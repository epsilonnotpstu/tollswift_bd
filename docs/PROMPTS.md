═══════════════════════════════════════════════════════
# PROMPT 1 — Foundation: Project Setup + Database + Auth
# ═══════════════════════════════════════════════════════

## What you need to do BEFORE running this prompt:
1. Create a Railway account at railway.app
2. Start a new Railway project → Add PostgreSQL service → copy DATABASE_URL
3. Create a Resend account at resend.com → get API key
4. Create Google OAuth credentials at console.cloud.google.com:
   - Create OAuth 2.0 Client ID (Web application)
   - Authorized redirect URIs: http://localhost:5173/auth/google/callback
   - Copy Client ID and Client Secret
5. Create a folder: `tollbd/`
6. Open this folder in VS Code

---

## CODEX PROMPT 1:

You are building "TollBD" — a production-grade smart bridge toll payment system for Bangladesh. This is a monorepo containing a React frontend, a Node.js/Express backend, and a Capacitor mobile wrapper. You will build the complete foundation layer now.

Read docs/PROJECT_INFO.md and docs/DATABASE_SCHEMA.md carefully before writing any code. Follow every naming convention and structure defined there exactly.

---

### TASK 1.1 — Create monorepo structure

Create this exact folder structure with all config files:

```
tollbd/
├── apps/
│   ├── web/          (React + Vite + TypeScript + Tailwind)
│   └── mobile/       (Capacitor config only for now)
├── packages/
│   └── shared/       (shared types)
├── api/              (Node.js + Express + Prisma)
├── docs/             (already exists — DO NOT MODIFY)
├── figma/            (empty — DO NOT TOUCH)
├── .gitignore
└── README.md
```

**Root `.gitignore`** must include:
- node_modules/, dist/, build/, .env, *.env
- uploads/, *.log, .DS_Store
- android/, ios/ (Capacitor native dirs)
- prisma/migrations/ (keep schema, ignore migrations from git in dev)

---

### TASK 1.2 — Backend (api/) — Complete setup

**`api/package.json`** — include all these exact dependencies:
```json
{
  "name": "tollbd-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.16.0",
    "axios": "^1.7.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-async-errors": "^3.1.1",
    "express-rate-limit": "^7.4.0",
    "google-auth-library": "^9.13.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "node-qrcode": "^1.5.4",
    "pdfkit": "^0.15.0",
    "resend": "^3.4.0",
    "sharp": "^0.33.5",
    "web-push": "^3.6.7",
    "winston": "^3.14.1",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.14.0",
    "@types/node-qrcode": "^1.5.5",
    "@types/pdfkit": "^0.13.4",
    "@types/web-push": "^3.6.3",
    "prisma": "^5.16.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0"
  }
}
```

