# Zentrix Control Centre

**Zentrix Control Centre** is the SA dropshipping / autonomous Shopify umbrella: **Start -> Approve -> Add**.

This repository is the control plane for running that loop — sourcing, review, and store operations — with the existing **agent platform MVP** as the foundation (autonomous agent orchestration, task queues, and dashboard).

## What it does

- **Start**: kick off sourcing / agent workflows for products and ops
- **Approve**: human-in-the-loop review before anything hits the store
- **Add**: push approved items into Shopify (and related automations)

Under the hood, the MVP still provides agent management, team workflows, real-time monitoring, LLM integration, and a management UI.

## Tech Stack

- **Frontend**: Next.js + React + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Queue**: Redis
- **Containers**: Docker

## Quick Start

Clone the repo at https://github.com/billyboy95/zentrix.git

After cloning, set up backend under backend/ (install deps, copy env example, run the API) and frontend under frontend/ (install deps, run the app). Dashboard: http://localhost:3000

## Project Structure

Root layout: backend/ Node API, frontend/ Next.js Control Centre UI, docker-compose.yml for Postgres and Redis, AGENTS.md notes, README.md.

## License

See LICENSE file in this repository.
