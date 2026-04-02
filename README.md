# 💰 Finance Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Monorepo finance dashboard with an Express API, a Next.js frontend, Supabase PostgreSQL, role-based access control, audit logging, and a chart-heavy reporting UI.

- Live demo: add your deployed URL here
- Repository: add your repository URL here

## 1. Project Identity

**Title:** Finance Dashboard

**One-line description:** A full-stack finance management system for tracking transactions, categories, and users with role-aware dashboard analytics.

**Stack badges:** Node.js, Express, Next.js 14, Supabase, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Recharts, npm workspaces.

## 2. What I Built

This project is a monorepo that combines an Express backend with a Next.js frontend and a Supabase PostgreSQL database. The system supports three roles, Admin, Analyst, and Viewer, and each role sees a different level of access across transactions, dashboard analytics, categories, and users.

The implementation follows the assignment requirements closely: authenticated users can manage finance data, dashboard analytics are role-aware, sensitive actions are protected server-side, and every important write path is traceable through audit logs and Swagger-documented APIs.

## 3. Features

- JWT authentication with refresh token support
- Role-based access control for Admin, Analyst, and Viewer
- Transactions CRUD with soft delete, hard delete, and restore
- Dashboard analytics with summary cards and charts
- Transaction filtering, search, sorting, and pagination
- Category management with color and Lucide icon metadata
- Admin-only user management
- Audit logs for write operations
- Swagger API documentation
- Seed data for fast local testing

## 4. Tech Stack

### Backend
- Node.js
- Express
- Supabase PostgreSQL
- JWT
- bcryptjs
- Winston
- Swagger JSdoc / Swagger UI

### Frontend
- Next.js 14
- React 18
- shadcn/ui
- Tailwind CSS
- TanStack Query
- Zustand
- Recharts
- React Hook Form
- Zod

### Monorepo
- npm workspaces
- concurrently

## 5. Project Structure

```text
finance-dashboard/
├── package.json
├── apps/
│   ├── api/
│   └── web/
└── packages/
    └── shared-types/
```

### Folder Roles
- `apps/api/`: Express backend, authentication, RBAC, Supabase access, seed scripts, tests, and Swagger.
- `apps/web/`: Next.js frontend, auth pages, dashboard UI, data tables, forms, hooks, and state management.
- `packages/shared-types/`: shared TypeScript types and enums that can be reused by both apps.

### Backend Layout
```text
apps/api/src/
├── config/
├── constants/
├── db/migrations/
├── middleware/
├── modules/
├── seeds/
├── services/
├── tests/
└── utils/
```

- `config/`: Supabase, Swagger, and logger setup.
- `constants/`: role and transaction type constants.
- `db/migrations/`: SQL schema files for Supabase.
- `middleware/`: auth, role checks, validation, rate limiting, and error handling.
- `modules/`: feature modules for auth, users, categories, transactions, and dashboard.
- `seeds/`: idempotent seed scripts for demo data.
- `services/`: shared business services such as audit logging.
- `tests/`: Jest and Supertest coverage for API routes.
- `utils/`: reusable response, async, pagination, and date helpers.

### Frontend Layout
```text
apps/web/
├── app/
├── components/
├── hooks/
├── lib/
├── store/
└── types/
```

- `app/`: Next.js App Router pages, layouts, and route groups.
- `components/`: shared UI, dashboard widgets, auth forms, tables, and layout chrome.
- `hooks/`: React Query hooks for auth, dashboard, categories, transactions, and users.
- `lib/`: Axios client, auth helpers, and utility functions.
- `store/`: Zustand auth store.
- `types/`: frontend domain types.

## 6. Local Setup

### Prerequisites
- Node.js 18 or newer
- npm 9 or newer
- A Supabase project with a PostgreSQL database

### Step-by-step setup

1. Clone the repository.
2. Install dependencies from the repo root.
3. Create the environment files shown in the next section.
4. Create the required tables in Supabase by running the SQL migration files from `apps/api/src/db/migrations/` in order.
5. Seed the database.
6. Start the development servers.

```bash
git clone <your-repo-url>
cd finance-dashboard
npm install
npm run seed
npm run dev
```

### Run apps individually

```bash
npm run dev:api
npm run dev:web
```

### Useful scripts

```bash
npm run test
npm run lint
npm run build
```

## 7. Environment Variables

### `apps/api/.env`

