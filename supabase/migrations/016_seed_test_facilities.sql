-- Seed two test facilities and assign memberships to existing users.
-- Facility UUIDs are fixed so this migration is idempotent (ON CONFLICT DO NOTHING).
-- Required for cross-tenant isolation testing (spec section 8).

INSERT INTO facilities (id, name, slug, facility_type, subscription_tier)
VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Sunrise Care Home',
    'sunrise-care-home',
    'care_home',
    'standard'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Hillside Shelter',
    'hillside-shelter',
    'shelter',
    'standard'
  )
ON CONFLICT (id) DO NOTHING;

-- Danielle → facility_admin at Sunrise Care Home
INSERT INTO facility_memberships (facility_id, user_id, role, status)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '207fcefb-3334-4c55-bcc8-78dbc638d3bf',
  'facility_admin',
  'active'
)
ON CONFLICT (facility_id, user_id) DO NOTHING;

-- Piet (piet@testing.co.za) → medical_staff at Sunrise Care Home
INSERT INTO facility_memberships (facility_id, user_id, role, status)
VALUES (
  'aaaaaaaa-0000-0000-0000-000000000001',
  '4c3cf24d-4646-4a2a-a0a6-91dac0bd3260',
  'medical_staff',
  'active'
)
ON CONFLICT (facility_id, user_id) DO NOTHING;

-- Quintin → super_admin at Hillside Shelter (isolation test: different facility)
INSERT INTO facility_memberships (facility_id, user_id, role, status)
VALUES (
  'bbbbbbbb-0000-0000-0000-000000000002',
  'b76bc967-9b5a-4469-beab-859ef79d8f2e',
  'super_admin',
  'active'
)
ON CONFLICT (facility_id, user_id) DO NOTHING;
