CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone reads site content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners manage site content" ON public.site_content FOR ALL TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.site_content (key, value) VALUES
  ('hero_heading_1', 'Where flavour'),
  ('hero_heading_2', 'meets atmosphere.'),
  ('hero_subtext', 'TASTE · CONNECT · UNWIND'),
  ('hero_image', ''),
  ('intro_image', ''),
  ('intro_text', 'Food that feels generous. A room made for lingering. Service that knows when to arrive and when to let the evening unfold.');

ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image_url text;

CREATE POLICY "Anyone views site media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');
CREATE POLICY "Owners upload site media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Owners update site media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-media' AND private.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (bucket_id = 'site-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Owners remove site media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));