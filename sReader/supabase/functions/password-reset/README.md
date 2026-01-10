# Password Reset Edge Function (Supabase)

Production-grade password reset using email verification codes.

## Overview
- Generates a 6-digit code and stores a hashed version in `password_resets`
- Sends the code via email (Resend API or logs if not configured)
- Verifies the code
- Resets the user's password using Supabase Admin API

## Prerequisites
1. Create `password_resets` table in your database. If you used `scripts/createTables.js`, it's already included. Otherwise, run this SQL in Supabase:

```sql
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(user_id);
```

2. Install Supabase CLI locally: https://supabase.com/docs/guides/cli

## Deploy

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref qzuddqptlgcqfwbjjarl

# Set function env secrets
supabase secrets set SUPABASE_URL=https://qzuddqptlgcqfwbjjarl.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set RESEND_API_KEY=YOUR_RESEND_API_KEY
supabase secrets set FROM_EMAIL="SReader <no-reply@sreader.africa>"

# Deploy the function
supabase functions deploy password-reset
```

## Function Endpoint
- URL: `https://qzuddqptlgcqfwbjjarl.functions.supabase.co/password-reset`
- Auth: Include `Authorization: Bearer <anon key>`

## Payloads
- Request code:
```json
{ "action": "request", "email": "user@example.com" }
```
- Verify code:
```json
{ "action": "verify", "email": "user@example.com", "code": "123456" }
```
- Reset password:
```json
{ "action": "reset", "email": "user@example.com", "code": "123456", "newPassword": "NewPass123" }
```

## Notes
- Codes expire in 15 minutes
- A code can be used only once
- Emails are sent using Resend if `RESEND_API_KEY` is set; otherwise they are logged (for testing)
