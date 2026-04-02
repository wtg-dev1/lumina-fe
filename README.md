# Lumina Therapy Alliance — Operations Platform

A complete React frontend for the Lumina Therapy Alliance ops platform.
Built for handoff to a Golang backend developer.

---

## Quick Start

```bash
npm install
npm run dev        # starts at http://localhost:3000
```

**Demo login credentials** (see `src/views/LoginPage.jsx`):

| Role | Email |
|------|-------|
| Admin | admin@luminatherapyalliance.com |
| Practice (WTG) | admin@wtgtherapy.com |
| Practice (DC) | admin@therapygroupdc.com |
| Employer | schen@meridiancap.com |

Any password works in demo mode. Replace with real JWT auth when backend is ready.

---

## Project Structure

```
src/
├── main.jsx                    # App entry point
├── App.jsx                     # Route definitions
├── index.css                   # Global styles + CSS variables
│
├── components/
│   ├── ui.jsx                  # Shared UI atoms (Badge, Btn, Modal, etc.)
│   └── AssessmentForm.jsx      # PHQ-9 / GAD-7 client form component
│
├── data/
│   └── stores/                 # React context providers (care, org, finance)
│
├── utils/
│   ├── constants.js            # Colors, US states, PSYPACT list, question data
│   ├── helpers.js              # fmt(), phqSev(), gadSev(), daysSince(), etc.
│   └── api.js                  # All API call functions (stubbed → real)
│
└── views/
    ├── LoginPage.jsx           # /login
    ├── AssessPage.jsx          # /assess/:token  (public, no auth)
    ├── OpsApp.jsx              # Main shell — sidebar, routing, role switching
    ├── LuminaOps.jsx           # Re-exports all view components
    ├── LuminaOps.single.jsx    # Complete monolithic prototype (all views)
    │
    ├── admin/                  # Admin-only views (stub re-exports)
    │   ├── DashboardView.jsx
    │   ├── ReferralsView.jsx
    │   ├── EmployersView.jsx
    │   ├── PracticesView.jsx
    │   ├── ClientsView.jsx
    │   ├── SessionsView.jsx
    │   ├── AssessmentsView.jsx
    │   ├── AssessmentSendView.jsx
    │   ├── BankingView.jsx
    │   ├── BillingView.jsx
    │   ├── PayoutsView.jsx
    │   └── ROIView.jsx
    │
    ├── practice/               # Practice portal
    │   └── PracticePortalView.jsx
    │
    └── employer/               # Employer portal
        └── EmployerPortalView.jsx
```

---

## Platform Modules

| Module | Description |
|--------|-------------|
| Dashboard | Revenue, sessions MTD, alerts for overdue invoices + pending referrals |
| Referrals | 3-step intake (employer → city/practice → match), practice loop tracking |
| Employers | Accounts, admin fee billing (annual), session contracts, banking |
| Practices | Network of 8 practices, session rates, contracts, clinician rosters |
| Clients | Enrolled clients with real names (admin/practice only), anon IDs for employers |
| Sessions | Session logging with auto-fill rates, modality tracking |
| Assessments | PHQ-9 / GAD-7 score history with severity indicators |
| Send Assessments | Generate tokenized links, copy email/text, in-person form option |
| Banking | ACH details for practices (payouts) and ACH employers (billing) |
| Billing | Monthly session invoices per employer, send/mark paid workflow |
| Payouts | Practice ACH payouts with Lumina margin calculation |
| ROI Reports | De-identified employer wellness reports (PHQ-9/GAD-7 aggregates) |
| Practice Portal | Referral confirmation loop, client list with real names, assessment sending |
| Employer Portal | Invoice history (session + admin fees), wellness report, utilization |

---

## Backend Integration

See `Lumina_Developer_Handoff.docx` for the complete technical spec.

### Key files for backend developer

- **`src/utils/api.js`** — HTTP client for the Go backend (`fetch` to `VITE_API_URL` or `/api/v1`).
- **`src/data/stores/`** — React context stores that load and mutate data via `api.js`.

### Authentication

Replace the demo login in `LoginPage.jsx`:
```js
// Replace this:
const role = DEMO_ROLES[email]

// With this:
const res = await api.auth.login(email, password)
setToken(res.token)          // stores JWT in localStorage
localStorage.setItem('lumina_role', res.role)  // role from JWT claims
```

### Assessment email/SMS

When client clicks **Send Assessment Link** in the ops app:
1. Frontend calls `api.assessments.sendLink(clientId, type)`
2. Backend creates a token, stores it in the `assessments` table (`completed: false`)
3. Backend sends email via SendGrid and/or SMS via Twilio with link to `/assess/:token`
4. Client opens link, completes form at `/assess/:token`
5. Frontend POSTs to `api.assessments.submitByToken(token, { answers, score })`
6. Backend marks assessment `completed: true`, score saved, clinician notified

---

## HIPAA Notes

- Client **names are never exposed to employers** — employers see only `LTA-XXXX` anon IDs
- Banking information is admin-only — never returned to practice or employer API calls
- PHQ-9/GAD-7 scores stored against anon IDs only
- All employer-facing reports are aggregate only — no individual data
- Backend must enforce row-level security: practices can only query their own clients

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| State | React Context + useReducer (→ API calls) |
| Styling | Inline styles with CSS variables (no CSS framework) |
| Backend | **Golang** (developer's choice of Gin or Echo) |
| Database | PostgreSQL 15+ (via Supabase recommended) |
| Auth | JWT (Supabase Auth or custom) |
| Payments | Stripe (employer billing) + Stripe Connect (practice payouts) |
| Email | SendGrid |
| SMS | Twilio |
| Hosting | Vercel (frontend) + Railway/Fly.io (Go API) |

---

## UI Conventions

- Use `ConfirmModal` from `src/components/ui/ConfirmModal.jsx` for user confirmations.
- Do not use native browser dialogs (`window.alert`, `window.confirm`, `window.prompt`) in app views.

---

## Contact

Daniel Selling, Psy.D. — Founder & CEO, Lumina Therapy Alliance
drselling@luminatherapyalliance.com · (718) 757-7033
10 Oakwood Drive, Lloyd Harbor, NY 11743
