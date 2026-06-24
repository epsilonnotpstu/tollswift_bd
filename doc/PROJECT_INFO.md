# TollBD — Project Reference Document
> This file is the single source of truth for AI coding agents (Codex, Claude).
> Read this before making any change to any file in this project.
> Do NOT contradict anything written here without explicit user instruction.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| App Name | TollBD (টোলবিডি) |
| Tagline | Smart Toll. Faster Bangladesh. |
| Type | Web app + Mobile app (same codebase) |
| Country | Bangladesh |
| Currency | BDT — always display as ৳ symbol |
| Languages | Bengali (primary UI) + English (data/code) |

---

## 2. Tech Stack (Non-negotiable)

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18+ | UI framework |
| TypeScript | 5+ | Type safety |
| Vite | 5+ | Build tool |
| React Router v6 | 6+ | Navigation |
| Zustand | 4+ | State management |
| TanStack Query | 5+ | Server state / caching |
| Axios | 1+ | HTTP client |
| Tailwind CSS | 3+ | Styling |
| Shadcn/ui | latest | Base component library |
| Lucide React | latest | Icons (stroke 1.5px, 20px default) |
| react-qr-code | latest | QR generation |
| html5-qrcode | latest | QR scanning |
| Recharts | 2+ | Charts (admin dashboard) |
| react-pdf or pdfmake | latest | PDF receipt generation |
| react-hot-toast | latest | Toast notifications |
| date-fns | 3+ | Date formatting |

### Mobile (Capacitor — wraps the same React app)
| Tool | Version | Purpose |
|------|---------|---------|
| Capacitor | 6+ | Native wrapper |
| @capacitor/camera | 6+ | Vehicle photo capture |
| @capacitor/push-notifications | 6+ | Mobile push |
| @capacitor/haptics | 6+ | Vibration feedback |
| @capacitor/share | 6+ | Native share sheet |
| @capacitor/filesystem | 6+ | Save PDF receipts |
| @capacitor/status-bar | 6+ | Status bar styling |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS | Runtime |
| Express | 4+ | Web framework |
| TypeScript | 5+ | Type safety |
| Prisma | 5+ | ORM |
| PostgreSQL | 15+ | Database (Railway) |
| JWT (jsonwebtoken) | 9+ | Auth tokens |
| bcryptjs | 2+ | Password hashing |
| Resend | 3+ | Email OTP sending |
| Google Auth Library | 9+ | Google OAuth verify |
| Multer | 1+ | File upload |
| Sharp | 0.33+ | Image optimization |
| node-qrcode | 1+ | QR token generation |
| pdfkit | 0.15+ | PDF receipts |
| web-push | 3+ | Web push notifications |
| zod | 3+ | Input validation |
| cors | 2+ | CORS middleware |
| helmet | 7+ | Security headers |
| express-rate-limit | 7+ | Rate limiting |
| winston | 3+ | Logging |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Railway.app | Backend + PostgreSQL hosting |
| Vercel | Frontend hosting (optional, or Railway static) |
| Resend.com | Transactional email (OTP) |
| Google Cloud Console | OAuth 2.0 credentials |
| SSLCommerz | Payment gateway (Bangladesh) |
| Cloudinary or Railway Volume | File/image storage |

---

## 3. Project Folder Structure

