import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createClient } from '@supabase/supabase-js';

const pathMatch = (pathname: string, name: string) =>
    pathname === `/.netlify/functions/${name}` ||
    pathname === `/api/ai/${name}` ||
    pathname === `/api/${name}`;

const mockNetlifyFunctions = (env: Record<string, string>) => ({
  name: 'mock-netlify-functions',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
      
      if (pathMatch(url.pathname, 'delete-application') && req.method === 'DELETE') {
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

      if (pathMatch(url.pathname, 'submit-application') && req.method === 'POST') {
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
                  const email = user_email.toLowerCase().trim();
                  const userName = application.user_name || 'Applicant';
                  const siteUrl = env.URL || 'http://localhost:3000';
                  const fromEmail = env.SENDER_EMAIL || 'admissions@mentorino.me';
                  const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', 'application_submitted').single();
                  const subject = template?.subject || 'Application Received - Mentorino';
                  let emailBody = template?.body || `Hi {{student_name}},<br><br>We have successfully received your application...`;
                  emailBody = emailBody.replace(/{{student_name}}/g, userName).replace(/{{mentor_name}}/g, 'Mentorino').replace(/{{program_name}}/g, application.mentor_type || 'the Mentorino program').replace(/{{login_url}}/g, `${siteUrl}/auth`).replace(/\n/g, '<br>');
                  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: `Mentorino <${fromEmail}>`, to: [email], subject, html: emailBody }) });
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

      if (pathMatch(url.pathname, 'check-application') && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try { const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY); const { email } = JSON.parse(body); const { data } = await supabase.from('applications').select('status').eq('user_email', email.toLowerCase().trim()).maybeSingle(); const isApproved = data?.status === 'approved'; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ is_approved: isApproved })); }
          catch (e: any) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: e.message })); }
        });
        return;
      }

      if (pathMatch(url.pathname, 'update-application-status') && req.method === 'POST') {
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
                  const studentName = appData.responses?.user_name || 'Applicant'; const siteUrl = env.URL || 'http://localhost:3000'; const fromEmail = env.SENDER_EMAIL || 'admissions@mentorino.me';
                  const templateId = status === 'approved' ? 'application_accepted' : 'application_rejected';
                  const { data: template } = await supabase.from('email_templates').select('subject, body').eq('id', templateId).single();
                  const subject = template?.subject || (status === 'approved' ? 'Welcome to Mentorino — Your Application Has Been Accepted!' : 'Update – Mentorino Application');
                  let emailBody = template?.body || (status === 'approved' ? `Hi {{student_name}},<br><br>Congratulations! Your application has been approved. You can now create your account.<br><br><a href="{{login_url}}">Create Your Account</a><br><br>Best,<br>Mentorino Team` : `Hi {{student_name}},<br><br>Thank you for applying to the {{program_name}}.<br>After careful review by {{mentor_name}},<br>we are unable to accept your application at this time.<br><br>Best,<br>Mentorino Team`);
                  emailBody = emailBody.replace(/{{student_name}}/g, studentName).replace(/{{mentor_name}}/g, 'Mentorino').replace(/{{program_name}}/g, appData.responses?.mentor_type || 'the Mentorino program').replace(/{{login_url}}/g, `${siteUrl}/auth`).replace(/\n/g, '<br>');
                  await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Authorization': `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: `Mentorino <${fromEmail}>`, to: [appData.user_email], subject, html: emailBody }) });
                } catch (emailErr) { console.error('Local mock email send error:', emailErr); }
              }
              res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ message: "Status updated successfully" }));
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
          '^/.netlify/functions/.*': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/\.netlify\/functions/, '/api/ai'),
          },
        },
      },
      plugins: [
        react(),
        tailwindcss(),
        mockNetlifyFunctions(env)
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
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
                  return 'vendor-pdf';
                }
                if (id.includes('xlsx')) {
                  return 'vendor-excel';
                }
                if (id.includes('lucide-react') || id.includes('recharts') || id.includes('motion')) {
                  return 'vendor-ui';
                }
                if (id.includes('@sentry') || id.includes('posthog-js')) {
                  return 'vendor-telemetry';
                }
                if (id.includes('@supabase/supabase-js')) {
                  return 'vendor-supabase';
                }
                return 'vendor';
              }
            }
          }
        }
      }
    };
});
