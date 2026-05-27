-- Email Templates Table for Mentorino
-- Run this in your Supabase SQL Editor

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
    'Hi {{student_name}},

We have successfully received your application to the {{program_name}} program.

Our team is currently reviewing it, and we will get back to you within 48 hours.

Best,
Mentorino Team'
  ),
  (
    'application_accepted',
    'Welcome to Mentorino — Your Application Has Been Accepted!',
    'Hi {{student_name}},

Congratulations! Your application to the {{program_name}} program has been approved by {{mentor_name}}.

You can now create your account and access your member portal.

Click here to create your account: {{login_url}}

Best,
Mentorino Team'
  ),
  (
    'application_rejected',
    'Update – Mentorino Application',
    'Hi {{student_name}},

Thank you for applying to the {{program_name}}.
After careful review by {{mentor_name}},
we are unable to accept your application at this time.

We wish you the best in your journey.

Best,
Mentorino Team'
  )
ON CONFLICT (id) DO NOTHING;
