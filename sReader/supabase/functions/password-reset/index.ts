// @ts-nocheck
// Supabase Edge Function: password-reset
// Actions: request, verify, reset
// Deno runtime
// Requires environment variables:
// - SUPABASE_URL
// - SUPABASE_SERVICE_ROLE_KEY
// - RESEND_API_KEY (optional, for sending emails)
// - FROM_EMAIL (e.g., "SReader <no-reply@sreader.africa>")

// @deno-types="https://cdn.jsdelivr.net/npm/@types/deno-std/mod.d.ts"
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

// Types
interface RequestBody {
  action: "request" | "verify" | "reset";
  email?: string;
  code?: string;
  newPassword?: string;
}

const SUPABASE_URL = (globalThis as any).Deno?.env?.get("SUPABASE_URL") || Deno?.env?.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = (globalThis as any).Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY") || Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = (globalThis as any).Deno?.env?.get("RESEND_API_KEY") || Deno?.env?.get("RESEND_API_KEY");
const FROM_EMAIL = ((globalThis as any).Deno?.env?.get("FROM_EMAIL") || Deno?.env?.get("FROM_EMAIL")) || "SReader <no-reply@example.com>";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

function random6Digit(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not set. Email content:", { to, subject, html });
    return { ok: true };
  }
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Email send failed: ${text}`);
  }
  return { ok: true };
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }
    const body = (await req.json()) as RequestBody;
    const now = new Date();

    if (!body.action) return jsonResponse({ error: "Missing action" }, 400);

    if (body.action === "request") {
      const email = body.email?.trim().toLowerCase();
      if (!email) return jsonResponse({ error: "Email required" }, 400);

      // Lookup user in app users table
      const { data: userRow, error: userErr } = await supabaseAdmin
        .from("users")
        .select("id, email, display_name")
        .eq("email", email)
        .single();
      if (userErr || !userRow) return jsonResponse({ error: "User not found" }, 404);

      const code = random6Digit();
      const codeHash = await sha256(code);
      const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins

      const { error: insertErr } = await supabaseAdmin.from("password_resets").insert({
        user_id: userRow.id,
        email,
        code_hash: codeHash,
        expires_at: expiresAt,
        used_at: null,
        created_at: now.toISOString(),
      });
      if (insertErr) return jsonResponse({ error: insertErr.message }, 500);

      const subject = "Your SReader Password Reset Code";
      const html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>Reset your password</h2>
          <p>Hello ${userRow.display_name || "there"},</p>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 4px;">${code}</h1>
          <p>This code expires in 15 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `;
      await sendEmail(email, subject, html);
      return jsonResponse({ ok: true });
    }

    if (body.action === "verify") {
      const email = body.email?.trim().toLowerCase();
      const code = body.code?.trim();
      if (!email || !code) return jsonResponse({ error: "Email and code required" }, 400);

      const codeHash = await sha256(code);
      const { data: resetRow, error: selErr } = await supabaseAdmin
        .from("password_resets")
        .select("id, expires_at, used_at")
        .eq("email", email)
        .eq("code_hash", codeHash)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (selErr || !resetRow) return jsonResponse({ error: "Invalid code" }, 400);
      if (resetRow.used_at) return jsonResponse({ error: "Code already used" }, 400);
      if (new Date(resetRow.expires_at) < now) return jsonResponse({ error: "Code expired" }, 400);

      return jsonResponse({ ok: true });
    }

    if (body.action === "reset") {
      const email = body.email?.trim().toLowerCase();
      const code = body.code?.trim();
      const newPassword = body.newPassword;
      if (!email || !code || !newPassword) return jsonResponse({ error: "Missing fields" }, 400);

      const codeHash = await sha256(code);
      const { data: latest, error: latestErr } = await supabaseAdmin
        .from("password_resets")
        .select("id, user_id, expires_at, used_at")
        .eq("email", email)
        .eq("code_hash", codeHash)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (latestErr || !latest) return jsonResponse({ error: "Invalid code" }, 400);
      if (latest.used_at) return jsonResponse({ error: "Code already used" }, 400);
      if (new Date(latest.expires_at) < now) return jsonResponse({ error: "Code expired" }, 400);

      // Update password via Admin API
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(latest.user_id, {
        password: newPassword,
      });
      if (updErr) return jsonResponse({ error: updErr.message }, 500);

      // Mark code as used
      await supabaseAdmin.from("password_resets").update({ used_at: now.toISOString() }).eq("id", latest.id);

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: "Internal error" }, 500);
  }
});
