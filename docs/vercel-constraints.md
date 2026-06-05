# Vercel Deployment Constraints

## Hobby Plan — 12 Serverless Function Limit

**Rule:** Vercel Hobby plan allows a maximum of **12 serverless function files** per deployment.

Only files in `api/` that export HTTP handlers (`GET`, `POST`, `PATCH`, `DELETE`, etc.) count toward the limit. Utility files (`auth.ts`, `prisma.ts`, `rate-limit.ts`) that only export helper functions do **not** count.

### Current Count: 8 endpoint files

| File | Purpose |
|---|---|
| `api/ai.ts` | Gemini AI (chat, analyze, brief) |
| `api/applications.ts` | Application CRUD |
| `api/bookings.ts` | Booking CRUD |
| `api/emails.ts` | Multi-router (16 sub-handlers via ?from=) |
| `api/enquiries.ts` | Enquiry CRUD |
| `api/events.ts` | Event CRUD |
| `api/profiles.ts` | Profile get/update |
| `api/task-activities.ts` | Task activity CRUD |

### Headroom: 4 slots remaining

### Mitigation Strategy

To stay within the limit without upgrading to Pro:
1. Consolidate related functions into a `?from=` router pattern (see `api/emails.ts`)
2. Delete the original file after merging its handlers
3. Update frontend fetch URLs to point to the new routed endpoint

### To Remove the Limit

Upgrade Vercel project to a Pro plan ($20/mo) or create a Team.
