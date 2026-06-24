# TollBD — Database Schema Reference
> Full Prisma schema for PostgreSQL on Railway.
> Never modify column names without updating this file and all related API files.

---

## Complete Prisma Schema (`api/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum Role {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  BLOCKED
  UNVERIFIED
}

enum VehicleType {
  MOTORBIKE
  CAR
  MICROBUS
  BUS
  TRUCK
  HEAVY_TRUCK
}

enum VehicleCategory {
  A   // Motorbike
  B   // Car / Jeep
  C   // Microbus / Minibus
  D   // Bus
  E   // Small Truck
  F   // Heavy Truck
}

enum VehicleStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum FuelType {
  PETROL
  DIESEL
  CNG
  ELECTRIC
  HYBRID
}

enum BridgeCategory {
  EXPRESSWAY
  NATIONAL
  LOCAL
}

enum BridgeStatus {
  ACTIVE
  MAINTENANCE
  CLOSED
}

enum PaymentMethod {
  WALLET
  SSLCOMMERZ
  BKASH
  NAGAD
  CARD
}

enum TransactionType {
  TOLL_PAYMENT
  WALLET_DEPOSIT
  REFUND
}

enum TransactionStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum AnnouncementType {
  INFO
  WARNING
  MAINTENANCE
}

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────

model User {
  id                String    @id @default(uuid())
  email             String    @unique
  phone             String?   @unique
  passwordHash      String?   // null for Google OAuth users
  fullName          String
  photoUrl          String?
  nidNumber         String?
  role              Role      @default(USER)
  status            UserStatus @default(UNVERIFIED)
  division          String?
  district          String?
  emergencyContact  String?
  googleId          String?   @unique
  emailVerified     Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  otps              Otp[]
  wallet            Wallet?
  vehicles          Vehicle[]
  transactions      Transaction[]
  qrTokens          QrToken[]
  pushSubscriptions PushSubscription[]

  @@index([email])
  @@index([role])
  @@index([status])
}

// ─────────────────────────────────────────
// OTP
// ─────────────────────────────────────────

model Otp {
  id          String   @id @default(uuid())
  userId      String
  code        String   // 6-digit numeric
  type        String   @default("email") // 'email' | 'phone'
  attempts    Int      @default(0)  // max 3 wrong attempts
  expiresAt   DateTime // now + 10 minutes
  used        Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([code])
}

// ─────────────────────────────────────────
// WALLET
// ─────────────────────────────────────────

model Wallet {
  id          String   @id @default(uuid())
  userId      String   @unique
  balance     Int      @default(0)  // STORED IN PAISA (100 paisa = 1 taka)
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id])
  transactions WalletTransaction[]

  @@index([userId])
}

model WalletTransaction {
  id          String   @id @default(uuid())
  walletId    String
  type        String   // 'CREDIT' | 'DEBIT'
  amount      Int      // in paisa
  description String
  reference   String?  // transaction ID or SSL transaction ID
  createdAt   DateTime @default(now())

  wallet      Wallet   @relation(fields: [walletId], references: [id])

  @@index([walletId])
  @@index([createdAt])
}

// ─────────────────────────────────────────
// VEHICLES
// ─────────────────────────────────────────

model Vehicle {
  id                  String          @id @default(uuid())
  ownerId             String
  registrationNumber  String          @unique
  vehicleType         VehicleType
  vehicleCategory     VehicleCategory
  ownerName           String
  fuelType            FuelType?
  brtaCertNumber      String?
  frontPhotoUrl       String?
  backPhotoUrl        String?
  status              VehicleStatus   @default(PENDING)
  rejectionReason     String?
  verifiedAt          DateTime?
  verifiedById        String?         // admin user id
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  owner               User            @relation(fields: [ownerId], references: [id])
  transactions        Transaction[]
  qrTokens            QrToken[]

  // BRTA verification result (null = not attempted)
  brtaVerified        Boolean?
  brtaVerifiedAt      DateTime?
  brtaData            Json?           // raw BRTA API response stored here

  @@index([ownerId])
  @@index([status])
  @@index([registrationNumber])
}

// ─────────────────────────────────────────
// BRIDGES
// ─────────────────────────────────────────

model Bridge {
  id              String         @id @default(uuid())
  name            String         // English name
  nameBn          String         // Bengali name
  location        String
  district        String
  latitude        Float
  longitude       Float
  category        BridgeCategory
  status          BridgeStatus   @default(ACTIVE)
  imageUrl        String?
  authorityName   String         // e.g. "Bangladesh Bridge Authority"
  hasFastpass     Boolean        @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  tollRate        TollRate?
  transactions    Transaction[]

  @@index([status])
  @@index([category])
}

// ─────────────────────────────────────────
// TOLL RATES
// ─────────────────────────────────────────

model TollRate {
  id              String   @id @default(uuid())
  bridgeId        String   @unique
  // Rates stored in PAISA per category
  rateA           Int      // Motorbike
  rateB           Int      // Car
  rateC           Int      // Microbus
  rateD           Int      // Bus
  rateE           Int      // Small Truck
  rateF           Int      // Heavy Truck
  effectiveFrom   DateTime @default(now())
  updatedById     String   // admin user id
  updatedAt       DateTime @updatedAt

  bridge          Bridge   @relation(fields: [bridgeId], references: [id])

  @@index([bridgeId])
}

// ─────────────────────────────────────────
// TRANSACTIONS
// ─────────────────────────────────────────

