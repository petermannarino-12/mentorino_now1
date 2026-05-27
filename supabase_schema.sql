-- SQL Setup Script for Mentorino Supabase Database
-- Run this in your Supabase SQL Editor

-- 1. Create Applications Table
CREATE TABLE public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL UNIQUE,
    mentor_type TEXT,
    responses JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_email ON public.applications (user_email);

-- 2. Create Users/Profiles Table (Extending Auth)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'mentor', 'admin')),
    tasks JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Function to handle new user registration
-- Allows: (1) approved applications, (2) first-admin bootstrap when no admin exists, (3) admin via raw_app_meta_data
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

-- Function to check application approval status safely from frontend
CREATE OR REPLACE FUNCTION public.is_application_approved(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.applications 
    WHERE TRIM(LOWER(user_email)) = TRIM(LOWER(email_to_check)) AND TRIM(LOWER(status)) = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is an admin bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is a mentor or admin bypassing RLS
CREATE OR REPLACE FUNCTION public.is_mentor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'mentor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically add profile and verify application standing
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Bookings Table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming',
    notes TEXT
);

-- 4. Create Task Activities Table
CREATE TABLE public.task_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    status TEXT DEFAULT 'pending',
    admin_response TEXT,
    pb_card_details TEXT,
    pb_linkedin_url TEXT,
    pb_resume_link TEXT,
    pb_cover_letter_link TEXT,
    pb_dress_code_notes TEXT,
    pb_greeting_intro_notes TEXT,
    net_attended_event TEXT,
    net_people_met TEXT,
    net_contact_info TEXT,
    net_panel_summary TEXT,
    pw_introduction TEXT,
    pw_volunteer_hours TEXT,
    cert_topic TEXT,
    roadmap_topic TEXT,
    interview_recommendation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Events Table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    link TEXT,
    attendees JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Row Level Security Context
-- Enable RLS on all tables
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Creating basic policies 
-- Applications: Users can create and read their own. Admins can read/update all.
-- Added security: Restrict inserts to prevent basic bot spam (rudimentary check - more advanced options in Supabase are recommended).
CREATE POLICY "Users can create applications" ON public.applications FOR INSERT WITH CHECK (user_email IS NOT NULL);
CREATE POLICY "Users can read own applications" ON public.applications FOR SELECT USING (user_email = auth.jwt()->>'email');
CREATE POLICY "Admins can do everything on applications" ON public.applications TO authenticated USING (
    public.is_mentor_or_admin()
);

-- Profiles: Users can read own. Admins can read all.
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Updated policy to restrict profile updates
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to explicitly prevent non-admins from changing their role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE trigger enforce_role_protection
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_role_escalation();

-- Bookings: Users read own. Admins read all.
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update bookings" ON public.bookings FOR ALL USING (
    public.is_mentor_or_admin()
);

-- Tasks: Users read own. Admins read all.
CREATE POLICY "Users can view own tasks" ON public.task_activities FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create tasks" ON public.task_activities FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update tasks" ON public.task_activities FOR ALL USING (
    public.is_mentor_or_admin()
);

-- Events: Everyone can read. Admins can create/update/delete.
CREATE POLICY "Everyone can read events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (
    public.is_mentor_or_admin()
);
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated USING (
    public.is_mentor_or_admin()
);
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (
    public.is_mentor_or_admin()
);

-- 7. Email Templates Table (editable templates for transactional emails)
CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.email_templates (id, subject, body) VALUES
  (
    'application_submitted',
    'Application Received - Mentorino',
    'Hi {{student_name}},\n\nWe have successfully received your application to the {{program_name}} program.\n\nOur team is currently reviewing it, and we will get back to you within 48 hours.\n\nBest,\nMentorino Team'
  ),
  (
    'application_accepted',
    'Welcome to Mentorino — Your Application Has Been Accepted!',
    'Hi {{student_name}},\n\nCongratulations! Your application to the {{program_name}} program has been approved by {{mentor_name}}.\n\nYou can now create your account and access your member portal.\n\nClick here to create your account: {{login_url}}\n\nBest,\nMentorino Team'
  ),
  (
    'application_rejected',
    'Update – Mentorino Application',
    'Hi {{student_name}},\n\nThank you for applying to the {{program_name}}.\nAfter careful review by {{mentor_name}},\nwe are unable to accept your application at this time.\n\nWe wish you the best in your journey.\n\nBest,\nMentorino Team'
  )
ON CONFLICT (id) DO NOTHING;

-- 8. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Validation Rules Table
CREATE TABLE IF NOT EXISTS public.validation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    field TEXT NOT NULL,
    entity TEXT NOT NULL CHECK (entity IN ('Application', 'User', 'TaskActivity', 'Product', 'Booking')),
    operator TEXT NOT NULL CHECK (operator IN ('required', 'minLength', 'maxLength', 'pattern', 'min', 'max', 'custom')),
    value TEXT,
    errorMessage TEXT,
    isActive BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 10. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 11. Reviews / Session Audit Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_name TEXT,
    reviewer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all new tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Admins can manage email templates" ON public.email_templates
    FOR ALL USING (public.is_mentor_or_admin());

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages" ON public.contact_messages
    FOR SELECT USING (public.is_mentor_or_admin());

CREATE POLICY "Admins can manage validation rules" ON public.validation_rules
    FOR ALL USING (public.is_mentor_or_admin());

CREATE POLICY "Authenticated users can read validation rules" ON public.validation_rules
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view subscribers" ON public.newsletter_subscribers
    FOR SELECT USING (public.is_mentor_or_admin());

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can view all reviews" ON public.reviews
    FOR SELECT USING (public.is_mentor_or_admin());

-- 12. Products Table (Store / Vault)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image TEXT,
    category TEXT,
    sales_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products" ON public.products
    FOR SELECT USING (status = 'active' OR public.is_mentor_or_admin());

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (public.is_mentor_or_admin());

INSERT INTO public.products (full_name, description, price, category, status) VALUES
  (
    'Career Mastery Blueprint',
    'A comprehensive 12-week career acceleration program covering personal branding, networking, interview prep, and strategic career planning.',
    499.00,
    'Program',
    'active'
  ),
  (
    'Resume & LinkedIn Overhaul',
    'Professional redesign of your resume and LinkedIn profile with personalized feedback and optimization for ATS systems.',
    199.00,
    'Service',
    'active'
  ),
  (
    'Interview Accelerator',
    'Intensive 1-on-1 interview preparation with mock interviews, feedback sessions, and a personalized preparation plan.',
    299.00,
    'Service',
    'active'
  ),
  (
    'The Trajectory Journal',
    'A guided career planning journal with daily prompts, weekly reflections, and strategic planning templates.',
    34.99,
    'Resource',
    'active'
  )
ON CONFLICT DO NOTHING;
