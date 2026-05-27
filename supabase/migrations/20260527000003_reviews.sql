CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_name TEXT,
    reviewer_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can view all reviews" ON public.reviews
    FOR SELECT USING (public.is_mentor_or_admin());
