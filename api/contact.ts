import { createClient } from '@supabase/supabase-js';
import { Resend } from "resend";

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing Supabase env vars: ${!url ? 'VITE_SUPABASE_URL' : ''} ${!key ? 'SUPABASE_SERVICE_ROLE_KEY' : ''}`);
  }
  return createClient(url, key);
}

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
const FROM_EMAIL = process.env.SENDER_EMAIL || 'admissions@mentorino.me';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admissions@mentorino.me';
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const MAX_SUBMISSIONS = 3;
const sanitize = (str: string) => str.replace(/[<>]/g, "").trim();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const fiveMinAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    const { count, error: countError } = await getSupabase()
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('email', normalizedEmail)
      .gte('created_at', fiveMinAgo.toISOString());
    if (countError) throw countError;

    if ((count || 0) >= MAX_SUBMISSIONS) {
      return Response.json({ error: "Too many submissions. Please wait a few minutes before trying again." }, { status: 429 });
    }

    const { error: insertError } = await getSupabase()
      .from('contact_messages')
      .insert({
        name: sanitize(name).slice(0, 255),
        email: normalizedEmail,
        phone: sanitize(phone || '').slice(0, 50),
        subject: subject?.slice(0, 255),
        message: sanitize(message).slice(0, 5000),
      });
    if (insertError) throw insertError;

    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: `Mentorino <${FROM_EMAIL}>`,
          to: ADMIN_EMAIL,
          subject: `New Contact Message from ${sanitize(name)}`,
          html: `<strong>Name:</strong> ${sanitize(name)}<br>
                 <strong>Email:</strong> ${normalizedEmail}<br>
                 <strong>Phone:</strong> ${sanitize(phone || 'N/A')}<br>
                 <strong>Subject:</strong> ${subject || 'N/A'}<br><br>
                 <strong>Message:</strong><br>${sanitize(message)}`
        });
      } catch (emailError) {
        console.error("Admin notification email error:", emailError);
      }
    }

    return Response.json({ message: "Message sent successfully" });
  } catch (error: any) {
    console.error("Contact Error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