| Variable | Example value | Purpose |
|---|---|---|
| `PORT` | `3000` | API server port |
| `NODE_ENV` | `development` | Runtime mode |
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `your-anon-key` | Supabase anon client key |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Supabase admin access key |
| `JWT_SECRET` | `your-32-char-minimum-secret-key` | Signs and verifies JWTs |
| `JWT_ACCESS_EXPIRES_IN` | `24h` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `FRONTEND_URL` | `http://localhost:3001` | Allowed frontend origin |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window |
| `RATE_LIMIT_MAX` | `100` | Global request limit |

### `apps/web/.env.local`

| Variable | Example value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | Frontend API base URL |

## 8. Seed Data & Test Accounts

The seed pipeline is idempotent and currently creates 3 users, 14 categories, and 100 transactions.

| Email | Password | Role | Access |
|---|---|---|---|
| `admin@finance.dev` | `Admin@1234` | Admin | Full access, including users, categories, hard delete, and audit visibility |
| `analyst@finance.dev` | `Analyst@1234` | Analyst | Read/write transactions and access analytics |
| `viewer@finance.dev` | `Viewer@1234` | Viewer | Read-only access to summary, recent activity, and shared lists |

## 9. API Reference

### Base URL
- Local: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api/docs`
- Swagger JSON: `http://localhost:3000/api/docs.json`

### Auth Header Format

```http
Authorization: Bearer <access_token>
```

### Auth Module

| Method | Path | Role required | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new viewer account |
| POST | `/auth/login` | Public | Login and receive tokens |
| POST | `/auth/logout` | Auth | Logout current user |
| GET | `/auth/me` | Auth | Get current profile |
| PUT | `/auth/me` | Auth | Update current profile |
| PUT | `/auth/me/password` | Auth | Change current password |
| POST | `/auth/refresh` | Auth | Refresh access token |

### Users Module

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users |
| GET | `/users/:id` | Admin | Get user by ID |
| POST | `/users` | Admin | Create user |
| PUT | `/users/:id` | Admin | Update user |
| PATCH | `/users/:id/role` | Admin | Change user role |
| PATCH | `/users/:id/status` | Admin | Toggle user status |
| DELETE | `/users/:id` | Admin | Soft delete user |
| DELETE | `/users/:id/hard` | Admin | Permanently delete user |

### Transactions Module

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/transactions` | Viewer+ | List transactions with filters and pagination |
| GET | `/transactions/:id` | Viewer+ | Get transaction details |
| POST | `/transactions` | Analyst+ | Create transaction |
| PUT | `/transactions/:id` | Analyst+ | Update transaction |
| DELETE | `/transactions/:id` | Analyst+ | Soft delete transaction |
| DELETE | `/transactions/:id/hard` | Admin | Hard delete transaction |
| PATCH | `/transactions/:id/restore` | Admin | Restore soft-deleted transaction |

### Categories Module

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/categories` | Viewer+ | List categories |
| GET | `/categories/:id` | Viewer+ | Get category details |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category if it is not default |

### Dashboard Module

| Method | Path | Role required | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | Viewer+ | Income, expense, net, and count summary |
| GET | `/dashboard/category-breakdown` | Viewer+ | Spend breakdown by category |
| GET | `/dashboard/recent-activity` | Viewer+ | Latest transactions |
| GET | `/dashboard/monthly-trends` | Analyst+ | Monthly analytics chart data |
| GET | `/dashboard/comparison` | Analyst+ | This month vs last month comparison |

### Example Request and Response

#### Login

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
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@finance.dev",
      "role": "admin"
    }
  }
}
```

#### Dashboard summary

```bash
curl http://localhost:3000/api/v1/dashboard/summary \
  -H "Authorization: Bearer <access_token>"
```

```json
{
  "success": true,
  "message": "Summary fetched successfully",
  "data": {
    "income": 120000,
    "expense": 84500,
    "net": 35500,
    "count": 100
  }
}
```

#### Transactions list

```bash
curl "http://localhost:3000/api/v1/transactions?page=1&limit=10&search=food" \
  -H "Authorization: Bearer <access_token>"
