// @ts-nocheck
// deno-lint-ignore no-explicit-any
import { FunctionRequest, FunctionResponse } from "https://deno.land/x/serve@3.14.1/mod.ts";

// deno-lint-ignore no-explicit-any
export async function middleware(req: FunctionRequest): Promise<FunctionResponse | null> {
  // Allow all requests - no authentication required for password reset
  return null;
}
