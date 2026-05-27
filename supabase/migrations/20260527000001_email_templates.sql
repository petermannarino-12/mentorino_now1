CREATE TABLE IF NOT EXISTS public.email_templates (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

INSERT INTO public.email_templates (id, subject, body) VALUES
  (
    'application_submitted',
    'Application Received - Mentorino',
    'Hi {{student_name}},\n\nWe have successfully received your application to the {{program_name}} program.\n\nOur team is currently reviewing it, and we will get back to you within 48 hours.\n\nBest,\nMentorino Team'
  ),
  (
    'application_accepted',
    'Welcome to Mentorino — Your Application Has Been Accepted!',
    'Hi {{student_name}},\n\nCongratulations! Your application to the {{program_name}} program has been approved by {{mentor_name}}.\n\nYou can now create your account and access your member portal.\n\nClick here to create your account: {{login_url}}\n\nBest,\nMentorino Team'
  ),
  (
    'application_rejected',
    'Update – Mentorino Application',
    'Hi {{student_name}},\n\nThank you for applying to the {{program_name}}.\nAfter careful review by {{mentor_name}},\nwe are unable to accept your application at this time.\n\nWe wish you the best in your journey.\n\nBest,\nMentorino Team'
  ),
  (
    'booking_confirmed',
    'Session Confirmed - Mentorino',
    'Hi {{student_name}},\n\nYour mentorship session has been confirmed.\n\nDate: {{session_date}}\nTime: {{session_time}}\n\nPlease log in to your portal to join the session at the scheduled time.\n\n{{login_url}}\n\nBest,\nMentorino Team'
  ),
  (
    'welcome_email',
    'Welcome to Mentorino!',
    'Hi {{student_name}},\n\nWelcome to Mentorino! Your account has been created successfully.\n\nYou can now log in and access your dashboard to manage your mentorship journey.\n\n{{login_url}}\n\nBest,\nMentorino Team'
  )
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates" ON public.email_templates
    FOR ALL USING (public.is_mentor_or_admin());
