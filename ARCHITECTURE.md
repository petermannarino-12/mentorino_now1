# Mentorino — Architecture

## Overview

Premium career, education, and life guidance mentorship platform. React 19 SPA with Vercel serverless backend, Supabase PostgreSQL (via Prisma ORM), Supabase Auth, and Google Gemini AI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4 |
| **Routing** | React Router DOM v7 (lazy-loaded, Motion animated) |
| **State** | TanStack React Query v5 (server) + React Context (auth) |
| **Forms** | React Hook Form v7 + Zod v4 |
| **Backend** | Express via Vercel Functions (serverless) |
| **Database** | Supabase PostgreSQL via Prisma ORM v7 |
| **Auth** | Supabase Auth (email/password) |
| **AI** | Google Gemini 2.0 Flash |
| **Email** | Resend |
| **Analytics** | PostHog |
| **Error Tracking** | Sentry |
| **Hosting** | Vercel |
| **CI/CD** | GitHub Actions |

## Project Structure

```
mentorino_now1/
├── src/                          # Frontend application
│   ├── main.tsx                  # Entry point (providers: ErrorBoundary, Query, Auth, PostHog, Helmet)
│   ├── App.tsx                   # Root component (lazy-loaded routes, animated transitions)
│   ├── index.css                 # Tailwind directives + global styles
│   ├── pages/                    # 24 page components (landing, auth, dashboards, etc.)
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Button, Card, Input, Loader, Pagination, Empty/Error states
│   │   ├── layout/               # Layout, Footer, DashboardWrapper
│   │   ├── admin/                # Admin dashboard wrapper, validation rules manager
│   │   ├── mentor/               # 5 mentor dashboard widgets
│   │   ├── forms/                # NetworkingSection, PersonalBrandingSection
│   │   ├── chat/                 # ChatBox, MentorChat, StudentChat
│   │   ├── ai/                   # AIChatWidget (floating assistant)
│   │   └── milestones/           # MilestoneList
│   ├── hooks/                    # Custom hooks + queries/
│   ├── contexts/                 # AuthContext (session, profile, sign out)
│   ├── services/                 # Service layer (applications, bookings, Gemini, etc.)
│   ├── lib/                      # Utilities (supabase client, query client, sentry, posthog, toast, date utils)
│   ├── types/                    # TypeScript types (index.ts)
│   ├── schemas/                  # Zod schemas (ai, auth)
│   ├── styles/                   # Design tokens (theme.ts)
│   └── constants/                # Navigation constants
├── api/                          # Vercel serverless functions (8 endpoint + 3 util files)
│   ├── auth.ts                   # Supabase admin client, token verification, role auth
│   ├── prisma.ts                 # Prisma client singleton
│   ├── rate-limit.ts             # IP-based rate limiter
│   ├── ai.ts                     # Gemini endpoints (chat, analyze, brief)
│   ├── applications.ts           # Application CRUD
│   ├── bookings.ts               # Booking CRUD
│   ├── emails.ts                 # Multi-purpose router: email + messaging + contact + newsletter + reviews + transactions
│   ├── enquiries.ts              # Enquiry CRUD
│   ├── events.ts                 # Event CRUD
│   ├── profiles.ts               # Profile get/update
│   └── task-activities.ts        # Task activity CRUD
├── prisma/
│   └── schema.prisma             # 17 database models
├── supabase/
│   ├── config.toml               # Local Supabase configuration
│   └── migrations/               # 14 SQL migration files (tables, RLS, triggers, seed)
├── database/
│   ├── supabase_schema.sql       # Full Supabase setup
│   └── email_templates_migration.sql
├── docs/
│   ├── PRD.md                    # Product Requirements Document
│   ├── PRD.pdf
│   ├── PRISMA-MIGRATION-PLAN.md  # Prisma ORM migration plan
│   └── metadata.json
├── scripts/                      # Utility scripts
├── public/                       # Static assets
└── .github/workflows/ci.yml      # CI pipeline
```

## Application Flow

```
Visitor → Apply (/apply) → PENDING APPLICATION
  ↓ (Mentor/Admin reviews)
APPROVED or REJECTED
  ↓ (if approved)
Sign Up (/auth) → STUDENT ROLE
  ↓
Dashboard (/dashboard)
├── Growth Strategy
├── Weekly Tasks
├── Session Booking (/booking)
├── Networking Events
├── The Vault (/vault)
├── Survey/Feedback (/survey)
├── Settings (/settings)
└── AI Chat (floating widget)
```

## Key Architectural Decisions

1. **Hybrid Auth**: Supabase Auth for client-side sessions; Prisma for all DB queries
2. **Serverless API**: Express-based Vercel Functions with shared Prisma client and auth middleware
3. **Role-Based Access**: 4-tier hierarchy (Visitor → Student → Mentor → Admin), enforced server-side via RLS and API middleware
4. **Lazy Loading**: All routes lazy-loaded with chunk error retry for resilience
5. **Build Splitting**: Vendor chunks separated for PDF, Excel, UI, Sentry, PostHog, Supabase

## Data Models (17 Prisma Models)

applications, profiles, bookings, task_activities, events, products, product_access_requests, transactions, reviews, email_templates, contact_messages, newsletter_subscribers, validation_rules, announcements, resource_links, messages, availability, public_sessions
