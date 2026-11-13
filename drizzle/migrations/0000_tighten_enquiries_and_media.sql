DROP POLICY IF EXISTS "Anyone views site media" ON storage.objects;
CREATE POLICY "Owners view site media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'site-media' AND private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Visitors submit enquiries" ON public.enquiries;
CREATE POLICY "Visitors submit enquiries" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (
  enquiry_type IN ('contact','private_dining')
  AND status = 'new'
  AND char_length(btrim(name)) BETWEEN 1 AND 120
  AND char_length(email) BETWEEN 3 AND 254 AND email LIKE '%_@_%'
  AND (phone IS NULL OR char_length(phone) <= 40)
  AND (occasion IS NULL OR char_length(occasion) <= 200)
  AND char_length(message) <= 4000
  AND (guests IS NULL OR guests BETWEEN 1 AND 500)
);