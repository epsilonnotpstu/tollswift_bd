// ─────────────────────────────────────────────────────────────
// TollBD Project Report — Typst Source
// ─────────────────────────────────────────────────────────────

#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 2.5cm),
  numbering: "1",
  number-align: center,
)

#set text(font: "Linux Libertine", size: 12pt, lang: "en")
#set heading(numbering: "1.")
#set par(justify: true, leading: 0.75em)

#show heading.where(level: 1): it => {
  v(1.2em)
  text(size: 16pt, weight: "bold", it)
  v(0.5em)
}

#show heading.where(level: 2): it => {
  v(0.8em)
  text(size: 13pt, weight: "bold", it)
  v(0.3em)
}

// ─── TABLE OF CONTENTS ────────────────────────────────────────

#outline(
  title: text(size: 16pt, weight: "bold")[Contents],
  indent: 2em,
  depth: 2,
)

#pagebreak()

// ─── 1. INTRODUCTION ─────────────────────────────────────────

= Introduction

Bangladesh's rapidly expanding road and bridge infrastructure has created an
urgent demand for a streamlined, cashless toll collection system. The existing
manual toll collection process at bridges and highways suffers from long vehicle
queues, revenue leakage due to human error, and a lack of transparency for both
commuters and authorities. These inefficiencies highlight the need for a modern,
digital platform that can automate toll collection while providing a seamless
experience for vehicle owners.

To address this problem, this report presents the development of *TollBD* — a
full-stack mobile and web application designed to enable digital, cashless toll
payment for bridge crossings across Bangladesh. The platform allows vehicle
owners to register their vehicles, top up a digital wallet, and pay tolls
automatically by scanning a QR code at bridge toll booths. Administrators can
manage bridges, toll rates, vehicle verifications, and transactions through a
dedicated web-based admin panel.

TollBD is built using a modern technology stack: a React-based Progressive Web
App (PWA) packaged as a native Android application via Capacitor, a Node.js
REST API backend with Prisma ORM, and PostgreSQL as the relational database.
The system supports multiple payment methods including digital wallet, SSLCommerz
gateway, bKash, Nagad, and card payments.

#pagebreak()

// ─── 2. OBJECTIVES ───────────────────────────────────────────

= Objectives

The main objectives of this application are:

+ To implement a secure user authentication system with OTP-based email
  verification, Google OAuth login, and JWT-based session management for both
  users and administrators.

+ To develop a vehicle registration module that allows users to submit vehicle
  details and photos for admin verification, with support for BRTA certificate
  validation.

+ To build a digital wallet system that enables users to deposit funds via
  multiple payment gateways (SSLCommerz, bKash, Nagad, Card) and use the
  wallet balance for toll payments.

+ To implement a QR-based FastPass toll payment system where users generate a
  secure, time-limited QR code for their vehicle, which bridge operators scan to
  process cashless toll collection instantly.

+ To provide a comprehensive admin panel for managing bridges, toll rates per
  vehicle category, vehicle verifications, user accounts, transactions, refunds,
  and system announcements.

+ To integrate push notification support (Web Push / FCM) for notifying users
  about payment confirmations, vehicle verification status, and system
  announcements.

#pagebreak()

// ─── 3. RELATED WORKS ────────────────────────────────────────

= Related Works

The following table presents a comparison between TollBD and several existing
digital toll collection and payment platforms:

#set table(stroke: 0.5pt, inset: 7pt)

