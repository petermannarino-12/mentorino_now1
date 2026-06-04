# Graph Report - mentorino_now1  (2026-06-04)

## Corpus Check
- 156 files · ~91,910 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 799 nodes · 1367 edges · 81 communities (58 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e4c578a0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Architecture & Infrastructure|Architecture & Infrastructure]]
- [[_COMMUNITY_Mentorship Application Pipeline|Mentorship Application Pipeline]]
- [[_COMMUNITY_Admin Dashboard & Controls|Admin Dashboard & Controls]]
- [[_COMMUNITY_Vault Digital Storefront|Vault Digital Storefront]]
- [[_COMMUNITY_Frontend Framework Stack|Frontend Framework Stack]]
- [[_COMMUNITY_Email Notification System|Email Notification System]]
- [[_COMMUNITY_AI Integration (Gemini)|AI Integration (Gemini)]]
- [[_COMMUNITY_Networking Events|Networking Events]]
- [[_COMMUNITY_Module messages Table (Chat)|Module: messages Table (Chat)]]
- [[_COMMUNITY_Module reviews Table (Feedback)|Module: reviews Table (Feedback)]]
- [[_COMMUNITY_Module task_activities Table|Module: task_activities Table]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module DELETE|Module: DELETE]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module getAuth|Module: getAuth]]
- [[_COMMUNITY_Module getUserFromToken|Module: getUserFromToken]]
- [[_COMMUNITY_Module mapProfileRow|Module: mapProfileRow]]
- [[_COMMUNITY_Module requireRole|Module: requireRole]]
- [[_COMMUNITY_Module requireUser|Module: requireUser]]
- [[_COMMUNITY_Module GET|Module: GET]]
- [[_COMMUNITY_Module PATCH|Module: PATCH]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module GET|Module: GET]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module DELETE|Module: DELETE]]
- [[_COMMUNITY_Module GET|Module: GET]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module getPrisma|Module: getPrisma]]
- [[_COMMUNITY_Module GET|Module: GET]]
- [[_COMMUNITY_Module PATCH|Module: PATCH]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module checkRateLimit|Module: checkRateLimit]]
- [[_COMMUNITY_Module getClientIp|Module: getClientIp]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module GET|Module: GET]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module POST|Module: POST]]
- [[_COMMUNITY_Module availability Table (Mentor Availability)|Module: availability Table (Mentor Availability)]]
- [[_COMMUNITY_Module contact_messages Table|Module: contact_messages Table]]
- [[_COMMUNITY_Module newsletter_subscribers Table|Module: newsletter_subscribers Table]]
- [[_COMMUNITY_Module public_sessions Table|Module: public_sessions Table]]
- [[_COMMUNITY_Module resource_links Table|Module: resource_links Table]]
- [[_COMMUNITY_Module ChunkErrorBoundary|Module: ChunkErrorBoundary]]
- [[_COMMUNITY_Module Known Issue Minimal Test Coverage|Module: Known Issue: Minimal Test Coverage]]
- [[_COMMUNITY_Module Password Policy (Min 8, Mixed Case + Num|Module: Password Policy (Min 8, Mixed Case + Num]]
- [[_COMMUNITY_Module useSupabasePaginated|Module: useSupabasePaginated]]
- [[_COMMUNITY_Module Peter Mannarino Portrait|Module: Peter Mannarino Portrait]]
- [[_COMMUNITY_Module formatDashboardDate|Module: formatDashboardDate]]
- [[_COMMUNITY_Module formatToNJ|Module: formatToNJ]]
- [[_COMMUNITY_Module getNJDate|Module: getNJDate]]
- [[_COMMUNITY_Module getNJISOString|Module: getNJISOString]]
- [[_COMMUNITY_Module captureException|Module: captureException]]
- [[_COMMUNITY_Module setUser|Module: setUser]]
- [[_COMMUNITY_Module cn|Module: cn]]
- [[_COMMUNITY_Module Mentorino brand identity|Module: Mentorino brand identity]]
- [[_COMMUNITY_Module Mentorino favicon — white italic bold M|Module: Mentorino favicon — white italic bold M ]]
- [[_COMMUNITY_Module LoginFormData|Module: LoginFormData]]
- [[_COMMUNITY_Module SignUpFormData|Module: SignUpFormData]]
- [[_COMMUNITY_Module EmailTemplate|Module: EmailTemplate]]
- [[_COMMUNITY_Module AIChatMessage|Module: AIChatMessage]]
- [[_COMMUNITY_Module Announcement|Module: Announcement]]
- [[_COMMUNITY_Module Application|Module: Application]]
- [[_COMMUNITY_Module ApplicationInput|Module: ApplicationInput]]
- [[_COMMUNITY_Module Booking|Module: Booking]]
- [[_COMMUNITY_Module DataState|Module: DataState]]
- [[_COMMUNITY_Module Feedback|Module: Feedback]]
- [[_COMMUNITY_Module NetworkEvent|Module: NetworkEvent]]
- [[_COMMUNITY_Module Product|Module: Product]]
- [[_COMMUNITY_Module ResourceLink|Module: ResourceLink]]
- [[_COMMUNITY_Module Review|Module: Review]]
- [[_COMMUNITY_Module RuleOperator|Module: RuleOperator]]
- [[_COMMUNITY_Module User|Module: User]]
- [[_COMMUNITY_Module UserRole|Module: UserRole]]
- [[_COMMUNITY_Module ValidationRule|Module: ValidationRule]]

## God Nodes (most connected - your core abstractions)
1. `getPrisma()` - 42 edges
2. `getUserFromToken()` - 33 edges
3. `supabase` - 28 edges
4. `useAuth()` - 23 edges
5. `TaskActivity` - 18 edges
6. `Mentorino Mentorship Platform` - 17 edges
7. `Application` - 16 edges
8. `compilerOptions` - 16 edges
9. `Booking` - 15 edges
10. `8. Entity / Data Model` - 15 edges

## Surprising Connections (you probably didn't know these)
- `AuthPage()` --calls--> `handleSubmit()`  [INFERRED]
  src/pages/Auth.tsx → api/applications.ts
- `Mentorino Mentorship Platform` --calls--> `Google Gemini 2.0 Flash AI`  [EXTRACTED]
  README.md → ARCHITECTURE.md
- `Mentorino Mentorship Platform` --conceptually_related_to--> `Vendor Chunk Build Splitting`  [EXTRACTED]
  README.md → ARCHITECTURE.md
- `Mentorino Mentorship Platform` --calls--> `Express via Vercel Functions (Serverless)`  [EXTRACTED]
  README.md → ARCHITECTURE.md
- `Mentorino Mentorship Platform` --calls--> `GitHub Actions CI/CD`  [EXTRACTED]
  README.md → ARCHITECTURE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Mentorino Technology Stack** — architecture_md_react_19, architecture_md_typescript_5_8, architecture_md_vite_6, architecture_md_tailwind_css_4, architecture_md_react_router_dom_v7, architecture_md_tanstack_react_query_v5, architecture_md_react_hook_form_v7, architecture_md_zod_v4, architecture_md_express_vercel_functions, architecture_md_supabase_postgresql, architecture_md_prisma_orm_v7, architecture_md_supabase_auth, architecture_md_google_gemini_2_0_flash, architecture_md_resend_api, architecture_md_posthog_analytics, architecture_md_sentry_error_tracking, architecture_md_vercel_hosting, architecture_md_github_actions_cicd [EXTRACTED 1.00]
- **Mentorino User Roles** — docs_prd_visitor_role, docs_prd_student_member_role, docs_prd_mentor_role, docs_prd_admin_role [EXTRACTED 1.00]
- **Student Features** — docs_prd_mentorship_application_pipeline, docs_prd_session_booking_system, docs_prd_growth_strategy, docs_prd_weekly_task_activities, docs_prd_networking_events_feature, docs_prd_the_vault_store, docs_prd_survey_feedback, docs_prd_ai_chat_assistant [EXTRACTED 1.00]
- **Security Layers** — docs_prd_row_level_security, docs_prd_rate_limiting, docs_prd_password_policy, docs_prd_signup_gate, architecture_md_supabase_auth, architecture_md_sentry_error_tracking [EXTRACTED 1.00]
- **Core Database Models (17 Schemas)** — architecture_md_profiles, architecture_md_applications, architecture_md_bookings, architecture_md_task_activities, architecture_md_events, architecture_md_products, architecture_md_transactions, architecture_md_reviews, architecture_md_email_templates, architecture_md_contact_messages, architecture_md_newsletter_subscribers, architecture_md_validation_rules, architecture_md_announcements, architecture_md_resource_links, architecture_md_messages, architecture_md_availability, architecture_md_public_sessions [EXTRACTED 1.00]

## Communities (81 total, 23 thin omitted)

### Community 0 - "Architecture & Infrastructure"
Cohesion: 0.17
Nodes (12): Vendor Chunk Build Splitting, Express via Vercel Functions (Serverless), GitHub Actions CI/CD, Lazy-Loaded Routes with Chunk Error Retry, PostHog Analytics, Resend Email API, Sentry Error Tracking, Serverless API via Express on Vercel Functions (+4 more)

### Community 1 - "Mentorship Application Pipeline"
Cohesion: 0.25
Nodes (9): applications Table, bookings Table, 4-Tier Role-Based Access Control, Growth Strategy & Roadmap, Mentor (Staff), Mentorship Application Pipeline (4-Step Form), Session Booking System (Calendar + Time Slots), Student / Member (Approved Applicant) (+1 more)

### Community 2 - "Admin Dashboard & Controls"
Cohesion: 0.25
Nodes (8): announcements Table, profiles Table (User Profiles), validation_rules Table, Admin (Super User), AI Console (Admin Full-Page Chat), Broadcast Announcements (Priority Levels), CRM / Student Directory (Admin), Dynamic No-Code Validation Rules Engine

### Community 3 - "Vault Digital Storefront"
Cohesion: 0.25
Nodes (8): products Table, transactions Table, Known Issue: No Payment Gateway, Career Mastery Blueprint ($499), Interview Accelerator ($299), Resume & LinkedIn Overhaul ($199), The Vault Digital Storefront, The Trajectory Journal ($34.99)

### Community 4 - "Frontend Framework Stack"
Cohesion: 0.25
Nodes (8): React 19, React Hook Form v7, React Router DOM v7, Tailwind CSS 4, TanStack React Query v5, TypeScript 5.8, Vite 6, Zod v4

### Community 5 - "Email Notification System"
Cohesion: 0.40
Nodes (5): email_templates Table, Email Template: Application Accepted, Email Template: Application Rejected, Email Template: Application Submitted, Email System (Resend, 3 Templates)

### Community 6 - "AI Integration (Gemini)"
Cohesion: 0.40
Nodes (5): Google Gemini 2.0 Flash AI, AI Chat Assistant (Floating Widget), AI Integration: Gemini 2.0 Flash (3 Functions), AI Application Analysis (Score, Summary, Red Flags), AI Pre-Session Brief Generation

### Community 11 - "Module: POST"
Cohesion: 0.32
Nodes (11): handleAnalyze(), handleChat(), handleGenerateBrief(), POST(), requireAuth(), router(), sanitize(), sanitizeChat() (+3 more)

### Community 12 - "Module: DELETE"
Cohesion: 0.08
Nodes (51): DELETE(), handleCheck(), handleDelete(), handleSubmit(), handleUpdateStatus(), POST(), router(), sanitize() (+43 more)

### Community 13 - "Module: POST"
Cohesion: 0.04
Nodes (50): dependencies, clsx, cors, eslint, eslint-plugin-jsx-a11y, eslint-plugin-react, eslint-plugin-react-hooks, express (+42 more)

### Community 14 - "Module: getAuth"
Cohesion: 0.14
Nodes (31): AdminDashboardWrapper(), AdminDashboardWrapperProps, useAddApplicationMutation(), useApplications(), useApplicationsQuery(), useDeleteApplicationMutation(), useUpdateApplicationStatusMutation(), useBookings() (+23 more)

### Community 15 - "Module: getUserFromToken"
Cohesion: 0.07
Nodes (10): SEOProps, VideoPlayer, VideoPlayerProps, DATA, faqs, LandingPageProps, api(), enquiryService (+2 more)

### Community 16 - "Module: mapProfileRow"
Cohesion: 0.07
Nodes (29): devDependencies, dotenv, jsdom, prisma, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/express-rate-limit (+21 more)

### Community 17 - "Module: requireRole"
Cohesion: 0.08
Nodes (23): AboutPage, AdminDashboard, AdminRevenue, App(), ApplicationPage, AuthPage, BookingPage, ConsultationOverviewPage (+15 more)

### Community 18 - "Module: requireUser"
Cohesion: 0.08
Nodes (23): 1.1 Add DATABASE_URL to .env.local, 1.2 Create prisma/schema.prisma, 1.3 Introspect & generate, 1.4 Review generated schema, 1.5 Create client singleton, 1.6 Create server-side singleton, 1.7 Update build script, Approach (+15 more)

### Community 19 - "Module: GET"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 20 - "Module: PATCH"
Cohesion: 0.13
Nodes (15): 8.10 `email_templates`, 8.11 `announcements`, 8.12 `contact_messages`, 8.13 `newsletter_subscribers`, 8.14 `resource_links`, 8.1 `profiles`, 8.2 `applications`, 8.3 `bookings` (+7 more)

### Community 21 - "Module: POST"
Cohesion: 0.17
Nodes (12): 3. Full User Journey / Lifecycle Flow, Phase 10: Administration (Admin Cycle), Phase 11: Ongoing Lifecycle Diagram, Phase 1: Discovery (Visitor — No Account), Phase 2: Application (Visitor → Applicant), Phase 3: Review & Decision (Mentor/Admin Side), Phase 4: Account Creation & Onboarding (Applicant → Student), Phase 5: Active Engagement — Growth Strategy & Weekly Tasks (+4 more)

### Community 22 - "Module: POST"
Cohesion: 0.22
Nodes (8): ChatBox(), ChatBoxProps, Message, Conversation, MentorChat(), MentorChatProps, StudentChat(), StudentChatProps

### Community 23 - "Module: GET"
Cohesion: 0.20
Nodes (10): 4.1 Dashboard Overview, 4.2 Session Management, 4.3 Session Booking, 4.4 Growth Strategy / Roadmap, 4.5 The Vault (Store), 4.6 Networking Events, 4.7 Survey / Feedback, 4.8 AI Chat Assistant (+2 more)

### Community 24 - "Module: POST"
Cohesion: 0.22
Nodes (9): 5.1 Mentor Dashboard, 5.2 Inquiry Audits, 5.3 Mentees, 5.4 Session Management, 5.5 Task Reviews, 5.6 Events Management, 5.7 Email Templates, 5.8 Accounts (+1 more)

### Community 25 - "Module: DELETE"
Cohesion: 0.22
Nodes (9): 6.1 Admin Home, 6.2 Applications (Advanced), 6.3 Students / CRM, 6.4 Activities (Detailed Audit), 6.5 AI Console, 6.6 Broadcast, 6.7 Validation Rules, 6.8 More Menu (+1 more)

### Community 26 - "Module: GET"
Cohesion: 0.25
Nodes (7): Application Flow, Data Models (17 Prisma Models), Key Architectural Decisions, Mentorino — Architecture, Overview, Project Structure, Tech Stack

### Community 27 - "Module: POST"
Cohesion: 0.25
Nodes (8): Hybrid Auth: Supabase Auth + Prisma DB Queries, Prisma ORM v7, Supabase Auth (Email/Password), Supabase PostgreSQL, Active Prisma ORM Migration, Row Level Security (RLS) on All Tables, Signup Gate (Approved Application Required), Prisma ORM Migration Plan (9 Phases)

### Community 28 - "Module: POST"
Cohesion: 0.25
Nodes (8): 7.1 AI Integration (Gemini 2.0 Flash), 7.2 Email System (Resend), 7.3 Security, 7.4 Analytics (PostHog), 7.5 SEO, 7.6 Responsive Design, 7.7 Error Handling, 7. Cross-Cutting Features

### Community 29 - "Module: getPrisma"
Cohesion: 0.25
Nodes (7): Deployment, Environment Variables, Mentorino, Prerequisites, Run Locally, Scripts, Tech Stack

### Community 30 - "Module: GET"
Cohesion: 0.29
Nodes (6): 1. Product Overview, 9. AI Chat Widget Specification, Mentorino — Premium Mentorship Platform, Product Requirements Document (PRD), Table of Contents, Tech Stack

### Community 31 - "Module: PATCH"
Cohesion: 0.29
Nodes (6): maxDuration, buildCommand, functions, api/**/*.ts, headers, rewrites

### Community 33 - "Module: checkRateLimit"
Cohesion: 0.33
Nodes (5): Current State, In Progress, Known Issues, Project Status, What Works

### Community 34 - "Module: getClientIp"
Cohesion: 0.33
Nodes (5): defaultStats, GrowthFeed(), GrowthFeedProps, GrowthFeedStats, metricLabels

### Community 35 - "Module: POST"
Cohesion: 0.40
Nodes (3): checklistItems, Mode, Props

### Community 36 - "Module: GET"
Cohesion: 0.40
Nodes (4): mcpServers, playwright, args, command

### Community 37 - "Module: POST"
Cohesion: 0.50
Nodes (3): ADMIN_NAV, MENTOR_NAV, STUDENT_NAV

### Community 38 - "Module: POST"
Cohesion: 0.50
Nodes (3): description, name, requestFramePermissions

### Community 44 - "Module: ChunkErrorBoundary"
Cohesion: 0.25
Nodes (4): ChunkErrorBoundary, Props, State, renderWithRouter()

### Community 47 - "Module: useSupabasePaginated"
Cohesion: 0.18
Nodes (7): supabase, api(), eventService, getToken(), api(), getToken(), taskService

### Community 49 - "Module: formatDashboardDate"
Cohesion: 0.18
Nodes (8): formatDashboardDate(), formatToNJ(), getNJISOString(), timeToEST(), DaySchedule, DEFAULT_SCHEDULE, MentorSessions(), MentorSessionsProps

### Community 50 - "Module: formatToNJ"
Cohesion: 0.50
Nodes (4): 2. User Roles & Permissions, Permissions Matrix, Role-Based UI Routing, Role Hierarchy

### Community 51 - "Module: getNJDate"
Cohesion: 0.67
Nodes (3): api(), bookingService, getToken()

### Community 52 - "Module: getNJISOString"
Cohesion: 0.50
Nodes (3): Active, Completed, Tasks

### Community 53 - "Module: captureException"
Cohesion: 0.15
Nodes (11): ErrorFallback(), ErrorFallbackProps, AuthProvider(), initPostHog(), queryClient, QueryProvider(), captureException(), initSentry() (+3 more)

### Community 55 - "Module: cn"
Cohesion: 0.29
Nodes (6): cn(), Button(), ButtonProps, Card(), Input(), InputProps

### Community 58 - "Module: LoginFormData"
Cohesion: 0.16
Nodes (12): useAddBookingMutation(), notifyError(), notifySuccess(), AuthFormData, AuthPage(), BookingPage(), BookingPageProps, MONTHS (+4 more)

### Community 60 - "Module: EmailTemplate"
Cohesion: 0.32
Nodes (6): DYNAMIC_VARIABLES, MentorEmailTemplates(), MentorEmailTemplatesProps, TEMPLATE_LABELS, EmailTemplate, emailTemplateService

### Community 61 - "Module: AIChatMessage"
Cohesion: 0.27
Nodes (6): Props, AdminTab, chatWithAssistant(), getApplicationSummary(), getPreSessionBrief(), AIChatMessage

### Community 62 - "Module: Announcement"
Cohesion: 0.16
Nodes (10): Props, UserDashboardProps, Announcement, ApplicationInput, DataState, Feedback, Milestone, ResourceLink (+2 more)

### Community 63 - "Module: Application"
Cohesion: 0.16
Nodes (10): AccessRequest, MentorAccessRequests(), MentorApplications(), MentorApplicationsProps, GoalsModalProps, MentorMenteesProps, Application, Task (+2 more)

### Community 65 - "Module: Booking"
Cohesion: 0.18
Nodes (14): TaskActivityFormProps, ActivitySnapshot(), ActivitySnapshotProps, Engagement(), EngagementProps, MentorOverviewProps, PendingActions(), PendingActionsProps (+6 more)

### Community 69 - "Module: NetworkEvent"
Cohesion: 0.24
Nodes (8): MentorAccounts(), MentorEvents(), MentorEventsProps, MentorMentees(), MentorOverview(), MentorDashboard(), NetworkEvent, Loader()

### Community 70 - "Module: Product"
Cohesion: 0.18
Nodes (9): StorePage(), productService, mockEq, mockFrom, mockOrder, mockProductRow, mockSelect, mockSingle (+1 more)

### Community 72 - "Module: Review"
Cohesion: 0.67
Nodes (3): MentorReviews(), MentorReviewsProps, Review

### Community 77 - "Module: User"
Cohesion: 0.50
Nodes (3): AuthPageProps, SettingsPageProps, User

### Community 78 - "Module: UserRole"
Cohesion: 0.20
Nodes (13): Layout(), LayoutProps, ProtectedRoute(), ProtectedRouteProps, mockNavigate, mockUseAuth, AuthContext, AuthContextType (+5 more)

## Knowledge Gaps
- **336 isolated node(s):** `remoteName`, `projects`, `config`, `ipRequests`, `name` (+331 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthPage()` connect `Module: LoginFormData` to `Module: DELETE`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `handleSubmit()` connect `Module: DELETE` to `Module: LoginFormData`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getPrisma()` (e.g. with `requireRole()` and `POST()`) actually correct?**
  _`getPrisma()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `remoteName`, `projects`, `config` to the rest of the system?**
  _352 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Module: DELETE` be split into smaller, more focused modules?**
  _Cohesion score 0.08344988344988345 - nodes in this community are weakly interconnected._
- **Should `Module: POST` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Module: getAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.13953488372093023 - nodes in this community are weakly interconnected._