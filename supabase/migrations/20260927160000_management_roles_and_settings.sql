-- Restaurant management (control room): team roles, restaurant settings and role administration.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';

-- Managers and superadmins carry full admin rights in every existing policy.
-- Compared as text because enum values added above cannot be referenced in this transaction.
CREATE OR REPLACE FUNCTION private.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR (_role::text = 'admin' AND role::text IN ('manager', 'superadmin')))
  )
$$;

CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id text PRIMARY KEY DEFAULT 'zayqa',
  name text NOT NULL,
  tagline text NOT NULL,
  secondary_phrase text NOT NULL DEFAULT 'Taste · Connect · Unwind',
  phone text NOT NULL,
  email text NOT NULL,
  address text NOT NULL,
  hours text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_settings_singleton CHECK (id = 'zayqa')
);

GRANT SELECT ON public.restaurant_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.restaurant_settings TO authenticated;
GRANT ALL ON public.restaurant_settings TO service_role;

ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'restaurant_settings' AND policyname = 'Anyone can read restaurant settings') THEN
    CREATE POLICY "Anyone can read restaurant settings" ON public.restaurant_settings
      FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'restaurant_settings' AND policyname = 'Admins can manage restaurant settings') THEN
    CREATE POLICY "Admins can manage restaurant settings" ON public.restaurant_settings
      FOR ALL TO authenticated
      USING (private.has_role(auth.uid(), 'admin'))
      WITH CHECK (private.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

INSERT INTO public.restaurant_settings (id, name, tagline, secondary_phrase, phone, email, address, hours)
VALUES ('zayqa', 'Zayqa Lounge', 'Where flavour meets atmosphere', 'Taste · Connect · Unwind', '+1 (212) 555-0148', 'hello@zayqalounge.com', '48 Mercer Street, New York, NY 10013', '12:00 — 23:00')
ON CONFLICT (id) DO NOTHING;

GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can manage user roles') THEN
    CREATE POLICY "Admins can manage user roles" ON public.user_roles
      FOR ALL TO authenticated
      USING (private.has_role(auth.uid(), 'admin'))
      WITH CHECK (private.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
