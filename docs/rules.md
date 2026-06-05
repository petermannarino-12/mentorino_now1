# Mentorino — Permanent Project Rules

## Rule 1: Application Submission — Always `upsert`, Never `create`

**File:** `api/applications.ts`

`applications.user_email` has a `@unique` constraint in the database. Calling `prisma.applications.create()` with an existing email throws a unique constraint error.

All submissions **must** use `prisma.applications.upsert()` with `where: { userEmail }`. This handles both first-time and repeat submissions identically — never fails on duplicate email.

```ts
// ✅ CORRECT
await prisma.applications.upsert({
  where: { userEmail: email },
  create: { ... },
  update: { ... },
});

// ❌ WRONG — will crash on re-submission
await prisma.applications.create({ ... });
```

## Rule 2: Application Form — Always Show the Form

**File:** `src/pages/Application.tsx`

The form **must not** be hidden by an `existingApp` check. Users who have already applied should see the form and be able to re-submit (Rule 1 handles the database collision). The success screen only appears immediately after a successful submit action.

```tsx
// ✅ CORRECT
if (isSubmitted) { return <SuccessScreen />; }

// ❌ WRONG — hides form from returning users permanently
if (isSubmitted || existingApp) { return <SuccessScreen />; }
```

## Rule 3: Never Send Empty Bearer Tokens

**File:** `src/services/applicationService.ts`

The `Authorization` header **must only** be included when a valid session token exists. Sending `Authorization: Bearer ` (empty value) can be rejected as malformed by server runtimes.

```ts
// ✅ CORRECT
...(token ? { 'Authorization': `Bearer ${token}` } : {}),

// ❌ WRONG — sends empty Bearer when no session
'Authorization': token ? `Bearer ${token}` : '',
```

## Rule 4: Use `?from=` Router for New API Endpoints

**File:** `api/` directory

All new serverless function handlers **must** be added as sub-handlers in an existing `?from=` router file (`emails.ts`, `applications.ts`, `ai.ts`), not as standalone files. This keeps the endpoint count within the Vercel Hobby 12-function limit.

```ts
// ✅ CORRECT — add to existing router
case "my-new-feature": return handleMyNewFeature(request);

// ❌ WRONG — creates a new endpoint file
export async function POST(request: Request) { ... }
```

## Rule 5: Utility Files Must Not Export HTTP Handlers

**File:** `api/auth.ts`, `api/prisma.ts`, `api/rate-limit.ts`

Utility files that export helper functions (`getPrisma()`, `getUserFromToken()`, `checkRateLimit()`) **must not** export `GET`/`POST`/`PATCH`/`DELETE` handlers. Only files exporting HTTP methods count toward the 12-function deployment limit.

## Vercel Hobby Plan Limit

**Maximum:** 12 serverless function endpoint files per deployment.
**Current:** 8 endpoint files.
**Headroom:** 4 slots.

See `docs/vercel-constraints.md` for the full breakdown.
