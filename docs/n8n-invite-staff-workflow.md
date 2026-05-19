# n8n Workflow: User Invite (Staff & Facilities)

One webhook handles all three invite scenarios in Innerframe:

| Who triggers it | Role sent | Where in the app |
|---|---|---|
| Home admin inviting staff | `staff` | Settings → Staff tab |
| Super admin adding staff to a facility | `staff` or `home_admin` | Facility detail → Staff tab |
| Super admin creating a new facility | `home_admin` | All Facilities → New Facility |

---

## How Each Flow Works

### Staff invite (home admin or super admin)
1. Admin fills in the invite form (name, email, temp password, role)
2. Frontend POSTs directly to this webhook
3. n8n creates the Supabase auth user
4. The DB trigger links the user to the org

### New facility (super admin only)
1. Super admin fills in the New Facility modal (facility name + admin details)
2. Frontend inserts the `organisations` row directly via Supabase (super admin RLS bypass allows this)
3. Frontend POSTs to **this same webhook** with `role: home_admin` and the new `org_id`
4. n8n creates the Supabase auth user for the home admin
5. The DB trigger links the home admin to the new org
6. If the webhook call fails, the frontend deletes the orphaned org automatically

---

## Setup Steps

### 1. Create the workflow in n8n

Add the following nodes in order:

---

### Node 1 — Webhook
- **Type:** Webhook
- **HTTP Method:** POST
- **Path:** `/invite-staff` (or any slug you choose)
- **Authentication:** None (internal use; see security notes below)
- **Response Mode:** Using "Respond to Webhook" node

Copy the **Production URL** and add it to the app's `.env.local`:
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
> with the temporary password and is forced to change it on first login.

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
and inserts a row in `public.users` using the metadata:

| Metadata field | Effect |
|---|---|
| `org_id` | Links the user to their facility |
| `full_name` | Display name in the portal |
| `role` | `staff`, `home_admin`, or `super_admin` |
| `force_password_change` | Stored in auth metadata; the app redirects to `/change-password` on first login |

---

## Security Notes

- Store your **service role key** in n8n as a Credential, not hardcoded in the node
- The webhook URL lives in `VITE_N8N_INVITE_WEBHOOK_URL` — never commit `.env.local`
- Only authenticated `home_admin` and `super_admin` users can reach the invite forms (enforced by the portal auth guard and role checks)
- Consider adding a Header Auth credential to the webhook node so only the Innerframe app can call it
