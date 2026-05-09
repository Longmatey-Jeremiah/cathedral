# Church Management Platform

A modular monorepo for a production-grade church management system.

```
.
├── apps
│   ├── api   — NestJS backend (auth, users, invites, notifications)
│   └── web   — Next.js landing + web app
├── tsconfig.base.json
├── turbo.json
└── package.json     ← workspaces root
```

## Stack

- **Monorepo:** Turborepo + npm workspaces
- **API:** NestJS · Prisma · PostgreSQL · JWT · class-validator · Helmet · Throttler
- **Web:** Next.js (App Router) · React 19 · Tailwind CSS v4 · TanStack Query · Zod

## Getting started

```bash
# 1. Install
npm install

# 2. Configure env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. (one-time) generate Prisma client + migrate
npm run prisma:generate -w @cmp/api
npm run prisma:migrate  -w @cmp/api

# 4. Run everything
npm run dev
```

Web at http://localhost:3000 · API at http://localhost:4000/api.

## Architecture

The backend follows the [architecture guide](./architecture.md):

- Modular monolith: `auth`, `users`, `invites`, `notifications`
- Strict separation of controllers / services / repositories
- Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`
- JWT auth + RBAC guards (`@Roles(...)`)
- Single-use, hashed invite tokens with expiry
- bcrypt-hashed passwords; temporary passwords on manual creation force a change on first login

The landing page follows the [Dialog style guide](./style.md): #f7f7f7
canvas, white cards, single-warm CTA in `#f69251`, geometric grotesque
display type, pill buttons against zero-radius inputs.

## Scripts (root)

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Run all apps in dev mode (Turbo orchestrates) |
| `npm run build`   | Build all apps                                |
| `npm run lint`    | Lint all apps                                 |
| `npm run test`    | Run tests across the monorepo                 |
| `npm run format`  | Prettier across the monorepo                  |
