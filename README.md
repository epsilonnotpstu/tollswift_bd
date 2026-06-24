# TollBD — বাংলাদেশ স্মার্ট ব্রিজ টোল সিস্টেম

Smart bridge toll payment system for Bangladesh. Supports wallet top-up, QR FastPass, SSLCommerz, and a full admin panel.

---

## Quick Start (Development)

```bash
# 1. API
cd api
cp .env.example .env       # fill in all values
npm install
npx prisma migrate dev
tsx prisma/seed.ts
npm run dev                # starts on :3001

# 2. Web
cd apps/web
npm install
npm run dev                # starts on :5174
```

Open http://localhost:5174

---

## Admin Panel

- URL: http://localhost:5174/admin
- Email: `admin@tollbd.com.bd`
- Password: `Admin@1234` (**change immediately in production!**)

---

## Android Build

```bash
# One-click build + install
cd apps/mobile
bash build-android.sh

# Install on connected phone
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Production Deploy (Railway)

1. Push this repo to GitHub
2. Create Railway project → New Service → GitHub Repo (point to `api/`)
3. Add PostgreSQL service, copy `DATABASE_URL` to API service
4. Set all env vars from `api/.env.example` in Railway dashboard
5. Update `apps/web/.env.production` → set `VITE_API_URL` to your Railway API URL
6. Deploy web to Vercel / Netlify / Railway Static

Railway auto-runs: `prisma migrate deploy && node dist/index.js`

---

## Tech Stack

| Layer | Tech |
|---|---|
| Web | React 18, Vite, Tailwind CSS, TanStack Query, Zustand |
| API | Node.js, Express 4, Prisma 5, PostgreSQL |
| Mobile | Capacitor 6 (Android) |
| Auth | JWT + Refresh Token, Google OAuth, Email OTP (Resend) |
| Payments | SSLCommerz (sandbox/live), Wallet |
| Notifications | Web Push (VAPID), Capacitor Push |

---

## Docs

- `doc/PROJECT_INFO.md` — Architecture + tech stack
- `doc/DATABASE_SCHEMA.md` — Full DB schema
- `doc/PROMPTS.md` — All 5 development prompts