```
tollbd/
├── apps/
│   ├── web/                          ← React app (Vite + TypeScript)
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── router/
│   │   │   │   └── index.tsx         ← All routes (user + admin)
│   │   │   ├── store/                ← Zustand stores
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── walletStore.ts
│   │   │   │   └── uiStore.ts
│   │   │   ├── api/                  ← Axios instances + API calls
│   │   │   │   ├── client.ts         ← Axios base config + interceptors
│   │   │   │   ├── auth.api.ts
│   │   │   │   ├── vehicle.api.ts
│   │   │   │   ├── bridge.api.ts
│   │   │   │   ├── toll.api.ts
│   │   │   │   ├── wallet.api.ts
│   │   │   │   ├── transaction.api.ts
│   │   │   │   └── admin.api.ts
│   │   │   ├── hooks/                ← Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useWallet.ts
│   │   │   │   ├── usePushNotification.ts
│   │   │   │   └── useCapacitor.ts   ← Capacitor native hooks
│   │   │   ├── components/           ← Reusable UI components
│   │   │   │   ├── ui/               ← Base components (shadcn)
│   │   │   │   ├── shared/           ← App-specific shared components
│   │   │   │   │   ├── BottomNav.tsx
│   │   │   │   │   ├── AppBar.tsx
│   │   │   │   │   ├── VehicleCard.tsx
│   │   │   │   │   ├── BridgeCard.tsx
│   │   │   │   │   ├── TransactionRow.tsx
│   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   ├── QRDisplay.tsx
│   │   │   │   │   ├── ReceiptCard.tsx
│   │   │   │   │   └── LoadingScreen.tsx
│   │   │   │   └── admin/            ← Admin-specific components
│   │   │   │       ├── AdminSidebar.tsx
│   │   │   │       ├── KPICard.tsx
│   │   │   │       ├── DataTable.tsx
│   │   │   │       └── ChartCard.tsx
│   │   │   ├── pages/                ← Route-level pages
│   │   │   │   ├── user/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── SplashPage.tsx
│   │   │   │   │   │   ├── OnboardingPage.tsx
│   │   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   │   ├── OTPPage.tsx
│   │   │   │   │   │   └── RegisterPage.tsx
│   │   │   │   │   ├── home/
│   │   │   │   │   │   └── HomePage.tsx
│   │   │   │   │   ├── wallet/
│   │   │   │   │   │   ├── WalletPage.tsx
│   │   │   │   │   │   └── DepositPage.tsx
│   │   │   │   │   ├── vehicle/
│   │   │   │   │   │   ├── VehiclesPage.tsx
│   │   │   │   │   │   ├── AddVehiclePage.tsx
│   │   │   │   │   │   └── VehicleDetailPage.tsx
│   │   │   │   │   ├── toll/
│   │   │   │   │   │   ├── SelectBridgePage.tsx
│   │   │   │   │   │   ├── SelectVehiclePage.tsx
│   │   │   │   │   │   ├── PaymentMethodPage.tsx
│   │   │   │   │   │   ├── PaymentConfirmPage.tsx
│   │   │   │   │   │   └── PaymentSuccessPage.tsx
│   │   │   │   │   ├── history/
│   │   │   │   │   │   ├── HistoryPage.tsx
│   │   │   │   │   │   └── ReceiptPage.tsx
│   │   │   │   │   ├── qr/
│   │   │   │   │   │   ├── MyQRPage.tsx
│   │   │   │   │   │   └── ScanPage.tsx
│   │   │   │   │   └── profile/
│   │   │   │   │       ├── ProfilePage.tsx
│   │   │   │   │       └── NotificationSettingsPage.tsx
│   │   │   │   └── admin/
│   │   │   │       ├── AdminLoginPage.tsx
│   │   │   │       ├── DashboardPage.tsx
│   │   │   │       ├── UsersPage.tsx
│   │   │   │       ├── UserDetailPage.tsx
│   │   │   │       ├── VehiclesPage.tsx
│   │   │   │       ├── BridgesPage.tsx
│   │   │   │       ├── TollRatesPage.tsx
│   │   │   │       ├── TransactionsPage.tsx
│   │   │   │       ├── ScannerPage.tsx
│   │   │   │       └── AnnouncementsPage.tsx
│   │   │   ├── types/                ← TypeScript interfaces
│   │   │   │   ├── auth.types.ts
│   │   │   │   ├── vehicle.types.ts
│   │   │   │   ├── bridge.types.ts
│   │   │   │   ├── transaction.types.ts
│   │   │   │   └── admin.types.ts
│   │   │   ├── utils/
│   │   │   │   ├── currency.ts       ← ৳ formatting, BDT utils
│   │   │   │   ├── date.ts           ← Bengali date formatting
│   │   │   │   ├── validators.ts     ← BD phone, plate number, NID
│   │   │   │   └── capacitor.ts      ← Platform detection helpers
│   │   │   └── styles/
│   │   │       ├── globals.css       ← Tailwind base + custom CSS vars
│   │   │       └── fonts.css         ← Inter + Hind Siliguri imports
│   │   ├── public/
│   │   │   ├── pwa/                  ← PWA icons
│   │   │   └── manifest.json
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                       ← Capacitor project (wraps web)
│       ├── android/                  ← Android native project
│       ├── ios/                      ← iOS native project
│       ├── capacitor.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                       ← Shared types between web + api
│       ├── src/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
│
├── api/                              ← Node.js + Express backend
│   ├── src/
│   │   ├── index.ts                  ← App entry point
│   │   ├── app.ts                    ← Express app setup
│   │   ├── config/
│   │   │   ├── env.ts                ← Environment variable validation
│   │   │   ├── database.ts           ← Prisma client singleton
│   │   │   └── logger.ts             ← Winston logger
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    ← JWT verify + role check
│   │   │   ├── validate.middleware.ts ← Zod request validation
│   │   │   ├── upload.middleware.ts  ← Multer + Sharp
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── error.middleware.ts   ← Global error handler
│   │   ├── routes/
│   │   │   ├── index.ts              ← Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── vehicle.routes.ts
│   │   │   ├── bridge.routes.ts
│   │   │   ├── toll.routes.ts
│   │   │   ├── wallet.routes.ts
│   │   │   ├── transaction.routes.ts
│   │   │   ├── qr.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── vehicle.controller.ts
│   │   │   ├── bridge.controller.ts
│   │   │   ├── toll.controller.ts
│   │   │   ├── wallet.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   ├── qr.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── otp.service.ts        ← Resend email OTP
│   │   │   ├── google.service.ts     ← Google OAuth verify
│   │   │   ├── vehicle.service.ts
│   │   │   ├── bridge.service.ts
│   │   │   ├── toll.service.ts
│   │   │   ├── wallet.service.ts
│   │   │   ├── sslcommerz.service.ts ← SSLCommerz payment
│   │   │   ├── qr.service.ts
│   │   │   ├── pdf.service.ts        ← pdfkit receipt
│   │   │   ├── push.service.ts       ← web-push VAPID
│   │   │   └── brta.service.ts       ← BRTA API (placeholder)
│   │   ├── schemas/                  ← Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── vehicle.schema.ts
│   │   │   ├── bridge.schema.ts
│   │   │   └── toll.schema.ts
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── hash.ts
│   │       ├── response.ts           ← Standard API response helpers
│   │       └── brta.placeholder.ts
│   ├── prisma/
│   │   ├── schema.prisma             ← Database schema
│   │   ├── migrations/               ← Auto-generated
│   │   └── seed.ts                   ← Initial data seeding
│   ├── uploads/                      ← Local file storage (dev only)
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                             ← YOU ARE HERE
│   ├── PROJECT_INFO.md               ← This file
│   ├── DATABASE_SCHEMA.md            ← Full DB schema reference
│   └── PROMPTS.md                    ← All 5 Codex prompts
│
├── figma/                            ← Exported Figma design tokens
│   └── (you add files here from Figma export)
│
├── .env.example                      ← Root env template
├── .gitignore
└── README.md
```

