# n8n Workflow: Create Staff User

This workflow receives a staff invite request from the Innerframe portal and
creates the Supabase auth user securely using the service role key.

---

## Setup Steps

### 1. Create the workflow in n8n

Add the following nodes in order:

---

### Node 1 — Webhook
- **Type:** Webhook
- **HTTP Method:** POST
- **Path:** `/invite-staff` (or any slug you choose)
- **Authentication:** None (the app sends the calling user's JWT for traceability)
- **Response Mode:** Using "Respond to Webhook" node

Copy the **Production URL** — you'll add it to the app's `.env.local` as:
```
VITE_N8N_INVITE_WEBHOOK_URL=https://n8n.cortexanalytics.co.za/webhook/invite-staff
```

---

### Node 2 — HTTP Request (Create Supabase Auth User)
- **Type:** HTTP Request
- **Method:** POST
- **URL:** `https://<your-project-ref>.supabase.co/auth/v1/admin/users`
  *(Replace `<your-project-ref>` with your Supabase project reference)*

**Headers:**
| Key | Value |
|-----|-------|
| `apikey` | `<your-service-role-key>` |
| `Authorization` | `Bearer <your-service-role-key>` |
| `Content-Type` | `application/json` |

**Body (JSON):**
```json
{
  "email": "{{ $json.body.email }}",
  "password": "{{ $json.body.password }}",
  "email_confirm": true,
  "user_metadata": {
    "org_id": "{{ $json.body.orgId }}",
    "full_name": "{{ $json.body.fullName }}",
    "role": "{{ $json.body.role }}",
    "force_password_change": true
  }
}
```

> `email_confirm: true` skips the confirmation email — the user logs in directly
> with the temporary password, then is forced to change it on first login.

---

### Node 3 — Respond to Webhook
- **Type:** Respond to Webhook
- **Response Code:** 
  - On success: `200`
  - On error: use an IF node to check `$node["HTTP Request"].error` and respond `400`
- **Response Body:**

Success:
```json
{ "ok": true }
```

Error (connect an IF → error branch):
```json
{ "ok": false, "error": "{{ $json.message }}" }
```

---

## What the Supabase Auth Trigger Does Automatically

Once the user is created, the existing trigger (`003_auth_user_trigger.sql`) fires
and creates a row in `public.users` using the metadata:
- `org_id` → links staff to the correct facility
- `full_name` → display name
- `role` → `staff` or `home_admin`
- `force_password_change` → stored in auth metadata (NOT in public.users), checked by the app on login

---

## Security Notes

- Store your **service role key** in n8n as a Credential, not hardcoded in the node
- The webhook URL is stored in `VITE_N8N_INVITE_WEBHOOK_URL` — never commit `.env.local`
- Only authenticated `home_admin` users can reach the invite form in the app (enforced by the portal auth guard)
- Consider adding a Header Auth credential to the webhook node for extra protection