#table(
  columns: (1.3fr, 1.4fr, 1.8fr, 2fr),
  align: (left, left, left, left),
  table.header(
    text(weight: "bold")[Application],
    text(weight: "bold")[Primary Function],
    text(weight: "bold")[Key Features],
    text(weight: "bold")[Limitations / Innovations],
  ),

  [*FASTag \ (India)*],
  [RFID-based automated toll collection on Indian highways.],
  [RFID tag linked to bank account; automatic deduction at toll plazas; SMS alerts; recharge via net banking or UPI.],
  [Requires physical RFID tag installation on every vehicle; not applicable to Bangladesh's bridge infrastructure; lacks QR-based fallback.],

  [*E-Toll \ (Bangladesh)*],
  [Electronic toll collection at select highways managed by Bangladesh Road Transport Authority.],
  [RFID-based card system; reduces manual cash handling at toll booths.],
  [Limited to specific highway corridors; no mobile app for user self-service; no digital wallet integration; minimal user-facing features.],

  [*iToll*],
  [Mobile app for highway toll payment in select Asian markets.],
  [NFC and RFID support; balance tracking; trip history.],
  [Proprietary hardware dependency; not open to third-party bridge authorities; lacks vehicle photo verification workflow.],

  [*TollBD \ (This Project)*],
  [Full-stack cashless toll payment platform for Bangladesh bridges via mobile app and QR code.],
  [OTP/Google auth, vehicle registration with BRTA verification, digital wallet, multi-gateway deposits, QR FastPass, admin panel, push notifications, bilingual UI.],
  [Introduces a QR-based FastPass system requiring no hardware installation on vehicles. Designed specifically for Bangladesh's bridge toll infrastructure with bilingual (English + Bengali) support and a real-time admin dashboard.],
)

#v(0.5em)
*Table 1:* Comparison of TollBD with existing toll collection platforms.

#pagebreak()

// ─── 4. PHASES ───────────────────────────────────────────────

= Phases

#table(
  columns: (2fr, 1.2fr, 3.8fr),
  align: (left, left, left),
  table.header(
    text(weight: "bold")[Phase],
    text(weight: "bold")[Duration],
    text(weight: "bold")[Key Activities],
  ),

  [*1. Requirements Analysis & Planning*],
  [Week 1–2],
  [
    1. Identified problems in existing cash-based toll collection \
    2. Gathered functional requirements for vehicle owners and bridge operators \
    3. Defined system objectives, user roles, and feature scope \
    4. Prepared project proposal, use cases, and system architecture diagram
  ],

  [*2. UI/UX Design*],
  [Week 3–4],
  [
    1. Designed mobile and web UI wireframes using Figma \
    2. Created user flows for registration, vehicle submission, toll payment, and wallet top-up \
    3. Designed admin panel layout and navigation structure \
    4. Finalized bilingual (English / Bengali) screen layouts
  ],

  [*3. Database & API Development*],
  [Week 5–7],
  [
    1. Designed PostgreSQL schema using Prisma ORM \
    2. Implemented JWT authentication, OTP verification, and Google OAuth \
    3. Built REST API endpoints for users, vehicles, bridges, toll rates, and wallet \
    4. Integrated SSLCommerz, bKash, and Nagad payment gateways
  ],

  [*4. Frontend & Mobile Development*],
  [Week 8–11],
  [
    1. Built React PWA with Vite and TailwindCSS \
    2. Implemented QR code generation and camera-based scanning \
    3. Developed admin panel with dashboard, data tables, and charts \
    4. Packaged app as Android APK using Capacitor \
    5. Integrated Web Push and Firebase Cloud Messaging for notifications
  ],

  [*5. Testing & Improvement*],
  [Week 12–13],
  [
    1. Conducted end-to-end testing of payment flow, QR scanning, and admin actions \
    2. Fixed bugs in mock payment redirect and IP-dependent URL issues \
    3. Collected feedback from test users and refined UI \
    4. Verified vehicle verification, refund, and announcement features
  ],

  [*6. Finalization & Documentation*],
  [Week 14],
  [
    1. Prepared the final production build and deployment configuration \
    2. Wrote API documentation and database schema documentation \
    3. Completed the final project report
  ],
)

#v(0.5em)
*Table 2:* Development phases with duration and key activities.

#pagebreak()

// ─── 5. GANTT CHART ──────────────────────────────────────────

= Gantt Chart

#let weeks = range(1, 15)
#let phases = (
  ("Requirements & Planning", (1, 2)),
  ("UI/UX Design",            (3, 4)),
  ("Database & API Dev",      (5, 7)),
  ("Frontend & Mobile Dev",   (8, 11)),
  ("Testing & Improvement",   (12, 13)),
  ("Finalization & Docs",     (14, 14)),
)

#let bar-color = rgb("#2563EB")
#let header-bg = rgb("#F1F5F9")

