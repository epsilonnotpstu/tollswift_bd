# TollBD — Phase 1 Master Prompt
## Foundation + Authentication + Digital Wallet
### (Give this entire file to Codex as your prompt)

---

## PROJECT OVERVIEW

You are building **TollBD** — Bangladesh's first smart digital toll payment mobile application. This is a **Flutter** mobile app (Android + iOS) with **Firebase** as the backend. The app allows Bangladeshi vehicle owners to pay highway toll fees digitally using a pre-loaded digital wallet, instead of paying cash at toll booths.

This is **Phase 1** of a 3-phase project. Phase 1 covers:
1. Complete project setup and architecture
2. Authentication system (Phone OTP + Biometric)
3. Digital Wallet (balance, deposit via SSLCommerz, transaction history)
4. User profile and onboarding

Do NOT build toll payment, vehicle registration, or admin features in this phase. Those are Phase 2 and Phase 3.

---

## TECH STACK (STRICT — DO NOT CHANGE)

### Frontend
- **Flutter 3.19+** (Dart)
- **State Management**: flutter_riverpod ^2.5.0
- **Navigation**: go_router ^13.0.0
- **Local Storage**: hive_flutter ^1.1.0 (offline cache)
- **HTTP**: dio ^5.4.0

### Backend (Firebase)
- **Firebase Auth** — Phone OTP authentication
- **Cloud Firestore** — Main database
- **Firebase Storage** — Profile pictures, documents
- **Firebase Cloud Functions** — Business logic (Node.js 20)
- **Firebase Cloud Messaging (FCM)** — Push notifications

### Payment
- **SSLCommerz** — Primary payment gateway for wallet top-up
  - Package: Use webview_flutter to load SSLCommerz payment page
  - After payment, Firebase Cloud Function validates IPN callback

### Key Flutter Packages (add to pubspec.yaml)
```yaml
dependencies:
  flutter_riverpod: ^2.5.0
  go_router: ^13.0.0
  firebase_core: ^2.27.0
  firebase_auth: ^4.17.0
  cloud_firestore: ^4.15.0
  firebase_storage: ^11.6.0
  firebase_messaging: ^14.7.0
  hive_flutter: ^1.1.0
  dio: ^5.4.0
  webview_flutter: ^4.7.0
  local_auth: ^2.1.8          # fingerprint/face ID
  pinput: ^3.0.0               # OTP input field
  cached_network_image: ^3.3.1
  image_picker: ^1.0.7
  fl_chart: ^0.66.2            # wallet spending chart
  intl: ^0.19.0                # BDT currency formatting
  lottie: ^3.0.0               # animations
  shimmer: ^3.0.0              # loading skeletons
  flutter_local_notifications: ^17.0.0
  connectivity_plus: ^6.0.2
  shared_preferences: ^2.2.3
  path_provider: ^2.1.3
  uuid: ^4.3.3
  crypto: ^3.0.3

dev_dependencies:
  build_runner: ^2.4.8
  hive_generator: ^2.0.1
  riverpod_generator: ^2.3.11
  flutter_lints: ^3.0.1
```

---

## PROJECT FOLDER STRUCTURE

Create this EXACT folder structure:

```
tollbd/
├── android/
├── ios/
├── lib/
│   ├── main.dart
│   ├── firebase_options.dart
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   ├── app_text_styles.dart
│   │   │   ├── app_spacing.dart
│   │   │   └── app_strings.dart         # bilingual strings BD/EN
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   └── app_theme_dark.dart
│   │   ├── router/
│   │   │   └── app_router.dart
│   │   ├── utils/
│   │   │   ├── currency_formatter.dart  # BDT formatting ৳1,250.00
│   │   │   ├── date_formatter.dart
│   │   │   ├── validators.dart
│   │   │   └── extensions.dart
│   │   └── widgets/                     # shared widgets
│   │       ├── toll_button.dart
│   │       ├── toll_card.dart
│   │       ├── loading_overlay.dart
│   │       ├── error_view.dart
│   │       ├── skeleton_loader.dart
│   │       └── animated_balance_card.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── auth_repository.dart
│   │   │   │   └── auth_local_datasource.dart
│   │   │   ├── domain/
│   │   │   │   └── auth_models.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── auth_provider.dart
│   │   │       └── screens/
│   │   │           ├── splash_screen.dart
│   │   │           ├── language_select_screen.dart
│   │   │           ├── phone_input_screen.dart
│   │   │           ├── otp_verify_screen.dart
│   │   │           ├── biometric_setup_screen.dart
│   │   │           └── profile_setup_screen.dart
│   │   ├── home/
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── home_provider.dart
│   │   │       └── screens/
│   │   │           ├── home_screen.dart
│   │   │           └── notification_screen.dart
│   │   ├── wallet/
│   │   │   ├── data/
│   │   │   │   ├── wallet_repository.dart
│   │   │   │   └── sslcommerz_service.dart
│   │   │   ├── domain/
│   │   │   │   ├── wallet_model.dart
│   │   │   │   └── transaction_model.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── wallet_provider.dart
│   │   │       └── screens/
│   │   │           ├── wallet_screen.dart
│   │   │           ├── add_money_screen.dart
│   │   │           ├── sslcommerz_webview_screen.dart
│   │   │           ├── transaction_history_screen.dart
│   │   │           └── receipt_screen.dart
│   │   └── profile/
│   │       └── presentation/
│   │           ├── providers/
│   │           │   └── profile_provider.dart
│   │           └── screens/
│   │               ├── profile_screen.dart
│   │               └── settings_screen.dart
│   └── services/
│       ├── firebase_service.dart
│       ├── notification_service.dart
│       ├── connectivity_service.dart
│       └── analytics_service.dart
├── functions/                            # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── auth/
│   │   │   └── onUserCreated.ts
│   │   ├── wallet/
│   │   │   ├── depositMoney.ts
│   │   │   ├── sslcommerzIPN.ts         # payment callback handler
│   │   │   └── getTransactions.ts
│   │   └── notifications/
│   │       └── sendNotification.ts
│   ├── package.json
│   └── tsconfig.json
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   ├── logo_white.png
│   │   ├── highway_silhouette.svg
│   │   └── bd_map_outline.svg
│   ├── animations/
│   │   ├── success_check.json           # Lottie
│   │   ├── loading_car.json             # Lottie
│   │   └── wallet_money.json            # Lottie
│   └── fonts/
│       ├── HindSiliguri-Regular.ttf
│       ├── HindSiliguri-Bold.ttf
│       └── RobotoMono-Regular.ttf
├── pubspec.yaml
├── firebase.json
├── firestore.rules
└── firestore.indexes.json
```

---

## DESIGN SYSTEM (IMPLEMENT EXACTLY)

### Colors (lib/core/constants/app_colors.dart)
```dart
class AppColors {
  // Primary Brand
  static const Color primary = Color(0xFF006A4E);        // Bangladesh green
  static const Color primaryDark = Color(0xFF004D38);
  static const Color primaryLight = Color(0xFF00875F);
  static const Color accent = Color(0xFFF42A41);          // Bangladesh red (CTA only)
  static const Color accentDark = Color(0xFFD01F34);

  // Surfaces
  static const Color background = Color(0xFFF7F8FA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF0F2F5);
  static const Color cardBorder = Color(0xFFE8ECF0);

  // Text
  static const Color textPrimary = Color(0xFF1A1A2E);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textHint = Color(0xFF9CA3AF);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Semantic
  static const Color success = Color(0xFF10B981);
  static const Color successBg = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningBg = Color(0xFFFFFBEB);
  static const Color error = Color(0xFFEF4444);
  static const Color errorBg = Color(0xFFFEF2F2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoBg = Color(0xFFEFF6FF);

  // Payment method brand colors
  static const Color bkashColor = Color(0xFFE2136E);
  static const Color nagadColor = Color(0xFFFF6B35);
  static const Color rocketColor = Color(0xFF8B2FC9);

  // Wallet card gradient
  static const List<Color> walletGradient = [
    Color(0xFF006A4E),
    Color(0xFF00875F),
    Color(0xFF00A572),
  ];

  // Chart colors
  static const Color chartPrimary = Color(0xFF006A4E);
  static const Color chartSecondary = Color(0xFFE8F5F0);
}
```

### Typography (lib/core/constants/app_text_styles.dart)
```dart
// Use Hind Siliguri for all text (supports Bengali + Latin)
// Use Roboto Mono for all monetary amounts

class AppTextStyles {
  static const String _primaryFont = 'HindSiliguri';
  static const String _monoFont = 'RobotoMono';

  // Display — big balance numbers
  static const TextStyle balanceAmount = TextStyle(
    fontFamily: _monoFont,
    fontSize: 36,
    fontWeight: FontWeight.w600,
    color: AppColors.textOnPrimary,
    letterSpacing: -0.5,
  );

  // Headings
  static const TextStyle h1 = TextStyle(fontFamily: _primaryFont, fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.2);
  static const TextStyle h2 = TextStyle(fontFamily: _primaryFont, fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.3);
  static const TextStyle h3 = TextStyle(fontFamily: _primaryFont, fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary, height: 1.4);
  static const TextStyle h4 = TextStyle(fontFamily: _primaryFont, fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary);

  // Body
  static const TextStyle bodyLarge = TextStyle(fontFamily: _primaryFont, fontSize: 16, fontWeight: FontWeight.w400, color: AppColors.textPrimary, height: 1.6);
  static const TextStyle bodyMedium = TextStyle(fontFamily: _primaryFont, fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary, height: 1.5);
  static const TextStyle bodySmall = TextStyle(fontFamily: _primaryFont, fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary, height: 1.5);

  // Labels
  static const TextStyle labelLarge = TextStyle(fontFamily: _primaryFont, fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary);
  static const TextStyle labelSmall = TextStyle(fontFamily: _primaryFont, fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary, letterSpacing: 0.5);

  // Amount (monospace)
  static const TextStyle amountLarge = TextStyle(fontFamily: _monoFont, fontSize: 24, fontWeight: FontWeight.w600, color: AppColors.textPrimary);
  static const TextStyle amountMedium = TextStyle(fontFamily: _monoFont, fontSize: 18, fontWeight: FontWeight.w500, color: AppColors.textPrimary);
  static const TextStyle amountSmall = TextStyle(fontFamily: _monoFont, fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textSecondary);
}
```

### Spacing & Radius
```dart
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;
  static const double xxxl = 48.0;
}

class AppRadius {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double pill = 100.0;
}
```

---

## FIREBASE FIRESTORE DATA MODELS

### Collection: `users`
Document ID = Firebase Auth UID
```
users/{uid}/
  ├── uid: string
  ├── phone: string                    // "+8801XXXXXXXXX"
  ├── name: string
  ├── name_bn: string                  // Bengali name
  ├── email: string (optional)
  ├── avatar_url: string
  ├── preferred_language: "bn" | "en"
  ├── nid_number: string (optional)
  ├── nid_verified: bool
  ├── wallet_balance: number           // stored in paisa (1 taka = 100 paisa)
  ├── biometric_enabled: bool
  ├── fcm_token: string
  ├── created_at: timestamp
  ├── updated_at: timestamp
  └── account_status: "active" | "suspended" | "pending"
```

### Collection: `transactions`
Document ID = auto-generated
```
transactions/{txId}/
  ├── id: string
  ├── user_id: string                  // FK to users
  ├── type: "deposit" | "toll" | "refund" | "pass_purchase"
  ├── status: "pending" | "success" | "failed" | "refunded"
  ├── amount: number                   // in paisa
  ├── balance_before: number           // in paisa
  ├── balance_after: number            // in paisa
  ├── description: string              // "Wallet top-up via bKash"
  ├── description_bn: string
  ├── payment_method: "bkash" | "nagad" | "rocket" | "card" | "netbanking"
  ├── sslcommerz_tran_id: string       // SSLCommerz transaction ID
  ├── sslcommerz_val_id: string        // SSLCommerz validation ID
  ├── gateway_response: map            // raw SSLCommerz response
  ├── reference_id: string             // toll gate ID or pass ID if applicable
  ├── created_at: timestamp
  └── updated_at: timestamp
```

### Collection: `app_config`
Document ID = "global"
```
app_config/global/
  ├── min_deposit_amount: number       // 50 (taka)
  ├── max_deposit_amount: number       // 50000 (taka)
  ├── low_balance_threshold: number    // 200 (taka)
  ├── sslcommerz_store_id: string
  ├── maintenance_mode: bool
  └── app_version_required: string
```

---

## FIRESTORE SECURITY RULES

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Transactions: users can read their own, only Cloud Functions can write
    match /transactions/{txId} {
      allow read: if request.auth != null &&
        request.auth.uid == resource.data.user_id;
      allow write: if false; // Only Cloud Functions write transactions
    }

    // App config: anyone authenticated can read
    match /app_config/{doc} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## SCREEN-BY-SCREEN IMPLEMENTATION

