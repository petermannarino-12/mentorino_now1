ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_by UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'events'
    AND indexname = 'idx_events_created_by'
  ) THEN
    CREATE INDEX idx_events_created_by ON public.events (created_by);
  END IF;
END $$;