#block(
  width: 100%,
  stroke: 0.5pt,
  radius: 4pt,
  clip: true,
)[
  #table(
    columns: (2.8fr, ..weeks.map(_ => 1fr)),
    align: (left, ..weeks.map(_ => center)),
    inset: (x: 5pt, y: 6pt),
    stroke: 0.4pt,
    fill: (col, row) => if row == 0 { header-bg } else { white },

    // Header row
    table.header(
      text(size: 9pt, weight: "bold")[Task Name],
      ..weeks.map(w => text(size: 9pt, weight: "bold")[W#w]),
    ),

    // Phase rows
    ..phases.map(((name, span)) => {
      let (start, end) = span
      (
        text(size: 9pt)[#name],
        ..weeks.map(w =>
          if w >= start and w <= end {
            rect(fill: bar-color, width: 100%, height: 14pt, radius: 2pt)
          } else {
            []
          }
        ),
      )
    }).flatten(),
  )
]

#v(0.5em)
*Figure 1:* Gantt Chart of TollBD development schedule.

#pagebreak()

// ─── 6. TECHNOLOGY STACK ─────────────────────────────────────

= Technology Stack

The TollBD application was developed using a modern, full-stack technology
ecosystem to ensure performance, scalability, and cross-platform compatibility.

#table(
  columns: (1.5fr, 1.5fr, 3fr),
  align: (left, left, left),
  table.header(
    text(weight: "bold")[Layer],
    text(weight: "bold")[Technology],
    text(weight: "bold")[Purpose],
  ),

  [*Mobile / Web Frontend*], [React 18 + Vite],        [Single-page application and PWA shell],
  [],                         [TailwindCSS],             [Utility-first responsive styling],
  [],                         [React Router v6],         [Client-side navigation and routing],
  [],                         [TanStack Query],          [Server state management and caching],
  [],                         [Capacitor 6],             [Native Android APK packaging],
  [],                         [Lucide Icons],            [Consistent icon library],

  [*Backend API*],            [Node.js + Express],       [REST API server and middleware],
  [],                         [TypeScript],              [Type-safe server-side development],
  [],                         [Prisma ORM],              [Type-safe database access layer],
  [],                         [Zod],                     [Runtime request validation],
  [],                         [JWT + bcrypt],            [Authentication and password hashing],

  [*Database*],               [PostgreSQL],              [Primary relational database],

  [*Payments*],               [SSLCommerz],              [Online payment gateway (card/internet banking)],
  [],                         [bKash / Nagad],           [Mobile financial service payments],

  [*Notifications*],          [Web Push (VAPID)],        [Browser and Android push notifications],

  [*Design & DevOps*],        [Figma],                   [UI/UX wireframing and prototyping],
  [],                         [GitHub],                   [Version control and collaboration],
  [],                         [Railway],                 [Cloud deployment for backend API],
)

#v(0.5em)
*Table 3:* Technology stack used in TollBD.

#pagebreak()

// ─── 7. ER DIAGRAM ───────────────────────────────────────────

= ER Diagram

The entity-relationship diagram below illustrates the core database schema of
TollBD. The system consists of eleven main entities: *User*, *Wallet*,
*WalletTransaction*, *Vehicle*, *Bridge*, *TollRate*, *Transaction*, *QrToken*,
*Announcement*, *Otp*, and *PushSubscription*.

The *User* entity is the central entity connected to most others. Each user owns
exactly one *Wallet* which maintains a balance in paisa (1 Taka = 100 paisa).
*Vehicles* are owned by users and must pass admin verification before use. Each
*Bridge* has a corresponding *TollRate* entry defining per-category rates. The
*Transaction* entity records every toll payment and wallet deposit, linking users,
vehicles, and bridges. *QrToken* stores one-time encrypted tokens for FastPass QR
scanning. *Announcement*, *Otp*, and *PushSubscription* support system
communication features.

#figure(
  image("er_diagram.png", width: 100%),
  caption: [ER Diagram of TollBD database schema.],
)

#pagebreak()

// ─── 8. UI SCREENSHOTS ───────────────────────────────────────

= UI of TollBD Application

Some of the main UI screens of the application are shown below:

#v(1em)

// ── Row 1: Auth screens ───────────────────────────────────────
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 10pt,
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Splash / Onboarding Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Login Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Register Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[OTP Verification Screen]
    ]
  ],
)

#v(0.4em)
#align(center)[#text(size: 9pt)[_Authentication Screens_]]

#v(1em)

// ── Row 2: Main user screens ─────────────────────────────────
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 10pt,
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Home Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Wallet Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Deposit Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[QR FastPass Screen]
    ]
  ],
)

#v(0.4em)
#align(center)[#text(size: 9pt)[_User Main Screens_]]

#v(1em)

// ── Row 3: Vehicle & Toll screens ────────────────────────────
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 10pt,
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Add Vehicle Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Select Bridge Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Payment Confirm Screen]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Transaction History]
    ]
  ],
)

#v(0.4em)
#align(center)[#text(size: 9pt)[_Vehicle & Toll Payment Screens_]]

#v(1em)

// ── Row 4: Admin panel screens ───────────────────────────────
#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 10pt,
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Admin Dashboard]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Admin Vehicles Page]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Admin Transactions]
    ]
  ],
  rect(height: 200pt, stroke: 0.5pt, radius: 4pt)[
    #align(center + horizon)[
      #text(size: 9pt, fill: gray)[Admin Announcements]
    ]
  ],
)

#v(0.4em)
#align(center)[#text(size: 9pt)[_Admin Panel Screens_]]

#v(0.5em)
*Figure 2:* UI screens of the TollBD application.

#pagebreak()

// ─── 9. FUNCTIONALITIES ──────────────────────────────────────

= Functionalities of the TollBD Application