**`api/tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`api/.env.example`** — create with ALL keys from docs/PROJECT_INFO.md section 10.

---

### TASK 1.3 — Prisma Schema

Write the COMPLETE Prisma schema exactly as defined in docs/DATABASE_SCHEMA.md.
Save to `api/prisma/schema.prisma`.

---

### TASK 1.4 — Backend core files (write ALL of these completely)

**`api/src/config/env.ts`**:
Use zod to validate all env vars at startup. Export typed `env` object.
If any required variable is missing → throw error with clear message listing missing vars.

**`api/src/config/logger.ts`**:
Winston logger with:
- Console transport (colorized in development)
- File transports: `logs/error.log` (errors only) + `logs/combined.log` (all)
- Format: timestamp + level + message + optional metadata JSON
- Export `logger` object

**`api/src/config/database.ts`**:
Prisma client singleton pattern (prevent multiple instances in dev with hot reload).
Export `prisma` client instance.

**`api/src/utils/response.ts`**:
```typescript
// Standardized API response helpers
export const success = (res, data, message?, statusCode = 200) => {...}
export const error = (res, message, statusCode = 400, code?, details?) => {...}
// All responses follow: { success: bool, data, message, error }
```

**`api/src/utils/jwt.ts`**:
- `signAccessToken(userId, role)` → 15min JWT
- `signRefreshToken(userId)` → 30day JWT
- `verifyAccessToken(token)` → decoded payload or throw
- `verifyRefreshToken(token)` → decoded payload or throw

**`api/src/utils/hash.ts`**:
- `hashPassword(plain)` → bcrypt hash (rounds: 12)
- `comparePassword(plain, hash)` → boolean

**`api/src/middleware/auth.middleware.ts`**:
```typescript
// requireAuth: verifies Bearer token, attaches user to req.user
// requireAdmin: requireAuth + checks role === 'ADMIN'
// optionalAuth: attaches user if token present, doesn't fail if missing
```
Attach to `req.user`: `{ id, email, role, status }`

**`api/src/middleware/validate.middleware.ts`**:
```typescript
// validate(schema: ZodSchema) → middleware that validates req.body
// On error: returns 400 with zod error details formatted for client
```

**`api/src/middleware/error.middleware.ts`**:
Global error handler (4-argument Express middleware).
Handles: Prisma errors (unique constraint → 409, not found → 404),
Zod errors → 400, JWT errors → 401, generic → 500.
Logs all 5xx errors with logger.

**`api/src/middleware/rateLimit.middleware.ts`**:
```typescript
export const authLimiter      // 5 req/min — for login/OTP endpoints
export const otpLimiter       // 3 req/10min — for OTP send
export const generalLimiter   // 100 req/min — all other routes
```

---

### TASK 1.5 — Auth system (complete implementation)

**`api/src/services/otp.service.ts`**:
```typescript
// generateOTP() → 6-digit string
// saveOTP(userId, code) → creates Otp record (expires 10min, deletes old OTPs for user)
// verifyOTP(userId, code) → checks: exists, not used, not expired, attempts < 3
//   On wrong: increments attempts, throws if ≥ 3
//   On correct: marks used: true
// sendOTPEmail(email, code, name) → uses Resend SDK
//   Email subject: "TollBD — আপনার OTP কোড"
//   Email body: clean HTML with OTP displayed prominently, 10-min expiry notice
```

**`api/src/services/google.service.ts`**:
```typescript
// verifyGoogleToken(idToken) → { googleId, email, name, photoUrl }
// Uses google-auth-library OAuth2Client to verify token
// Throws if token invalid or audience mismatch
```

**`api/src/schemas/auth.schema.ts`** — Zod schemas:
```typescript
export const registerSchema   // email, password (min 8, 1 upper, 1 number), fullName
export const loginSchema      // email, password
export const sendOTPSchema    // email
export const verifyOTPSchema  // email, code (6-digit string)
export const googleAuthSchema // idToken
export const refreshSchema    // refreshToken (string)
```

**`api/src/services/auth.service.ts`**:
```typescript
// register(data) → creates user (UNVERIFIED), creates wallet, sends OTP email
// loginWithEmail(email, pass) → verifies password, checks status, returns tokens
// sendEmailOTP(email) → finds/creates user, generates OTP, sends email
// verifyEmailOTP(email, code) → verifies OTP, marks emailVerified, returns tokens
//   If user didn't exist yet → creates new user record
// googleAuth(idToken) → verifyGoogleToken → find or create user → return tokens
// refreshTokens(refreshToken) → verify → issue new access token
// logout(userId, refreshToken) → (stateless JWT — just return success)
```

**`api/src/controllers/auth.controller.ts`**:
Thin controllers that call service methods and use response helpers.
Routes handled:
- POST /auth/register
- POST /auth/login
- POST /auth/otp/send
- POST /auth/otp/verify
- POST /auth/google
- POST /auth/refresh
- POST /auth/logout

**`api/src/routes/auth.routes.ts`**:
Wire controllers with validation middleware and rate limiters.

---

### TASK 1.6 — User profile routes

**`api/src/controllers/user.controller.ts`**:
- GET /users/me → return current user profile (without passwordHash)
- PATCH /users/me → update fullName, phone, division, district, emergencyContact
- POST /users/me/photo → upload profile photo (multer + sharp resize to 400×400)
- DELETE /users/me → soft delete (set status to BLOCKED + anonymize email)

**`api/src/routes/user.routes.ts`**:
All routes require `requireAuth`.

---

### TASK 1.7 — App entry point

**`api/src/app.ts`**:
```typescript
// Create Express app
// Apply: helmet, cors (allow FRONTEND_URL), express.json, generalLimiter
// Mount routes: /api/v1/auth, /api/v1/users
// Mount error middleware last
// Export app
```

**`api/src/index.ts`**:
```typescript
// Import env (validates all vars)
// Import app
// Connect to DB (prisma.$connect)
// Start server on PORT
// Graceful shutdown on SIGTERM
```

---

### TASK 1.8 — Prisma Seed File

**`api/prisma/seed.ts`** — seed:
1. Admin user: `admin@tollbd.com.bd`, password `Admin@1234`, role ADMIN, status ACTIVE
2. 10 bridges (data in docs/DATABASE_SCHEMA.md)
3. Toll rates for all 10 bridges (data in docs/DATABASE_SCHEMA.md)
4. Wallet for admin user (balance 0)

---

### TASK 1.9 — Frontend scaffolding (web app)

**`apps/web/package.json`** — include:
react, react-dom, react-router-dom, zustand, @tanstack/react-query, axios,
tailwindcss, shadcn/ui base, lucide-react, react-hot-toast, date-fns, typescript, vite.

**`apps/web/vite.config.ts`**:
- React plugin
- Proxy: `/api` → `http://localhost:3001`
- Path alias: `@` → `./src`

