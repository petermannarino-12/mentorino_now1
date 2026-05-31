# Mentorino

Premium career, education, and life guidance mentorship platform.

## Prerequisites

- Node.js 20+
- A Supabase project (local or hosted)
- A Vercel account (for deployment)
- API keys: Resend (email), Gemini (AI features), Sentry (error tracking), PostHog (analytics)

## Run Locally

1. Install dependencies:
   `npm install`

2. Copy `.env.example` to `.env` and fill in the required values:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key (server-side only)
   - `GEMINI_API_KEY` — your Gemini API key
   - `RESEND_API_KEY` — your Resend API key (for emails)

3. Run the dev server:
   `npm run dev`

   The app runs on `http://localhost:3000` by default.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Deployment

The project deploys on **Vercel**. Push to the `main` branch to trigger an automatic deployment.

### Environment Variables

Set these in the Vercel dashboard (under Project Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `RESEND_API_KEY` | Email sending via Resend |
| `GEMINI_API_KEY` | Google Gemini AI API key |
| `VITE_SENTRY_DSN` | Sentry error tracking DSN |
| `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog analytics token |
| `VITE_PUBLIC_POSTHOG_HOST` | PostHog host URL |
| `SENDER_EMAIL` | From address for emails |
| `ADMIN_EMAIL` | Admin notification email |
| `DATABASE_URL` | Supabase Postgres connection string |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Vercel Functions (Node.js), Prisma ORM
- **Database:** Supabase PostgreSQL (via Prisma)
- **Auth:** Supabase Auth
- **Email:** Resend
- **AI:** Google Gemini
- **Monitoring:** Sentry, PostHog