The TollBD application incorporates a comprehensive set of functionalities
designed to facilitate efficient and cashless toll payment for bridge crossings
in Bangladesh.

== User Authentication & Profile Management

The system provides secure multi-method authentication including email and
password login with OTP-based email verification, Google OAuth single sign-on,
and JWT-based session management with refresh token support. Users can manage
their profile information, upload a profile photo, and configure emergency
contacts. A password recovery mechanism via OTP is also implemented.

== Vehicle Registration & Verification

Users can register multiple vehicles by submitting the vehicle registration
number, type, fuel type, owner details, and BRTA certificate photos. Registered
vehicles are submitted for admin review, where administrators can verify or
reject them with a reason. The system also integrates with the BRTA database
for automated certificate verification. Verified vehicles are eligible for QR
FastPass generation.

== Digital Wallet & Multi-Gateway Payments

Each user has a digital wallet that stores balance in paisa for precision. Users
can deposit funds via SSLCommerz (card and internet banking), bKash, Nagad, or
debit/credit card. Wallet transactions are recorded with descriptions and
references. The wallet balance can be used for seamless toll payments without
redirecting to an external gateway.

== QR FastPass Toll Payment

Verified vehicle owners can generate a secure, time-limited (24-hour) QR code
token. Bridge operators scan this QR code using the admin scanner to process toll
collection instantly. The system automatically calculates the toll amount based
on the vehicle category and the bridge's configured toll rates, and deducts the
amount from the user's wallet or initiates a gateway payment.

== Transaction Management & Receipts

All toll payments, wallet deposits, and refunds are recorded as transactions with
complete audit trails. Users can view their transaction history with filtering by
status. Administrators can view all transactions, process refunds with a reason,
approve pending transactions, and export transaction data as CSV. PDF receipts
are generated for completed toll payments.

== Admin Panel

The web-based admin panel provides a real-time dashboard with key performance
indicators including today's revenue, transaction count, active users, and pending
vehicle verifications. Administrators can manage bridges (add, update, toggle
status), configure toll rates per vehicle category, manage user accounts (view,
block/unblock), and post bilingual announcements (edit, delete, filter by type).
A scanner interface allows admins to process QR-based toll collection directly.

== Push Notifications & Announcements

The system supports Web Push notifications via VAPID protocol, delivering
real-time alerts to users about payment confirmations and vehicle verification
status updates. Administrators can broadcast push notifications to all registered
users. A bilingual announcement system (English and Bengali) allows admins to
post informational, warning, and maintenance alerts.

#pagebreak()

// ─── 10. CONCLUSION ──────────────────────────────────────────

= Conclusion

The TollBD application presents a practical and scalable solution to the
persistent challenge of cash-based toll collection at bridges across Bangladesh.
By combining a mobile-first Progressive Web App with a QR-based FastPass
system, digital wallet integration, and a comprehensive admin panel, the platform
significantly reduces vehicle waiting time at toll booths while improving revenue
transparency and operational efficiency for bridge authorities.

The use of modern technologies—React, Node.js, Prisma, and PostgreSQL—ensures
the system is maintainable, extensible, and production-ready. The inclusion of
multiple payment gateways (SSLCommerz, bKash, Nagad) accommodates the diverse
financial preferences of Bangladeshi users, while the bilingual interface (English
and Bengali) makes the application accessible to a broad user base.

Future work may include RFID-based automatic toll detection as an alternative to
QR scanning, integration with real BRTA APIs for live vehicle verification,
real-time vehicle tracking for dynamic toll pricing, and expansion to cover
highway checkpoints beyond bridges.

#pagebreak()

// ─── REFERENCES ──────────────────────────────────────────────

= References

#set par(hanging-indent: 2em)

[1] Bangladesh Bridge Authority, "Bangabandhu Sheikh Mujibur Rahman Tunnel and Bridge Toll Policy," Available: https://www.bba.gov.bd (accessed 25 June 2026).

[2] National Payments Corporation of India, "FASTag — Electronic Toll Collection," Available: https://www.npci.org.in/what-we-do/netc-fastag (accessed 25 June 2026).

[3] SSLCommerz, "SSLCommerz Payment Gateway — Developer Documentation," Available: https://developer.sslcommerz.com (accessed 25 June 2026).

[4] Capacitor by Ionic, "Capacitor: Cross-platform Native Runtime for Web Apps," Available: https://capacitorjs.com (accessed 25 June 2026).

[5] Prisma, "Prisma ORM — Next-generation Node.js and TypeScript ORM," Available: https://www.prisma.io (accessed 25 June 2026).

[6] React, "React — A JavaScript library for building user interfaces," Available: https://react.dev (accessed 25 June 2026).