**`apps/web/tailwind.config.ts`**:
Extend theme with colors matching docs/PROJECT_INFO.md section design tokens.
All brand colors as CSS variables. Hind Siliguri font.

**`apps/web/src/styles/globals.css`**:
```css
/* CSS variables for all design tokens */
:root {
  --color-primary: #1B4FDB;
  --color-primary-50: #EEF2FF;
  --color-secondary: #00A86B;
  --color-accent: #F5A623;
  --color-bg: #F8F9FD;
  --color-surface: #FFFFFF;
  --color-border: #E4E9F5;
  --color-text-primary: #0F1729;
  --color-text-secondary: #5C6B8A;
  --color-text-muted: #8A97B5;
  /* ... all tokens ... */
  --font-bengali: 'Hind Siliguri', sans-serif;
}
/* Google Fonts import for Inter + Hind Siliguri */
/* Base body styles */
/* .font-bengali utility class */
/* Mobile tap highlight removal */
/* Smooth scroll */
```

**`apps/web/src/api/client.ts`**:
Axios instance with:
- baseURL: `/api/v1`
- Request interceptor: add `Authorization: Bearer <token>` from Zustand auth store
- Response interceptor: on 401 → try refresh token → retry, on second 401 → logout
- Error normalization: extract error message from response body

**`apps/web/src/store/authStore.ts`**:
Zustand store with:
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  // Actions:
  setAuth(user, token): void
  clearAuth(): void
  setLoading(bool): void
}
// Persist to localStorage (user + token)
```

**`apps/web/src/store/uiStore.ts`**:
```typescript
interface UIState {
  isOnline: boolean
  // Toll payment flow state (persisted across steps)
  selectedBridgeId: string | null
  selectedVehicleId: string | null
  selectedPaymentMethod: string | null
  setTollSelection(bridge?, vehicle?, method?): void
  clearTollSelection(): void
}
```

**`apps/web/src/router/index.tsx`**:
React Router v6 with:
- Public routes: /splash, /onboarding, /login, /otp, /register
- Protected routes (require auth): /home, /wallet, /wallet/deposit,
  /vehicles, /vehicles/add, /vehicles/:id, /toll/*, /history, /history/:id,
  /qr, /qr/scan, /profile, /profile/settings
- Admin routes (require ADMIN role): /admin/*, /admin/login
- Default redirect: / → /splash
- ProtectedRoute and AdminRoute wrapper components

**`apps/web/src/types/`** — write complete TypeScript interfaces for:
- `auth.types.ts`: User, LoginRequest, RegisterRequest, AuthResponse
- `vehicle.types.ts`: Vehicle, CreateVehicleRequest
- `bridge.types.ts`: Bridge, TollRate
- `transaction.types.ts`: Transaction, WalletTransaction
- `admin.types.ts`: DashboardStats, AdminUser

All types must match Prisma schema exactly.

---

### TASK 1.10 — Capacitor config

**`apps/mobile/capacitor.config.ts`**:
```typescript
import { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.tollbd.app',
  appName: 'TollBD',
  webDir: '../web/dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: { style: 'Light', backgroundColor: '#1B4FDB' },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1B4FDB',
      showSpinner: false
    },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] }
  }
};
export default config;
```

---

### VERIFY BEFORE FINISHING PROMPT 1:

After writing all files, run these verification checks:
1. `cd api && npm install` — must succeed
2. `cd api && npm run db:generate` — must succeed (Prisma client generated)
3. `cd apps/web && npm install` — must succeed
4. Confirm all TypeScript types have no compile errors
5. Confirm all import paths are correct

**Do NOT start the server or run migrations** — the user will provide DATABASE_URL first.

**Print a summary** of all files created and next steps for the user.

---

## What user does after Prompt 1:
1. Create `api/.env` file (copy from `.env.example`, fill in real values)
2. Run: `cd api && npx prisma migrate dev --name init`
3. Run: `cd api && npm run db:seed`
4. Run: `cd api && npm run dev` — verify server starts on port 3001
5. Test: `curl http://localhost:3001/api/v1/auth/otp/send -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com"}'`

---

# ═══════════════════════════════════════════════════════
# PROMPT 2 — Core Business APIs: Vehicles, Bridges, Tolls, Wallet, Payment
# ═══════════════════════════════════════════════════════

## What you need to do BEFORE running this prompt:
1. Confirm `cd api && npm run dev` works without errors
2. Confirm database is migrated and seeded
3. Confirm OTP email works (send a test OTP, check your inbox)
4. Get SSLCommerz sandbox credentials from sslcommerz.com
5. Add to `api/.env`: SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASS
6. Run: `cd api && npx web-push generate-vapid-keys` → copy to .env VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY