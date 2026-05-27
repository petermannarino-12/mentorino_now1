# Prisma ORM Migration Plan — Mentorino

## Approach

**Hybrid: Keep Supabase Auth, replace all DB queries with Prisma.**

- `supabase.auth.*` (signup, login, OAuth, sessions, password reset, `onAuthStateChange`, `admin.deleteUser`) **stays**
- All `supabase.from('table').*` calls → `prisma.table.*`

---

## Phase 1: Setup

### 1.1 Add DATABASE_URL to .env.local

```
DATABASE_URL=postgresql://postgres.mbzaqnqobecmmmkrkouu:Nexinbe%40777@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5
```

### 1.2 Create prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 1.3 Introspect & generate

```
npx prisma db pull       # generates schema from existing Supabase tables
npx prisma generate       # generates Prisma Client
```

### 1.4 Review generated schema

- Add relations (e.g., `profiles` → `applications`, `profiles` → `bookings`, etc.)
- JSONB columns: `profiles.milestones`, `applications.responses`, `events.attendees` → use `Json` type
- Mark `auth.users` as `@@ignore` (managed by Supabase Auth, not Prisma)

### 1.5 Create client singleton

**`src/lib/prisma.ts`**
```typescript
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```

### 1.6 Create server-side singleton

**`netlify/functions/_shared/prisma.ts`**
```typescript
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 1.7 Update build script

In `package.json`, add `"postinstall": "prisma generate"` and ensure `npx prisma generate` runs during Netlify build (`netlify.toml` build command).

---

## Phase 2: Service Layer (6 files)

| File | Table | Replace With |
|---|---|---|
| `src/services/bookingService.ts` | `bookings` | `prisma.booking.findMany/create` |
| `src/services/taskService.ts` | `task_activities` | `prisma.taskActivity.findMany/update/create` |
| `src/services/eventService.ts` | `events` | `prisma.event.findMany/create/update/delete` |
| `src/services/productService.ts` | `products` | `prisma.product.findMany/findUnique` |
| `src/services/applicationService.ts` | `applications` | `prisma.application.*` (keep Netlify fn calls for insert/update/delete) |
| `src/services/validationService.ts` | `validation_rules` | `prisma.validationRule.*` |
| `src/services/emailTemplateService.ts` | `email_templates` | `prisma.emailTemplate.findMany/update` |

---

## Phase 3: Hooks (6 files)

| File | Change |
|---|---|
| `src/hooks/useSupabasePaginated.ts` | **Replace entirely** — create typed per-table hooks or use a generic factory |
| `src/hooks/useMentorDashboardData.ts` | Replace inline `supabase.from('reviews')` → `prisma.review.findMany()` |
| `src/hooks/queries/userQueries.ts` | `supabase.from('profiles')` → `prisma.profile.findMany()` |
| `src/hooks/useApplications.ts` | (wraps service — no change needed) |
| `src/hooks/useBookings.ts` | (wraps service — no change needed) |
| `src/hooks/useTasks.ts` | (wraps service — no change needed) |
| `src/hooks/useEvents.ts` | (wraps service — no change needed) |

---

## Phase 4: Auth Context (1 file)

**`src/contexts/AuthContext.tsx`**

- **Keep**: `supabase.auth.getSession()`, `supabase.auth.onAuthStateChange()`, `supabase.auth.signOut()`
- **Replace**: `supabase.from('profiles').select('*').eq('id', userId).single()` → `prisma.profile.findUnique({ where: { id: userId } })`

---

## Phase 5: Pages with inline Supabase calls (9 files)

| File | Supabase calls → Prisma equivalent |
|---|---|
| `pages/Auth.tsx` | Keep `supabase.auth.*` + `supabase.rpc('is_application_approved')` → `prisma.application.findFirst()` + keep `supabase.from('profiles').select()` → `prisma.profile.findUnique()` |
| `pages/ResetPassword.tsx` | Keep all `supabase.auth.*` (auth-only — no change) |
| `pages/Settings.tsx` | `supabase.from('profiles').update()` → `prisma.profile.update()` |
| `pages/GrowthForm.tsx` | `supabase.auth.getSession()` (keep), `supabase.from('profiles')` → `prisma.profile`, `supabase.from('task_activities')` → `prisma.taskActivity` |
| `pages/Survey.tsx` | `supabase.auth.getSession()` (keep), `supabase.from('reviews')` → `prisma.review` |
| `pages/Store.tsx` | `supabase.from('transactions')` → `prisma.transaction` |
| `pages/UserDashboard.tsx` | `supabase.from('bookings')` → `prisma.booking` |
| `pages/dashboard/Purchases.tsx` | `supabase.auth.getSession()` (keep), `supabase.from('transactions')` → `prisma.transaction` |
| `components/Footer.tsx` | `supabase.from('newsletter_subscribers')` → `prisma.newsletterSubscriber` |
| `components/milestones/MilestoneList.tsx` | `supabase.from('profiles')` → `prisma.profile` |
| `components/admin/ValidationRulesManager.tsx` | `supabase.from('validation_rules')` → `prisma.validationRule` |

---

## Phase 6: Netlify Functions (6 files)

| File | Change |
|---|---|
| `netlify/functions/contact.ts` | Replace `supabase.from('contact_messages')` → `prisma.contactMessage` |
| `netlify/functions/submit-application.ts` | Replace `supabase.from('applications'/'email_templates')` → `prisma.application` / `prisma.emailTemplate` |
| `netlify/functions/update-application-status.ts` | Replace `supabase.from('profiles'/'applications'/'email_templates')` → Prisma (keep `supabase.auth.getUser()`) |
| `netlify/functions/delete-application.ts` | Replace `supabase.from('profiles'/'applications')` → Prisma (keep `supabase.auth.admin.deleteUser()`) |
| `netlify/functions/send-welcome-email.ts` | Replace `supabase.from('email_templates')` → `prisma.emailTemplate` |
| `netlify/functions/send-booking-confirmation.ts` | Replace `supabase.from('email_templates')` → `prisma.emailTemplate` |

---

## Phase 7: Middleware & Miscellaneous

| File | Change |
|---|---|
| `src/middleware/authenticate.ts` | Replace `supabaseServer.auth.getUser()` → keep (this is auth-only) |
| `vite.config.ts` | Replace mock Netlify function handlers (`supabase.from()`) → `prisma.*` |
| `test-check.ts`, `test-insert2.ts`, `test-unique.ts` | Optionally migrate or leave as-is |

---

## Phase 8: Replace Postgres Triggers & RPCs with Application Code

### `handle_new_user()` trigger

Currently: Postgres trigger `on_auth_user_created` creates a profile row after signup.

With Prisma: **Remove the trigger from Supabase** after deployment, and replace with explicit `prisma.profile.create()` call in `AuthContext.tsx` after signup:

```typescript
// In Auth.tsx, after successful signUp():
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  await prisma.profile.create({
    data: {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
      role: 'user',
    }
  })
}
```

> ⚠️ **Important**: Before removing the trigger, deploy the Prisma-based code first, THEN remove the trigger from Supabase SQL (to avoid race conditions during deployment).

### `is_application_approved()` RPC

Replace `supabase.rpc('is_application_approved', { email_to_check: email })` with:

```typescript
const approved = await prisma.application.findFirst({
  where: { user_email: email, status: 'approved' }
})
return !!approved
```

### `prevent_role_escalation()` trigger

Replace with a check in the service layer before `prisma.profile.update()`:

```typescript
if (data.role && data.role !== currentProfile.role) {
  // Check if caller is admin
  if (callerRole !== 'admin') {
    delete data.role  // or throw
  }
}
```

---

## Phase 9: Cleanup

1. Remove `src/lib/supabase.ts` (after confirming no remaining imports)
2. Remove `src/lib/supabase-server.ts`
3. Remove `netlify/functions/_shared/supabase-client.ts`
4. Remove `src/middleware/authenticate.ts` (if auth middleware moved to Prisma-based session check)
5. Update rollupOptions in `vite.config.ts` to remove `vendor-supabase` chunk (or keep it for auth)
6. Run `npm run typecheck` and `npm run test`

---

## Execution Order

```
Phase 1 (Setup)
  └→ Phase 2 (Services — most isolated, testable independently)
       └→ Phase 3 (Hooks)
            └→ Phase 4 (AuthContext)
                 └→ Phase 5 (Pages + Components)
                      └→ Phase 6 (Netlify Functions — deploy critical)
                           └→ Phase 7 (Misc)
                                └→ Phase 8 (Triggers/RPCs → code)
                                     └→ Phase 9 (Cleanup)
```

## Rollback Plan

Each service can be rolled back individually by reverting the import from `prisma` back to `supabase`. The old `src/lib/supabase.ts` and `netlify/functions/_shared/supabase-client.ts` files should be kept until Phase 9 to allow quick revert.
