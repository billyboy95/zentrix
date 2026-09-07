# Zentrix

Zentrix Control Centre foundation: full-stack autonomous agent orchestration platform with a Node.js/Express backend and Next.js frontend. Primary product loop is **Start → Approve → Add** for autonomous Shopify stores (Shrine / Olivia theme templates).

## Project Structure

- `backend/` — Node.js + Express API server (port 4000)
- `frontend/` — Next.js + React + TailwindCSS dashboard (port 3000)
- `themes/` — Shopify theme catalog (`catalog.json`) and packages (`packages/*.zip`)
- `docker-compose.yml` — PostgreSQL and Redis for local development

## Cursor Cloud specific instructions

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Backend API | `cd backend && npm run dev` | 4000 | Express with nodemon hot-reload |
| Frontend | `cd frontend && npm run dev` | 3000 | Next.js dev server |
| PostgreSQL | `docker compose up postgres -d` | 5432 | Optional for MVP; in-memory stores used currently |
| Redis | `docker compose up redis -d` | 6379 | Optional for MVP; in-memory stores used currently |

### Quick commands

- **Backend lint**: `cd backend && npm run lint`
- **Backend tests**: `cd backend && npm test`
- **Frontend lint**: `cd frontend && npm run lint`
- **Frontend build**: `cd frontend && npm run build`

### Caveats

- The backend currently uses in-memory data stores (Maps), so data resets on server restart. PostgreSQL/Redis integration is planned but not yet wired up; the `docker-compose.yml` services are provided for future use.
- The frontend calls `http://localhost:4000` by default (configured via `NEXT_PUBLIC_API_URL` in `frontend/.env.local`). The backend must be running for the dashboard to show agent/task data.
- Backend `.env` is created from `.env.example` — copy it if missing: `cp backend/.env.example backend/.env`.
- The frontend was scaffolded with Next.js 16 which has breaking changes from earlier versions. See `frontend/AGENTS.md` for framework-specific notes.
- Backend tests (`npm test`) run entirely in-memory via Supertest — no database or external services required.
- The frontend does not have a `.env.local` file by default; it uses `http://localhost:4000` as the API base URL via the hardcoded default in `src/app/page.tsx` and `src/components/StoreFlow.tsx`.

## Start → Approve → Add (stores)

In-memory Maps (same pattern as agents/tasks). Data resets on server restart. No Shopify Admin API keys.

| Step | API | Effect |
|------|-----|--------|
| List themes | `GET /api/themes` | Catalog from `themes/catalog.json` (`shrine`, `olivia`) plus `available` if the zip exists |
| Start | `POST /api/stores` `{ name, templateId }` | Creates `draft`. `templateId` must be `shrine` or `olivia` |
| CRUD | `GET /api/stores`, `GET/PUT/DELETE /api/stores/:id` | Optional `?status=` filter (comma-separated) |
| Submit | `POST /api/stores/:id/submit` | `draft` → `pending_approval` |
| Approve | `POST /api/stores/:id/approve` | `draft` \| `pending_approval` → `approved` |
| Reject | `POST /api/stores/:id/reject` | `draft` \| `pending_approval` → `rejected` |
| Add | `POST /api/stores/:id/provision` | `approved` → `provisioning` → `live`; sets `themePackage` to the catalog path |

Statuses: `draft` \| `pending_approval` \| `approved` \| `provisioning` \| `live` \| `rejected`.

```
TODO: Shopify Admin API — create shop, upload/publish theme zip from themePackage, persist myshopify domain.
```

Theme zips (`themes/packages/shrine-1.3.1.zip`, `themes/packages/olivia-14.2.5.zip`) may still be pending; see `themes/README.md`.
