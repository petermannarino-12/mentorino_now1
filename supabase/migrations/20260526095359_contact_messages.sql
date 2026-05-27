CREATE TABLE public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages" ON public.contact_messages
    FOR SELECT USING (public.is_mentor_or_admin());
