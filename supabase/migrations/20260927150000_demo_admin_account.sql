-- Demo owner account used by the prefilled admin sign-in: demo@grabweb.com / zayqa2026.
-- Safe to run more than once: creates the user if missing, otherwise resets its password,
-- and always makes sure it holds the admin role.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  demo_id uuid;
BEGIN
  SELECT id INTO demo_id FROM auth.users WHERE email = 'demo@grabweb.com';

  IF demo_id IS NULL THEN
    demo_id := gen_random_uuid();

    -- GoTrue fails to load users whose token columns are NULL, so they are set to ''.
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', demo_id, 'authenticated', 'authenticated',
      'demo@grabweb.com', extensions.crypt('zayqa2026', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Zayqa Demo Owner"}'::jsonb, now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(), demo_id, demo_id::text,
      jsonb_build_object('sub', demo_id::text, 'email', 'demo@grabweb.com', 'email_verified', true),
      'email', now(), now(), now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('zayqa2026', extensions.gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = demo_id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (demo_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
