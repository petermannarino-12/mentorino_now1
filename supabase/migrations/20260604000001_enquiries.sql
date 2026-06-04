CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('free_intro_call', 'rapid_response_call')),
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert enquiries" ON public.enquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view enquiries" ON public.enquiries
    FOR SELECT USING (public.is_mentor_or_admin());

CREATE POLICY "Admins can update enquiries" ON public.enquiries
    FOR UPDATE USING (public.is_mentor_or_admin());
