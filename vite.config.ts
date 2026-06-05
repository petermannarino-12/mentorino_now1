import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createClient } from '@supabase/supabase-js';

const pathMatch = (pathname: string, name: string) =>
    pathname === `/api/ai/${name}` ||
    pathname === `/api/${name}`;

const isAppFrom = (url: URL, from: string) =>
    url.pathname === '/api/applications' && url.searchParams.get('from') === from;

const mockApi = (env: Record<string, string>) => ({
  name: 'mock-api',
  configureServer(server) {
    (async () => {
      try {
        const { default: { Pool } }: any = await import('pg');
        const pool = new Pool({ connectionString: env.DATABASE_URL, max: 1 });
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.enquiries (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            service_type TEXT NOT NULL CHECK (service_type IN ('free_intro_call', 'rapid_response_call')),
            message TEXT,
            status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );
        `);
        await pool.end();
      } catch {}
    })();

    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      
      if ((pathMatch(url.pathname, 'delete-application') || isAppFrom(url, 'delete-application')) && req.method === 'DELETE') {
        try {
          const id = url.searchParams.get('id');
          if (!id) {
             res.statusCode = 400;
             res.setHeader('Content-Type', 'application/json');
             res.end(JSON.stringify({ error: "Missing ID parameter" }));
             return;
          }
          const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
          const { data: appData, error: fetchError } = await supabase.from('applications').select('user_email').eq('id', id).maybeSingle();
          if (fetchError) throw fetchError;
          if (!appData) { res.statusCode = 404; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: "Application not found" })); return; }
          const targetEmail = appData.user_email;
          const { data: targetProfile } = await supabase.from('profiles').select('id').eq('email', targetEmail).maybeSingle();
          if (targetProfile && targetProfile.id) { const { error: authDeleteError } = await supabase.auth.admin.deleteUser(targetProfile.id); if (authDeleteError) console.error("Local Mock Auth Delete Error:", authDeleteError); }
          const { error: deleteError } = await supabase.from('applications').delete().eq('id', id);
          if (deleteError) throw deleteError;
          res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ message: "Mentee and application deleted successfully" }));
        } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        return;
      }

      if ((pathMatch(url.pathname, 'submit-application') || isAppFrom(url, 'submit-application')) && req.method === 'POST') {
         let body = '';
         req.on('data', chunk => body += chunk);
         req.on('end', async () => {
            try {
              const { application } = JSON.parse(body);
              const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
              const { user_email, mentor_type, status, id: appId, created_at, ...responses } = application;
              const { error } = await supabase.from('applications').insert({ user_email: user_email.toLowerCase().trim(), mentor_type: application.mentor_type, status: 'pending', responses });
              res.setHeader('Content-Type', 'application/json');
              if (error) { res.statusCode = 500; res.end(JSON.stringify({ error: error.message })); }
              else if (env.RESEND_API_KEY) {
                try {
                  const adminEmail = env.ADMIN_EMAIL || 'peter@mentorino.me';
                  const email = user_email.toLowerCase().trim();
                  const userName = application.user_name || 'Applicant';
                  const siteUrl = env.URL || 'http://localhost:3000';
                  const fromEmail = env.SENDER_EMAIL || 'peter@mentorino.me';
                  const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', 'application_submitted').single();
                  const subject = template?.subject || 'Application Received - Mentorino';
                  let emailBody = template?.body || `Hi {{student_name}},<br><br>We have successfully received your application...`;
                  emailBody = emailBody.replace(/{{student_name}}/g, userName).replace(/{{mentor_name}}/g, 'Mentorino').replace(/{{program_name}}/g, application.mentor_type || 'the Mentorino program').replace(/{{login_url}}/g, `${siteUrl}/auth`).replace(/\n/g, '<br>');
                  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: `Mentorino <${fromEmail}>`, to: [email], bcc: [adminEmail], subject, html: emailBody }) });
                } catch (emailErr) { console.error('Local mock email send error:', emailErr); }
                res.statusCode = 200; res.end(JSON.stringify({ message: "Application submitted successfully" }));
              } else { res.statusCode = 200; res.end(JSON.stringify({ message: "Application submitted successfully" })); }
            } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
         });
         return;
      }

      if (pathMatch(url.pathname, 'profiles')) {
        if (req.method === 'GET') {
          try {
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            const id = url.searchParams.get('id'); const limit = url.searchParams.get('limit');
            if (limit) { const { data } = await supabase.from('profiles').select('*').limit(parseInt(limit)); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data || [])); }
            else { const { data } = await supabase.from('profiles').select('*').eq('id', id).single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data || null)); }
          } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          return;
        }
        if (req.method === 'PATCH') {
          let body = ''; req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const { milestones } = JSON.parse(body);
              const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
              const token = url.searchParams.get('token') || req.headers.authorization?.split(' ')[1];
              if (!token) { res.statusCode = 401; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: "Unauthorized" })); return; }
              const { data: { user } } = await supabase.auth.getUser(token);
              if (!user) { res.statusCode = 401; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: "Invalid token" })); return; }
              const { data } = await supabase.from('profiles').update({ milestones }).eq('id', user.id).select().single();
              res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data));
            } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          });
          return;
        }
      }

      if (pathMatch(url.pathname, 'bookings')) {
        if (req.method === 'GET') {
          try {
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            const userId = url.searchParams.get('userId'); const from = parseInt(url.searchParams.get('from') || '0'); const to = parseInt(url.searchParams.get('to') || '49');
            let query = supabase.from('bookings').select('*').order('date', { ascending: false }).range(from, to);
            if (userId) query = query.eq('user_id', userId);
            const { data } = await query; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data || []));
          } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          return;
        }
        if (req.method === 'POST') {
          let body = ''; req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try { const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY); const booking = JSON.parse(body); const { data } = await supabase.from('bookings').insert(booking).select().single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }
            catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          });
          return;
        }
        if (req.method === 'PATCH') {
          let body = ''; req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try { const { id, notes } = JSON.parse(body); const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY); const { data } = await supabase.from('bookings').update({ notes }).eq('id', id).select().single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }
            catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          });
          return;
        }
      }

      if (pathMatch(url.pathname, 'task-activities')) {
        if (req.method === 'GET') {
          try {
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            const userId = url.searchParams.get('userId'); const from = parseInt(url.searchParams.get('from') || '0'); const to = parseInt(url.searchParams.get('to') || '49');
            let query = supabase.from('task_activities').select('*').order('created_at', { ascending: false }).range(from, to);
            if (userId) query = query.eq('user_id', userId);
            const { data } = await query; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data || []));
          } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          return;
        }
        if (req.method === 'POST') {
          let body = ''; req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
              const activity = JSON.parse(body);
              if (activity.id) { const { id, ...updateData } = activity; const { data } = await supabase.from('task_activities').update(updateData).eq('id', id).select().single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }
              else { const { data } = await supabase.from('task_activities').insert(activity).select().single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }
            } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          });
          return;
        }
      }

      if (pathMatch(url.pathname, 'events')) {
        if (req.method === 'GET') {
          try {
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            const from = parseInt(url.searchParams.get('from') || '0'); const to = parseInt(url.searchParams.get('to') || '49');
            const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false }).range(from, to);
            res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data || []));
          } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          return;
        }
        if (req.method === 'POST') {
          let body = ''; req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
              const payload = JSON.parse(body);
              if (payload.action === 'attend') {
                const { data: ev } = await supabase.from('events').select('attendees').eq('id', payload.eventId).single();
                const attendees: string[] = ev?.attendees || [];
                if (!attendees.includes(payload.userId)) { await supabase.from('events').update({ attendees: [...attendees, payload.userId] }).eq('id', payload.eventId); }
                const { data } = await supabase.from('events').select('*').eq('id', payload.eventId).single();
                res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data));
              } else { const { data } = await supabase.from('events').insert(payload).select().single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); }
            } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          });
          return;
        }
        if (req.method === 'DELETE') {
          try {
            const id = url.searchParams.get('id');
            if (!id) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: "Missing id" })); return; }
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            await supabase.from('events').delete().eq('id', id);
            res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ message: "Event deleted" }));
          } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          return;
        }
      }

      if (pathMatch(url.pathname, 'reviews') && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try { const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY); const review = JSON.parse(body); const { data } = await supabase.from('reviews').insert(review).select().single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ id: data.id, message: "Review submitted" })); }
          catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        });
        return;
      }

      if (pathMatch(url.pathname, 'transactions') && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try { const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY); const transaction = JSON.parse(body); const { data } = await supabase.from('transactions').insert(transaction).select().single(); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ id: data.id, message: "Transaction created" })); }
          catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        });
        return;
      }

      if (pathMatch(url.pathname, 'newsletter') && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try { const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY); const { email } = JSON.parse(body); await supabase.from('newsletter_subscribers').insert({ email: email.toLowerCase().trim() }); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ message: "Subscribed successfully" })); }
          catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        });
        return;
      }

      if ((pathMatch(url.pathname, 'check-application') || isAppFrom(url, 'check-application')) && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try { const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY); const { email } = JSON.parse(body); const { data } = await supabase.from('applications').select('status').eq('user_email', email.toLowerCase().trim()).maybeSingle(); const isApproved = data?.status === 'approved'; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ is_approved: isApproved })); }
          catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        });
        return;
      }

      if ((pathMatch(url.pathname, 'update-application-status') || isAppFrom(url, 'update-application-status')) && req.method === 'POST') {
         let body = ''; req.on('data', chunk => body += chunk);
         req.on('end', async () => {
            try {
              const { id, status } = JSON.parse(body);
              if (!id || !status || !['approved', 'rejected', 'pending'].includes(status)) { res.statusCode = 400; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: "Invalid parameters" })); return; }
              const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
              const { data: appData, error: fetchError } = await supabase.from('applications').select('user_email, responses').eq('id', id).single();
              if (fetchError || !appData) { res.statusCode = 404; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: "Application not found" })); return; }
              const { error: updateError } = await supabase.from('applications').update({ status }).eq('id', id);
              if (updateError) throw updateError;
              if (env.RESEND_API_KEY && (status === 'approved' || status === 'rejected')) {
                try {
                  const adminEmail = env.ADMIN_EMAIL || 'peter@mentorino.me';
                  const studentName = appData.responses?.user_name || 'Applicant'; const siteUrl = env.URL || 'http://localhost:3000'; const fromEmail = env.SENDER_EMAIL || 'peter@mentorino.me';
                  const templateId = status === 'approved' ? 'application_accepted' : 'application_rejected';
                  const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', templateId).single();
                  const subject = template?.subject || (status === 'approved' ? 'Welcome to Mentorino — Your Application Has Been Accepted!' : 'Update – Mentorino\nApplication');
                  let emailBody = template?.body || (status === 'approved' ? `Hi {{student_name}},<br><br>Congratulations! Your application has been approved. You can now create your account.<br><br><a href="{{login_url}}">Create Your Account</a><br><br>Best,<br>the Mentorino Team` : `Hi {{student_name}},<br><br>Thank you for applying to {{program_name}}.<br><br>After careful review by Peter,<br>we are unable to accept your application at this time.<br><br>Best,<br>the Mentorino Team`);
                  emailBody = emailBody.replace(/{{student_name}}/g, studentName).replace(/{{mentor_name}}/g, 'Mentorino').replace(/{{program_name}}/g, appData.responses?.mentor_type || 'the Mentorino program').replace(/{{login_url}}/g, `${siteUrl}/auth`).replace(/\n/g, '<br>');
                  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: `Mentorino <${fromEmail}>`, to: [appData.user_email], bcc: [adminEmail], subject, html: emailBody }) });
                } catch (emailErr) { console.error('Local mock email send error:', emailErr); }
              }
              res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ message: "Status updated successfully" }));
            } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
         });
         return;
      }

      if ((pathMatch(url.pathname, 'list-product-requests') || (url.pathname === '/api/emails' && url.searchParams.get('from') === 'list-requests')) && (req.method === 'GET' || req.method === 'POST')) {
        try {
          const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
          const { data } = await supabase.from('product_access_requests').select('*').order('created_at', { ascending: false });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ requests: data || [] }));
        } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        return;
      }

      if (pathMatch(url.pathname, 'enquiries')) {
        if (req.method === 'GET') {
          try {
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data || []));
          } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          return;
        }
        if (req.method === 'POST') {
          let body = ''; req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
              const enquiry = JSON.parse(body);
              const { data } = await supabase.from('enquiries').insert({
                name: enquiry.name,
                email: enquiry.email,
                phone: enquiry.phone || null,
                service_type: enquiry.service_type,
                message: enquiry.message || null
              }).select().single();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          });
          return;
        }
        if (req.method === 'PATCH') {
          let body = ''; req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const { id, status } = JSON.parse(body);
              const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
              const { data } = await supabase.from('enquiries').update({ status }).eq('id', id).select().single();
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(data));
            } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
          });
          return;
        }
      }

      if (pathMatch(url.pathname, 'contact') && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { name, email, phone, subject, message } = JSON.parse(body);
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            await supabase.from('contact_messages').insert({
              name: (name || '').replace(/[<>]/g, '').trim().slice(0, 255),
              email: (email || '').toLowerCase().trim(),
              phone: ((phone || '')).replace(/[<>]/g, '').trim().slice(0, 50),
              subject: (subject || '').slice(0, 255),
              message: ((message || '')).replace(/[<>]/g, '').trim().slice(0, 5000),
            });
            if (env.RESEND_API_KEY) {
              try {
                const { Resend } = await import("resend");
                const resend = new Resend(env.RESEND_API_KEY);
                const fromEmail = env.SENDER_EMAIL || 'peter@mentorino.me';
                  const adminEmail = env.ADMIN_EMAIL || 'peter@mentorino.me';
                  const cleanedName = (name || '').replace(/[<>]/g, '').trim();
                  const cleanedMsg = (message || '').replace(/[<>]/g, '').trim();
                  await resend.emails.send({
                    from: `Mentorino <${fromEmail}>`,
                    to: adminEmail,
                    subject: `New Contact Message from ${cleanedName}`,
                    html: `<strong>Name:</strong> ${cleanedName}<br><strong>Email:</strong> ${email}<br><strong>Phone:</strong> ${phone || 'N/A'}<br><strong>Subject:</strong> ${subject || 'N/A'}<br><br><strong>Message:</strong><br>${cleanedMsg}`
                  });
                  await resend.emails.send({
                    from: `Mentorino <${fromEmail}>`,
                    to: email,
                    bcc: adminEmail,
                    subject: "Your message has been received — Mentorino",
                    html: `Hi ${cleanedName},<br><br>We've received your message and will get back to you within 48 hours.<br><br><strong>Your message:</strong><br>${cleanedMsg}<br><br>— Mentorino Team`
                  });
              } catch (e) { console.error("Contact email error:", e); }
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: "Message sent successfully" }));
          } catch (e) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        });
        return;
      }

      if ((pathMatch(url.pathname, 'handle-product-access') || (url.pathname === '/api/emails' && url.searchParams.get('from') === 'grant-access')) && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { request_id, action, mentor_notes } = JSON.parse(body);
            const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
            if (action === 'grant') {
              await supabase.from('product_access_requests').update({ status: 'granted', mentor_notes: mentor_notes || null, granted_at: new Date().toISOString() }).eq('id', request_id);
            } else {
              await supabase.from('product_access_requests').update({ status: 'denied', mentor_notes: mentor_notes || null }).eq('id', request_id);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: `Access ${action === 'grant' ? 'granted' : 'denied'}` }));
          } catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        });
        return;
      }

      next();
    });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // Strict build-time validation for required environment variables
    const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    if (mode === 'production') {
      for (const key of requiredEnv) {
        if (!env[key]) {
          throw new Error(`CRITICAL BUILD ERROR: Missing required environment variable ${key}. Build aborted.`);
        }
      }
    }

    return {
      logLevel: 'info',
      server: {
        port: 3000,
        host: true,
        strictPort: true,
        allowedHosts: ["all"],
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      },
      plugins: [
        react(),
        tailwindcss(),
        mockApi(env)
      ],
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './'),
        },
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
      },
      build: {
        outDir: 'dist',
        reportCompressedSize: false,
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('jspdf') || id.includes('jspdf-autotable') || id.includes('html2canvas') || id.includes('base64-arraybuffer') || id.includes('css-line-break')) return 'vendor-pdf';
                if (id.includes('xlsx')) return 'vendor-excel';
                if (id.includes('@sentry')) return 'vendor-sentry';
                if (id.includes('posthog-js')) return 'vendor-posthog';
                if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
                if (id.includes('react-dom') || id.includes('react/') || id.includes('scheduler')) return 'vendor-react';
                if (id.includes('react-router')) return 'vendor-router';
                if (id.includes('@tanstack/react-query')) return 'vendor-query';
                if (id.includes('motion')) return 'vendor-motion';
                if (id.includes('lucide-react') || id.includes('recharts')) return 'vendor-ui';
                if (id.includes('react-hook-form') || id.includes('@hookform/resolvers')) return 'vendor-forms';
                if (id.includes('sonner')) return 'vendor-toast';
                if (id.includes('zod')) return 'vendor-validation';
                if (id.includes('react-helmet-async')) return 'vendor-helmet';
                if (id.includes('react-error-boundary')) return 'vendor-error';
                if (id.includes('tailwind-merge') || id.includes('clsx')) return 'vendor-utils';
                if (id.includes('hls.js')) return 'vendor-video';
                if (id.includes('@google/genai') || id.includes('marked')) return 'vendor-ai';
                return 'vendor-core'; // remaining small deps
              }
            }
          }
        }
      }
    };
});
