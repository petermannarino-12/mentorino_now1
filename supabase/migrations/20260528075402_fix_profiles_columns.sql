-- Add missing columns to profiles table that Prisma expects
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mentorship_status TEXT;

-- Sync name from full_name for existing rows
UPDATE public.profiles SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;

-- Fix handle_new_user function to use full_name instead of name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.applications 
    WHERE TRIM(LOWER(user_email)) = TRIM(LOWER(new.email)) AND TRIM(LOWER(status)) = 'approved'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'admin'
  ) OR (new.raw_app_meta_data->>'role' = 'admin') THEN
    
    INSERT INTO public.profiles (id, email, full_name, role, name)
    VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1)),
      CASE 
        WHEN new.raw_app_meta_data->>'role' = 'admin' THEN 'admin'
        ELSE 'user'
      END,
      COALESCE(new.raw_user_meta_data->>'full_name', SPLIT_PART(new.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      name = EXCLUDED.name;
    
    RETURN new;
  END IF;

  RAISE EXCEPTION 'Registration blocked: Your application has not been approved yet.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
