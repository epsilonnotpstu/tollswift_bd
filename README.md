# TollBD

Smart Toll. Faster Bangladesh.

This monorepo contains the TollBD React web app, Express API, shared TypeScript package, and Capacitor mobile wrapper.

## Structure

- `api` - Node.js, Express, Prisma, PostgreSQL backend
- `apps/web` - React, Vite, TypeScript, Tailwind frontend
- `apps/mobile` - Capacitor wrapper for the web build
- `packages/shared` - shared types/constants
- `docs` - project reference documents
- `figma` - design export/reference files

## Prompt 1 Setup

1. Copy `api/.env.example` to `api/.env` and fill real values.
2. Run `cd api && npm install`.
3. Run `cd api && npm run db:generate`.
4. After `DATABASE_URL` is ready, run `cd api && npx prisma migrate dev --name init`.
5. Run `cd api && npm run db:seed`.
6. Run `cd api && npm run dev`.
7. Run `cd apps/web && npm install && npm run dev`.
