-- ── compliance_items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_items (
  id          uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  category    text NOT NULL CHECK (category IN ('admin','finance','kitchen','medical','board_governance','medical_residence','hr')),
  title       text NOT NULL,
  description text,
  frequency   text NOT NULL CHECK (frequency IN ('daily','weekly','monthly','quarterly','annual','ongoing')),
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── compliance_checks ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_checks (
  id           uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id       uuid NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  item_id      uuid NOT NULL REFERENCES public.compliance_items(id) ON DELETE CASCADE,
  is_complete  boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  completed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  notes        text,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, item_id)
);

CREATE INDEX IF NOT EXISTS compliance_checks_org_idx ON public.compliance_checks(org_id);

ALTER TABLE public.compliance_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compliance_items_read" ON public.compliance_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "compliance_checks_select" ON public.compliance_checks
  FOR SELECT TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "compliance_checks_insert" ON public.compliance_checks
  FOR INSERT TO authenticated
  WITH CHECK (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "compliance_checks_update" ON public.compliance_checks
  FOR UPDATE TO authenticated
  USING (org_id = (SELECT org_id FROM public.users WHERE id = auth.uid()));