```

```json
{
  "success": true,
  "message": "Transactions fetched successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 10. Role & Permission Matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login / logout | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View transactions | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| View categories | ✅ | ✅ | ✅ |
| Search / filter / paginate transactions | ✅ | ✅ | ✅ |
| Access analytics charts | ❌ | ✅ | ✅ |
| Create transactions | ❌ | ✅ | ✅ |
| Update transactions | ❌ | ✅ | ✅ |
| Soft delete transactions | ❌ | ✅ | ✅ |
| Hard delete transactions | ❌ | ❌ | ✅ |
| Restore deleted transactions | ❌ | ❌ | ✅ |
| Create / update / delete categories | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Toggle user status | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

## 11. Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(100) | Required |
| `email` | VARCHAR(255) | Unique |
| `password_hash` | TEXT | Stored securely with bcrypt |
| `role` | VARCHAR(20) | `admin`, `analyst`, or `viewer` |
| `status` | VARCHAR(20) | `active` or `inactive` |
| `avatar_url` | TEXT | Optional |
| `last_login_at` | TIMESTAMPTZ | Optional |
| `created_at` | TIMESTAMPTZ | Default now |
| `updated_at` | TIMESTAMPTZ | Default now |

### `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | VARCHAR(100) | Required |
| `type` | VARCHAR(10) | `income` or `expense` |
| `color` | VARCHAR(7) | Hex color used in UI |
| `icon` | VARCHAR(50) | Lucide icon name |
| `is_default` | BOOLEAN | Default categories are protected |
| `created_by` | UUID | Nullable reference to `users` |
| `created_at` | TIMESTAMPTZ | Default now |
| `updated_at` | TIMESTAMPTZ | Default now |

### `transactions`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | References `users` |
| `category_id` | UUID | References `categories`, nullable on delete |
| `amount` | NUMERIC(15,2) | Financial precision without float errors |
| `type` | VARCHAR(10) | `income` or `expense` |
| `date` | DATE | Transaction date |
| `description` | TEXT | Optional |
| `notes` | TEXT | Optional |
| `tags` | TEXT[] | Searchable metadata |
| `is_deleted` | BOOLEAN | Soft delete flag |
| `deleted_at` | TIMESTAMPTZ | Soft delete timestamp |
| `created_by` | UUID | Nullable reference to `users` |
| `updated_by` | UUID | Nullable reference to `users` |
| `created_at` | TIMESTAMPTZ | Default now |
| `updated_at` | TIMESTAMPTZ | Default now |

**Recommended indexes:**
- `transactions(user_id)`
- `transactions(date)`
- `transactions(type)`
- `transactions(category_id)`
- `transactions(is_deleted)`

### `audit_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key |
| `user_id` | UUID | Nullable reference to `users` |
| `action` | VARCHAR(50) | Action name |
| `entity` | VARCHAR(50) | Affected table or module |
| `entity_id` | UUID | Affected record |
| `old_data` | JSONB | Previous state |
| `new_data` | JSONB | New state |
| `ip_address` | INET | Request origin |
| `user_agent` | TEXT | Client metadata |
| `created_at` | TIMESTAMPTZ | Default now |

### Key design decisions
- Use `NUMERIC(15,2)` for currency precision.
- Keep soft delete for recoverability and auditability.
- Use JSONB for audit snapshots.
- Index transaction fields that are used for filtering and reporting.

## 12. Assumptions & Trade-offs

- Single organization, not multi-tenant.
- INR is the only supported currency in v1.
- Categories are global, not per-user.
- Analysts can soft-delete transactions, but only Admins can hard-delete or restore them.
- Tokens are stored in localStorage on the client side for the current implementation.
- No file uploads or receipt attachments in v1.
- Dashboard date range defaults to the current month.
- Refresh token flow reuses the same refresh token until expiry.
- The frontend is intentionally light-mode only in this implementation.

## 13. Screenshots / Demo

Add screenshots here once you capture them:

- Login page
- Dashboard overview
- Transactions table
- Categories table
- Users page
- Swagger UI

Suggested placement:
- `docs/screenshots/login.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/transactions.png`
- `docs/screenshots/users.png`
- `docs/screenshots/swagger.png`

## 14. Deployment

### API
- Suggested hosting: Railway or Render
- Production base URL: add your live API URL here

### Web
- Suggested hosting: Vercel
- Production base URL: add your live web URL here

### Post-deploy checklist
- Set production environment variables
- Apply the Supabase schema
- Run the seed script in the target environment if needed
- Verify Swagger docs and role-based access

## 15. Running Tests

### API tests

```bash
npm run test --workspace=apps/api
```

### Watch mode

```bash
npm run test:watch --workspace=apps/api
```

## Additional Notes

- Swagger docs are exposed from the backend at `/api/docs`.
- The root workspace uses npm workspaces, so `npm run dev` starts both apps together.
- The web app runs on port `3001` and the API runs on port `3000` by default.

---

If you are reviewing this project for evaluation, start with sections 1 to 3, then inspect the setup, API reference, role matrix, and database schema.
