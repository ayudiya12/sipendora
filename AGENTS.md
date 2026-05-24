# SIPENDORA — Agent Guide

Monorepo: `client/` (React 19 + Vite 5) and `server/` (Express 5 + MySQL).  
No test framework, no CI/CD. Academic thesis project (facility booking + revenue management).

## Quick start order

```bash
npm run install-all          # install root + client + server deps
cp server/.env.example server/.env   # if exists; otherwise copy server/.env
npm run migrate --prefix server      # DB schema (ALTER TABLE migrations)
npm run seeder  --prefix server      # fake data with faker id_ID locale
npm run dev                          # concurrently runs both server & client
```

## Key commands

| Command | Location | Purpose |
|---|---|---|
| `npm run dev` | root | `concurrently` runs server + client |
| `npm run dev` | server | `node --watch index.js` (hot-reload) |
| `npm run dev` | client | `vite` dev server |
| `npm run build` | client | `vite build` production build |
| `npm run lint` | client | `eslint . --ext js,jsx --max-warnings 0` |
| `npm run migrate` | server | `node database/migrate.js` |
| `npm run seeder` | server | `node database/seeder.js` |

## Architecture

- **Database**: MySQL, raw queries via `mysql2/promise` — no ORM
- **Vite proxy**: `/api` → `http://localhost:5000`
- **RBAC roles**: `PENYEWA` (renter), `ADMIN`, `PIMPINAN` (director)
- **FCFS engine**: `server/utils/fcfsHelper.js` — core booking allocation algorithm
- **Auth**: JWT (`jsonwebtoken` + `bcryptjs`), stored in Zustand persist
- **State**: Zustand (auth/global) + TanStack Query (data fetching)
- **UI language**: Indonesian (bahasa Indonesia); code identifiers remain English
- **Payment**: Midtrans sandbox (`MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`)
- **File storage**: `@vercel/blob` in production; local `uploads/` in dev

## Setup notes

- Default local DB: `root/roots@localhost:3306/sipendora`
- Seeder creates users with password `sipendora123`
- Faker locale used: `id_ID` for realistic Indonesian data
- Express 5 — note API changes vs Express 4 (e.g., `req.query` changes)
- `server/.env` is gitignored; `server/.env.deploy` has Railway credentials **committed** — do not push new secrets

## Conventions from `.agents/`

- **Naming**: camelCase except PascalCase for classes; database tables prefixed `tb_`
- **Currency**: `DECIMAL` or `BIGINT`, never `FLOAT`
- **Locking**: `lockForUpdate()` for FCFS race-condition protection
- **Colors**: Deep Blue `#1D3557`, Vibrant Green `#2A9D8F`, Soft Gray — defined in `tailwind.config.js`
- **Layer separation**: Data (repository) / Service (business logic) / Presentation (routes)

## Important files

| File | Purpose |
|---|---|
| `goodtoknow/` | Full project documentation (architecture, tutorials, deployment) |
| `.agents/` | AI agent rules (naming, FCFS precision, security) |
| `server/utils/fcfsHelper.js` | FCFS algorithm with AT/BT/ST/CT/TAT/WT metrics |
| `server/routes/` | One file per resource: auth, bookings, facilities, payments, users, etc. |
| `client/src/pages/` | Page components per role (admin/, penyewa/, pimpinan/) |
| `client/src/store/authStore.js` | Zustand store with persist middleware |
| `client/src/utils/api.js` | Axios instance with JWT interceptor |
| `client/tailwind.config.js` | Custom color palette, fonts, animations |

## Deployment

- **Frontend**: Vercel (`client/vercel.json` rewrites all routes to `index.html`)
- **Backend**: Railway (Express + MySQL)
- Raw `MYSQL_URL` credentials in `.env.deploy` for Railway — use `shuttle.proxy.rlwy.net` host externally
