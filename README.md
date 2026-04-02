# Finance Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A full-stack finance management system — monorepo, role-aware, audit-logged, and built to think out loud.

**Live demo →** [finance-dashboard-web.vercel.app/login](https://finance-dashboard-web.vercel.app/login)  
**API docs →** [Swagger UI](https://finance-dashboard-7cno.onrender.com/api/docs/)  
**Repository →** [github.com/PremShinde-2013/finance-dashboard](https://github.com/PremShinde-2013/finance-dashboard)

> **Note:** The API is hosted on Render's free tier. The first request after inactivity may take 30–60 seconds to cold-start. Subsequent requests are fast.

---

## The thinking behind this

When I read the assignment, the first question I asked myself wasn't *"what do I need to build?"* — it was *"what does a real finance system actually need to get right?"*

A finance dashboard isn't really a CRUD app. It's a trust system. The moment money is involved, two things become non-negotiable: **who is allowed to do what**, and **what happened and when**. Everything else — the charts, the filters, the API design — is in service of those two things.

That framing shaped every decision I made here.

**On roles:** I didn't just add role checks as an afterthought. I thought about the actual human context — a Viewer is probably a stakeholder who needs visibility but not control. An Analyst is someone doing day-to-day work — they should be able to create and edit records but not irreversibly delete them. An Admin has full ownership. These aren't arbitrary tiers; they map to how a real finance team actually operates.

**On soft delete:** Hard delete is permanent. In a financial system, permanent deletion is dangerous — you lose the audit trail, you can't reconcile discrepancies, and there's no recovery. So I implemented soft delete with a restore path, and only gave hard delete access to Admins who explicitly need it. The goal was: make the safe path the easy path.

**On audit logs:** I added this beyond the requirement because I think it's the right thing to do. Every write — create, update, delete, login — leaves a trace with the old and new state, the user who did it, and the IP. This is the kind of thing that saves you at 2am when something is wrong and you need to know exactly what happened.

**On the monorepo:** I could have built a separate frontend repo. Instead, I used npm workspaces so both apps live together, share types, and start with a single `npm run dev`. That's a practical engineering decision — it reduces context switching, makes refactoring easier, and shows the relationship between the two layers clearly.

These weren't the path of least resistance. They were the considered choices.

---

## What's inside

```
finance-dashboard/
├── apps/
│   ├── api/          → Express backend (auth, RBAC, transactions, dashboard, audit)
│   └── web/          → Next.js 14 frontend (dashboard, tables, charts, modals)
└── packages/
    └── shared-types/ → TypeScript interfaces shared across both apps
```

The backend follows a strict **Routes → Controller → Service → Database** flow. Controllers don't touch the database. Services don't know about HTTP. Middleware handles cross-cutting concerns — auth, role enforcement, validation, rate limiting, error formatting — so modules stay clean.

The frontend follows a **Page → Hook → Axios → API** flow. TanStack Query manages server state and caching. Zustand holds auth state. Every form is validated with Zod before a request is even made.

---

## Features at a glance

**Authentication & Access**
- JWT with access token (24h) and refresh token (7d)
- Three roles: Admin, Analyst, Viewer — enforced at the middleware layer, not just the UI
- Inactive users are blocked at the auth step, not the route step

**Financial Records**
- Full CRUD for transactions — create, read, update, soft delete, hard delete, restore
- Filter by type, category, date range, amount range, tags, and free-text search
- Pagination up to 100 results per page
- `NUMERIC(15,2)` for amounts — no floating-point precision errors on money

**Dashboard Analytics**
- Summary cards: total income, total expenses, net balance, transaction count
- Monthly trend chart (12 months of income vs expense)
- Category breakdown (spend/earn by category with color coding)
- This month vs last month comparison
- Recent activity feed
- Charts are role-gated — Analysts and Admins see the full picture, Viewers see the summary

**Operational Safety**
- Soft delete with restore so no financial record is ever permanently lost by accident
- Hard delete reserved for Admins only
- Audit log on every write with `old_data` and `new_data` JSONB snapshots
- Rate limiting: 100 requests per 15 minutes globally, 10 per 15 minutes on login

**Developer Experience**
- OpenAPI 3.0 Swagger docs with 30+ schemas
- Idempotent seed script — run it multiple times, same result
- Jest + Supertest integration tests
- `npm run dev` starts both frontend and backend in parallel

---

## Tech stack

| Layer | Choices |
|---|---|
| **Backend runtime** | Node.js 18, Express 4 |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | jsonwebtoken, bcryptjs |
| **Validation** | express-validator |
| **Logging** | Winston, morgan |
| **Docs** | swagger-jsdoc, swagger-ui-express |
| **Frontend** | Next.js 14 App Router, React 18, TypeScript |
| **UI** | shadcn/ui, Tailwind CSS, Lucide icons |
| **Charts** | Recharts |
| **Data fetching** | TanStack Query (React Query) |
| **State** | Zustand |
| **Forms** | React Hook Form, Zod |
| **Tables** | TanStack Table |
| **Monorepo** | npm workspaces, concurrently |

---

## Local setup

### What you need
- Node.js 18 or newer
- npm 9 or newer
- A [Supabase](https://supabase.com) project (free tier works fine)

### Step by step

**1. Clone and install**
```bash
git clone https://github.com/PremShinde-2013/finance-dashboard.git
cd finance-dashboard
npm install
```

**2. Set up environment files**

Create `apps/api/.env`:
```bash
cp apps/api/.env.example apps/api/.env
```

Create `apps/web/.env.local`:
```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in your Supabase credentials and JWT secret. See the [Environment Variables](#environment-variables) section below.

**3. Apply the database schema**

Go to your Supabase project → SQL Editor, then run the migration files in order:
```
apps/api/src/db/migrations/001_create_users_table.sql
apps/api/src/db/migrations/002_create_finance_tables.sql
```

**4. Seed the database**
```bash
npm run seed
```

This creates 3 users, 14 categories, and 100 transactions spread across the last 6 months. The script is idempotent — safe to run multiple times.

**5. Start development**
```bash
npm run dev
```

This starts both apps in parallel:
- API → `http://localhost:3000`
- Web → `http://localhost:3001`
- Swagger UI → `http://localhost:3000/api/docs`

**Run individually if needed:**
```bash
npm run dev:api
npm run dev:web
```

**Other useful commands:**
```bash
npm run test     # run API tests
npm run lint     # lint both apps
npm run build    # production build
```

---

## Environment variables

### `apps/api/.env`

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `3000` | API server port |
| `NODE_ENV` | `development` | Runtime mode |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | `eyJ...` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key (for seed + admin ops) |
| `JWT_SECRET` | `minimum-32-character-secret` | Signs and verifies access tokens |
| `JWT_ACCESS_EXPIRES_IN` | `24h` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `FRONTEND_URL` | `http://localhost:3001` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

### `apps/web/.env.local`

| Variable | Example | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | Backend API base URL |

---

## Test accounts

The seed script creates these accounts so you can test each role immediately without any manual setup:

| Email | Password | Role | What they can do |
|---|---|---|---|
| `admin@finance.dev` | `Admin@1234` | Admin | Everything — users, categories, hard delete, restore, audit logs |
| `analyst@finance.dev` | `Analyst@1234` | Analyst | Create and edit transactions, view all analytics |
| `viewer@finance.dev` | `Viewer@1234` | Viewer | Read-only — summary, recent activity, transaction list |

---

## API reference

### Base URLs

| Environment | URL |
|---|---|
| Local API | `http://localhost:3000/api/v1` |
| Local Swagger UI | `http://localhost:3000/api/docs` |
| Production API | `https://finance-dashboard-7cno.onrender.com/api/v1` |
| Production Swagger UI | `https://finance-dashboard-7cno.onrender.com/api/docs/` |

### Auth header

Every protected route requires:
```http
Authorization: Bearer <access_token>
```

---

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new account (default role: viewer) |
| `POST` | `/auth/login` | Public | Login and receive access + refresh tokens |
| `POST` | `/auth/logout` | Auth | Logout |
| `GET` | `/auth/me` | Auth | Get current user profile |
| `PUT` | `/auth/me` | Auth | Update own name or email |
| `PUT` | `/auth/me/password` | Auth | Change own password |
| `POST` | `/auth/refresh` | Auth | Get a new access token using the refresh token |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List all users with pagination |
| `GET` | `/users/:id` | Admin | Get a specific user |
| `POST` | `/users` | Admin | Create a user with any role |
| `PUT` | `/users/:id` | Admin | Update user details |
| `PATCH` | `/users/:id/role` | Admin | Change a user's role |
| `PATCH` | `/users/:id/status` | Admin | Activate or deactivate a user |
| `DELETE` | `/users/:id` | Admin | Soft delete a user |
| `DELETE` | `/users/:id/hard` | Admin | Permanently delete a user |

### Transactions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/transactions` | Viewer+ | List with filters and pagination |
| `GET` | `/transactions/:id` | Viewer+ | Get a single transaction |
| `POST` | `/transactions` | Analyst+ | Create a transaction |
| `PUT` | `/transactions/:id` | Analyst+ | Update a transaction |
| `DELETE` | `/transactions/:id` | Analyst+ | Soft delete |
| `DELETE` | `/transactions/:id/hard` | Admin | Permanently delete |
| `PATCH` | `/transactions/:id/restore` | Admin | Restore a soft-deleted transaction |

**Supported query parameters for `GET /transactions`:**

```
page, limit, type, category_id, start_date, end_date,
min_amount, max_amount, tags, search, sort_by, sort_order
```

### Categories

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/categories` | Viewer+ | List all categories |
| `GET` | `/categories/:id` | Viewer+ | Get a single category |
| `POST` | `/categories` | Admin | Create a category |
| `PUT` | `/categories/:id` | Admin | Update a category |
| `DELETE` | `/categories/:id` | Admin | Delete (blocked if `is_default = true`) |

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/summary` | Viewer+ | Income, expense, net balance, count |
| `GET` | `/dashboard/category-breakdown` | Viewer+ | Totals grouped by category |
| `GET` | `/dashboard/recent-activity` | Viewer+ | Last N transactions |
| `GET` | `/dashboard/monthly-trends` | Analyst+ | 12-month income vs expense data |
| `GET` | `/dashboard/comparison` | Analyst+ | This month vs last month |

---

### Example requests

**Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finance.dev","password":"Admin@1234"}'
```
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "token": "<access_token>",
    "refreshToken": "<refresh_token>",
    "user": { "id": "...", "name": "Admin User", "email": "admin@finance.dev", "role": "admin" }
  }
}
```

**Dashboard summary:**
```bash
curl http://localhost:3000/api/v1/dashboard/summary \
  -H "Authorization: Bearer <access_token>"
```
```json
{
  "success": true,
  "message": "Summary fetched successfully",
  "data": { "income": 120000, "expense": 84500, "net": 35500, "count": 100 }
}
```

**Filtered transactions:**
```bash
curl "http://localhost:3000/api/v1/transactions?type=expense&search=food&page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```
```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": [...],
  "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
}
```

**Standard error response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be a positive number" },
    { "field": "date", "message": "Date cannot be in the future" }
  ]
}
```

---

## Role & permission matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login / logout | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View categories | ✅ | ✅ | ✅ |
| Search, filter, paginate | ✅ | ✅ | ✅ |
| Access analytics & trend charts | ❌ | ✅ | ✅ |
| Create transactions | ❌ | ✅ | ✅ |
| Update transactions | ❌ | ✅ | ✅ |
| Soft delete transactions | ❌ | ✅ | ✅ |
| Hard delete transactions | ❌ | ❌ | ✅ |
| Restore deleted transactions | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Toggle user status | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

Role enforcement happens in `role.middleware.js` on every protected route — not just in the UI. A Viewer who calls `POST /transactions` directly with a valid token will still get a `403`.

---

## Database schema

### Why these tables, why these types

The schema was designed with two questions in mind: *what data do we need to store*, and *what queries will we run most often*. Those two questions together explain most of the decisions.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | UUIDs over sequential IDs — harder to enumerate |
| `name` | VARCHAR(100) | — |
| `email` | VARCHAR(255) | Unique |
| `password_hash` | TEXT | bcryptjs, 12 salt rounds — never stored plain |
| `role` | VARCHAR(20) | CHECK constraint: `admin`, `analyst`, `viewer` |
| `status` | VARCHAR(20) | CHECK constraint: `active`, `inactive` |
| `avatar_url` | TEXT | Optional |
| `last_login_at` | TIMESTAMPTZ | Updated on every login — useful for security audits |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |

### `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | — |
| `name` | VARCHAR(100) | Unique per type |
| `type` | VARCHAR(10) | `income` or `expense` — typed so categories only appear in the right context |
| `color` | VARCHAR(7) | Hex color for UI rendering |
| `icon` | VARCHAR(50) | Lucide icon name |
| `is_default` | BOOLEAN | Default categories are seeded and cannot be deleted |
| `created_by` | UUID | Nullable FK to `users` |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |

### `transactions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | — |
| `user_id` | UUID | FK to `users`, cascades on delete |
| `category_id` | UUID | FK to `categories`, nullable on delete (keeps transaction if category is removed) |
| `amount` | NUMERIC(15,2) | Not FLOAT — financial calculations need exact decimal precision |
| `type` | VARCHAR(10) | `income` or `expense` — denormalized from category for faster filtering |
| `date` | DATE | Transaction date, not created_at |
| `description` | TEXT | Short summary |
| `notes` | TEXT | Long-form detail |
| `tags` | TEXT[] | PostgreSQL native array — flexible metadata without a join table |
| `is_deleted` | BOOLEAN | Soft delete flag — `false` by default |
| `deleted_at` | TIMESTAMPTZ | Set when soft deleted |
| `created_by` | UUID | Who created it |
| `updated_by` | UUID | Who last touched it |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |

**Indexes on the columns used most often in filters and reporting:**
```sql
CREATE INDEX ON transactions(user_id);
CREATE INDEX ON transactions(date);
CREATE INDEX ON transactions(type);
CREATE INDEX ON transactions(category_id);
CREATE INDEX ON transactions(is_deleted);
```

### `audit_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | — |
| `user_id` | UUID | Who performed the action |
| `action` | VARCHAR(50) | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, etc. |
| `entity` | VARCHAR(50) | Which table was affected |
| `entity_id` | UUID | Which record was affected |
| `old_data` | JSONB | Full snapshot before the change |
| `new_data` | JSONB | Full snapshot after the change |
| `ip_address` | INET | PostgreSQL native IP type |
| `user_agent` | TEXT | Browser/client metadata |
| `created_at` | TIMESTAMPTZ | — |

JSONB snapshots mean you can reconstruct the exact state of any record at any point in time. `INET` is a PostgreSQL native type — it validates IP addresses and allows subnet operations, which is cleaner than storing IPs as plain strings.

---

## Assumptions and trade-offs

Every project involves decisions where there's no objectively right answer. Here's what I chose and why.

**Single organization, not multi-tenant.** The assignment describes a team-facing finance dashboard, not a SaaS product. Adding tenant isolation would add meaningful complexity without being asked for. If this became a real product, the schema would add an `org_id` column and row-level security policies in Supabase.

**Analyst soft-delete only, Admin hard-delete.** Soft delete is the safe default. Permanently removing financial data should require deliberate elevated access. This maps cleanly to how you'd want a real system to behave — junior staff can tidy things up, seniors have the override.

**`NUMERIC(15,2)` over `FLOAT`.** Floating-point arithmetic on currency is a well-known footgun. `0.1 + 0.2 !== 0.3` in IEEE 754. Financial amounts need exact decimal representation. NUMERIC is slower but correct — and correctness matters more here.

**Global categories, not per-user.** In a team finance system, categories like "Salary" and "Office Supplies" are organization-level concepts. Per-user categories would fragment reporting and make cross-user analytics meaningless.

**Tags as `TEXT[]` instead of a join table.** A separate `transaction_tags` table would be more normalized. But for a feature like tags — flexible, lightweight, primarily used for search — the PostgreSQL array type with GIN indexing is simpler and fast enough. One less join in the hot read path.

**Tokens in localStorage.** The more secure option is an httpOnly cookie, which would prevent XSS access. I chose localStorage for simplicity in this implementation because it's easier to demonstrate and doesn't require cookie configuration across different deployment environments. In a production system I'd switch to httpOnly cookies with a CSRF token.

**INR only, current month as default dashboard range.** Single currency keeps the schema simple. The date default is a practical UX choice — most people reviewing a finance dashboard want to see the current period, not all time.

---

## Deployment

### API — Render

The backend is deployed on Render's free tier. Add these environment variables in your Render service settings, then deploy from the `apps/api` directory.

Production base URL: `https://finance-dashboard-7cno.onrender.com/api/v1`  
Swagger UI: `https://finance-dashboard-7cno.onrender.com/api/docs/`

### Web — Vercel

The frontend is deployed on Vercel. Set `NEXT_PUBLIC_API_URL` to your production API URL, and deploy from the `apps/web` directory.

Production URL: `https://finance-dashboard-web.vercel.app`

### Post-deploy checklist

- [ ] Set all production environment variables
- [ ] Apply Supabase schema (migrations folder, in order)
- [ ] Run seed script against production database if needed
- [ ] Verify Swagger docs load correctly
- [ ] Test all three role tiers with the seed accounts

---

## Running tests

```bash
# Run all API tests
npm run test --workspace=apps/api

# Watch mode during development
npm run test:watch --workspace=apps/api
```

Tests cover auth routes (register, login, token refresh) and transaction routes (CRUD, role enforcement, filter behavior) using Jest and Supertest.


---

*Built by Prem Shinde — questions, feedback, or just want to talk backend architecture? Reach out.*
