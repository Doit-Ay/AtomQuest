# 🎯 AtmoQuest — Goal Setting & Tracking Portal

> **AtomQuest Hackathon 1.0** | Comprehensive Performance Management System

AtmoQuest is an enterprise-grade, goal-setting and performance-tracking platform built for organizations following structured appraisal cycles. It digitizes the entire lifecycle — from goal definition and manager approval to quarterly check-ins, weighted scoring, analytics, and automated notifications.

---

## 🚀 Live Demo

**URL:** *Deployment link here*

### Quick Login Credentials (password: `password123`)

| Role     | User          | Email                        |
|----------|---------------|------------------------------|
| Employee | Aditya Singh  | employee@atmoquest.dev       |
| Manager  | Rajesh Kumar  | manager@atmoquest.dev        |
| Admin    | Priya Sharma  | admin@atmoquest.dev          |

---

## ✨ Key Features

### 🔐 Role-Based Access Control
- **Employee**: Create goals, submit sheets, log quarterly achievements
- **Manager**: Approve/return goal sheets, manage team, push shared goals
- **Admin**: Full system control — user management, cycle admin, audit trails

### 📊 Advanced Analytics Dashboard
- **QoQ Performance Trend** — Area chart tracking weighted scores across quarters
- **Goal Status Distribution** — Interactive donut chart
- **Thrust Area Breakdown** — Horizontal bar chart by organizational focus
- **Employee Comparison** — Gradient bar chart for team benchmarking
- **Organizational Alignment Sunburst** — D3.js radial hierarchy: Org → Department → Employee → Goals

### 🔗 Shared Goals
Managers/Admins can "push" templated goals to multiple employees simultaneously:
- Multi-recipient selection with "Select All"
- Auto-creates goal sheets for recipients without one
- Recipients receive automated email notifications

### 📧 Email Notification System
Integrated with **Resend API** for automated dark-themed notifications:
- Goal sheet submitted (→ Manager)
- Goal sheet approved/returned (→ Employee)
- Check-in reminders
- Shared goal assignments

### ⚡ Escalation Engine
Rule-based compliance monitoring with auto-detection:
- Overdue goal sheet submissions (14+ days)
- Pending approval delays (7+ days)
- Missing quarterly check-ins (21+ days)
- Severity classification (High/Medium/Low)

### 📈 Reports & Export
- **Achievement Reports** with quarterly score breakdown
- **Completion Dashboard** tracking check-in compliance
- **Excel Export** — Multi-sheet .xlsx with Goals, Summary, and Check-in data
- **CSV Export** — Flat file for spreadsheet tools

### 🔍 Full Audit Trail
Every action logged with:
- User, timestamp, action type
- JSON diff viewer (previous → new values)
- Filterable by entity type and user

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js 16 (App Router)                │
├──────────┬──────────┬──────────┬──────────┬─────────┬──────────┤
│  Login   │Dashboard │  Goals   │ Approvals│ Reports │  Admin   │
│  Page    │  (RSC)   │  (RSC)   │  (RSC)   │  (RSC)  │  (RSC)   │
├──────────┴──────────┴──────────┴──────────┴─────────┴──────────┤
│           Server Actions (goals.ts, admin.ts, etc.)            │
├────────────────────────────────────────────────────────────────┤
│           Prisma v7 ORM + SQLite (dev) / PostgreSQL (prod)     │
├────────────────────────────────────────────────────────────────┤
│           NextAuth v5 (Credentials Provider + JWT)              │
├────────────────────────────────────────────────────────────────┤
│  Resend Email  │  D3.js Sunburst  │  Recharts  │  xlsx Export  │
└────────────────┴──────────────────┴────────────┴───────────────┘
```

---

## 📱 Pages & Routes (16 total)

| Route                      | Access     | Description                              |
|----------------------------|------------|------------------------------------------|
| `/login`                   | Public     | Quick login + email/password auth        |
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
| ORM              | Prisma v7 (SQLite + better-sqlite3)         |
| Auth             | NextAuth v5 (JWT + Credentials)             |
| Charts           | Recharts + D3.js (Sunburst)                 |
| Animations       | Framer Motion                               |
| Email            | Resend API                                  |
| Export           | xlsx (SheetJS)                              |

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/atmoquest.git
cd atmoquest

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Initialize database
npx prisma db push
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key"
RESEND_API_KEY="re_xxxxxxxx"          # Optional: for email notifications
RESEND_FROM_EMAIL="noreply@yourdomain.com"
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
│   ├── login/        # Auth page
│   └── api/          # API routes (auth, export)
├── components/
│   ├── layout/       # Sidebar, Topbar
│   └── shared/       # Skeleton, ErrorBoundary
├── lib/              # Auth config, Prisma client, email, utilities
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

*Built with ❤️ using Next.js 16, Prisma v7, and D3.js*
