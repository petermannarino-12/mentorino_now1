-- Add indexes for performance optimization

-- Booking queries: order by date, filter by user_id
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings (date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);

-- Task activities: filter by user_id, filter by status
CREATE INDEX IF NOT EXISTS idx_task_activities_user_id ON public.task_activities (user_id);
CREATE INDEX IF NOT EXISTS idx_task_activities_status ON public.task_activities (status);

-- Events: ordered by date
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date DESC);

-- Profiles: lookup by email (used in application delete flow)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Applications: filter by status, composite for status + date queries
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_status_created ON public.applications (status, created_at DESC);
