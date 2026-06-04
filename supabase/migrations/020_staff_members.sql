-- staff_members: operational staff separate from portal auth users
CREATE TABLE IF NOT EXISTS public.staff_members (
  id              uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id          uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  full_name       text NOT NULL,
  role            text NOT NULL CHECK (role IN (
    'nurse','care_worker','cook','cleaning','admin',
    'management','security','maintenance','physiotherapist',
    'social_worker','other'
  )),
  id_number       text,
  phone           text,
  email           text,
  employment_date date,
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','on_leave','terminated')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_members_org_idx  ON public.staff_members(org_id);
CREATE INDEX IF NOT EXISTS staff_members_role_idx ON public.staff_members(org_id, role);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_members_select" ON public.staff_members
  FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "staff_members_insert" ON public.staff_members
  FOR INSERT TO authenticated
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "staff_members_update" ON public.staff_members
  FOR UPDATE TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "staff_members_delete" ON public.staff_members
  FOR DELETE TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
