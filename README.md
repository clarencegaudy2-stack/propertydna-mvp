# PropertyDNA MVP

**AI-powered real estate deal analysis for investors.** Submit a property deal, get an instant financial analysis with a 0–100 deal score, and explore a full 9-tab investment report.

---

## Frontend Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 6 | Build tool + dev server |
| TypeScript | 5.9 | Type safety |
| Wouter | 3 | Client-side routing |
| TailwindCSS | 4 | Styling |
| Tanstack Query | 5 | Server state + API calls |

**Source:** `artifacts/property-dna/`

**Key pages:**
- `/` — Landing page (logged-out)
- `/login` — Sign in
- `/signup` — Create account
- `/dashboard` — Deal list + stats
- `/submit` — New deal form
- `/deals/:id` — 9-tab deal report (Investment, Property, Location, Market, Risk, Strategy, Tax, Notes, AI Coach)
- `/admin` — Admin deal management view

---

## Backend Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24 | Runtime |
| Express | 5 | HTTP server |
| TypeScript | 5.9 | Type safety |
| Drizzle ORM | latest | Database queries |
| Zod | v4 | Request validation |

**Source:** `artifacts/api-server/`

**Key routes:**
- `GET /deals` — List all deals
- `POST /deals` — Create + score a deal
- `GET /deals/:id` — Single deal
- `GET /deals/:id/results` — Deal with full calculated metrics
- `DELETE /deals/:id` — Remove deal
- `GET /dashboard/stats` — Aggregate stats

**Scoring algorithm** (`artifacts/api-server/src/lib/calculator.ts`):
- Cash-on-Cash Return: 35 pts
- DSCR: 30 pts
- Cap Rate: 25 pts
- Cash Flow bonus: 10 pts
- **≥ 75** → Strong Deal / Proceed (Green)
- **50–74** → Review / Analyze Further (Yellow)
- **< 50** → Reject / Do Not Proceed (Red)

---

## Database

| Item | Detail |
|---|---|
| Engine | PostgreSQL 16 |
| Provider | Replit-managed (always-on) |
| ORM | Drizzle |
| Schema location | `lib/db/src/schema/` |
| Migrations | `pnpm --filter @workspace/db run push` |

**Current tables:**

| Table | Purpose |
|---|---|
| `deals` | All property deal submissions and scores |

**Phase 2 additions needed:**
- `users` table (for real auth)
- `user_id` foreign key on `deals` (for data isolation)

---

## Monorepo Structure

```
/
├── artifacts/
│   ├── property-dna/        # React + Vite frontend
│   └── api-server/          # Express API server
├── lib/
│   ├── db/                  # Drizzle schema + client
│   ├── api-spec/            # OpenAPI spec + Orval codegen
│   └── api-zod/             # Shared Zod validation schemas
└── package.json             # pnpm workspace root
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string (set by Replit automatically) |
| `PORT` | Auto | API server port (set per artifact by Replit) |

No `.env` file is needed in development — Replit injects `DATABASE_URL` automatically.

For production deployment, `DATABASE_URL` must be set in Replit's Secrets panel.

---

## Development

```bash
# Install dependencies
pnpm install

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (separate terminal)
pnpm --filter @workspace/property-dna run dev

# Typecheck all packages
pnpm run typecheck

# Push DB schema changes (dev only)
pnpm --filter @workspace/db run push

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

---

## Deployment

PropertyDNA is deployed via **Replit Autoscale**.

**To publish:**
1. Ensure `DATABASE_URL` is set in Replit Secrets
2. Click **Deploy** in the Replit editor
3. Replit builds both servers, assigns a `.replit.app` domain, and handles TLS

**Deployment config** (`.replit`):
```toml
[deployment]
router = "application"
deploymentTarget = "autoscale"
```

The production database is the same Replit-managed PostgreSQL instance — data persists across redeployments.

---

## Authentication (Phase 1 — Mock)

Phase 1 uses a browser `localStorage`-backed mock auth system. Sessions persist across page refreshes and browser restarts.

**Demo accounts:**
- `alex@example.com` / any password (user role)
- `admin@propertydna.com` / any password (admin role)

**Phase 2:** Replace with Replit Auth or Clerk for real user accounts, password hashing, and per-user data isolation.

---

## Phase 2 Roadmap

- [ ] Real authentication (Replit Auth or Clerk)
- [ ] User isolation — `user_id` on all deal records
- [ ] Stripe — paywall for full deal reports
- [ ] OpenAI — live AI Coach analysis
- [ ] Google Sheets — deal export
- [ ] Market data API — ARV, comparable sales
- [ ] Property data API — ownership, parcel info

---

## Infrastructure Verification (completed)

| Component | Status |
|---|---|
| PostgreSQL database | ✅ Persistent, always-on |
| Session persistence | ✅ Fixed (localStorage) |
| API server | ✅ Running |
| Frontend | ✅ Running |
| Deal scoring | ✅ Live calculations |
| GitHub backup | ✅ Connected |
| Production deployment | 🔲 Ready — click Deploy |
| User data isolation | ⚠️ Phase 2 |
