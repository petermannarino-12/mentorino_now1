# Product Requirements Document (PRD)

## Mentorino — Premium Mentorship Platform

**Version:** 1.0
**Date:** May 27, 2026
**Author:** Product Team
**Status:** Draft

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Full User Journey / Lifecycle Flow](#3-full-user-journey--lifecycle-flow)
4. [Student / Member Features](#4-student--member-features)
5. [Mentor Features](#5-mentor-features)
6. [Admin Features](#6-admin-features)
7. [Cross-Cutting Features](#7-cross-cutting-features)
8. [Entity / Data Model](#8-entity--data-model)
9. [AI Chat Widget Specification](#9-ai-chat-widget-specification)

---

## 1. Product Overview

| Attribute | Detail |
|-----------|--------|
| **Product Name** | Mentorino |
| **Creator / Mentor** | Peter Mannarino |
| **Tagline** | Premium career, education, and life guidance mentorship |
| **Target Audience** | College students, recent graduates, career-changers |
| **Value Proposition** | 1-on-1 strategic guidance covering career, education, and life decisions through a structured mentorship pipeline |
| **Business Model** | Premium mentorship programs + digital product sales (The Vault) |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router DOM v7 (lazy-loaded, animated transitions via Motion) |
| **State Mgmt** | TanStack React Query v5 (server) + React Context (auth) |
| **Forms** | React Hook Form v7 + Zod v4 |
| **Backend** | Netlify Functions (serverless) |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **Auth** | Supabase Auth (email/password) |
| **AI** | Google Gemini 2.0 Flash |
| **Email** | Resend API |
| **Analytics** | PostHog |
| **Error Tracking** | Sentry |
| **Hosting** | Netlify (SPA) |
| **CI/CD** | GitHub Actions |

---

## 2. User Roles & Permissions

### Role Hierarchy

```
Visitor  →  Student/Member  →  Mentor  →  Admin
(public)    (approved app)     (staff)    (super user)
```

### Permissions Matrix

| Feature Area | Visitor | Student | Mentor | Admin |
|---|---|---|---|---|
| Landing, About, Programs, FAQ, Contact | ✅ | ✅ | ✅ | ✅ |
| Apply for mentorship | ✅ | — | — | — |
| Sign up (create account) | ✅ * | — | — | — |
| Login | ✅ | ✅ | ✅ | ✅ |
| Dashboard Overview | — | ✅ | ✅ | ✅ |
| Session Booking | — | ✅ | — | — |
| The Vault (Store) | — | ✅ | — | — |
| Growth Strategy / Tasks | — | ✅ | — | — |
| Networking Events (RSVP) | — | ✅ | ✅ | ✅ |
| Survey / Feedback | — | ✅ | — | — |
| AI Chat Assistant | — | ✅ | ✅ | ✅ |
| Review Applications | — | — | ✅ | ✅ |
| Approve / Reject Applications | — | — | ✅ | ✅ |
| AI Application Analysis | — | — | — | ✅ |
| Review Student Tasks | — | — | ✅ | ✅ |
| Manage Email Templates | — | — | ✅ | ✅ |
| Manage Events (CRUD) | — | — | ✅ | ✅ |
| CRM / Student Directory | — | — | — | ✅ |
| Broadcast Announcements | — | — | — | ✅ |
| Manage Validation Rules | — | — | — | ✅ |
| Manage Products / Store | — | — | — | ✅ |
| View Revenue / Finances | — | — | — | ✅ |

*\* Signup only allowed if the visitor has an approved application.*

### Role-Based UI Routing

| Role | Dashboard Component | Navigation Items |
|---|---|---|
| **Student** (`user`) | UserDashboard | Overview, Sessions, Vault, Guidance, Settings |
| **Mentor** (`mentor`) | MentorDashboard | Dashboard, Audits, Events, Mentees, Reviews, Accounts |
| **Admin** (`admin`) | AdminDashboardWrapper | Dashboard, Applications, Students, Sessions, Activities, Networking, AI Console, Validation, More |

---

## 3. Full User Journey / Lifecycle Flow

### Phase 1: Discovery (Visitor — No Account)

```
Visitor arrives at mentorino.com
    │
    ├── Landing Page (/)
    │   ├── Hero section with CTA "APPLY FOR STRATEGIC GUIDANCE"
    │   ├── Navigation: About Mentor, Programs, Consultation, FAQ, Contact
    │   ├── Stats: 25+ Years Combined Experience, 1000+ Students Guided, 
    │   │   3 Pillars of Focus (Career, Education, Life)
    │   ├── Testimonials carousel (Mauricio L., David C., Mohamed R., Connor C.)
    │   ├── FAQ accordion (5 questions)
    │   ├── Footer: social links (Instagram, Twitter/X, LinkedIn, YouTube, Email)
    │   └── "Begin Your Trajectory" CTA button
    │
    ├── About Page (/about) — Peter Mannarino's backstory
    ├── Programs Page (/programs) — Mentorship program details
    ├── Consultation Overview (/consultation) — Strategy call info
    ├── FAQ Page (/faq) — 5 accordion questions
    ├── Contact Page (/contact) — Form: name, email, phone, subject, message
    │   └── Rate-limited: 3 submissions per 5 minutes per IP
    ├── Terms of Service (/terms)
    ├── Privacy Policy (/privacy)
    └── 404 Page (catch-all for unknown routes)
```

### Phase 2: Application (Visitor → Applicant)

```
Visitor clicks "Apply Now" → /apply
    │
    ┌──────────────────────────────────────────────────────────────┐
    │  4-STEP APPLICATION FORM                                    │
    │                                                              │
    │  Step 1: Profile & Goals                                     │
    │    ┌──────────────────────────────────────────────────┐      │
    │    │ Mentor type:       [dropdown selector           ]│      │
    │    │ Full name:         [text input                  ]│      │
    │    │ Phone:             [country code + number       ]│      │
    │    │ Email:             [email input, validated      ]│      │
    │    └──────────────────────────────────────────────────┘      │
    │                                                              │
    │  Step 2: Meeting Preference                                  │
    │    ┌──────────────────────────────────────────────────┐      │
    │    │ ○ Virtual    ○ In-Person    ○ Hybrid             │      │
    │    │ Frequency: ○ Weekly  ○ Bi-weekly  ○ Monthly     │      │
    │    └──────────────────────────────────────────────────┘      │
    │                                                              │
    │  Step 3: Goals & Seriousness                                 │
    │    ┌──────────────────────────────────────────────────┐      │
    │    │ Goals:      [textarea, multi-line               ]│      │
    │    │ Seriousness: [━━━━━━●━━━━━━━━━] (1-10 slider)    │      │
    │    └──────────────────────────────────────────────────┘      │
    │                                                              │
    │  Step 4: Commitment                                          │
    │    ┌──────────────────────────────────────────────────┐      │
    │    │ ☐ I understand this program is selective         │      │
    │    │ ☐ I authorize a background check                │      │
    │    │ [Submit Application]                             │      │
    │    └──────────────────────────────────────────────────┘      │
    └──────────────────────────────────────────────────────────────┘
            │
    Result A: Duplicate email found
            │   └── Error: "You have already submitted an application"
            │       └── Show current application status page:
            │           ├── "Pending" — "Under Review, Awaiting Feedback"
            │           ├── "Approved" — "Proceed to sign up"
            │           └── "Rejected" — "Application was not accepted"
            │
    Result B: New application — Success
            │   └── Insert into `applications` table (status: 'pending')
            │       ├── Rate limit: 1 application per 24h per email
            │       └── Email sent: application_submitted template via Resend
```

### Phase 3: Review & Decision (Mentor/Admin Side)

```
Mentor/Admin logs in → /dashboard
    │
    ├── [Mentor] → Inquiry Audit tab → Pending applications list
    │   └── Each entry: name, email, date, mentor type, status badge
    │
    └── [Admin] → Applications tab
        │
        ├── Full list with status badges (pending/approved/rejected/deleted)
        │
        ├── Click application → Detail modal
        │   ├── User info (name, email, phone)
        │   ├── Mentor type selected
        │   ├── Meeting preference + frequency
        │   ├── Goals (full text)
        │   ├── Seriousness (1-10, progress bar)
        │   └── Source / attribution
        │
        ├── [Admin Only] → "AI Intelligence Audit" button
        │   │
        │   └── Netlify function: /functions/analyze-application
        │       └── Gemini 2.0 Flash analyzes the application
        │           ├── Score (0-100)
        │           ├── Summary (2-3 sentence overview)
        │           ├── Recommendation (accept/review/manual)
        │           └── Red Flags (string array)
        │
        └── Decision actions:
                │
                ├── APPROVE
                │   ├── Status → 'approved'
                │   ├── Email sent: application_accepted template
                │   └── Result: User can now sign up (DB trigger allows registration)
                │
                ├── REJECT
                │   ├── Status → 'rejected'
                │   ├── Email sent: application_rejected template
                │   └── Result: Signup remains blocked
                │
                └── DELETE (Move to recycle bin)
                    ├── Status → 'deleted'
                    ├── Visible only in admin's recycle bin
                    └── Can restore (status → 'pending') or permanently delete
```

### Phase 4: Account Creation & Onboarding (Applicant → Student)

```
Approved applicant visits /auth → "Sign Up" tab
    │
    ├── Form fields:
    │   ├── Full Name (text)
    │   ├── Email (pre-filled from application, read-only)
    │   └── Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
    │
    ├── Supabase Auth creates user account
    │   └── DB trigger: handle_new_user()
    │       ├── Check: email has approved application? → Yes
    │       ├── Role assigned: 'user' (student)
    │       └── Profile auto-created in `profiles` table
    │
    ├── User logs in with email + password
    │   └── AuthContext initializes:
    │       ├── supabase.auth.getSession() → session token
    │       ├── Fetch profile from profiles table
    │       ├── Set user + role in React Context
    │       └── PostHog identify, Sentry set user
    │
    └── Redirect to /dashboard
            │
            └── Dashboard Overview (Student View)
                │
                ├── Step 1 Progress: Application → Approved ✅
                │
                ├── "Start Strategic Audit" CTA → /dashboard/guidance
                │   └── Personal branding form (one-time setup)
                │
                └── Welcome components:
                    ├── Strategy Broadcasts (announcements carousel)
                    ├── Networking Events section (first event)
                    ├── Pinned Resources grid
                    └── Quick Stats (calls count, feedback link)
```

### Phase 5: Active Engagement — Growth Strategy & Weekly Tasks

```
Student navigates to /dashboard/guidance or /dashboard/roadmap
    │
    ├── GROWTH STRATEGY FORM (one-time submission)
    │   └── Saves data to task_activities table
    │       ├── Personal Branding section
    │       │   ├── Business card details
    │       │   ├── LinkedIn profile URL
    │       │   ├── Resume link (Google Drive / shareable)
    │       │   ├── Cover letter link
    │       │   ├── Dress code / professional attire notes
    │       │   └── Elevator pitch / greeting intro
    │       ├── Career Roadmap topic
    │       └── Interview preparation notes
    │
    └── WEEKLY TASK ACTIVITIES (recurring)
        │
        └── 12 activity fields across 6 categories:
            │
            ├── Category 1: Personal Branding (6 fields)
            │   ├── pb_card_details
            │   ├── pb_linkedin_url
            │   ├── pb_resume_link
            │   ├── pb_cover_letter_link
            │   ├── pb_dress_code_notes
            │   └── pb_greeting_intro_notes
            │
            ├── Category 2: Networking (4 fields)
            │   ├── net_attended_event — Event name
            │   ├── net_people_met — People met
            │   ├── net_contact_info — Contacts collected
            │   └── net_panel_summary — Key takeaways
            │
            ├── Category 3: Partner Work (2 fields)
            │   ├── pw_introduction — Introductions made
            │   └── pw_volunteer_hours — Volunteer hours logged
            │
            ├── Category 4: Certification Planning
            │   └── cert_topic
            │
            ├── Category 5: Career Roadmap
            │   └── roadmap_topic
            │
            └── Category 6: Interview Preparation
                └── interview_recommendation
                    │
                    └── Status after submission: 'pending'
                        │
                        └── Mentor reviews → submits admin_response
                            └── Status updated to 'reviewed'
                                └── Student sees feedback on dashboard
```

### Phase 6: Active Engagement — Session Booking & Management

```
Student navigates to /booking
    │
    ├── Calendar Widget
    │   ├── Month navigation (← prev month | current month | next month →)
    │   ├── Day grid (Sundays disabled/greyed out)
    │   └── Selected date highlighted
    │
    ├── Time Slot Selection (5 options)
    │   ├── 09:00 AM
    │   ├── 11:00 AM
    │   ├── 02:00 PM
    │   ├── 04:30 PM
    │   └── 08:00 PM
    │
    ├── Confirm → Insert into `bookings` table
    │   └── Status: 'upcoming'
    │
    └── Success screen with booking confirmation
            │
            └── /dashboard/sessions → Sessions Management
                ├── UPCOMING SESSIONS
                │   ├── Date, time, status badge
                │   ├── "Join Now" button → opens Google Meet link
                │   ├── Notes button → modal with textarea, saves to booking.notes
                │   └── "AI Briefing" button
                │       └── Netlify: /functions/generate-brief
                │           └── Input: booking + student context + purchases
                │           └── Output: AI-generated pre-session brief
                │
                └── PAST SESSIONS (greyed out)
                    ├── Date, time, status: 'completed'
                    └── Notes read-only
```

### Phase 7: Active Engagement — Networking & The Vault

```
NETWORKING EVENTS (/dashboard/networking)
    │
    ├── Events Grid
    │   ├── Event cards: title, date, time, location, description
    │   ├── Attendee avatars + count ("12 attending")
    │   └── "Join Event" button
    │       └── Registration modal
    │           ├── Name (auto-filled)
    │           ├── Email (auto-filled)
    │           └── Reason for attending (optional textarea)
    │               └── User ID added to event.attendees JSONB array
    │
    └── Post-Event: "Submit Feedback"
        └── Opens TaskActivityForm in networking-only mode
            ├── Event name (pre-filled)
            ├── People met
            ├── Contact info collected
            └── Panel summary / key takeaways

THE VAULT STORE (/vault)
    │
    ├── [Not Approved] → "The Vault is Locked"
    │   └── "Apply for Mentorship" button → /apply
    │
    └── [Approved Student] → Product Grid
        ├── Search field
        ├── Product cards (4 products)
        │   ├── Image
        │   ├── Category badge
        │   ├── Product name
        │   ├── Description
        │   ├── Price
        │   └── "Buy" button
        │       └── Insert into transactions table (status: 'pending')
        │
        └── Products:
            ├── Career Mastery Blueprint — $499
            ├── Resume & LinkedIn Overhaul — $199
            ├── Interview Accelerator — $299
            └── The Trajectory Journal — $34.99
```

### Phase 8: Feedback Loop (Student → Mentor)

```
STUDENT completes session → /survey
    │
    ├── Rating selector (1-5 stars, visual)
    └── Comment textarea
        │
        └── Insert into `reviews` table
            │
            └── Mentor sees on dashboard (Reviews section)

STUDENT submits task activity
    │
    └── Status: 'pending'
        │
        └── MENTOR logs in → Reviews tab
            ├── List of pending tasks
            ├── Click task → Detail modal
            │   └── All 12+ activity fields displayed by category
            └── Feedback textarea → admin_response
                └── Status updated to 'reviewed'
                    └── Student sees mentor's feedback on task page
```

### Phase 9: Mentorship Oversight (Mentor Cycle)

```
Mentor Dashboard (/dashboard)
    │
    ├── Overview: pending apps count, upcoming sessions, tasks pending
    │
    ├── Inquiry Audits (/dashboard/audits)
    │   ├── Pending applications list
    │   ├── View application details
    │   └── Approve or Reject
    │
    ├── Sessions (/dashboard/sessions)
    │   ├── All bookings list
    │   ├── Start Call (Google Meet notification)
    │   └── Update Office Hours
    │
    ├── Reviews (/dashboard/reviews)
    │   ├── Pending tasks list
    │   ├── Review task details per category
    │   └── Submit feedback → update status to 'reviewed'
    │
    ├── Events (/dashboard/events)
    │   ├── Create event (title, description, date, time, location)
    │   └── Delete event
    │
    ├── Mentees (/dashboard/mentees)
    │   ├── Approved mentee list
    │   ├── Message (placeholder action)
    │   └── Remove (delete)
    │
    └── Emails (/dashboard/emails)
        ├── List 3 templates
        ├── Edit subject
        ├── Edit body
        └── Save changes
```

### Phase 10: Administration (Admin Cycle)

```
Admin Dashboard — All Mentor features PLUS:

    ├── Admin Home (/dashboard?tab=home)
    │   ├── Stats Cards
    │   │   ├── New Applications (count)
    │   │   ├── Networking Events (count)
    │   │   ├── Strategy Audits (count)
    │   │   └── Sessions (count)
    │   ├── Active Mentees / Completed Sessions KPIs
    │   ├── Recent Inbound Applications mini-list
    │   ├── Next Sessions mini-list
    │   ├── AI Strategy Partner quick launch button
    │   └── Command Buttons: Schedule, Audits, Students, SOPs, Global Broadcast
    │
    │
    ├── Applications (/dashboard?tab=applications)
    │   ├── Full list with status badges + filters
    │   ├── Click → Detail modal (same as mentor)
    │   ├── "AI Intelligence Audit" button
    │   │   └── Gemini returns: score, summary, recommendation, redFlags[]
    │   ├── Accept/Reject with email template preview
    │   ├── "Rubberstamp Acceptance" preset comment
    │   └── Recycle Bin
    │       ├── Deleted applications list
    │       ├── Restore (status → 'pending')
    │       └── Permanent Delete
    │
    │
    ├── Students / CRM (/dashboard?tab=students)
    │   ├── Full directory with search bar
    │   ├── Click student → Detail modal
    │   │   ├── Assigned Tasks list (mark status, assign new)
    │   │   ├── Milestones (completed indicator)
    │   │   ├── Mentor Notes (add new note)
    │   │   └── Tags (e.g., "Strategist")
    │   └── Task assignment: default "New Strategic Task"
    │
    │
    ├── Activities (/dashboard?tab=activities)
    │   ├── Full task_activities list with status filter
    │   ├── Click → Detail modal per category:
    │   │   ├── Personal Branding (6 sub-fields)
    │   │   ├── Career Roadmap
    │   │   ├── Interview Prep
    │   │   ├── Networking (4 sub-fields)
    │   │   ├── Partner Work (2 sub-fields)
    │   │   └── Certification Planning
    │   └── Feedback textarea → Update status to 'reviewed'
    │
    │
    ├── AI Console (/dashboard?tab=ai)
    │   ├── Full-page AI chat interface (Gemini 2.0 Flash)
    │   ├── Chat history display
    │   ├── Preset: "Rubberstamp Acceptance"
    │   └── Inline input with Enter key support
    │
    │
    ├── Broadcast (/dashboard?tab=broadcast)
    │   ├── Active Updates list (announcements)
    │   ├── New Broadcast form
    │   │   ├── Title
    │   │   ├── Content
    │   │   └── Priority (Low / Medium / High)
    │   └── "Send Global Alert" (simulated)
    │
    │
    ├── Validation (/dashboard?tab=validation)
    │   ├── Rules list: Entity | Field | Operator | Value | Error Msg | Active
    │   ├── Create Rule form:
    │   │   ├── Entity: Application / User / TaskActivity / Product / Booking
    │   │   ├── Field: [dynamic based on entity]
    │   │   ├── Operator: Required / Min Length / Max Length / Regex Pattern /
    │   │   │            Min Value / Max Value
    │   │   ├── Value: [depends on operator]
    │   │   └── Error Message: [custom text]
    │   ├── Toggle active/inactive (switch)
    │   └── Delete rule (with confirmation)
    │
    │
    └── More (/dashboard?tab=more)
        ├── Availability
        ├── Digital Products / Store Management
        ├── Revenue / Finances
        ├── AI Partner
        ├── Guidelines
        ├── Data Rules
        ├── Settings
        └── System Logout
```

### Phase 11: Ongoing Lifecycle Diagram

```
                         ┌─────────────────┐
                         │    VISITOR      │
                         │  (No Account)   │
                         └────────┬────────┘
                                  │ Apply
                                  ▼
                         ┌─────────────────┐
                         │    PENDING      │
                         │   APPLICATION   │
                         └────────┬────────┘
                                  │ Mentor/Admin Review
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐       ┌─────────────────┐
           │    APPROVED     │       │    REJECTED     │
           └────────┬────────┘       └─────────────────┘
                    │
                    ▼
           ┌─────────────────┐
           │   SIGN UP /     │
           │    LOGIN        │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │    STUDENT /    │
           │    MEMBER       │
           └────────┬────────┘
                    │
        ┌───────────┼───────────┬──────────────┬──────────────┐
        │           │           │              │              │
        ▼           ▼           ▼              ▼              ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐  ┌──────────┐  ┌──────────┐
   │ Growth  │ │ Weekly  │ │ Session │  │Networking│  │  Vault   │
   │Strategy │ │  Tasks  │ │ Booking │  │ Events   │  │  Store   │
   └─────────┘ └────┬────┘ └────┬────┘  └────┬─────┘  └──────────┘
                     │           │            │
                     ▼           ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ Mentor   │ │  Join    │ │  Buy     │
              │ Reviews  │ │  Call    │ │ Product  │
              └────┬─────┘ └────┬─────┘ └──────────┘
                   │            │
                   ▼            ▼
              ┌──────────┐ ┌──────────┐
              │Feedback  │ │  Survey  │
              │& Revise  │ │ / Rating │
              └──────────┘ └──────────┘
                   │            │
                   └────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  PROGRAM CYCLE   │
              │   CONTINUES      │
              │  (Tasks → Book → │
              │  Review → Grow)  │
              └──────────────────┘
```

---

## 4. Student / Member Features

### 4.1 Dashboard Overview

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard` (UserDashboard) |
| **Access** | Authenticated student (role: `user`) |
| **Description** | Personalized landing page showing progress, tasks, events, and resources |

**Components:**

| Component | Description |
|-----------|-------------|
| Growth Velocity Card | Progress percentage with visual indicator |
| Application Status Tracker | 5-step flow: No App → Pending → Approved → Strategy → Sessions → Engaged |
| Tasks Pending Counter | Number of incomplete tasks |
| Milestones Progress | Completed vs total milestones |
| Strategy Broadcasts | Announcements carousel (only if approved) |
| Networking Events | First event with attend button (only if approved) |
| Active Tasks List | Tasks with "Mark Done" action (only if approved) |
| Milestone List | Milestone component with completion states |
| Pinned Resources Grid | Resource links with download icons (only if approved) |
| Quick Stats | Calls count, feedback link |

**User Story:** "As a student, I want to see my overall mentorship progress and access all tools from one central dashboard."

**States:**
- **No application:** Shows "Apply Now" CTA
- **Pending application:** Shows "Under Review — Awaiting Feedback"
- **Approved (no strategy):** Shows "Start Strategic Audit" CTA → /dashboard/roadmap
- **Strategy complete:** Shows full dashboard with tasks, events, resources
- **Full engagement:** All components active

---

### 4.2 Session Management

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/sessions` |
| **Access** | Authenticated student |
| **Description** | View upcoming and past sessions, join calls, edit notes, generate AI briefs |

**Features:**

| Feature | Detail |
|---------|--------|
| Upcoming Sessions List | Date, time, status badge, "Join Now" (Google Meet) |
| Notes Editing | Modal with textarea, saves to `bookings.notes` |
| AI Pre-Session Brief | Button → calls Gemini with booking + student context + purchases |
| Past Sessions | Greyed out, read-only notes |

**User Story:** "As a student, I want to view my scheduled sessions and join them with one click."

---

### 4.3 Session Booking

| Aspect | Detail |
|--------|--------|
| **Route** | `/booking` |
| **Access** | Authenticated student |
| **Description** | Calendar-based booking with 5 time slots |

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID (FK→profiles) | Student who booked |
| `user_name` | string | Student's name |
| `date` | string (YYYY-MM-DD) | Booking date |
| `time` | string | e.g., "09:00 AM" |
| `status` | enum | `upcoming` / `completed` / `cancelled` |
| `notes` | text (nullable) | Session notes |

**User Story:** "As a student, I want to book a strategy call at a convenient time."

**UI Flow:**
1. Calendar widget — month nav, day selection (Sundays disabled)
2. Time slot picker — 5 fixed slots
3. Confirmation — inserts booking with status `upcoming`
4. Success screen

---

### 4.4 Growth Strategy / Roadmap

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/guidance`, `/dashboard/roadmap` |
| **Access** | Authenticated student |
| **Description** | One-time personal branding audit + recurring weekly task activities |

**One-Time Growth Strategy Form:**
- Personal Branding checklist (6 fields)
- Career Roadmap topic
- Interview Preparation notes

**Weekly Task Activities — 6 Categories (12+ fields):**

| Category | Fields | Description |
|----------|--------|-------------|
| **Personal Branding** | 6 | Business card, LinkedIn, Resume, Cover letter, Dress code, Elevator pitch |
| **Networking** | 4 | Event attended, People met, Contact info, Panel summary |
| **Partner Work** | 2 | Introductions made, Volunteer hours |
| **Certification Planning** | 1 | Certification topic |
| **Career Roadmap** | 1 | Roadmap topic |
| **Interview Prep** | 1 | Interview preparation notes |

**User Story:** "As a student, I want to submit my growth activities and receive mentor feedback."

**Status Flow:** `pending` → mentor reviews → `reviewed` (with admin_response)

---

### 4.5 The Vault (Store)

| Aspect | Detail |
|--------|--------|
| **Route** | `/vault` |
| **Access** | Authenticated student (approved) |
| **Description** | Digital product catalog with 4 resources |

**States:**

| State | Behavior |
|-------|----------|
| Not approved | "The Vault is Locked" — "Apply for Mentorship" button → /apply |
| Approved | Full product grid displayed |

**Products:**

| Product | Price |
|---------|-------|
| Career Mastery Blueprint | $499 |
| Resume & LinkedIn Overhaul | $199 |
| Interview Accelerator | $299 |
| The Trajectory Journal | $34.99 |

**Product Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `full_name` | string | Product name |
| `description` | text | Product description |
| `price` | decimal | Price |
| `image` | string (URL) | Product image |
| `category` | string | Category |
| `sales_count` | integer | Number sold |
| `status` | enum | `active` / `draft` |

**User Story:** "As a student, I want to browse and purchase digital resources to accelerate my growth."

**Note:** No payment gateway integration — purchases recorded as `pending` transactions.

---

### 4.6 Networking Events

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/networking` |
| **Access** | Authenticated student |
| **Description** | Event grid with RSVP, attendee tracking, post-event reports |

**Event Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | string | Event name |
| `description` | text | Event description |
| `date` | string (YYYY-MM-DD) | Event date |
| `time` | string (HH:MM) | Event time |
| `location` | string | Physical or virtual location |
| `link` | string (nullable) | Join link |
| `attendees` | UUID[] (JSONB) | Array of user IDs |
| `created_at` | timestamp | Creation timestamp |

**Features:**
- Events grid (title, date, time, location, description)
- Attendee avatars with count
- "Join Event" → Registration modal (auto-filled name/email, reason)
- Post-event "Submit Feedback" → TaskActivityForm (networking fields only)

**User Story:** "As a student, I want to discover and join networking events to expand my professional network."

---

### 4.7 Survey / Feedback

| Aspect | Detail |
|--------|--------|
| **Route** | `/survey` |
| **Access** | Authenticated student |
| **Description** | Post-session feedback form |

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `reviewer_name` | string | Student's name |
| `reviewer_email` | string | Student's email |
| `rating` | integer (1-5) | Star rating |
| `comment` | text (nullable) | Written feedback |
| `created_at` | timestamp | Submission time |

**User Story:** "As a student, I want to provide feedback on my mentorship experience."

---

### 4.8 AI Chat Assistant

| Aspect | Detail |
|--------|--------|
| **Visibility** | All authenticated pages (floating widget) |
| **Position** | Bottom-right corner |
| **Backend** | Gemini 2.0 Flash via Netlify function |
| **Context** | Career guidance, session prep, program questions |

**User Story:** "As a student, I want to ask career and program questions via AI chat at any time."

---

### 4.9 Settings

| Aspect | Detail |
|--------|--------|
| **Route** | `/settings` |
| **Access** | Authenticated student |
| **Description** | Account management page |

**User Story:** "As a student, I want to manage my account settings and log out."

---

## 5. Mentor Features

### 5.1 Mentor Dashboard

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard` (MentorDashboard) |
| **Access** | Authenticated mentor (role: `mentor`) |
| **Description** | Consolidated view of applications, bookings, tasks, events, reviews |

**User Story:** "As a mentor, I want to see all pending items at a glance."

---

### 5.2 Inquiry Audits

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/audits` |
| **Access** | Mentor |
| **Description** | Review pending applications, approve or reject |

**Features:**
- Pending applications list
- Application detail view (full form data)
- Approve / Reject actions

**User Story:** "As a mentor, I want to review incoming applications and make admission decisions."

---

### 5.3 Mentees

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/mentees` |
| **Access** | Mentor |
| **Description** | List of approved mentees |

**Features:**
- Mentee list (name, email, status)
- Message action (placeholder)
- Remove action (with confirmation)

**User Story:** "As a mentor, I want to see my mentees and manage the relationship."

---

### 5.4 Session Management

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/sessions` |
| **Access** | Mentor |
| **Description** | View and manage bookings |

**Features:**
- All bookings list
- "Start Call" button (Google Meet notification)
- "Update Office Hours" action

**User Story:** "As a mentor, I want to manage my scheduled sessions."

---

### 5.5 Task Reviews

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/reviews` |
| **Access** | Mentor |
| **Description** | Review and provide feedback on student tasks |

**Features:**
- Pending tasks list (filtered by `status === 'pending'`)
- Task detail modal showing all 12+ activity fields by category
- Feedback textarea → updates task to `reviewed` with `admin_response`

**User Story:** "As a mentor, I want to review student task submissions and provide actionable feedback."

---

### 5.6 Events Management

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/events` |
| **Access** | Mentor |
| **Description** | Create and delete networking events |

**Features:**
- Events list
- Create event form (title, description, date, time, location)
- Delete event (with confirmation)

**User Story:** "As a mentor, I want to create and manage networking events for students."

---

### 5.7 Email Templates

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/emails` |
| **Access** | Mentor |
| **Description** | Edit email templates sent to applicants |

**Templates:**

| ID | Trigger | Subject | Body |
|----|---------|---------|------|
| `application_submitted` | New application submitted | Editable | Editable |
| `application_accepted` | Application approved | Editable | Editable |
| `application_rejected` | Application rejected | Editable | Editable |

**Template Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | text (PK) | Template identifier |
| `subject` | string | Email subject line |
| `body` | text | Email body (HTML/text) |
| `updated_at` | timestamp | Last modified |

**User Story:** "As a mentor, I want to customize email notifications sent to applicants throughout the process."

---

### 5.8 Accounts

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard/accounts` |
| **Access** | Mentor |
| **Description** | Account management |

**User Story:** "As a mentor, I want to manage my account settings."

---

## 6. Admin Features

*Admins have access to ALL mentor features PLUS the following:*

### 6.1 Admin Home

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=home` |
| **Access** | Admin |
| **Description** | Stats dashboard with KPIs and quick-action command buttons |

**KPIs:**

| Metric | Description |
|--------|-------------|
| New Applications | Count of pending applications |
| Networking Events | Count of upcoming events |
| Strategy Audits | Count of pending task reviews |
| Sessions | Count of upcoming bookings |
| Active Mentees | Total active students |
| Completed Sessions | Total completed sessions |

**Command Buttons:**
- Schedule — Quick link to sessions
- Audits — Quick link to application audits
- Students — Quick link to CRM
- SOPs — Standard operating procedures
- Global Broadcast — Quick announcement creation

**AI Strategy Partner:** One-click launch of AI chat console

**User Story:** "As an admin, I want a bird's-eye view of platform activity with quick access to key actions."

---

### 6.2 Applications (Advanced)

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=applications` |
| **Access** | Admin |
| **Description** | Full application management with AI analysis, bulk actions, recycle bin |

**Features beyond Mentor:**

| Feature | Description |
|---------|-------------|
| AI Intelligence Audit | Calls Gemini 2.0 Flash for score, summary, recommendation, red flags |
| Email Preview | Shows email template before sending accept/reject |
| Rubberstamp Acceptance | One-click accept with preset comment |
| Recycle Bin | View deleted apps; restore or permanently delete |

**AI Analysis Output:**

| Field | Type | Example |
|-------|------|---------|
| `score` | number (0-100) | 85 |
| `summary` | string | "Strong candidate with clear goals in tech..." |
| `recommendation` | string | "Accept — well-prepared for the program" |
| `redFlags` | string[] | ["Vague career direction", "Low seriousness score"] |

**User Story:** "As an admin, I want AI-powered insights to make informed and efficient application decisions."

---

### 6.3 Students / CRM

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=students` |
| **Access** | Admin |
| **Description** | Full student directory with search, task management, milestones, notes, tags |

**Features:**

| Feature | Description |
|---------|-------------|
| Student Directory | Full list with search bar |
| Student Detail Modal | Tasks, milestones, notes, tags |
| Task Assignment | Assign default "New Strategic Task" |
| Milestone Tracking | View completion status |
| Mentor Notes | Add and view notes per student |
| Tags | Add labels (e.g., "Strategist") |

**User Story:** "As an admin, I want to manage all student relationships and progress from one place."

---

### 6.4 Activities (Detailed Audit)

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=activities` |
| **Access** | Admin |
| **Description** | Full task_activities audit with per-category drill-down |

**Detail Modal Sections:**

| Category | Fields Visible |
|----------|----------------|
| Personal Branding | Business card, LinkedIn, Resume, Cover letter, Dress code, Elevator pitch |
| Career Roadmap | Roadmap topic |
| Interview Prep | Interview notes |
| Networking | Event attended, People met, Contact info, Panel summary |
| Partner Work | Introductions, Volunteer hours |
| Certification Planning | Certification topic |

**User Story:** "As an admin, I want to drill into every aspect of a student's activity submission for thorough evaluation."

---

### 6.5 AI Console

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=ai` |
| **Access** | Admin |
| **Description** | Full-page AI chat interface with Gemini 2.0 Flash |

**Features:**
- Full chat history display
- Message input with Enter key support
- "Rubberstamp Acceptance" preset button
- AI responses for program management questions

**User Story:** "As an admin, I want a dedicated AI assistant for platform management tasks."

---

### 6.6 Broadcast

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=broadcast` |
| **Access** | Admin |
| **Description** | Announcement CRUD with priority levels |

**Announcement Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `title` | string | Announcement title |
| `content` | text | Announcement body |
| `priority` | enum | `low` / `medium` / `high` |
| `created_at` | timestamp | Creation time |
| `program_type` | string (nullable) | Program filter |

**User Story:** "As an admin, I want to send announcements to all students with different priority levels."

---

### 6.7 Validation Rules

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=validation` |
| **Access** | Admin |
| **Description** | Dynamic form validation rule engine (no-code) |

**Entities (5):**

| Entity | Description |
|--------|-------------|
| Application | Application form fields |
| User | Profile fields |
| TaskActivity | Growth strategy audit fields |
| Product | Store product fields |
| Booking | Session booking fields |

**Operators (6):**

| Operator | Type | Description |
|----------|------|-------------|
| `required` | any | Field must not be empty/null |
| `minLength` | string | Minimum character length |
| `maxLength` | string | Maximum character length |
| `pattern` | string | Regex pattern match |
| `min` | number | Minimum numeric value |
| `max` | number | Maximum numeric value |

**Rule Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `field` | string | Target field name |
| `entity` | enum | One of 5 entities |
| `operator` | enum | One of 6 operators |
| `value` | any | Rule value (string/number/regex) |
| `errorMessage` | string | Custom error message |
| `isActive` | boolean | Toggle on/off |
| `created_at` | timestamp | Creation time |

**User Story:** "As an admin, I want to configure form validation rules without code changes."

---

### 6.8 More Menu

| Aspect | Detail |
|--------|--------|
| **Route** | `/dashboard?tab=more` |
| **Access** | Admin |
| **Description** | Additional system management tools |

**Quick Actions:**
- Availability — Set mentor availability
- Digital Products — Manage store products
- Revenue / Finances — View financial data
- AI Partner — AI configuration
- Guidelines — Program guidelines
- Data Rules — Data management rules
- Settings — System settings
- System Logout — Log out of admin session

**User Story:** "As an admin, I want access to all additional system management tools in one place."

---

## 7. Cross-Cutting Features

### 7.1 AI Integration (Gemini 2.0 Flash)

| AI Feature | Input | Output | Endpoint | Trigger |
|-----------|-------|--------|----------|---------|
| Application Analysis | Full application object | score (0-100), summary, recommendation, redFlags[] | `/functions/analyze-application` | Admin clicks "AI Intelligence Audit" |
| Pre-Session Brief | booking + student context + purchased products | AI-generated brief (text) | `/functions/generate-brief` | Mentor/student clicks "AI Briefing" |
| Chat Assistant | chat history [{role, text}] + message | AI response (text) | `/functions/chat` | User sends message in chat widget |

**Fallback Behavior:**
- Application Analysis: `{ score: 0, summary: "Analysis unavailable.", recommendation: "Manual review required.", redFlags: [] }`
- Pre-Session Brief: `"Brief could not be generated."`
- Chat Assistant: `"I'm sorry, I'm experiencing some technical difficulties..."`

**Validation:** All AI function inputs validated with Zod schemas before processing.

---

### 7.2 Email System (Resend)

| Aspect | Detail |
|--------|--------|
| **Provider** | Resend API |
| **Templates** | 3 editable templates stored in `email_templates` table |
| **Triggers** | Application submitted → confirmation email |
| | Application approved → acceptance email |
| | Application rejected → rejection email |
| **Template Management** | Editable by mentors/admins via `/dashboard/emails` |
| **Config** | `RESEND_API_KEY`, `SENDER_EMAIL` environment variables |

---

### 7.3 Security

| Layer | Implementation |
|-------|----------------|
| **Database** | Row Level Security (RLS) on all tables |
| **Authentication** | Supabase Auth (email/password) |
| **Authorization** | Role-based (visitor/user/mentor/admin) |
| **Rate Limiting** | Contact form: 3 submissions per 5 min per IP |
| | Application: 1 per 24h per email |
| **Password Policy** | Min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| **Signup Gate** | DB trigger prevents signup without approved application |
| **Role Escalation** | DB trigger prevents non-admin users from changing their role |
| **Error Monitoring** | Sentry (0.1 sample rate in production) |
| **API Security** | Auth token verified in all Netlify functions before admin operations |

---

### 7.4 Analytics (PostHog)

| Aspect | Detail |
|--------|--------|
| **Events Tracked** | Page views, user actions |
| **User Identification** | On login — identifies user for cohort analysis |
| **Session Recording** | Recorded with input masking for privacy |
| **Config** | `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN`, `VITE_PUBLIC_POSTHOG_HOST` |

---

### 7.5 SEO

| Aspect | Detail |
|--------|--------|
| **Library** | react-helmet-async |
| **Per-Page Meta** | Title, description, OpenGraph tags, Twitter Cards |
| **Sitemap** | `robots.txt` served from dist |
| **Structure** | Semantic HTML with proper heading hierarchy |

---

### 7.6 Responsive Design

| Breakpoint | Target |
|------------|--------|
| Mobile (< 640px) | Single column, hamburger nav |
| Tablet (640-1024px) | 2-column layouts |
| Desktop (> 1024px) | Full multi-column layouts |

**Styling:** Tailwind CSS with custom design tokens (colors, spacing, typography in `src/styles/theme.ts`)

---

### 7.7 Error Handling

| Aspect | Detail |
|--------|--------|
| **Chunk Loading Errors** | Auto page reload on chunk load failure |
| **API Errors** | Toast notifications via sonner |
| **Boundary Errors** | Sentry capture with user context |
| **Form Errors** | Zod validation messages displayed inline |

---

## 8. Entity / Data Model

### 8.1 `profiles`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, FK→auth.users | User identifier |
| `email` | TEXT | UNIQUE, NOT NULL | User email |
| `name` | TEXT | NOT NULL | Display name |
| `role` | TEXT | NOT NULL, DEFAULT 'user' | `visitor` / `user` / `mentor` / `admin` |
| `avatar` | TEXT | | Avatar URL |
| `mentorship_status` | TEXT | | `applied` / `approved` / `active` / `completed` |
| `joined_date` | TIMESTAMPTZ | | Date joined |
| `tags` | JSONB | | Array of tags |
| `notes` | JSONB | | Array of notes |
| `tasks` | JSONB | | Array of task objects |
| `milestones` | JSONB | | Array of milestone objects |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

### 8.2 `applications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Application identifier |
| `user_email` | TEXT | UNIQUE, NOT NULL | Applicant email |
| `user_name` | TEXT | | Applicant name |
| `user_phone` | TEXT | | Phone with country code |
| `mentor_type` | TEXT | | Selected mentor type |
| `meeting_preference` | TEXT | | Virtual / In-Person / Hybrid |
| `frequency` | TEXT | | Weekly / Bi-weekly / Monthly |
| `goals` | TEXT | | Goals text |
| `seriousness` | INTEGER | 1-10 | Seriousness rating |
| `attribution` | TEXT | | How they heard |
| `source` | TEXT | | Source tracking |
| `tags` | JSONB | | Array of tags |
| `notes` | JSONB | | Array of notes |
| `status` | TEXT | NOT NULL, DEFAULT 'pending' | pending / approved / rejected / deleted |
| `responses` | JSONB | | All form responses (legacy) |
| `ai_score` | NUMERIC | | AI analysis score |
| `pillar` | TEXT | | Program pillar |
| `experience` | TEXT | | Experience level |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Submission timestamp |

### 8.3 `bookings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Booking identifier |
| `user_id` | UUID | FK→profiles.id | Student who booked |
| `user_name` | TEXT | | Student name |
| `date` | DATE | | Booking date |
| `time` | TEXT | | Time slot |
| `status` | TEXT | DEFAULT 'upcoming' | upcoming / completed / cancelled |
| `notes` | TEXT | | Session notes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

### 8.4 `task_activities`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Activity identifier |
| `user_id` | UUID | FK→profiles.id | Student |
| `user_name` | TEXT | | Student name |
| `status` | TEXT | DEFAULT 'pending' | pending / reviewed |
| `admin_response` | TEXT | | Mentor feedback |
| `pb_card_details` | TEXT | | Business card details |
| `pb_linkedin_url` | TEXT | | LinkedIn URL |
| `pb_resume_link` | TEXT | | Resume link |
| `pb_cover_letter_link` | TEXT | | Cover letter link |
| `pb_dress_code_notes` | TEXT | | Dress code notes |
| `pb_greeting_intro_notes` | TEXT | | Elevator pitch |
| `net_attended_event` | TEXT | | Event attended |
| `net_people_met` | TEXT | | People met |
| `net_contact_info` | TEXT | | Contacts collected |
| `net_panel_summary` | TEXT | | Panel takeaways |
| `pw_introduction` | TEXT | | Introductions made |
| `pw_volunteer_hours` | TEXT | | Volunteer hours |
| `cert_topic` | TEXT | | Certification topic |
| `roadmap_topic` | TEXT | | Career roadmap topic |
| `interview_recommendation` | TEXT | | Interview prep notes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Submission timestamp |

### 8.5 `events`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Event identifier |
| `title` | TEXT | NOT NULL | Event title |
| `description` | TEXT | | Event description |
| `date` | DATE | | Event date |
| `time` | TIME | | Event time |
| `location` | TEXT | | Location |
| `link` | TEXT | | Join link |
| `attendees` | JSONB | DEFAULT '[]' | Array of user IDs |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

### 8.6 `products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Product identifier |
| `full_name` | TEXT | NOT NULL | Product name |
| `description` | TEXT | | Product description |
| `price` | DECIMAL | NOT NULL | Price |
| `image` | TEXT | | Image URL |
| `category` | TEXT | | Category |
| `sales_count` | INTEGER | DEFAULT 0 | Number sold |
| `status` | TEXT | DEFAULT 'active' | active / draft |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

### 8.7 `reviews`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Review identifier |
| `reviewer_name` | TEXT | | Reviewer name |
| `reviewer_email` | TEXT | | Reviewer email |
| `rating` | INTEGER | 1-5 | Rating |
| `comment` | TEXT | | Review comment |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Submission timestamp |

### 8.8 `transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Transaction identifier |
| `user_id` | UUID | FK→profiles.id | Student |
| `product_id` | UUID | FK→products.id | Product purchased |
| `amount` | DECIMAL | | Transaction amount |
| `status` | TEXT | | successful / pending / failed |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Transaction timestamp |

### 8.9 `validation_rules`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Rule identifier |
| `field` | TEXT | NOT NULL | Target field name |
| `entity` | TEXT | NOT NULL | Application / User / TaskActivity / Product / Booking |
| `operator` | TEXT | NOT NULL | required / minLength / maxLength / pattern / min / max |
| `value` | TEXT | | Rule parameter value |
| `errorMessage` | TEXT | | Custom error message |
| `isActive` | BOOLEAN | DEFAULT true | Toggle |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

### 8.10 `email_templates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Template identifier |
| `subject` | TEXT | | Email subject |
| `body` | TEXT | | Email body content |
| `updated_at` | TIMESTAMPTZ | | Last modified |

### 8.11 `announcements`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Announcement identifier |
| `title` | TEXT | | Announcement title |
| `content` | TEXT | | Announcement body |
| `priority` | TEXT | | low / medium / high |
| `program_type` | TEXT | | Optional program filter |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

### 8.12 `contact_messages`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Message identifier |
| `name` | TEXT | | Sender name |
| `email` | TEXT | | Sender email |
| `phone` | TEXT | | Sender phone |
| `subject` | TEXT | | Message subject |
| `message` | TEXT | | Message body |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Submission timestamp |

### 8.13 `newsletter_subscribers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Subscriber identifier |
| `email` | TEXT | UNIQUE | Subscriber email |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Signup timestamp |

### 8.14 `resource_links`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK | Resource identifier |
| `title` | TEXT | | Resource title |
| `url` | TEXT | | Resource URL |
| `category` | TEXT | | Resource category |
| `is_pinned` | BOOLEAN | DEFAULT false | Pinned to dashboard |

---

## 9. AI Chat Widget Specification

| Aspect | Detail |
|--------|--------|
| **Visibility** | All authenticated pages (student, mentor, admin) |
| **Position** | Floating bottom-right corner |
| **Trigger** | Click chat bubble icon |
| **Backend Model** | Gemini 2.0 Flash |
| **API Endpoint** | Netlify function: `/functions/chat` |
| **Input** | Chat history array `[{role: 'user'|'model', text: string}]` + new message string |
| **Output** | AI text response |
| **Validation** | Zod schema validation before processing |
| **Context Scope** | Career guidance, session preparation, program questions, general mentorship |
| **Fallback Message** | "I'm sorry, I'm experiencing some technical difficulties..." |
| **Preset Welcome** | Initial greeting message shown on first open |

---

*End of PRD Document — Mentorino Platform v1.0*
