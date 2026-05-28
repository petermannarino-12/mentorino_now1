CREATE TABLE IF NOT EXISTS public.product_access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    mentor_notes TEXT,
    granted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_access_requests_student ON public.product_access_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_product_access_requests_status ON public.product_access_requests(status);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS file_url TEXT;
