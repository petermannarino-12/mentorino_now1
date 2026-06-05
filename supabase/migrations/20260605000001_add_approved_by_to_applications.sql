ALTER TABLE public.applications ADD COLUMN approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
