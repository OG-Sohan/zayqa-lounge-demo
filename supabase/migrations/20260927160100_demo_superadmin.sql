-- Runs after the enum gains 'superadmin' so the value can be used.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'superadmin'::public.app_role FROM auth.users WHERE email = 'demo@grabweb.com'
ON CONFLICT (user_id, role) DO NOTHING;