model Transaction {
  id                  String            @id @default(uuid())
  userId              String
  vehicleId           String
  vehiclePlate        String            // denormalized for history display
  bridgeId            String
  bridgeName          String            // denormalized
  amount              Int               // in paisa
  paymentMethod       PaymentMethod
  type                TransactionType
  status              TransactionStatus @default(PENDING)
  sslTransactionId    String?
  sslSessionKey       String?
  refundReason        String?
  refundedAt          DateTime?
  receiptUrl          String?
  metadata            Json?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  user                User              @relation(fields: [userId], references: [id])
  vehicle             Vehicle           @relation(fields: [vehicleId], references: [id])
  bridge              Bridge            @relation(fields: [bridgeId], references: [id])

  @@index([userId])
  @@index([vehicleId])
  @@index([bridgeId])
  @@index([status])
  @@index([createdAt])
  @@index([userId, createdAt])
  @@index([bridgeId, createdAt])
}

// ─────────────────────────────────────────
// QR TOKENS (FastPass)
// ─────────────────────────────────────────

model QrToken {
  id              String   @id @default(uuid())
  userId          String
  vehicleId       String
  vehiclePlate    String
  tokenData       String   // encrypted payload
  expiresAt       DateTime // now + 24 hours
  used            Boolean  @default(false)
  usedAt          DateTime?
  usedAtBridgeId  String?
  createdAt       DateTime @default(now())

  user            User     @relation(fields: [userId], references: [id])
  vehicle         Vehicle  @relation(fields: [vehicleId], references: [id])

  @@index([userId])
  @@index([expiresAt])
  @@index([used])
}

// ─────────────────────────────────────────
// ANNOUNCEMENTS
// ─────────────────────────────────────────

model Announcement {
  id              String           @id @default(uuid())
  title           String
  titleBn         String
  body            String
  bodyBn          String
  type            AnnouncementType @default(INFO)
  targetBridgeIds String[]         // empty = all users
  isActive        Boolean          @default(true)
  expiresAt       DateTime?
  createdById     String           // admin user id
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([isActive])
  @@index([createdAt])
}

// ─────────────────────────────────────────
// PUSH SUBSCRIPTIONS (Web Push VAPID)
// ─────────────────────────────────────────

model PushSubscription {
  id          String   @id @default(uuid())
  userId      String
  endpoint    String   @unique
  p256dh      String
  auth        String
  userAgent   String?
  platform    String?  // 'web' | 'android' | 'ios'
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

---

## Seed Data (`api/prisma/seed.ts`)

### Admin User
```
email:    admin@tollbd.com.bd
password: Admin@1234
role:     ADMIN
name:     TollBD Admin
```

### 10 Bridges (seeded)

| Name | Bengali Name | District | Category | Latitude | Longitude |
|------|-------------|---------|----------|----------|-----------|
| Padma Bridge | পদ্মা সেতু | Munshiganj | EXPRESSWAY | 23.4463 | 90.2622 |
| Bangabandhu Bridge | বঙ্গবন্ধু সেতু | Sirajganj | NATIONAL | 24.0667 | 89.7167 |
| Meghna Bridge | মেঘনা সেতু | Munshiganj | NATIONAL | 23.5897 | 90.6036 |
| Kanchpur Bridge | কাঁচপুর সেতু | Narayanganj | NATIONAL | 23.7186 | 90.5875 |
| Lalon Shah Bridge | লালন শাহ সেতু | Kushtia | NATIONAL | 23.9093 | 89.1152 |
| Bhairab Bridge | ভৈরব সেতু | Kishoreganj | NATIONAL | 24.0547 | 90.9728 |
| Muktarpur Bridge | মুক্তারপুর সেতু | Munshiganj | NATIONAL | 23.5133 | 90.5488 |
| Gomti Bridge | গোমতী সেতু | Comilla | LOCAL | 23.4607 | 91.1991 |
| Sultan Mahmud Bridge | সুলতান মাহমুদ সেতু | Khulna | LOCAL | 22.8456 | 89.5403 |
| Second Meghna Bridge | দ্বিতীয় মেঘনা সেতু | Munshiganj | NATIONAL | 23.5750 | 90.6100 |

### Default Toll Rates (paisa)

| Bridge | A | B | C | D | E | F |
|--------|---|---|---|---|---|---|
| Padma Bridge | 20000 | 150000 | 240000 | 380000 | 320000 | 560000 |
| Bangabandhu | 5000 | 40000 | 60000 | 100000 | 80000 | 150000 |
| All others | 10000 | 75000 | 120000 | 200000 | 160000 | 280000 |

> Paisa → Taka: divide by 100. Example: 20000 paisa = ৳ 200.

---

## Key Queries Reference

### Get user wallet balance
```sql
SELECT balance FROM wallets WHERE "userId" = $1;
```

### Check if toll payment possible (wallet)
```sql
SELECT w.balance >= tr."rate{category}" AS can_pay
FROM wallets w, toll_rates tr
WHERE w."userId" = $userId AND tr."bridgeId" = $bridgeId;
```

### Get user transactions with pagination
```sql
SELECT t.*, b.name AS "bridgeName", v."registrationNumber" AS plate
FROM transactions t
JOIN bridges b ON t."bridgeId" = b.id
JOIN vehicles v ON t."vehicleId" = v.id
WHERE t."userId" = $userId
ORDER BY t."createdAt" DESC
LIMIT 20 OFFSET $offset;
```

### Admin daily revenue
```sql
SELECT COALESCE(SUM(amount), 0) AS total
FROM transactions
WHERE status = 'SUCCESS'
  AND type = 'TOLL_PAYMENT'
  AND DATE("createdAt") = CURRENT_DATE;
```
