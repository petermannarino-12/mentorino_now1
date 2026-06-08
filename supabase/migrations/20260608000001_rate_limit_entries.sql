CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_entries_lookup
  ON public.rate_limit_entries (identifier, created_at);
