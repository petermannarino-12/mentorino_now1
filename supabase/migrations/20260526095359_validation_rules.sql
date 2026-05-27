CREATE TABLE public.validation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    field TEXT NOT NULL,
    entity TEXT NOT NULL CHECK (entity IN ('Application', 'User', 'TaskActivity', 'Product', 'Booking')),
    operator TEXT NOT NULL CHECK (operator IN ('required', 'minLength', 'maxLength', 'pattern', 'min', 'max', 'custom')),
    value TEXT,
    errorMessage TEXT,
    isActive BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage validation rules" ON public.validation_rules
    FOR ALL USING (public.is_mentor_or_admin());

CREATE POLICY "Authenticated users can read validation rules" ON public.validation_rules
    FOR SELECT TO authenticated USING (true);
