# Zentrix Control Centre

**Zentrix Control Centre** is the SA dropshipping / autonomous Shopify umbrella: **Start → Approve → Add**.

This repository is the control plane for running that loop — sourcing, review, and store operations — with the existing **agent platform MVP** as the foundation (autonomous agent orchestration, task queues, and dashboard).

## What it does

- **Start**: create a store draft on a theme template (`shrine` or `olivia`)
- **Approve**: human-in-the-loop review (`draft` / `pending_approval` → `approved` or `rejected`)
- **Add**: provision the store (`approved` → `provisioning` → `live`) and record the selected theme package path

The agent/task MVP remains available on the same dashboard for sourcing and ops workflows.

Shopify Admin API is **not** wired yet (no secrets, no live shop create). Provisioning is an in-memory stub.

## Theme packages

Catalog: [`themes/catalog.json`](themes/catalog.json)

| Template ID | Theme | Package |
|-------------|--------|---------|
| `shrine` | Shrine 1.3.1 | `themes/packages/shrine-1.3.1.zip` |
| `olivia` | Olivia 14.2.5 / LuminTheme | `themes/packages/olivia-14.2.5.zip` |

Zip files may still be pending. The Control Centre uses catalog IDs regardless; provision records the intended path. See [`themes/README.md`](themes/README.md).

## Tech Stack

- **Frontend**: Next.js + React + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Queue**: Redis
- **Containers**: Docker

## Quick Start

Clone the repo at https://github.com/billyboy95/zentrix.git

After cloning, set up backend under backend/ (install deps, copy env example, run the API) and frontend under frontend/ (install deps, run the app). Dashboard: http://localhost:3000

Local API (in-memory, no Shopify keys):

- `GET /api/themes` — catalog
- `GET|POST /api/stores` — list / Start (draft)
- `POST /api/stores/:id/approve` — Approve
- `POST /api/stores/:id/provision` — Add

## Project Structure

Root layout: backend/ Node API, frontend/ Next.js Control Centre UI, themes/ catalog + packages, docker-compose.yml for Postgres and Redis, AGENTS.md notes, README.md.

## License

See LICENSE file in this repository.
