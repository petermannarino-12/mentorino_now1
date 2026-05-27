CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    product TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded'))
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR ALL USING (public.is_mentor_or_admin());

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions (date DESC);
