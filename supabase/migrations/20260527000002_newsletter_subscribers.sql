CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view subscribers" ON public.newsletter_subscribers
    FOR SELECT USING (public.is_mentor_or_admin());