---

## 4. Database Schema Summary

See `DATABASE_SCHEMA.md` for full Prisma schema. Tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (user + admin roles) |
| `otps` | Email OTP codes (expires in 10 min) |
| `vehicles` | Registered vehicles per user |
| `bridges` | Bridge master data |
| `toll_rates` | Per-bridge toll rates by vehicle category |
| `wallets` | One wallet per user (balance in paisa, not taka) |
| `wallet_transactions` | Wallet credit/debit ledger |
| `transactions` | All toll payment transactions |
| `qr_tokens` | Short-lived QR fastpass tokens (24hr TTL) |
| `announcements` | Admin broadcast messages |
| `push_subscriptions` | Web push notification subscriptions |

---

## 5. API Base URLs

```
Development:  http://localhost:3001/api/v1
Production:   https://tollbd-api.up.railway.app/api/v1
```

All responses follow this shape:
```json
{
  "success": true,
  "data": {},
  "message": "optional message",
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error",
  "error": { "code": "ERROR_CODE", "details": {} }
}
```

---

## 6. Auth System

- JWT access token: 15 minute expiry
- JWT refresh token: 30 day expiry, stored in httpOnly cookie
- Email OTP: 6-digit numeric, expires in 10 minutes, max 3 attempts
- Google OAuth: verify `id_token` server-side via Google Auth Library
- Admin role: `role: 'ADMIN'` in users table, separate admin-only routes
- All protected routes require `Authorization: Bearer <token>` header

