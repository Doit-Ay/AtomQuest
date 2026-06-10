# 🎯 AtomQuest — Goal Setting & Tracking Portal

> **AtomQuest Hackathon 1.0** | Comprehensive Performance Management System

AtomQuest is an enterprise-grade, goal-setting and performance-tracking platform built for organizations following structured appraisal cycles. It digitizes the entire lifecycle — from goal definition and manager approval to quarterly check-ins, weighted scoring, analytics, and automated notifications.

---

## 🚀 Live Demo

**URL:** [https://atom-quest-dun.vercel.app](https://atom-quest-dun.vercel.app)

### Quick Login Credentials (password: `password123`)

| Role     | User          | Email                        |
|----------|---------------|------------------------------|
| Employee | Aditya Singh  | employee@atomquest.dev       |
| Manager  | Rajesh Kumar  | manager@atomquest.dev        |
| Admin    | Priya Sharma  | admin@atomquest.dev          |

### Microsoft SSO
Click **"Sign in with Microsoft"** to login via Azure AD — auto-provisions new users with org hierarchy sync.

---

## ✨ Core Features (Phase 1 & 2)

### 🔐 Role-Based Access Control
- **Employee**: Create goals, submit sheets, log quarterly achievements
- **Manager**: Approve/return goal sheets, manage team, push shared goals
- **Admin**: Full system control — user management, cycle admin, audit trails

### 📋 Goal Creation & Approval (Phase 1)
- Select Thrust Area, define Goal Title/Description
- Assign Unit of Measurement: Numeric, %, Timeline, or Zero-based
- Set Targets and Weightage per goal
- System-enforced validation: total=100%, min=10%, max 8 goals
- Manager (L1) approval with inline edit, approve, or return for rework
- Goals locked on approval — no edits without Admin intervention

### 📊 Achievement Tracking & Check-ins (Phase 2)
- Quarterly update interface for Actual vs. Planned achievements
- Status selection: Not Started / On Track / Completed
- Manager check-in module with structured comments
- System-computed progress scores per goal

### 🔗 Shared Goals
- Admin/Manager can push templated goals to multiple employees
- Multi-recipient selection with "Select All"
- Auto-creates goal sheets for recipients without one
- Recipients receive email + Teams notifications
- Goal Title and Target read-only; weightage adjustable

---

## 🏆 Bonus Features (All Implemented)

### 5.1 Microsoft Entra ID (Azure AD) Integration ✅
- **Single Sign-On (SSO)** via Microsoft Entra ID provider
- **Automatic org hierarchy sync** — manager reporting lines derived from Microsoft Graph API (`/me/manager`)
- **Role assignment from Azure AD groups** — configurable group-to-role mapping (Admin/Manager/Employee)
- Auto-provisioning of new users on first SSO login
- Profile sync on every login (department, manager, role updates)

### 5.2 Email & Microsoft Teams Integration ✅
- **Automated email notifications** for: goal submission, approval, rejection, check-in reminders, shared goal assignments
- **Teams Adaptive Card notifications** via Incoming Webhook for all lifecycle events
- **Deep-link support** — every Teams card includes a direct link to the relevant goal sheet/page
- Dark-themed HTML email templates matching the portal design

### 5.3 Escalation Module (Rule-Based) ✅
- Configurable escalation rules triggered by defined conditions:
  - Employee has not submitted goals within 14 days of cycle open
  - Manager has not approved goals within 7 days of submission
  - Quarterly check-in not completed within 21 days of window
- Severity classification: High / Medium / Low
- Escalation log visible to Admin/HR for tracking and resolution

### 5.4 Analytics Module ✅
- **QoQ Performance Trend** — Area chart tracking weighted scores across quarters
- **Goal Status Distribution** — Interactive donut chart
- **Thrust Area Breakdown** — Horizontal bar chart by organizational focus
- **Employee Comparison** — Gradient bar chart for team benchmarking
- **Organizational Alignment Sunburst** — D3.js radial hierarchy: Org → Department → Employee → Goals

---

## 📈 Reporting & Governance

- **Achievement Report**: Exportable (CSV / Excel) showing Planned vs. Actual for all employees
- **Completion Dashboard**: Real-time view of check-in completion status
- **Audit Trail**: Every change logged with user, timestamp, action type, and JSON diff viewer
- **Multi-sheet Excel Export**: Goals, Summary, and Check-in data in `.xlsx` format

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      Next.js 16 (App Router + RSC)                      │
├───────────┬───────────┬───────────┬───────────┬──────────┬──────────────┤
│   Login   │ Dashboard │   Goals   │ Approvals │ Reports  │    Admin     │
│   (SSO)   │   (RSC)   │   (RSC)   │   (RSC)   │  (RSC)   │   (RSC)     │
├───────────┴───────────┴───────────┴───────────┴──────────┴──────────────┤
│              Server Actions (goals.ts, admin.ts, etc.)                   │
├──────────────────────────────────────────────────────────────────────────┤
│           Prisma v7 ORM + PostgreSQL (Supabase)                          │
├──────────────────────────────────────────────────────────────────────────┤
│   NextAuth v5 (Credentials + Microsoft Entra ID SSO) + JWT Sessions      │
├──────────────────────────────────────────────────────────────────────────┤
│ Microsoft  │ Microsoft │  Resend  │ D3.js    │ Recharts │ xlsx Export   │
│ Graph API  │ Teams     │  Email   │ Sunburst │ Charts   │ CSV/Excel    │
└────────────┴───────────┴──────────┴──────────┴──────────┴──────────────┘
```

### Authentication Flow
```
User → Login Page
  ├── Credentials (email/password) → JWT → Dashboard
  └── Microsoft SSO → Azure AD → Graph API (org sync) → JWT → Dashboard
```

### Notification Flow
```
Goal Event (submit/approve/return)
  ├── Email (Resend API) → Employee/Manager inbox
  └── Teams (Webhook) → Adaptive Card → Channel notification
                              └── Deep-link → AtomQuest page
```

---

## 📱 Pages & Routes (16 total)

| Route                      | Access     | Description                              |
|----------------------------|------------|------------------------------------------|
| `/login`                   | Public     | SSO + Quick login + email/password auth  |
| `/dashboard`               | All roles  | Role-aware dashboard with metrics        |
| `/dashboard/goals`         | All        | Goal creation, editing, submission       |
| `/dashboard/approvals`     | Mgr/Admin  | Review and approve/return goal sheets   |
| `/dashboard/team`          | Mgr/Admin  | Team member overview & scores           |
| `/dashboard/checkins`      | All        | Quarterly achievement entry             |
| `/dashboard/shared-goals`  | Mgr/Admin  | Push shared goals to team members       |
| `/dashboard/escalations`   | Mgr/Admin  | Overdue compliance escalations          |
| `/dashboard/analytics`     | All        | Charts, sunburst, trend analysis        |
| `/dashboard/reports`       | Mgr/Admin  | Achievement reports + CSV/Excel export  |
| `/dashboard/admin`         | Admin      | Cycle & user CRUD, sheet unlock         |
| `/dashboard/audit`         | Admin      | Full audit log with diff viewer         |
| `/api/auth/[...nextauth]`  | System     | NextAuth API endpoints                  |
| `/api/export`              | System     | Excel/CSV export API                    |

---

## 🛠️ Tech Stack

| Layer            | Technology                                  |
|------------------|---------------------------------------------|
| Framework        | Next.js 16 (App Router, Server Components)  |
| Language         | TypeScript 5                                |
| Styling          | Vanilla CSS (Obsidian dark theme, 1000+ LOC)|
| Database         | PostgreSQL (Supabase) via Prisma v7         |
| Auth             | NextAuth v5 (JWT + Credentials + Azure AD)  |
| SSO              | Microsoft Entra ID (OpenID Connect)         |
| Org Sync         | Microsoft Graph API                         |
| Charts           | Recharts + D3.js (Sunburst)                 |
| Animations       | Framer Motion                               |
| Email            | Resend API                                  |
| Teams            | Incoming Webhook (Adaptive Cards)           |
| Export           | xlsx (SheetJS)                              |
| Hosting          | Vercel (Serverless)                         |

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Doit-Ay/AtomQuest.git
cd AtomQuest

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Initialize database
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://..."          # Pooler connection (port 6543)
DIRECT_URL="postgresql://..."            # Direct connection (port 5432)

# Auth
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Microsoft Entra ID (Optional)
AZURE_AD_CLIENT_ID=""
AZURE_AD_CLIENT_SECRET=""
AZURE_AD_TENANT_ID="common"
AZURE_AD_ADMIN_GROUPS="atomquest-admin"  # Azure AD groups → Admin role
AZURE_AD_MANAGER_GROUPS="atomquest-manager"  # Azure AD groups → Manager role

# Microsoft Teams (Optional)
TEAMS_WEBHOOK_URL=""                     # Incoming Webhook URL

# Email (Optional - uses console logging if not set)
RESEND_API_KEY=""
```

---

## 🎨 Design Philosophy

- **Obsidian Dark Theme** — `#0A0D14` base with teal/violet accent gradients
- **Glassmorphism** — Frosted card surfaces with subtle borders
- **Micro-animations** — Framer Motion for entrance, hover, and state transitions
- **JetBrains Mono** — Monospaced numerics for data-heavy interfaces
- **Mobile-First Responsive** — Bottom tab bar on mobile, full sidebar on desktop

---

## 📂 Project Structure

```
src/
├── actions/          # Server Actions (goals, admin, escalations, shared-goals)
├── app/
│   ├── dashboard/    # 12 dashboard sub-routes
│   ├── login/        # Auth page (SSO + Credentials)
│   └── api/          # API routes (auth, export)
├── components/
│   ├── layout/       # Sidebar, Topbar
│   └── shared/       # Skeleton, ErrorBoundary
├── lib/
│   ├── auth.ts       # NextAuth config (Credentials + Azure AD + Graph API)
│   ├── prisma.ts     # Prisma client singleton (PrismaPg adapter)
│   ├── email.ts      # Resend email templates
│   └── teams.ts      # Teams Adaptive Card notifications
└── types/            # TypeScript declarations
```

---

## 👥 Team

| Member        | Role          |
|---------------|---------------|
| Aditya Singh  | Full Stack    |

---

## 📄 License

This project was built for the **AtomQuest Hackathon 1.0** on Unstop.

---

*Built with ❤️ using Next.js 16, Prisma v7, Microsoft Entra ID, and D3.js*