---

### SCREEN 1: Splash Screen
**File**: `lib/features/auth/presentation/screens/splash_screen.dart`

**What it shows:**
- Full screen with `AppColors.primary` (#006A4E) background
- TollBD logo centered (white version), 120x120px
- Below logo: App name "TollBD" in white, HindSiliguri Bold, 32px
- Below name: Tagline "স্মার্ট টোল, সহজ যাত্রা" in white 70% opacity, 16px
- Bottom: "Powered by Bangladesh Road Transport Authority" text, 12px, white 50%
- Loading indicator: thin linear progress bar at very bottom, green accent

**Logic:**
```
onInit:
  1. Wait 2 seconds (minimum splash time)
  2. Check Firebase Auth current user
  3. If user exists AND biometric enabled → go to BiometricUnlockScreen
  4. If user exists AND biometric NOT enabled → go to HomeScreen
  5. If no user → go to LanguageSelectScreen
```

---

### SCREEN 2: Language Select Screen
**File**: `lib/features/auth/presentation/screens/language_select_screen.dart`

**What it shows:**
- White background
- Top: Bangladesh flag emoji + "TollBD" wordmark, centered, top 20% of screen
- Middle: Two large selection cards, full width with 24px margin:
  - Card 1: "বাংলা" with Bengali script decoration, selected = green border + checkmark
  - Card 2: "English" with subtle EN text decoration
- Cards have 16px border radius, subtle shadow
- Bottom: "Continue" button — full width, red (#F42A41), pill shape, 56px height
- Selecting a language immediately saves to SharedPreferences key "preferred_language"

---

### SCREEN 3: Phone Input Screen
**File**: `lib/features/auth/presentation/screens/phone_input_screen.dart`

**What it shows:**
- White background with subtle green wave decoration at top (SVG)
- Back button (top left)
- Title: "আপনার নম্বর দিন" / "Enter your number" (based on language)
- Subtitle: "আমরা আপনাকে একটি OTP পাঠাবো" (14px, secondary color)
- Phone input field:
  - Left side: Bangladesh flag 🇧🇩 + "+880" (non-editable, gray background)
  - Right side: 10-digit number input (editable)
  - Full border, 56px height, 12px radius
  - Keyboard: number pad
- "Send OTP" button — full width, primary green (#006A4E), 56px, pill shape
- Button disabled and gray until 10 digits entered
- Terms text at bottom: "এগিয়ে যাওয়ার মাধ্যমে আপনি আমাদের Terms of Service মেনে নিচ্ছেন"
- Loading state: button shows CircularProgressIndicator while Firebase sends OTP

**Logic:**
```
onSendOTP:
  1. Validate: exactly 10 digits, starts with valid BD prefix (01X)
  2. Show loading on button
  3. Call FirebaseAuth.instance.verifyPhoneNumber(
       phoneNumber: "+880" + enteredNumber,
       codeSent: (verificationId, _) → navigate to OTPScreen with verificationId,
       verificationFailed: (e) → show error snackbar
     )
```

---

### SCREEN 4: OTP Verify Screen
**File**: `lib/features/auth/presentation/screens/otp_verify_screen.dart`

**What it shows:**
- Phone number displayed at top (partially masked: +880 01***XXXX)
- Title: "OTP যাচাই করুন" / "Verify OTP"
- Subtitle: "6-digit code sent to your number"
- **OTP Input**: Use `pinput` package
  - 6 boxes in a row
  - Box size: 52x60px each
  - Default style: border, white background
  - Focused style: green border (#006A4E), light green background
  - Filled style: green background, white text, bold
  - Border radius: 12px each box
  - Auto-focus on screen open
  - Auto-submit when 6 digits entered
- Resend timer: "Resend OTP in 0:45" counting down
- After timer hits 0: "Resend OTP" tappable link in green
- "Verify" button — green, full width, 56px
- Error state: boxes shake animation, red border, error text below

**Logic:**
```
onOTPComplete(6 digits):
  1. Show loading overlay
  2. Create PhoneAuthCredential with verificationId + OTP
  3. signInWithCredential
  4. If success:
     - Check Firestore if user document exists
     - If new user → go to ProfileSetupScreen
     - If existing user → check biometric setting → go to BiometricSetup or Home
  5. If wrong OTP → shake animation + "ভুল OTP" error message
```

---

### SCREEN 5: Profile Setup Screen
**File**: `lib/features/auth/presentation/screens/profile_setup_screen.dart`

**What it shows:**
- Progress indicator at top (Step 1 of 2) — two dots, first green
- Avatar picker: circle with camera icon overlay, tap to pick image
- Name field: "আপনার নাম লিখুন" placeholder, Bengali keyboard default
- Name (English) field: optional
- "পরবর্তী" (Next) button — green, full width

**On submit:**
```
1. Upload avatar to Firebase Storage: users/{uid}/avatar.jpg
2. Create Firestore user document with all fields
3. Set wallet_balance = 0
4. Navigate to BiometricSetupScreen
```

---

### SCREEN 6: Biometric Setup Screen
**File**: `lib/features/auth/presentation/screens/biometric_setup_screen.dart`

**What it shows:**
- Fingerprint icon (large, 80px, green)
- Title: "দ্রুত লগইনের জন্য Biometric চালু করুন"
- Subtitle: "আপনার আঙুলের ছাপ বা Face ID দিয়ে নিরাপদে লগইন করুন"
- "চালু করুন" (Enable) button — green, full width
- "এখন না" (Skip) text button — secondary color
- Device biometric illustration below

**Logic:**
```
onEnableTap:
  1. Check device biometric availability (local_auth package)
  2. Authenticate with biometric
  3. If success: save biometric_enabled = true in Firestore + SharedPreferences
  4. Navigate to HomeScreen
onSkip:
  Navigate to HomeScreen
```

---

### SCREEN 7: Home Screen
**File**: `lib/features/home/presentation/screens/home_screen.dart`

**Layout** (ScrollView, top to bottom):

**A. App Bar** (not the standard Flutter AppBar — custom):
- Left: "হ্যালো, {name} 👋" in 20px bold, + "সুপ্রভাত" (time-based greeting)
- Right: notification bell icon (badge count if unread), avatar circle

**B. Wallet Balance Card** (most important UI element):
```
Container with:
  - Gradient background: left to right, colors from AppColors.walletGradient
  - Border radius: 20px
  - Padding: 24px
  - Height: ~180px
  - Subtle highway/road SVG watermark in bottom right (opacity 0.1, white)

Inside card:
  Row 1: "আপনার ব্যালেন্স" label (white, 13px) + eye icon (tap to hide)
  Row 2: "৳ 1,250.00" — large balance, RobotoMono 36px bold, white
          (when hidden: shows "৳ ••••••")
  Row 3 (bottom of card): Two buttons side by side
    [+ টাকা যোগ করুন] — white background, green text, 14px bold, pill
    [লেনদেনের ইতিহাস] — transparent, white border, white text, 14px, pill
```
- Balance comes from Firestore realtime stream — updates instantly if changed
- Add slight pulse animation on balance when it updates

**C. Quick Action Row** (4 icons in a row):
```
Each item: icon (48px circle, light green background) + label below (12px)

[🛣️ টোল দিন]  [💳 টাকা যোগ]  [🚗 গাড়ি]  [📋 পাস কিনুন]
  Pay Toll     Add Money    Vehicles    Buy Pass
```
Navigate to respective screens on tap.

**D. Active Vehicle Chip** (if vehicle registered):
```
Horizontal scrollable row of vehicle chips:
Each chip: green dot (active) | car icon | "DHAKA METRO GA 11-1111" | ▼

If no vehicle: "গাড়ি যোগ করুন" card with + icon, dashed border
```

**E. Low Balance Warning** (conditional — show if balance < ৳200):
```
Orange/amber banner:
"⚠️ আপনার ব্যালেন্স কম (৳{amount})। দ্রুত টাকা যোগ করুন।"
[টাকা যোগ করুন →] link
```

**F. Recent Transactions** (last 3 only):
```
Section header: "সাম্প্রতিক লেনদেন" + "সব দেখুন →" link

Each transaction row:
  Left: colored icon circle (green for deposit, red for toll, blue for refund)
  Middle: transaction description (bold 14px) + date/time (12px secondary)
  Right: amount with +/- sign (green for +, red for -)

If no transactions: empty state illustration + "এখনো কোনো লেনদেন নেই"
```

**G. Bottom Navigation Bar** (persistent across app):
```
5 tabs:
  🏠 হোম     💳 টোল দিন    🚗 গাড়ি    📋 ইতিহাস    👤 প্রোফাইল
  Home       Pay Toll     Vehicles    History       Profile

Active tab: green icon + green label
Inactive: gray icon + gray label
Middle tab (Pay Toll): slightly elevated, red FAB-style, white toll icon
```

---

### SCREEN 8: Wallet Screen
**File**: `lib/features/wallet/presentation/screens/wallet_screen.dart`

**Layout:**

**A. Top Balance Section** (same gradient card as home, but bigger):
- Balance display with show/hide
- "৳ যোগ করুন" prominent red button

**B. Spending Chart**:
```
Using fl_chart BarChart:
- Last 7 days spending bars
- X-axis: day names (সোম, মঙ্গল, বুধ...)
- Y-axis: amount in taka
- Bar color: AppColors.primary
- Tooltip on tap: shows exact amount + date
- Title: "এই সপ্তাহে ব্যয়"
```

**C. Transaction List**:
```
Filter chips row (horizontally scrollable):
[সব] [টোল] [ডিপোজিট] [রিফান্ড]

Each transaction item:
  Left icon circle (colored by type):
    - deposit → green, ↑ arrow
    - toll → orange, 🛣️ road
    - refund → blue, ↩️ return
  Title: short description
  Date: "আজ, ৩:৪৫ PM" or "১২ জানুয়ারি"
  Amount: "+ ৳500.00" (green) or "- ৳45.00" (red)
  Status badge: "সফল" / "অপেক্ষমান" / "ব্যর্থ"

On tap → navigate to ReceiptScreen with transaction details
```

---

### SCREEN 9: Add Money Screen
**File**: `lib/features/wallet/presentation/screens/add_money_screen.dart`

**Layout:**

**A. Amount Section**:
```
Large amount input:
  "৳" prefix (fixed, 28px, primary green)
  Amount text field: 36px RobotoMono, number keyboard
  Underline style (no box border)
  Placeholder: "0.00"

Quick amount chips (horizontally scrollable):
[৳100] [৳200] [৳500] [৳1,000] [৳2,000] [৳5,000]
  - Tapping a chip fills the amount field
  - Selected chip: filled green background, white text
  - Unselected: white background, gray border

Validation messages:
  - "সর্বনিম্ন ৳50" if amount < 50
  - "সর্বোচ্চ ৳50,000" if amount > 50000
```

**B. Payment Method Section**:
```
Section label: "পেমেন্ট পদ্ধতি বেছে নিন"

Payment method cards (vertical list, each tappable):

[Card 1 - bKash]
  Left: bKash logo (pink circle, "b")
  Middle: "bKash" bold + "মোবাইল ব্যাংকিং"
  Right: radio button
  Border: pink (#E2136E) when selected

[Card 2 - Nagad]
  Left: Nagad logo (orange circle)
  Middle: "Nagad" bold + "মোবাইল ব্যাংকিং"
  Right: radio button
  Border: orange when selected

[Card 3 - Rocket (DBBL)]
  Similar to above, purple

[Card 4 - ডেবিট/ক্রেডিট কার্ড]
  Left: card chip icon (blue)
  Middle: "Card" bold + "Visa, Mastercard, Amex"
  Right: radio button
  Border: blue when selected

[Card 5 - ইন্টারনেট ব্যাংকিং]
  Left: bank icon (gray)
  Middle: "Net Banking" + "Dutch Bangla, BRAC, City Bank..."

Note at bottom: "SSLCommerz দ্বারা নিরাপদ পেমেন্ট 🔒"
```

**C. Proceed Button**:
```
Full width, 56px height, red (#F42A41)
Text: "৳{amount} পরিশোধ করুন"
Disabled if: no amount OR no payment method selected
```

**On Proceed Tap:**
```
1. Validate amount and method
2. Show loading
3. Call Cloud Function: createSSLCommerzSession({
     amount: amount,
     userId: uid,
     paymentMethod: selectedMethod,
     currency: "BDT"
   })
4. Function returns paymentUrl + transactionId
5. Save transactionId to local state
6. Navigate to SSLCommerzWebViewScreen(url: paymentUrl, txId: transactionId)
```

---

### SCREEN 10: SSLCommerz WebView Screen
**File**: `lib/features/wallet/presentation/screens/sslcommerz_webview_screen.dart`

**What it shows:**
- Custom app bar with "নিরাপদ পেমেন্ট 🔒" title + back button
- WebView loading SSLCommerz payment page
- Loading indicator while page loads
- TollBD branding in app bar (user knows they're still in the app)

**Logic:**
```
The WebView intercepts navigation URLs:
  SUCCESS URL: "https://tollbd.app/payment/success"
    → Call Cloud Function validateSSLPayment(transactionId)
    → If valid → Show PaymentSuccessScreen
  FAIL URL: "https://tollbd.app/payment/fail"
    → Navigate back to AddMoneyScreen with error message
  CANCEL URL: "https://tollbd.app/payment/cancel"
    → Navigate back silently

Configure in SSLCommerz dashboard:
  Success URL: https://tollbd.app/payment/success
  Fail URL: https://tollbd.app/payment/fail
  Cancel URL: https://tollbd.app/payment/cancel
  IPN URL: https://{region}-{project}.cloudfunctions.net/sslcommerzIPN
```

---

### FIREBASE CLOUD FUNCTIONS — PHASE 1

**functions/src/wallet/depositMoney.ts:**
```typescript
// Called by app to initiate SSLCommerz session
export const createSSLCommerzSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { amount, paymentMethod, currency } = data;
  const userId = context.auth.uid;

  // Validate amount
  if (amount < 5000 || amount > 5000000) { // in paisa
    throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
  }

  // Create pending transaction in Firestore
  const transactionRef = admin.firestore().collection('transactions').doc();
  const transactionId = transactionRef.id;

  await transactionRef.set({
    id: transactionId,
    user_id: userId,
    type: 'deposit',
    status: 'pending',
    amount: amount,
    payment_method: paymentMethod,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Call SSLCommerz API to create payment session
  const sslData = {
    store_id: process.env.SSLCOMMERZ_STORE_ID,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
    total_amount: amount / 100, // convert paisa to taka
    currency: 'BDT',
    tran_id: transactionId,
    success_url: 'https://tollbd.app/payment/success',
    fail_url: 'https://tollbd.app/payment/fail',
    cancel_url: 'https://tollbd.app/payment/cancel',
    ipn_url: `https://${process.env.REGION}-${process.env.PROJECT_ID}.cloudfunctions.net/sslcommerzIPN`,
    cus_name: 'TollBD User',
    cus_phone: context.auth.token.phone_number,
    product_name: 'Wallet Top-up',
    product_category: 'Digital Payment',
    shipping_method: 'NO',
    num_of_item: 1,
    product_profile: 'general',
  };

  const response = await axios.post('https://sandbox.sslcommerz.com/gwprocess/v4/api.php', sslData);

  return {
    paymentUrl: response.data.GatewayPageURL,
    transactionId: transactionId,
  };
});
```

**functions/src/wallet/sslcommerzIPN.ts:**
```typescript
// SSLCommerz IPN callback — validates payment and credits wallet
export const sslcommerzIPN = functions.https.onRequest(async (req, res) => {
  const { tran_id, status, val_id, amount, store_passwd } = req.body;

  // Verify with SSLCommerz validation API
  const validationUrl = `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${val_id}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWORD}&format=json`;

  const validationResponse = await axios.get(validationUrl);
  const validData = validationResponse.data;

  if (validData.status !== 'VALID' && validData.status !== 'VALIDATED') {
    res.status(400).send('Invalid payment');
    return;
  }

  // Get transaction from Firestore
  const txRef = admin.firestore().collection('transactions').doc(tran_id);
  const txDoc = await txRef.get();
  if (!txDoc.exists || txDoc.data()?.status !== 'pending') {
    res.status(200).send('Already processed');
    return;
  }

  const tx = txDoc.data()!;
  const userRef = admin.firestore().collection('users').doc(tx.user_id);

  // Atomic wallet credit using Firestore transaction
  await admin.firestore().runTransaction(async (firestoreTx) => {
    const userDoc = await firestoreTx.get(userRef);
    const currentBalance = userDoc.data()?.wallet_balance || 0;
    const newBalance = currentBalance + tx.amount;

    firestoreTx.update(userRef, { wallet_balance: newBalance, updated_at: admin.firestore.FieldValue.serverTimestamp() });
    firestoreTx.update(txRef, {
      status: 'success',
      balance_before: currentBalance,
      balance_after: newBalance,
      sslcommerz_val_id: val_id,
      gateway_response: validData,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  // Send FCM notification to user
  const userDoc = await userRef.get();
  const fcmToken = userDoc.data()?.fcm_token;
  if (fcmToken) {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: 'ওয়ালেটে টাকা যোগ হয়েছে! 💰',
        body: `৳${tx.amount / 100} সফলভাবে যোগ হয়েছে`,
      },
      data: { type: 'wallet_credit', transaction_id: tran_id },
    });
  }

  res.status(200).send('IPN processed');
});
```

---

## STATE MANAGEMENT (Riverpod)

### Wallet Provider
```dart
// lib/features/wallet/presentation/providers/wallet_provider.dart

// Stream provider — real-time balance from Firestore
final walletBalanceProvider = StreamProvider<int>((ref) {
  final uid = ref.watch(authStateProvider).value?.uid;
  if (uid == null) return Stream.value(0);
  return FirebaseFirestore.instance
      .collection('users')
      .doc(uid)
      .snapshots()
      .map((doc) => (doc.data()?['wallet_balance'] as int?) ?? 0);
});

// Transactions stream with optional filter
final transactionsProvider = StreamProvider.family<List<TransactionModel>, String?>((ref, filter) {
  final uid = ref.watch(authStateProvider).value?.uid;
  if (uid == null) return Stream.value([]);

  Query query = FirebaseFirestore.instance
      .collection('transactions')
      .where('user_id', isEqualTo: uid)
      .orderBy('created_at', descending: true)
      .limit(50);

  if (filter != null && filter != 'all') {
    query = query.where('type', isEqualTo: filter);
  }

  return query.snapshots().map((snapshot) =>
      snapshot.docs.map((doc) => TransactionModel.fromFirestore(doc)).toList());
});
```

---

## BILINGUAL SUPPORT

Create `lib/core/constants/app_strings.dart`:
```dart
class AppStrings {
  static String get(String key, String language) {
    return language == 'bn' ? _bn[key] ?? key : _en[key] ?? key;
  }

  static const Map<String, String> _bn = {
    'hello': 'হ্যালো',
    'good_morning': 'সুপ্রভাত',
    'good_afternoon': 'শুভ অপরাহ্ন',
    'good_evening': 'শুভ সন্ধ্যা',
    'your_balance': 'আপনার ব্যালেন্স',
    'add_money': 'টাকা যোগ করুন',
    'pay_toll': 'টোল দিন',
    'transaction_history': 'লেনদেনের ইতিহাস',
    'low_balance_warning': 'আপনার ব্যালেন্স কম',
    'deposit_success': 'ওয়ালেটে টাকা যোগ হয়েছে',
    'select_payment_method': 'পেমেন্ট পদ্ধতি বেছে নিন',
    // ... add all strings
  };

  static const Map<String, String> _en = {
    'hello': 'Hello',
    'good_morning': 'Good morning',
    'good_afternoon': 'Good afternoon',
    'good_evening': 'Good evening',
    'your_balance': 'Your Balance',
    'add_money': 'Add Money',
    'pay_toll': 'Pay Toll',
    'transaction_history': 'Transaction History',
    'low_balance_warning': 'Low balance',
    'deposit_success': 'Money added to wallet',
    'select_payment_method': 'Select payment method',
    // ... add all strings
  };
}
```

---

## WHAT YOU MUST DO YOURSELF (Manual Steps)

### 1. Firebase Project Setup
- Go to console.firebase.google.com
- Create new project: "tollbd-production"
- Enable: Authentication (Phone), Firestore, Storage, Cloud Functions, FCM
- Download `google-services.json` → place in `android/app/`
- Download `GoogleService-Info.plist` → place in `ios/Runner/`
- Run: `flutterfire configure` to generate `firebase_options.dart`

### 2. SSLCommerz Account
- Register at sslcommerz.com
- Create store, get Store ID and Store Password
- Set sandbox URLs for testing
- Add to Firebase environment: `firebase functions:config:set sslcommerz.store_id="YOUR_ID" sslcommerz.store_password="YOUR_PASSWORD"`

### 3. Enable Phone Auth
- Firebase Console → Authentication → Sign-in method → Phone → Enable
- For testing: add test phone numbers (+8801712345678 with OTP 123456)

### 4. Firestore Indexes
Create composite index in Firestore Console:
```
Collection: transactions
Fields: user_id (ASC), created_at (DESC)
```

### 5. Deploy Cloud Functions
```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

---

## PHASE 1 DELIVERABLES CHECKLIST

- [ ] Flutter project created and all packages installed
- [ ] Firebase connected and configured
- [ ] Splash screen with logo and auto-navigation
- [ ] Language selection (Bengali/English) with persistence
- [ ] Phone number input with +880 prefix
- [ ] OTP verification with 6-box pinput UI
- [ ] Profile setup with avatar upload
- [ ] Biometric setup (enable/skip)
- [ ] Home screen with balance card, quick actions, recent transactions
- [ ] Wallet screen with chart and filtered transaction list
- [ ] Add money screen with amount input and 5 payment methods
- [ ] SSLCommerz webview integration
- [ ] Payment success/fail screens
- [ ] Cloud Function: createSSLCommerzSession
- [ ] Cloud Function: sslcommerzIPN (validates and credits wallet)
- [ ] Cloud Function: onUserCreated (initializes wallet_balance = 0)
- [ ] FCM notifications for wallet credit
- [ ] Real-time balance sync via Firestore stream
- [ ] Firestore security rules deployed
- [ ] Both Bengali and English UI working
- [ ] Bottom navigation bar (placeholder for Phase 2 tabs)

---

*Phase 1 Complete. Proceed to Phase 2 for Vehicle Registration + Toll Payment.*





# TollBD — Phase 2 Master Prompt
## Vehicle Registration + Toll Payment System
### (Give this entire file to Codex AFTER Phase 1 is complete)

---

## PHASE 2 CONTEXT

This is Phase 2 of the TollBD project. Phase 1 is already complete, which means:
- Flutter project structure exists
- Firebase is configured
- Authentication (Phone OTP + Biometric) is working
- Digital Wallet with SSLCommerz deposit is working
- Home screen with balance card is working
- Bottom navigation bar exists

**Phase 2 adds:**
1. Vehicle Registration & Management (with BRTC API integration layer)
2. QR Code Toll Payment (scan → verify → deduct → open gate)
3. Monthly Pass system
4. Trip History with receipt and dispute
5. Offline payment mode

Do NOT rebuild anything from Phase 1. Only add new features.

---

## NEW FIRESTORE COLLECTIONS (Add these)

### Collection: `vehicles`
```
vehicles/{vehicleId}/
  ├── id: string
  ├── owner_uid: string                    // FK to users
  ├── plate_number: string                 // "DHAKA METRO GA 11-1111"
  ├── plate_number_raw: string             // "DHAKAMETROGAA111111" (for search)
  ├── vehicle_type: "motorcycle" | "car" | "microbus" | "truck" | "bus" | "cng"
  ├── make: string                         // "Toyota"
  ├── model: string                        // "Corolla"
  ├── color: string                        // "White"
  ├── year: number                         // 2020
  ├── registration_doc_url: string         // Firebase Storage URL
  ├── brtc_status: "verified" | "pending_manual" | "rejected" | "api_verified"
  ├── brtc_data: map                       // raw BRTC API response (if available)
  ├── is_active: bool                      // default vehicle for payment
  ├── nickname: string                     // "আমার গাড়ি", "অফিস বাস"
  ├── created_at: timestamp
  └── updated_at: timestamp
```

### Collection: `toll_gates`
```
toll_gates/{gateId}/
  ├── id: string
  ├── name: string                         // "যাত্রাবাড়ী টোল প্লাজা"
  ├── name_en: string                      // "Jatrabari Toll Plaza"
  ├── road_name: string                    // "ঢাকা-চট্টগ্রাম মহাসড়ক"
  ├── location: GeoPoint
  ├── address: string
  ├── status: "active" | "maintenance" | "offline"
  ├── toll_rates: {                        // amounts in paisa
  │     motorcycle: 5000,                 // ৳50
  │     cng: 5000,
  │     car: 10000,                       // ৳100
  │     microbus: 15000,                  // ৳150
  │     truck_small: 25000,               // ৳250
  │     truck_large: 40000,               // ৳400
  │     bus_small: 30000,                 // ৳300
  │     bus_large: 50000,                 // ৳500
  │   }
  ├── gate_operator_uid: string           // operator's Firebase Auth UID
  ├── daily_vehicle_count: number         // updated by Cloud Functions
  ├── daily_revenue: number               // updated by Cloud Functions
  └── qr_code_secret: string             // for QR verification (server-side only)
```

### Collection: `toll_payments`
```
toll_payments/{paymentId}/
  ├── id: string
  ├── user_id: string
  ├── vehicle_id: string
  ├── gate_id: string
  ├── gate_name: string
  ├── road_name: string
  ├── vehicle_plate: string
  ├── vehicle_type: string
  ├── amount: number                      // in paisa
  ├── status: "success" | "failed" | "refunded" | "disputed"
  ├── payment_method: "wallet" | "offline_qr"
  ├── balance_before: number
  ├── balance_after: number
  ├── qr_payload: string                  // encrypted QR data that was scanned
  ├── gate_operator_uid: string
  ├── dispute_id: string                  // if disputed, FK to disputes
  ├── receipt_url: string                 // PDF receipt Firebase Storage URL
  ├── created_at: timestamp
  └── updated_at: timestamp
```

### Collection: `passes`
```
passes/{passId}/
  ├── id: string
  ├── user_id: string
  ├── vehicle_id: string
  ├── pass_type: "monthly" | "quarterly" | "annual"
  ├── vehicle_type: string               // pricing is vehicle-type dependent
  ├── price: number                      // in paisa
  ├── status: "active" | "expired" | "cancelled"
  ├── valid_from: timestamp
  ├── valid_until: timestamp
  ├── auto_renew: bool
  ├── covered_gates: ["all"] | [gateId]  // "all" means all Bangladesh toll gates
  ├── transaction_id: string             // FK to transactions collection
  └── created_at: timestamp
```

### Collection: `disputes`
```
disputes/{disputeId}/
  ├── id: string
  ├── user_id: string
  ├── toll_payment_id: string
  ├── reason: "wrong_amount" | "not_my_vehicle" | "gate_error" | "double_charge" | "other"
  ├── description: string
  ├── status: "open" | "under_review" | "resolved_refunded" | "resolved_rejected"
  ├── admin_notes: string
  ├── refund_amount: number
  ├── evidence_urls: [string]            // uploaded screenshot/photo URLs
  ├── created_at: timestamp
  └── resolved_at: timestamp
```

### Collection: `offline_qr_tokens`
```
offline_qr_tokens/{tokenId}/
  ├── id: string
  ├── user_id: string
  ├── vehicle_id: string
  ├── token_hash: string                 // SHA256 of (userId + vehicleId + timestamp + secret)
  ├── amount_reserved: number            // balance reserved for this token
  ├── valid_until: timestamp             // 24 hours from creation
  ├── status: "unused" | "used" | "expired"
  ├── used_at: timestamp
  └── created_at: timestamp
```

---

## NEW FIRESTORE SECURITY RULES (ADD to existing rules)

```javascript
// Add inside the match /databases/{database}/documents block

match /vehicles/{vehicleId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.owner_uid;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.owner_uid;
  allow update: if request.auth != null && request.auth.uid == resource.data.owner_uid
    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['brtc_status', 'brtc_data']); // only functions can change verification status
  allow delete: if request.auth != null && request.auth.uid == resource.data.owner_uid;
}

match /toll_gates/{gateId} {
  allow read: if request.auth != null;
  allow write: if false; // only admin SDK
}

match /toll_payments/{paymentId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
  allow write: if false; // only Cloud Functions
}

match /passes/{passId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
  allow write: if false; // only Cloud Functions
}

match /disputes/{disputeId} {
  allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
  allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
  allow update: if false; // only admin
}
```

---

## NEW FLUTTER FILES TO CREATE

Add to existing project structure:
```
lib/features/
  ├── vehicle/
  │   ├── data/
  │   │   ├── vehicle_repository.dart
  │   │   └── brtc_service.dart            # BRTC API interface
  │   ├── domain/
  │   │   └── vehicle_model.dart
  │   └── presentation/
  │       ├── providers/
  │       │   └── vehicle_provider.dart
  │       └── screens/
  │           ├── vehicles_screen.dart      # list of vehicles
  │           ├── add_vehicle_screen.dart
  │           ├── vehicle_detail_screen.dart
  │           └── vehicle_type_selector.dart
  ├── toll_payment/
  │   ├── data/
  │   │   ├── toll_repository.dart
  │   │   └── qr_service.dart
  │   ├── domain/
  │   │   ├── toll_payment_model.dart
  │   │   └── toll_gate_model.dart
  │   └── presentation/
  │       ├── providers/
  │       │   └── toll_provider.dart
  │       └── screens/
  │           ├── scan_qr_screen.dart        # main toll payment screen
  │           ├── nearby_gates_screen.dart   # map view of gates
  │           ├── payment_confirm_screen.dart
  │           ├── payment_success_screen.dart
  │           └── payment_failed_screen.dart
  ├── pass/
  │   ├── data/
  │   │   └── pass_repository.dart
  │   ├── domain/
  │   │   └── pass_model.dart
  │   └── presentation/
  │       ├── providers/
  │       │   └── pass_provider.dart
  │       └── screens/
  │           ├── pass_store_screen.dart
  │           └── my_passes_screen.dart
  └── history/
      ├── data/
      │   └── history_repository.dart
      ├── domain/
      │   └── trip_model.dart
      └── presentation/
          ├── providers/
          │   └── history_provider.dart
          └── screens/
              ├── trip_history_screen.dart
              ├── receipt_detail_screen.dart
              └── dispute_screen.dart
```

**Add to pubspec.yaml:**
```yaml
mobile_scanner: ^3.5.6      # QR code scanner
google_maps_flutter: ^2.5.3 # map for nearby gates
geolocator: ^11.0.0         # user location
flutter_svg: ^2.0.10        # SVG assets
pdf: ^3.10.7                # generate PDF receipts
printing: ^5.12.0           # print/share PDF
encrypt: ^5.0.3             # QR payload encryption
qr_flutter: ^4.1.0          # generate QR codes (for offline mode)
```

---

## BRTC API INTEGRATION LAYER

**IMPORTANT:** The Bangladesh Road Transport Corporation (BRTC) does not currently have a public API. Design the code so it can be swapped in when available.

```dart
// lib/features/vehicle/data/brtc_service.dart

abstract class BRTCService {
  Future<BRTCVerificationResult> verifyVehicle(String plateNumber);
}

// MOCK implementation (used until real API is available)
class BRTCServiceMock implements BRTCService {
  @override
  Future<BRTCVerificationResult> verifyVehicle(String plateNumber) async {
    await Future.delayed(const Duration(seconds: 2)); // simulate network

    // Simulate: 70% verified, 20% not found, 10% API error
    final random = Random().nextDouble();
    if (random < 0.7) {
      return BRTCVerificationResult(
        status: BRTCStatus.verified,
        ownerName: 'মোহাম্মদ রহিম',
        vehicleType: 'Car',
        make: 'Toyota',
        model: 'Corolla',
        year: 2019,
        color: 'White',
        taxTokenValid: true,
        fitnessCertValid: true,
        insuranceValid: true,
      );
    } else if (random < 0.9) {
      return BRTCVerificationResult(status: BRTCStatus.notFound);
    } else {
      return BRTCVerificationResult(status: BRTCStatus.apiError);
    }
  }
}

// REAL implementation (plug in when BRTC API is available)
class BRTCServiceReal implements BRTCService {
  final String apiKey;
  final String baseUrl; // "https://api.brtc.gov.bd/v1" (hypothetical)

  BRTCServiceReal({required this.apiKey, required this.baseUrl});

  @override
  Future<BRTCVerificationResult> verifyVehicle(String plateNumber) async {
    final response = await http.get(
      Uri.parse('$baseUrl/vehicles/verify?plate=$plateNumber'),
      headers: {'Authorization': 'Bearer $apiKey', 'Content-Type': 'application/json'},
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return BRTCVerificationResult.fromJson(data);
    }
    throw Exception('BRTC API error: ${response.statusCode}');
  }
}

// In production, inject via Riverpod:
final brtcServiceProvider = Provider<BRTCService>((ref) {
  const useRealAPI = bool.fromEnvironment('USE_BRTC_REAL_API', defaultValue: false);
  if (useRealAPI) {
    return BRTCServiceReal(
      apiKey: const String.fromEnvironment('BRTC_API_KEY'),
      baseUrl: 'https://api.brtc.gov.bd/v1',
    );
  }
  return BRTCServiceMock();
});
```

---

## SCREEN-BY-SCREEN IMPLEMENTATION — PHASE 2

---

### SCREEN 1: Vehicles Screen (Tab 3 of bottom nav)
**File**: `lib/features/vehicle/presentation/screens/vehicles_screen.dart`

**Layout:**

**A. Header section:**
- Title: "আমার গাড়ি" (My Vehicles)
- Subtitle: "নিবন্ধিত: {count}টি গাড়ি"
- "গাড়ি যোগ করুন" button (top right, green, outlined)

**B. Vehicles List:**
Each vehicle card:
```
Card (white, 12px radius, subtle shadow):
  Left: vehicle type icon circle (colored by type)
         motorcycle=orange, car=green, truck=blue, bus=red, cng=teal
  
  Middle column:
    Row 1: Plate number in BD style — "ঢাকা মেট্রো ঘ ১১-১১১১"
           In yellow background box (license plate style), black bold text
    Row 2: Make + Model + Year — "Toyota Corolla 2019"
    Row 3: Nickname if set — "আমার গাড়ি"
  
  Right: 
    BRTC status badge:
      "যাচাইকৃত ✓" — green badge
      "অপেক্ষমান" — amber badge  
      "ম্যানুয়াল পর্যালোচনা" — orange badge
    Three-dot menu → Edit / Set Active / Delete

  Bottom bar (if this is active vehicle):
    Full width green strip: "● সক্রিয় গাড়ি — টোল পেমেন্টে ব্যবহৃত হবে"
```

**C. Empty State:**
```
Illustration: Car with + icon
"এখনো কোনো গাড়ি নেই"
"আপনার গাড়ি যোগ করুন এবং ডিজিটাল টোল পেমেন্ট শুরু করুন"
[গাড়ি যোগ করুন] big green button
```

---

### SCREEN 2: Add Vehicle Screen
**File**: `lib/features/vehicle/presentation/screens/add_vehicle_screen.dart`

**Layout (scrollable form, 2 steps):**

**Step 1 — Basic Info:**

**Vehicle Type Selector** (most important, show first):
```
Horizontal scrollable row of type cards:
Each card: 72x80px, icon + label below

🏍️ মোটরসাইকেল    🚗 গাড়ি    🚐 মাইক্রোবাস    🚛 ট্রাক    🚌 বাস    🛺 সিএনজি

Selected: green border + green background + checkmark
```

**Registration Number Field:**
```
Label: "নিবন্ধন নম্বর"
Helper text: "উদাহরণ: ঢাকা মেট্রো ঘ ১১-১১১১"
Input field: full width, 56px height, 12px radius
Keyboard: mixed (numbers + Bengali characters)

Below input: "BRTC দিয়ে যাচাই করুন" button — outlined green
  → Shows loading: "BRTC ডেটাবেজে খোঁজা হচ্ছে..."
  → Success: green banner "✓ BRTC যাচাই সফল" + owner name shown
  → Not found: amber banner "নিবন্ধন পাওয়া যায়নি — আপনাকে ম্যানুয়ালি যোগ করতে হবে"
  → Error: "BRTC সার্ভার এখন উপলব্ধ নয়"
```

**Owner Details (auto-filled if BRTC verified, manual if not):**
```
"মালিকের নাম" field
"গাড়ির রঙ" color picker (8 color circles: White, Black, Silver, Red, Blue, Yellow, Green, Other)
"নির্মাতা ও মডেল" field (e.g., "Toyota Corolla")
"নির্মাণ বছর" — number picker 2000-2024
"ডাকনাম (ঐচ্ছিক)" — e.g., "অফিসের গাড়ি"
```

**Step 2 — Document Upload:**
```
"নিবন্ধন কার্ডের ছবি আপলোড করুন"

Dashed border upload area:
  📄 Icon
  "ছবি তুলুন বা গ্যালারি থেকে বেছে নিন"
  Accepted: JPG, PNG, PDF (max 5MB)

After upload: thumbnail preview + "পরিবর্তন করুন" link

Note: "আপনার ডকুমেন্ট নিরাপদে সংরক্ষিত হবে এবং শুধুমাত্র যাচাইয়ের জন্য ব্যবহার হবে"
```

**Submit Button:**
```
"গাড়ি যোগ করুন" — full width, 56px, primary green
```

**On Submit:**
```
1. Validate all required fields
2. Upload registration doc to Firebase Storage: vehicles/{vehicleId}/registration.jpg
3. Call Cloud Function: addVehicle({...vehicleData})
4. Function creates Firestore document
5. If BRTC verified → status = "api_verified"
6. If not verified → status = "pending_manual"
7. Send admin notification for manual review if pending_manual
8. Navigate back to Vehicles screen
9. Show success snackbar: "গাড়ি যোগ করা হয়েছে!"
```

---

### SCREEN 3: Scan QR Screen (Toll Payment — Tab 2, the center FAB tab)
**File**: `lib/features/toll_payment/presentation/screens/scan_qr_screen.dart`

**Layout:**

**A. Full-screen Camera View:**
```
mobile_scanner package, fills entire screen

Overlay on camera:
  Top: custom app bar (transparent background)
    Left: X close button (white)
    Center: "টোল স্ক্যান করুন" (white, bold)
    Right: torch/flashlight toggle icon (white)
  
  Center: QR viewfinder frame
    Four corner brackets (green, 3px stroke, 40px each side)
    Animated: corners pulse with a subtle scale animation
    Semi-transparent dark overlay outside the frame
    Below frame: "QR কোডটি ফ্রেমের ভেতরে রাখুন" (white, 14px)
  
  Bottom sheet (white, rounded top corners 24px):
    Active vehicle chip: 
      "সক্রিয় গাড়ি: DHAKA GA 11-1111 ▼"
      Tap to switch vehicle (shows bottom sheet with vehicle list)
    
    Divider
    
    "কাছের টোল গেট দেখুন →" tappable link (opens NearbyGatesScreen)
    
    "ম্যানুয়ালি কোড লিখুন" button (outlined, for if QR damaged)
      → Shows text input field for 8-digit gate code
```

**QR Payload format (encrypted, server-side generated):**
```
The QR code at each toll gate contains a signed JWT:
{
  "gate_id": "gate_jatrabari_001",
  "gate_name": "যাত্রাবাড়ী টোল প্লাজা",
  "timestamp": 1234567890,      // QR regenerates every 60 seconds
  "signature": "HMAC-SHA256"   // verified server-side
}

App sends this payload to Cloud Function, which verifies signature.
```

**On QR Detected:**
```
1. Vibration feedback (HapticFeedback.mediumImpact)
2. Stop camera scanning
3. Decode QR payload
4. Show brief loading overlay: "গেটের তথ্য যাচাই হচ্ছে..."
5. Call Cloud Function: verifyTollGate(qrPayload)
6. Navigate to PaymentConfirmScreen with gate info
```

---

### SCREEN 4: Payment Confirm Screen
**File**: `lib/features/toll_payment/presentation/screens/payment_confirm_screen.dart`

**Layout:**

**Top — Gate Information:**
```
White card:
  Road icon + "যাত্রাবাড়ী টোল প্লাজা" (gate name, 20px bold)
  "ঢাকা-চট্টগ্রাম মহাসড়ক" (road name, 14px secondary)
  
  Location chip: 📍 "জাতীয় মহাসড়ক N2, ঢাকা"
```

**Middle — Vehicle and Amount:**
```
Two-column info card:
  Left: "গাড়ি"
    Car icon + "DHAKA GA 11-1111"
    "Toyota Corolla (গাড়ি)"
  Right: "পরিমাণ"
    "৳100.00" in large green Roboto Mono 28px
    "বর্তমান ব্যালেন্স: ৳1,150.00"

Balance after payment row:
  "পেমেন্টের পরে ব্যালেন্স:"
  "৳1,050.00" in medium text

If balance < toll amount: Show red warning
  "❌ অপর্যাপ্ত ব্যালেন্স — ৳{shortfall} কম আছে"
  [টাকা যোগ করুন] button
```

**Pass Status (if applicable):**
```
If user has active monthly pass for this vehicle type:
  Green banner: "✓ মাসিক পাস সক্রিয় — এই টোল বিনামূল্যে!"
  Amount shows "৳0.00" (free)
```

**Bottom — Action Buttons:**
```
"পরিশোধ করুন" — full width, 56px, RED (#F42A41), bold
  (Red for urgency/action — different from deposit which is green)

"বাতিল করুন" — text button, secondary color

Note: "পেমেন্ট নিরাপদ ও এনক্রিপ্টেড 🔒"

If biometric enabled: Payment automatically prompts biometric
  (fingerprint/face) before executing
```

---

### SCREEN 5: Payment Success Screen
**File**: `lib/features/toll_payment/presentation/screens/payment_success_screen.dart`

**Layout:**

**Animation (Lottie, plays once):**
```
success_check.json — green circle with checkmark drawing animation, 120px
Plays for 1.5 seconds
```

**After animation:**
```
"গেট খুলছে! ✓" — 24px bold, primary green
"টোল পরিশোধ সম্পন্ন" — 16px secondary

Transaction summary card:
  Gate: "যাত্রাবাড়ী টোল প্লাজা"
  Vehicle: "DHAKA GA 11-1111"  
  Amount paid: "৳100.00" (bold green)
  New balance: "৳1,050.00"
  Time: "আজ, ৩:৪৫ PM"
  Transaction ID: "TXN-XXXXXXXX" (small, gray, copy-on-tap)

Two buttons:
  [📄 রসিদ ডাউনলোড করুন] — outlined green, generates PDF
  [হোমে ফিরুন] — filled green

Auto-navigate to home after 8 seconds (show countdown)
```

**Gate Open Notification:**
Real-time: When Cloud Function processes payment, it writes to Realtime DB:
```
/gates/{gateId}/last_payment → { userId, vehicleId, timestamp, status: "open" }
```
Gate operator app listens and opens physical barrier.
User sees the "গেট খুলছে" message immediately.

---

### SCREEN 6: Nearby Gates Screen
**File**: `lib/features/toll_payment/presentation/screens/nearby_gates_screen.dart`

**Layout:**

**Top half: Google Map**
```
google_maps_flutter widget
User location: blue dot
Toll gates: custom green marker (toll gate icon)
Active gate (nearest): larger marker, pulsing animation

Map controls: zoom in/out, my location button
```

**Bottom half: Scrollable list of nearby gates**
```
Sorted by distance from user location

Each gate card:
  Left: colored circle (green=active, orange=maintenance, gray=offline)
  Middle: 
    Gate name (bold 14px)
    Road name (12px secondary)
    Distance: "৩.২ কিমি দূরে"
  Right: "দেখুন →" green link

On tap: shows gate details in bottom sheet:
  - Gate name + road
  - Toll rates by vehicle type (table)
  - Operating hours (24/7 or specific)
  - Status
  - "এখানে পেমেন্ট করুন" button → opens manual code entry
```

---

### SCREEN 7: Pass Store Screen
**File**: `lib/features/pass/presentation/screens/pass_store_screen.dart`

**Layout:**

**Header:**
- Title: "টোল পাস"
- Subtitle: "FastPass লেনে সুবিধাজনক যাতায়াত করুন"

**Vehicle Type Selector:**
```
Pill chips: [🏍️ মোটরসাইকেল] [🚗 গাড়ি] [🚐 মাইক্রোবাস] [🚛 ট্রাক] [🚌 বাস]
Selecting shows prices for that vehicle type
```

**Pass Cards (3 cards, vertically stacked):**

```
[Card 1 — Monthly Pass]
  Green gradient header band: "মাসিক পাস"
  Duration: "৩০ দিন"
  Price: "৳500" (for car — changes by vehicle type)
  Savings badge: "৳300 সাশ্রয়" (vs paying individually)
  Features list:
    ✓ সকল জাতীয় মহাসড়ক টোল গেট
    ✓ FastPass লেন অ্যাক্সেস
    ✓ স্বয়ংক্রিয় পেমেন্ট (কোনো স্ক্যান ছাড়া)
    ✓ ডিজিটাল পাস কার্ড
  [এখনই কিনুন] button — green, full width

[Card 2 — Quarterly Pass] (Most Popular badge)
  Border: 2px green (featured)
  Purple gradient header: "ত্রৈমাসিক পাস"
  Duration: "৯০ দিন"
  Price: "৳1,300" + "প্রতি মাসে মাত্র ৳433"
  Per-day: "৳14.4/দিন"
  [Most Popular] badge at top right corner
  Same features + "অতিরিক্ত ১০% ছাড়"

[Card 3 — Annual Pass]
  Dark green gradient header: "বার্ষিক পাস"
  Duration: "৩৬৫ দিন"
  Price: "৳4,500" + savings
  Best value badge: "সর্বোচ্চ সাশ্রয়"
  Same features + "অগ্রাধিকার গ্রাহক সেবা"
```

**On Buy:**
```
1. Show confirmation bottom sheet with selected pass details
2. Check wallet balance ≥ pass price
3. If sufficient: Call Cloud Function purchasePass({passType, vehicleId})
4. If insufficient: "৳{shortfall} কম আছে — টাকা যোগ করুন" with add money link
5. Function deducts from wallet, creates pass document, sends receipt
```

---

### SCREEN 8: Trip History Screen (Tab 4 of bottom nav)
**File**: `lib/features/history/presentation/screens/trip_history_screen.dart`

**Layout:**

**A. Summary Card:**
```
This month's stats:
  [গাড়ি: 24টি যাত্রা] [৳2,400 মোট ব্যয়] [১৮টি গেট]
```

**B. Filter Row:**
```
Date filter: [এই মাস ▼] — shows date picker on tap
Vehicle filter: [সব গাড়ি ▼] — shows vehicle list
Type filter chips: [সব] [টোল] [পাস]
```

**C. Timeline List (grouped by date):**
```
Date header: "আজ, ১৮ জানুয়ারি ২০২৫" — gray, small

Trip item:
  Left: vertical line (timeline) + colored dot (green=success, red=failed)
  
  Content card:
    Row 1: Gate name (bold 14px) + amount (bold green/red 14px, right aligned)
    Row 2: Road name (12px gray)
    Row 3: Time + Vehicle plate (12px gray) + Status badge
    
    If failed: "পেমেন্ট ব্যর্থ" red badge + retry option

On tap → ReceiptDetailScreen
Swipe left → shows "বিরোধ দাখিল করুন" (Dispute) red action
```

---

### SCREEN 9: Receipt Detail Screen
**File**: `lib/features/history/presentation/screens/receipt_detail_screen.dart`

**Layout (receipt-style white card):**
```
TollBD logo at top center
"ডিজিটাল রসিদ" title
"সরকারি স্বীকৃত টোল পেমেন্ট" subtitle

Divider (dashed)

Details table:
  রসিদ নম্বর: TXN-20250118-XXXXXX
  তারিখ ও সময়: ১৮ জানুয়ারি ২০২৫, ৩:৪৫ PM
  টোল গেট: যাত্রাবাড়ী টোল প্লাজা
  সড়ক: ঢাকা-চট্টগ্রাম মহাসড়ক
  যানবাহন: Toyota Corolla (DHAKA GA 11-1111)
  টোল ফি: ৳100.00
  পেমেন্ট পদ্ধতি: TollBD Wallet
  স্ট্যাটাস: সফল ✓

Divider (dashed)

QR code (for verification if needed)

Bottom actions:
  [📄 PDF ডাউনলোড] [↗ শেয়ার করুন] [⚠️ বিরোধ দাখিল করুন]
```

---

### SCREEN 10: Dispute Screen
**File**: `lib/features/history/presentation/screens/dispute_screen.dart`

**Layout:**
```
Header: "বিরোধ দাখিল করুন" with the original transaction summary

Reason selector (radio buttons):
  ○ ভুল পরিমাণ চার্জ হয়েছে
  ○ এটি আমার গাড়ি নয়
  ○ গেট খোলেনি
  ○ দ্বিগুণ চার্জ হয়েছে
  ○ অন্যান্য

Description field (multiline, optional):
  "বিস্তারিত বলুন (ঐচ্ছিক)"

Evidence upload (optional):
  "প্রমাণের ছবি আপলোড করুন (ঐচ্ছিক)"

[দাখিল করুন] button — red, full width

After submit:
  "আপনার বিরোধ #DSP-XXXXX নিবন্ধিত হয়েছে"
  "৭ কার্যদিবসের মধ্যে সমাধান করা হবে"
  Admin gets notification to review
```

---

## OFFLINE QR MODE

**When to use:** User has no internet at toll gate.

**How it works:**
```
1. App generates offline QR in advance (when online)
2. User opens app offline, shows pre-generated QR at gate
3. Gate operator scans QR with operator app
4. Operator app contacts server to verify
5. Once user goes online: transaction syncs
```

**Offline QR Generation (when online):**
```dart
// lib/features/toll_payment/data/qr_service.dart

class QRService {
  Future<OfflineQRToken> generateOfflineQR({
    required String userId,
    required String vehicleId,
    required int amount, // maximum amount to reserve (e.g., truck toll ₹500)
  }) async {
    // 1. Call Cloud Function to reserve balance and get token
    final result = await FirebaseFunctions.instance
        .httpsCallable('generateOfflineQR')
        .call({
      'vehicleId': vehicleId,
      'reservedAmount': amount,
    });
    
    // 2. Store token locally with Hive
    final token = OfflineQRToken.fromJson(result.data);
    await HiveBoxes.offlineTokens.put(token.id, token);
    return token;
  }
}
```

**UI for Offline QR:**
- On home screen: "অফলাইন QR তৈরি করুন" option
- Shows current offline tokens with: vehicle, reserved amount, expiry
- Displays full-screen QR when needed
- Token expires after 24 hours

---

## CLOUD FUNCTIONS — PHASE 2

**functions/src/toll/processPayment.ts:**
```typescript
export const processTollPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const { qrPayload, vehicleId } = data;
  const userId = context.auth.uid;

  // 1. Verify QR signature
  const decodedQR = verifyQRSignature(qrPayload); // throws if invalid/expired
  const { gate_id } = decodedQR;

  // 2. Get gate info and toll rate
  const gateDoc = await admin.firestore().collection('toll_gates').doc(gate_id).get();
  if (!gateDoc.exists || gateDoc.data()?.status !== 'active') {
    throw new functions.https.HttpsError('not-found', 'Gate not active');
  }
  const gate = gateDoc.data()!;

  // 3. Get vehicle info
  const vehicleDoc = await admin.firestore().collection('vehicles').doc(vehicleId).get();
  const vehicle = vehicleDoc.data()!;
  if (vehicle.owner_uid !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Not your vehicle');
  }

  // 4. Check if user has active pass for this vehicle type
  const now = admin.firestore.Timestamp.now();
  const activePass = await admin.firestore().collection('passes')
    .where('user_id', '==', userId)
    .where('vehicle_id', '==', vehicleId)
    .where('status', '==', 'active')
    .where('valid_until', '>', now)
    .limit(1)
    .get();

  const hasFreePass = !activePass.empty;
  const tollAmount = hasFreePass ? 0 : gate.toll_rates[vehicle.vehicle_type];

  // 5. Atomic payment
  await admin.firestore().runTransaction(async (tx) => {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await tx.get(userRef);
    const balance = userDoc.data()?.wallet_balance || 0;

    if (!hasFreePass && balance < tollAmount) {
      throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance');
    }

    const newBalance = balance - tollAmount;
    const paymentId = admin.firestore().collection('toll_payments').doc().id;
    const paymentRef = admin.firestore().collection('toll_payments').doc(paymentId);

    // Deduct balance
    tx.update(userRef, { wallet_balance: newBalance, updated_at: admin.firestore.FieldValue.serverTimestamp() });

    // Create toll payment record
    tx.set(paymentRef, {
      id: paymentId,
      user_id: userId,
      vehicle_id: vehicleId,
      gate_id: gate_id,
      gate_name: gate.name,
      road_name: gate.road_name,
      vehicle_plate: vehicle.plate_number,
      vehicle_type: vehicle.vehicle_type,
      amount: tollAmount,
      status: 'success',
      payment_method: 'wallet',
      balance_before: balance,
      balance_after: newBalance,
      qr_payload: qrPayload,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Signal gate to open (Realtime Database)
    await admin.database().ref(`/gates/${gate_id}/open_signal`).set({
      userId, vehicleId, paymentId,
      plate: vehicle.plate_number,
      timestamp: Date.now(),
    });
  });

  // 6. Send FCM notification
  // ... (similar to Phase 1)

  return { success: true, amount: tollAmount, hasFreePass };
});
```

**functions/src/vehicle/addVehicle.ts:**
```typescript
export const addVehicle = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const userId = context.auth.uid;
  const { plateNumber, vehicleType, make, model, color, year, nickname, brtcVerified, brtcData } = data;

  // Check vehicle not already registered
  const existing = await admin.firestore().collection('vehicles')
    .where('plate_number_raw', '==', plateNumber.replace(/\s/g, '').toUpperCase())
    .where('owner_uid', '==', userId)
    .get();

  if (!existing.empty) {
    throw new functions.https.HttpsError('already-exists', 'Vehicle already registered');
  }

  const vehicleId = admin.firestore().collection('vehicles').doc().id;

  await admin.firestore().collection('vehicles').doc(vehicleId).set({
    id: vehicleId,
    owner_uid: userId,
    plate_number: plateNumber,
    plate_number_raw: plateNumber.replace(/\s/g, '').toUpperCase(),
    vehicle_type: vehicleType,
    make, model, color, year,
    nickname: nickname || '',
    brtc_status: brtcVerified ? 'api_verified' : 'pending_manual',
    brtc_data: brtcData || null,
    is_active: false,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { vehicleId };
});
```

---

## NEW FIRESTORE INDEXES (Add these)

```
Collection: vehicles
  - owner_uid (ASC) + created_at (DESC)

Collection: toll_payments
  - user_id (ASC) + created_at (DESC)
  - user_id (ASC) + vehicle_id (ASC) + created_at (DESC)

Collection: passes
  - user_id (ASC) + status (ASC) + valid_until (DESC)

Collection: disputes
  - user_id (ASC) + created_at (DESC)
  - status (ASC) + created_at (ASC)   [for admin queries]
```

---

## PHASE 2 DELIVERABLES CHECKLIST

- [ ] Vehicles screen with list of registered vehicles
- [ ] Add Vehicle form with type selector
- [ ] BRTC API interface (mock + real stub)
- [ ] Vehicle document upload to Firebase Storage
- [ ] BRTC verification flow (loading → success/fail badge)
- [ ] QR Scanner screen with camera, viewfinder overlay, torch toggle
- [ ] Vehicle selector on scanner screen
- [ ] Payment Confirm screen with gate info, vehicle, amount
- [ ] Pass check (free pass → ৳0 toll)
- [ ] Insufficient balance warning with add money redirect
- [ ] Cloud Function: verifyTollGate (QR signature verification)
- [ ] Cloud Function: processTollPayment (atomic deduct + gate signal)
- [ ] Cloud Function: addVehicle
- [ ] Cloud Function: generateOfflineQR
- [ ] Payment Success screen with Lottie animation
- [ ] Realtime Database gate open signal
- [ ] Offline QR mode (generate + display)
- [ ] Nearby Gates screen with Google Maps
- [ ] Pass Store screen with 3 pass tiers
- [ ] Cloud Function: purchasePass
- [ ] My Passes screen with expiry countdown
- [ ] Trip History screen with timeline
- [ ] Receipt Detail screen with PDF generation
- [ ] Dispute screen and Cloud Function
- [ ] PDF generation using `pdf` package
- [ ] All new Firestore collections and security rules
- [ ] All new Firestore indexes

---

*Phase 2 Complete. Proceed to Phase 3 for Admin Dashboard + Analytics + Advanced Features.*





# TollBD — Phase 3 Master Prompt
## Admin Dashboard + Analytics + Advanced Features
### (Give this entire file to Codex AFTER Phase 1 and Phase 2 are complete)

---

## PHASE 3 CONTEXT

This is Phase 3 of the TollBD project. Phases 1 and 2 are complete:
- ✅ Authentication, Wallet, SSLCommerz deposit (Phase 1)
- ✅ Vehicle Registration, QR Toll Payment, Monthly Pass, Trip History (Phase 2)

**Phase 3 adds:**
1. Toll Gate Operator App (tablet UI)
2. Admin Web Dashboard (React — separate project)
3. Advanced Analytics (revenue, traffic heatmaps, reports)
4. Route-based Toll Estimator
5. Family Account feature
6. Live Queue system (real-time vehicles at each gate)
7. Automated monthly pass auto-renewal
8. Push notification center with notification history
9. NID verification screen
10. App rating, help & FAQ system

---

## NEW FIRESTORE COLLECTIONS

### Collection: `gate_operators`
```
gate_operators/{uid}/
  ├── uid: string                     // Firebase Auth UID
  ├── name: string
  ├── phone: string
  ├── assigned_gate_id: string        // FK to toll_gates
  ├── shift_start: string             // "08:00"
  ├── shift_end: string               // "20:00"
  ├── role: "operator" | "supervisor"
  ├── status: "active" | "inactive"
  └── created_at: timestamp
```

### Collection: `gate_queue`
```
gate_queue/{gateId}/
  └── vehicles: [
        {
          vehicleId: string,
          plateNumber: string,
          vehicleType: string,
          userId: string,
          enteredAt: timestamp,
          estimatedWait: number,       // minutes
          position: number,
        }
      ]
  └── updated_at: timestamp
```

### Collection: `analytics_daily`
```
analytics_daily/{gateId_YYYYMMDD}/
  ├── gate_id: string
  ├── date: string                    // "2025-01-18"
  ├── total_revenue: number           // in paisa
  ├── vehicle_counts: {
  │     motorcycle: number,
  │     car: number,
  │     microbus: number,
  │     truck: number,
  │     bus: number,
  │   }
  ├── total_vehicles: number
  ├── peak_hour: number               // 0-23 (hour with most traffic)
  ├── hourly_data: [                  // 24 entries
  │     { hour: 0, vehicles: 5, revenue: 25000 },
  │     ...
  │   ]
  ├── pass_usage_count: number
  ├── dispute_count: number
  └── created_at: timestamp
```

### Collection: `family_accounts`
```
family_accounts/{familyId}/
  ├── id: string
  ├── owner_uid: string               // primary account
  ├── name: string                    // "রহিম পরিবার"
  ├── members: [
  │     { uid: string, name: string, phone: string, role: "admin" | "member", joined_at: timestamp }
  │   ]
  ├── shared_wallet: bool             // if true, all members use owner's wallet
  ├── created_at: timestamp
  └── updated_at: timestamp
```

### Collection: `notifications_log`
```
notifications_log/{notifId}/
  ├── id: string
  ├── user_id: string
  ├── type: "toll_payment" | "wallet_credit" | "low_balance" | "pass_expiry" | "dispute_update" | "system"
  ├── title: string
  ├── title_bn: string
  ├── body: string
  ├── body_bn: string
  ├── data: map                       // extra payload
  ├── is_read: bool
  ├── created_at: timestamp
  └── read_at: timestamp
```

### Collection: `nid_verifications`
```
nid_verifications/{uid}/
  ├── user_id: string
  ├── nid_number: string
  ├── nid_front_url: string
  ├── nid_back_url: string
  ├── selfie_url: string
  ├── status: "pending" | "verified" | "rejected"
  ├── rejection_reason: string
  ├── submitted_at: timestamp
  └── reviewed_at: timestamp
```

---

## PART A: OPERATOR APP (Flutter — TABLET UI)

The operator app is a **separate Flutter app** (`tollbd_operator/`) targeting Android tablets (10-12 inch). It uses the same Firebase project.

### Operator App Setup

```
tollbd_operator/
├── lib/
│   ├── main.dart                     // Different entry point
│   ├── core/                         // Same design system colors/typography
│   └── features/
│       ├── auth/
│       │   └── operator_login_screen.dart
│       ├── dashboard/
│       │   ├── gate_dashboard_screen.dart   // Main screen
│       │   └── vehicle_queue_widget.dart
│       ├── manual_entry/
│       │   └── manual_toll_screen.dart
│       └── reports/
│           └── operator_reports_screen.dart
```

---

### OPERATOR SCREEN 1: Gate Dashboard Screen
**File**: `tollbd_operator/lib/features/dashboard/gate_dashboard_screen.dart`

**Layout (Landscape tablet, 1280x800):**

```
Split layout — Left panel (40%) | Right panel (60%)

LEFT PANEL — Gate Status:
  Header: Gate name + "● সক্রিয়" green badge
  
  Large stats cards (2x2 grid):
    [আজকের আয়]     [মোট গাড়ি]
    ৳24,500         248
    
    [FastPass]      [বিরোধ]
    32 টি           3 টি
  
  Gate control:
    Toggle: [গেট খোলো ▶] [গেট বন্ধ করো ■]
    (Writes to Realtime DB → physical gate responds)
  
  Shift info:
    "আপনার শিফট: সকাল ৮টা — বিকাল ৮টা"
    "অবশিষ্ট সময়: ৪ ঘন্টা ১৫ মিনিট"

RIGHT PANEL — Live Feed:
  Real-time transaction feed (auto-updates via Firestore stream):
  
  Each row:
    Time | Vehicle plate | Vehicle type | Amount | Status
    ৩:৪৫ PM | DHAKA GA 11-1111 | 🚗 গাড়ি | ৳100 | ✓ সফল
    
  Color coding:
    Green row = successful payment
    Blue row = FastPass used (free)
    Red row = failed/dispute
  
  Filter chips: [সব] [শুধু সফল] [শুধু পাস] [বিরোধ]
```

---

### OPERATOR SCREEN 2: Manual Toll Screen
**File**: `tollbd_operator/lib/features/manual_entry/manual_toll_screen.dart`

**When to use:** App-based payment failed, or tourist vehicle without TollBD.

**Layout:**
```
Title: "ম্যানুয়াল টোল এন্ট্রি"

Vehicle plate input (large, 24px):
  Placeholder: "ঢাকা মেট্রো ঘ ১১-১১১১"
  Lookup button: searches Firestore for registered vehicle

Vehicle type selector (big buttons):
  [🏍️] [🚗] [🚐] [🚛] [🚌] [🛺]

Amount display (auto-calculated from gate rates):
  "টোল ফি: ৳100"

Payment method toggle:
  [💳 TollBD App] [💵 নগদ]

If TollBD App: Enter user's phone number → lookup account → charge wallet
If Cash: Just record entry (for analytics), no payment

[কনফার্ম করুন] big green button
```

---

## PART B: ADMIN WEB DASHBOARD (React)

**Create a separate React project** (`tollbd_admin/`) for web-based admin control.

```
tollbd_admin/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── StatCard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── GateHeatmap.tsx
│   │   └── DataTable.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── OverviewPage.tsx           // main dashboard
│   │   ├── GatesPage.tsx              // all toll gates management
│   │   ├── UsersPage.tsx              // user management
│   │   ├── DisputesPage.tsx           // dispute resolution
│   │   ├── VehiclesPage.tsx           // pending vehicle verifications
│   │   ├── AnalyticsPage.tsx          // charts and reports
│   │   └── SettingsPage.tsx           // toll rates, app config
│   ├── services/
│   │   └── firebase.ts
│   └── hooks/
│       └── useFirestore.ts
```

**Tech stack for admin:**
```json
"dependencies": {
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "firebase": "^10.8.0",
  "recharts": "^2.10.0",           // charts
  "@tanstack/react-table": "^8.0.0", // data tables
  "react-router-dom": "^6.22.0",
  "tailwindcss": "^3.4.0",
  "date-fns": "^3.3.0",
  "@headlessui/react": "^1.7.0",
  "react-hot-toast": "^2.4.0"
}
```

---

### ADMIN PAGE 1: Overview Dashboard
**File**: `src/pages/OverviewPage.tsx`

**Layout (widescreen, sidebar + content):**

**Sidebar (240px, dark green #004D38):**
```
TollBD logo (white)

Navigation items:
  📊 ওভারভিউ         (active)
  🛣️ টোল গেট
  👥 ব্যবহারকারী
  🚗 যানবাহন যাচাই    (badge: pending count)
  ⚠️ বিরোধ           (badge: open disputes)
  📈 বিশ্লেষণ
  ⚙️ সেটিংস

Bottom: Admin name + logout
```

**Main Content:**

**A. Top KPI Cards (4 in a row):**
```
[আজকের মোট আয়]      [মোট ব্যবহারকারী]    [সক্রিয় গেট]        [মুলতুবি বিরোধ]
৳4,85,230           12,450 জন            42টি                 8টি
▲ 12% গতকাল থেকে    ▲ 230 নতুন আজ        38 সক্রিয়/4 রক্ষণাবেক্ষণ   🔴 জরুরি
```

**B. Revenue Chart (recharts BarChart):**
```
Title: "দৈনিক আয় — শেষ ৩০ দিন"
X-axis: dates
Y-axis: revenue in lakh taka
Bar color: #006A4E
Tooltip: date + exact amount + vehicle breakdown
Time range buttons: [৭ দিন] [৩০ দিন] [৬ মাস] [১ বছর]
```

**C. Traffic by Vehicle Type (recharts PieChart):**
```
Donut chart:
  🏍️ মোটরসাইকেল — 35%
  🚗 গাড়ি — 42%
  🚐 মাইক্রোবাস — 8%
  🚛 ট্রাক — 10%
  🚌 বাস — 5%

Each segment clickable — shows gate-level breakdown
```

**D. Top Performing Gates Table:**
```
Columns: Gate Name | Road | Today's Revenue | Vehicle Count | Status
Row hover: highlight green
Click row: goes to GatesPage filtered to that gate
```

**E. Recent Disputes (needs action):**
```
Mini table: Dispute ID | User | Gate | Amount | Submitted | Action Button
[Resolve] [Reject] buttons inline
```

---

### ADMIN PAGE 2: Vehicle Verification
**File**: `src/pages/VehiclesPage.tsx`

**Purpose:** Admin reviews pending vehicle registrations (those not auto-verified by BRTC).

**Layout:**
```
Filter tabs: [সব] [অপেক্ষমান (12)] [অনুমোদিত] [প্রত্যাখ্যাত]

Each pending vehicle card:
  Left: Registration doc thumbnail (uploaded image)
  Middle:
    Plate number
    Owner name
    Vehicle type + make + model
    Submitted: "২ ঘন্টা আগে"
  Right action buttons:
    [✓ অনুমোদন] green button
    [✗ প্রত্যাখ্যান] red button
    [বিস্তারিত দেখুন] gray button

On Approve:
  Cloud Function: adminApproveVehicle(vehicleId)
  → Updates brtc_status = "verified"
  → Sends FCM notification to user: "আপনার গাড়ি যাচাই হয়েছে ✓"

On Reject:
  Shows modal: Enter rejection reason
  → Updates status = "rejected"
  → Sends FCM notification with reason
```

---

### ADMIN PAGE 3: Dispute Resolution
**File**: `src/pages/DisputesPage.tsx`

**Layout:**
```
3-column kanban-style:
  [খোলা বিরোধ]     [পর্যালোচনাধীন]    [সমাধান হয়েছে]

Each dispute card:
  Dispute ID + User name + phone
  Gate name + Amount charged
  Reason (translated to English)
  Time submitted
  
  [বিবরণ দেখুন] → full detail modal:
    Transaction receipt
    Uploaded evidence images
    User description
    [রিফান্ড দিন] [প্রত্যাখ্যান করুন]
    Refund amount input (can be partial)
    Admin notes field

On Refund:
  Cloud Function: processDisputeRefund({disputeId, refundAmount, adminNote})
  → Atomic: credit wallet + update dispute status + send notification
```

---

### ADMIN PAGE 4: Analytics Page
**File**: `src/pages/AnalyticsPage.tsx`

**Sections:**

**A. Gate Heatmap:**
```
Bangladesh road map (SVG) with toll gate circles
Circle size = traffic volume
Circle color = revenue (light green = low, dark green = high)
Hover tooltip: gate name + stats
Date range filter
```

**B. Hourly Traffic Pattern:**
```
recharts LineChart
X-axis: 24 hours (12AM to 11PM)
Y-axis: vehicle count
Multiple lines: Mon, Tue, Wed... (different colors)
Shows peak hours clearly
```

**C. Revenue by Gate (sortable table):**
```
Gate Name | Daily Avg | Weekly | Monthly | YTD | Growth%
Export to CSV button
```

**D. Pass Analytics:**
```
Total active passes: {count}
Monthly renewal rate: {percent}
Revenue from passes vs individual tolls: pie chart
Expiring soon (next 7 days): {count} — sends reminder notifications
```

---

### ADMIN PAGE 5: Settings — Toll Rates
**File**: `src/pages/SettingsPage.tsx`

**Toll Rate Management:**
```
For each gate (dropdown):
  Per vehicle type, editable rate fields:
  
  Vehicle Type | Current Rate (৳) | New Rate | Action
  মোটরসাইকেল  |  ৳50             | [input]  | [Save]
  গাড়ি        |  ৳100            | [input]  | [Save]
  ...
  
  [সব গেটে একসাথে প্রয়োগ করুন] button (applies to all gates)

Pass Pricing:
  Monthly / Quarterly / Annual prices per vehicle type
  
App Configuration:
  Min deposit amount
  Low balance threshold
  App maintenance mode toggle
  Force update version
```

---

## PART C: ADVANCED FLUTTER FEATURES

### FEATURE 1: Route-based Toll Estimator

**New Screen:** `lib/features/toll_payment/presentation/screens/toll_estimator_screen.dart`

**UI:**
```
"যাত্রাপথ পরিকল্পনাকারী" title

From: [text input with location autocomplete]
To: [text input with location autocomplete]

[হিসাব করুন] button

Results (after calculation):
  Route map snippet (Google Maps static)
  
  Toll gates on this route (list):
    1. যাত্রাবাড়ী টোল — ৳100
    2. কাঁচপুর টোল — ৳100
    3. মেঘনা টোল — ৳150
  
  Total: ৳350 for [selected vehicle type]
  
  Your balance: ৳1,050 ✓ (sufficient)
  OR
  Your balance: ৳200 ✗ (৳150 কম — add money)
  
  [সরাসরি পেমেন্ট শুরু করুন] button (opens scanner)
```

**Cloud Function:**
```typescript
// functions/src/toll/estimateRouteTolls.ts
export const estimateRouteTolls = functions.https.onCall(async (data) => {
  const { originLat, originLng, destLat, destLng, vehicleType } = data;

  // Use Google Directions API to get route polyline
  const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${process.env.GOOGLE_MAPS_KEY}`;
  const routeResponse = await axios.get(directionsUrl);
  const polyline = routeResponse.data.routes[0].overview_polyline.points;

  // Decode polyline and check which toll gates fall within 500m of route
  const routePoints = decodePolyline(polyline);
  const allGates = await admin.firestore().collection('toll_gates').where('status', '==', 'active').get();

  const tollsOnRoute = [];
  for (const gateDoc of allGates.docs) {
    const gate = gateDoc.data();
    const gateLocation = gate.location; // GeoPoint
    
    // Check if any route point is within 500m of this gate
    const isOnRoute = routePoints.some(point =>
      haversineDistance(point, { lat: gateLocation.latitude, lng: gateLocation.longitude }) < 0.5
    );

    if (isOnRoute) {
      tollsOnRoute.push({
        gateId: gate.id,
        gateName: gate.name,
        roadName: gate.road_name,
        amount: gate.toll_rates[vehicleType] || 0,
        location: gate.location,
      });
    }
  }

  const totalAmount = tollsOnRoute.reduce((sum, t) => sum + t.amount, 0);
  return { tollsOnRoute, totalAmount };
});
```

---

### FEATURE 2: Family Account

**New Screens:**
- `lib/features/profile/presentation/screens/family_account_screen.dart`
- `lib/features/profile/presentation/screens/invite_member_screen.dart`

**UI — Family Account Screen:**
```
"পারিবারিক অ্যাকাউন্ট" title

If no family account:
  Illustration: family with car
  "পরিবারের সদস্যদের একই ওয়ালেট ব্যবহার করতে দিন"
  [পরিবার তৈরি করুন] button

If family account exists:
  Family name + edit
  
  Members list:
    [👤 মোহাম্মদ রহিম] [Admin] [আপনি]
    [👤 ফাতেমা বেগম] [সদস্য] [সরান] 
    [👤 রাহুল রহিম] [সদস্য] [সরান]
  
  [সদস্য যোগ করুন] button (sends invite via phone number)
  
  Shared wallet toggle:
    "শেয়ারড ওয়ালেট: সক্রিয়"
    "সদস্যরা আপনার ওয়ালেট ব্যালেন্স ব্যবহার করতে পারবে"
    
  Family vehicles tab: shows all vehicles of all members
```

---

### FEATURE 3: Live Gate Queue

**On the Scanner Screen (Phase 2), add queue info:**
```
After QR detection, before payment confirm:
  Show: "যাত্রাবাড়ী গেটে এখন ৫টি গাড়ি অপেক্ষায়"
  "আপনার আনুমানিক অপেক্ষা: ৩ মিনিট"
  [তবুও পেমেন্ট করুন] [অন্য গেট বেছে নিন]
```

**Real-time Queue (Firestore stream):**
```dart
// Queue updates every 30 seconds via Cloud Function
// Operator app can see and manage queue
// User app shows estimated wait time

final gateQueueProvider = StreamProvider.family<GateQueue, String>((ref, gateId) {
  return FirebaseFirestore.instance
      .collection('gate_queue')
      .doc(gateId)
      .snapshots()
      .map((doc) => GateQueue.fromFirestore(doc));
});
```

---

### FEATURE 4: Auto-renewal for Monthly Passes

**Cloud Function — scheduled, runs daily at midnight:**
```typescript
// functions/src/pass/autoRenewPasses.ts
export const autoRenewPasses = functions.pubsub
  .schedule('0 0 * * *') // midnight every day
  .timeZone('Asia/Dhaka')
  .onRun(async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find passes expiring tomorrow with auto_renew = true
    const expiringPasses = await admin.firestore().collection('passes')
      .where('status', '==', 'active')
      .where('auto_renew', '==', true)
      .where('valid_until', '<=', admin.firestore.Timestamp.fromDate(tomorrow))
      .get();

    for (const passDoc of expiringPasses.docs) {
      const pass = passDoc.data();
      const userRef = admin.firestore().collection('users').doc(pass.user_id);
      const userDoc = await userRef.get();
      const balance = userDoc.data()?.wallet_balance || 0;

      if (balance >= pass.price) {
        // Renew: deduct + extend validity
        await admin.firestore().runTransaction(async (tx) => {
          const newValidUntil = new Date(pass.valid_until.toDate());
          if (pass.pass_type === 'monthly') newValidUntil.setMonth(newValidUntil.getMonth() + 1);
          else if (pass.pass_type === 'quarterly') newValidUntil.setMonth(newValidUntil.getMonth() + 3);
          else newValidUntil.setFullYear(newValidUntil.getFullYear() + 1);

          tx.update(userRef, { wallet_balance: balance - pass.price });
          tx.update(passDoc.ref, { valid_until: admin.firestore.Timestamp.fromDate(newValidUntil) });
        });
        // Send FCM: "আপনার মাসিক পাস নবায়ন হয়েছে"
      } else {
        // Insufficient balance — cancel auto-renew, notify
        await passDoc.ref.update({ auto_renew: false, status: 'expired' });
        // Send FCM: "অপর্যাপ্ত ব্যালেন্সের কারণে পাস নবায়ন হয়নি"
      }
    }
  });
```

---

### FEATURE 5: Notification Center (Full Implementation)

**New Screen:** `lib/features/home/presentation/screens/notification_screen.dart`

**UI:**
```
"বিজ্ঞপ্তি" title
[সব পড়া হিসেবে চিহ্নিত করুন] button (top right)

Grouped list:
  "আজ"
    [🟢] "ওয়ালেটে ৳500 যোগ হয়েছে" — "৩:৪৫ PM" — tapped = read
    [🟡] "আপনার পাস ৩ দিনে মেয়াদ শেষ হবে" — "১১:২০ AM" — new (bold)
  
  "গতকাল"
    [🔵] "যাত্রাবাড়ী টোল পরিশোধ সম্পন্ন — ৳100" — "গতকাল ৫:১৫ PM"
    [🔴] "বিরোধ #DSP-001 সমাধান হয়েছে — ৳100 রিফান্ড" — "গতকাল ২:০০ PM"

Notification types and icons:
  💰 wallet_credit → green circle
  🛣️ toll_payment → orange road circle
  ⚠️ low_balance → red warning circle
  📋 pass_expiry → yellow calendar circle
  ✅ dispute_resolved → blue checkmark circle
  📢 system → gray bell circle

Tapping a notification:
  toll_payment → go to ReceiptDetailScreen
  low_balance → go to AddMoneyScreen
  pass_expiry → go to PassStoreScreen
  dispute_resolved → go to DisputeScreen
  Mark as read in Firestore
```

---

### FEATURE 6: NID Verification

**New Screen:** `lib/features/profile/presentation/screens/nid_verification_screen.dart`

**UI:**
```
Header: "জাতীয় পরিচয়পত্র যাচাই"
"নিরাপদ যাচাই — আপনার তথ্য সুরক্ষিত থাকবে"

NID Number field: 10 or 17 digit
Date of Birth picker

Upload NID Front photo:
  Dashed upload area, camera icon
  "সামনের দিক"

Upload NID Back photo:
  "পেছনের দিক"

Take Selfie:
  "আপনার একটি সেলফি তুলুন"
  (liveness check — smile detection using camera)

[জমা দিন] button

Status states:
  Pending: "যাচাই প্রক্রিয়াধীন... ১-২ কার্যদিবস লাগবে"
  Verified: "✓ NID যাচাইকৃত" — green badge in profile
  Rejected: "প্রত্যাখ্যাত: {reason}" — resubmit option

Benefits of NID verification:
  ✓ উচ্চতর দৈনিক লেনদেন সীমা
  ✓ বিরোধ দাখিলে অগ্রাধিকার
  ✓ ক্রেডিট-টোল বৈশিষ্ট্য (পরে আসবে)
```

---

### FEATURE 7: Help & FAQ

**New Screen:** `lib/features/profile/presentation/screens/help_screen.dart`

**UI:**
```
Search bar: "কিছু খুঁজুন..."

Quick help cards:
  [💳 কিভাবে টাকা যোগ করবেন]
  [🚗 গাড়ি কিভাবে যোগ করবেন]
  [🛣️ টোল পেমেন্ট সমস্যা]
  [📋 মাসিক পাস সম্পর্কে]

FAQ accordion (expandable):
  Q: "QR কোড স্ক্যান হচ্ছে না কেন?"
  A: "নিশ্চিত করুন যে... (explanation)"
  
  Q: "আমার টাকা কাটা গেছে কিন্তু গেট খুলেনি"
  A: "এটি একটি সাময়িক সমস্যা... (explanation + dispute link)"

Contact options:
  [📞 কল করুন] 16XXX (hotline)
  [💬 লাইভ চ্যাট] (opens in-app chat or WhatsApp)
  [✉️ ইমেইল করুন] support@tollbd.app

App version + build number at bottom
Rate us: [⭐⭐⭐⭐⭐] — opens Play Store / App Store
```

---

## ADDITIONAL CLOUD FUNCTIONS — PHASE 3

```typescript
// functions/src/index.ts — Add these exports:

export { estimateRouteTolls } from './toll/estimateRouteTolls';
export { autoRenewPasses } from './pass/autoRenewPasses';
export { sendPassExpiryReminders } from './pass/sendPassExpiryReminders';
export { adminApproveVehicle } from './admin/adminApproveVehicle';
export { adminRejectVehicle } from './admin/adminRejectVehicle';
export { processDisputeRefund } from './admin/processDisputeRefund';
export { updateDailyAnalytics } from './analytics/updateDailyAnalytics';
export { createFamilyAccount } from './family/createFamilyAccount';
export { inviteFamilyMember } from './family/inviteFamilyMember';
export { submitNIDVerification } from './auth/submitNIDVerification';

// Scheduled functions:
export { autoRenewPasses } from './pass/autoRenewPasses';
// runs daily at midnight Dhaka time

export { updateDailyAnalytics } from './analytics/updateDailyAnalytics';
// runs every hour to aggregate analytics_daily collection
```

---

## UPDATED FIRESTORE SECURITY RULES (Final Version)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isLoggedIn() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }
    function isAdmin() {
      return request.auth != null &&
        request.auth.token.admin == true; // Set via Admin SDK custom claims
    }

    match /users/{userId} {
      allow read, write: if isLoggedIn() && isOwner(userId);
      allow read: if isAdmin();
    }

    match /transactions/{txId} {
      allow read: if isLoggedIn() && request.auth.uid == resource.data.user_id;
      allow write: if false;
    }

    match /vehicles/{vehicleId} {
      allow read: if isLoggedIn() && request.auth.uid == resource.data.owner_uid;
      allow read: if isAdmin();
      allow create: if isLoggedIn() && request.auth.uid == request.resource.data.owner_uid;
      allow update: if isLoggedIn() && request.auth.uid == resource.data.owner_uid
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['brtc_status', 'brtc_data']);
      allow delete: if isLoggedIn() && request.auth.uid == resource.data.owner_uid;
    }

    match /toll_gates/{gateId} {
      allow read: if isLoggedIn();
      allow write: if isAdmin();
    }

    match /toll_payments/{paymentId} {
      allow read: if isLoggedIn() && request.auth.uid == resource.data.user_id;
      allow read: if isAdmin();
      allow write: if false;
    }

    match /passes/{passId} {
      allow read: if isLoggedIn() && request.auth.uid == resource.data.user_id;
      allow write: if false;
    }

    match /disputes/{disputeId} {
      allow read: if isLoggedIn() && request.auth.uid == resource.data.user_id;
      allow read: if isAdmin();
      allow create: if isLoggedIn() && request.auth.uid == request.resource.data.user_id;
      allow update: if isAdmin();
    }

    match /gate_operators/{uid} {
      allow read: if isLoggedIn() && request.auth.uid == uid;
      allow read, write: if isAdmin();
    }

    match /analytics_daily/{docId} {
      allow read: if isAdmin();
      allow write: if false;
    }

    match /family_accounts/{familyId} {
      allow read: if isLoggedIn() &&
        resource.data.members.hasAny([{'uid': request.auth.uid}]);
      allow write: if false;
    }

    match /notifications_log/{notifId} {
      allow read: if isLoggedIn() && request.auth.uid == resource.data.user_id;
      allow update: if isLoggedIn() && request.auth.uid == resource.data.user_id
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['is_read', 'read_at']);
      allow create, delete: if false;
    }

    match /app_config/{doc} {
      allow read: if isLoggedIn();
      allow write: if isAdmin();
    }
  }
}
```

---

## FIREBASE REALTIME DATABASE STRUCTURE

```json
{
  "gates": {
    "{gateId}": {
      "status": "active",
      "open_signal": {
        "userId": "string",
        "vehicleId": "string",
        "paymentId": "string",
        "plate": "DHAKA GA 11-1111",
        "timestamp": 1234567890
      },
      "queue_count": 5,
      "last_updated": 1234567890
    }
  }
}
```

**Realtime Database Rules:**
```json
{
  "rules": {
    "gates": {
      "$gateId": {
        ".read": "auth != null",
        "open_signal": {
          ".write": false
        },
        "queue_count": {
          ".read": "auth != null",
          ".write": false
        }
      }
    }
  }
}
```

---

## ENVIRONMENT VARIABLES SUMMARY

**Firebase Cloud Functions config:**
```bash
firebase functions:config:set \
  sslcommerz.store_id="YOUR_STORE_ID" \
  sslcommerz.store_password="YOUR_STORE_PASSWORD" \
  sslcommerz.sandbox="true" \
  google.maps_key="YOUR_GOOGLE_MAPS_KEY" \
  app.qr_secret="YOUR_32_CHAR_RANDOM_SECRET" \
  brtc.api_key="PENDING_UNTIL_API_AVAILABLE" \
  brtc.base_url="https://api.brtc.gov.bd/v1"
```

**Flutter `.env` file (use flutter_dotenv):**
```
GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_KEY
SSLCOMMERZ_SANDBOX=true
APP_ENV=development
```

---

## PHASE 3 DELIVERABLES CHECKLIST

**Operator App:**
- [ ] Separate Flutter project tollbd_operator created
- [ ] Operator login with Firebase Auth
- [ ] Gate dashboard (landscape tablet layout)
- [ ] Live transaction feed via Firestore stream
- [ ] Gate open/close control via Realtime Database
- [ ] Manual toll entry screen
- [ ] Operator reports screen (daily summary)

**Admin Web Dashboard:**
- [ ] React project tollbd_admin created with TypeScript
- [ ] Admin login (email/password with custom claims)
- [ ] Overview dashboard with 4 KPI cards
- [ ] Revenue bar chart (recharts)
- [ ] Traffic pie chart
- [ ] Top gates table
- [ ] Vehicle verification page (approve/reject)
- [ ] Dispute resolution kanban
- [ ] Analytics page with heatmap
- [ ] Toll rate settings management
- [ ] App config settings

**Advanced Flutter Features:**
- [ ] Route-based Toll Estimator screen
- [ ] Google Directions API integration via Cloud Function
- [ ] Family Account creation and management
- [ ] Invite family member via phone number
- [ ] Live Gate Queue display
- [ ] Auto-renewal scheduled Cloud Function
- [ ] Full Notification Center screen
- [ ] NID Verification screen with 3-photo upload
- [ ] Help & FAQ screen with search
- [ ] In-app rating prompt (after 5th toll payment)

**Cloud Functions:**
- [ ] estimateRouteTolls
- [ ] autoRenewPasses (scheduled, nightly)
- [ ] sendPassExpiryReminders (scheduled, daily)
- [ ] adminApproveVehicle
- [ ] adminRejectVehicle
- [ ] processDisputeRefund
- [ ] updateDailyAnalytics (scheduled, hourly)
- [ ] createFamilyAccount
- [ ] inviteFamilyMember
- [ ] submitNIDVerification

**Infrastructure:**
- [ ] Final Firestore security rules deployed
- [ ] Realtime Database rules deployed
- [ ] All new Firestore indexes created
- [ ] Admin custom claims set via Admin SDK
- [ ] All environment variables configured
- [ ] Firebase App Check enabled (prevents unauthorized API calls)
- [ ] Performance monitoring enabled

---

## FINAL PROJECT SUMMARY

```
TollBD — Complete Feature List
══════════════════════════════

Phase 1 (Auth + Wallet):
  ✓ Phone OTP login
  ✓ Biometric unlock
  ✓ Digital wallet
  ✓ SSLCommerz deposit (bKash, Nagad, Rocket, Card, Net Banking)
  ✓ Transaction history
  ✓ Push notifications
  ✓ Bengali + English bilingual

Phase 2 (Core Features):
  ✓ Vehicle registration with BRTC API layer
  ✓ QR code toll payment
  ✓ Monthly/Quarterly/Annual passes
  ✓ FastPass lane support
  ✓ Trip history + digital receipts
  ✓ PDF receipt generation
  ✓ Dispute system
  ✓ Offline QR mode
  ✓ Nearby gates map

Phase 3 (Advanced):
  ✓ Operator tablet app
  ✓ Admin web dashboard
  ✓ Revenue analytics
  ✓ Route toll estimator
  ✓ Family accounts
  ✓ Live gate queue
  ✓ Auto-renewal passes
  ✓ NID verification
  ✓ Help & FAQ
══════════════════════════════
```

---

*All 3 phases complete. TollBD is production-ready.*    