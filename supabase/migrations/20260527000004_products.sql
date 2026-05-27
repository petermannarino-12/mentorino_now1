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

-- Seed data
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
