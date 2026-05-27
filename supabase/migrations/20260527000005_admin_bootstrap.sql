-- First Admin Bootstrap Migration
-- Modifies handle_new_user to allow:
--   1. Approved applications (existing behavior)
--   2. First admin signup when no admin exists (bootstrap)
--   3. Admin role assignment via raw_app_meta_data (Supabase Dashboard)
--
-- To create the first admin via Supabase Dashboard:
--   1. Go to Authentication > Users
--   2. Add a new user with their email
--   3. In "App metadata", add: {"role": "admin"}
--   4. The handle_new_user trigger will assign admin role and bypass application check

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.applications 
    WHERE TRIM(LOWER(user_email)) = TRIM(LOWER(new.email)) AND TRIM(LOWER(status)) = 'approved'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'admin'
  ) OR (new.raw_app_meta_data->>'role' = 'admin') THEN
    
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
      CASE 
        WHEN new.raw_app_meta_data->>'role' = 'admin' THEN 'admin'
        ELSE 'user'
      END
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name;
    
    RETURN new;
  END IF;

  RAISE EXCEPTION 'Registration blocked: Your application has not been approved yet.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