---

## 7. Vehicle Categories (BRTA Standard)

| Category | Vehicle Types | Example Toll (Padma) |
|----------|--------------|----------------------|
| A | Motorbike / Scooter | ৳ 200 |
| B | Car / Jeep / SUV (≤12 seats) | ৳ 1,500 |
| C | Microbus / Minibus (12–31 seats) | ৳ 2,400 |
| D | Bus (31+ seats) | ৳ 3,800 |
| E | Small Truck / Pickup (≤5 tons) | ৳ 3,200 |
| F | Large Truck / Heavy Vehicle (5+ tons) | ৳ 5,600 |

---

## 8. Payment Methods

| Method | How it works |
|--------|-------------|
| TollBD Wallet | Instant deduction from user wallet balance |
| SSLCommerz | Redirect to SSLCommerz gateway (card / net banking) |
| bKash | Redirect via SSLCommerz bKash option |
| Nagad | Redirect via SSLCommerz Nagad option |

All wallet top-ups go through SSLCommerz → callback → server updates wallet.
Wallet balance stored in **paisa** (1 taka = 100 paisa) as integer to avoid float issues.

---

## 9. Key Business Rules

1. A user cannot pay toll without at least 1 verified vehicle.
2. Wallet payment fails if balance < toll amount.
3. QR tokens expire after 24 hours and are single-use.
4. Vehicle stays `PENDING` until admin approves; toll payment blocked for pending vehicles.
5. Admin can set different toll rates per bridge per vehicle category.
6. Refunds go back to the user's TollBD wallet (not original payment method).
7. BRTA API integration is a placeholder — code hook exists but external API call is commented out.
8. OTP can only be resent after 60 seconds cooldown.
9. Max 3 wrong OTP attempts → OTP invalidated, user must request new one.
10. File uploads: max 5MB per image, only JPEG/PNG/WEBP accepted.

---

## 10. Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=otp@tollbd.com.bd

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# SSLCommerz
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASS=
SSLCOMMERZ_IS_LIVE=false

# Web Push (VAPID)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=admin@tollbd.com.bd

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5

# BRTA API (placeholder)
BRTA_API_URL=
BRTA_API_KEY=

# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3001

# Railway (auto-set in production)
RAILWAY_ENVIRONMENT=
```

---

## 11. Capacitor Build Notes

The React app in `apps/web` IS the Capacitor app. After building:
```bash
cd apps/web && npm run build
cd apps/mobile && npx cap sync
npx cap open android   # Opens Android Studio
npx cap open ios       # Opens Xcode
```

Capacitor-specific features used:
- Camera: Vehicle photo capture (AddVehiclePage)
- Push Notifications: Mobile push (supplement to Web Push)
- Haptics: Feedback on QR scan, payment success
- Share: Share receipt/QR image
- Filesystem: Save PDF receipts to device
- StatusBar: White icons on primary-blue backgrounds

---

## 12. Seeded Initial Data

After `prisma db seed`:
- 1 admin user: `admin@tollbd.com.bd` / `Admin@1234`
- 10 bridges with realistic BD data
- Default toll rates for all bridges
- 3 sample announcements

---

## 13. Design Token Source

Figma exports go into `/figma` folder.
CSS variables are defined in `apps/web/src/styles/globals.css`.
Tailwind config extends these CSS variables.
Never hardcode hex colors — always use CSS vars or Tailwind tokens.
