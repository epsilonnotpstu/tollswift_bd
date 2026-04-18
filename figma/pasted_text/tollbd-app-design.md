Design a complete, production-ready mobile app UI for "TollBD" — 
Bangladesh's first smart digital toll payment system for the Android 
and iOS platform. The app should feel modern, trustworthy, and 
distinctly Bangladeshi without being clichéd.

━━━━━━━━━━━━━━━━━━━━━━━━━━
BRAND IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━
App name: TollBD
Tagline: "স্মার্ট টোল, সহজ যাত্রা" (Smart Toll, Easy Journey)

Primary color: #006A4E (Bangladesh deep green)
Accent color: #F42A41 (Bangladesh red — use sparingly for CTAs)
Background: #F7F8FA (off-white surface)
Card surface: #FFFFFF
Text primary: #1A1A2E
Text secondary: #6B7280
Success: #10B981
Warning: #F59E0B
Error: #EF4444

Typography:
- Headings: Hind Siliguri Bold (Bengali + Latin support)
- Body: Inter Regular / Medium
- Numbers/Amounts: Roboto Mono (for BDT amounts)

Design inspiration: Combine the clean minimalism of Google Pay 
with the trust indicators of bKash, the card-based layout of 
Rapido, and the dashboard style of N26 bank app.

━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREENS TO DESIGN (27 screens)
━━━━━━━━━━━━━━━━━━━━━━━━━━

ONBOARDING (4 screens):
1. Splash screen — TollBD logo on deep green, animated highway silhouette
2. Language select — বাংলা / English toggle, flag icons
3. Phone OTP screen — Bangladesh +880, clean input, 6-digit OTP
4. Biometric setup screen — fingerprint/face ID prompt

HOME & DASHBOARD (3 screens):
5. Home screen — 
   - Greeting with user name (বাংলায়)
   - Wallet balance card (large, green gradient card showing ৳ amount)
   - Quick actions row: Pay Toll | Add Money | History | Pass
   - Active vehicle pill (car icon + plate number)
   - Recent transactions list (last 3)
   - Upcoming tolls on my route (map snippet)
   - Low balance warning banner (if < ৳200)

6. Wallet detail screen —
   - Balance with large Roboto Mono number
   - Add money button (prominent red CTA)
   - Mini transaction graph (last 30 days)
   - Transaction list with filter chips: All | Toll | Deposit | Refund

7. Notification center — grouped by Today, This Week

TOLL PAYMENT (4 screens):
8. Pay Toll screen —
   - QR code scanner (full-screen camera with green border frame)
   - Manual toll code entry option
   - Nearby toll gates map (using Google Maps widget)

9. Payment confirmation —
   - Toll gate name + location
   - Vehicle selected (plate number)
   - Toll amount (large)
   - Wallet balance after payment
   - "Confirm & Pay" big green button
   - Cancel link

10. Payment success —
    - Green checkmark animation circle
    - "Toll Paid! Gate Opening..." message
    - Transaction ID
    - Receipt download button
    - Share receipt option

11. Payment failed screen —
    - Red X with reason (Insufficient balance / Network error)
    - Retry or Add Money buttons

VEHICLE MANAGEMENT (3 screens):
12. My Vehicles list —
    - Cards per vehicle: icon + plate + type + status badge
    - Active vehicle highlighted with green border
    - Add Vehicle FAB button

13. Add Vehicle screen —
    - Vehicle type selector: Motorcycle | Car | CNG | Truck | Bus
    - Registration number field (BD format: DHAKA METRO GA 11-1111)
    - Owner name field
    - BRTC verify button (shows "Verifying via BRTC..." loader, then 
      green verified badge OR "Manual approval pending" amber badge)
    - Upload registration doc (photo picker)
    - Vehicle color picker

14. Vehicle detail — all info + toll history for that vehicle

WALLET / PAYMENTS (3 screens):
15. Add Money screen —
    - Amount quick-select chips: ৳100 ৳200 ৳500 ৳1000 ৳2000
    - Custom amount input
    - Payment method cards:
      * bKash (pink)
      * Nagad (orange)  
      * Rocket (purple)
      * Debit/Credit Card via SSLCommerz (blue)
      * Internet Banking (gray)
    - "Proceed" CTA

16. SSLCommerz webview wrapper screen — with TollBD top bar
17. Transaction receipt — PDF-style receipt card, downloadable

MONTHLY PASS (2 screens):
18. Pass store — 
    - Pass cards: Monthly ৳500 | Quarterly ৳1300 | Annual ৳4500
    - Per vehicle or family plan toggle
    - FastPass lane badge on each card
    - Benefits list per pass type

19. My Passes — active passes with expiry countdown ring

TRIP & HISTORY (2 screens):
20. Trip history —
    - Timeline view showing toll gates passed
    - Date filter, vehicle filter
    - Map route preview per trip
    - Total spent this month summary

21. Receipt detail — full digital receipt with QR for dispute

PROFILE & SETTINGS (3 screens):
22. Profile screen —
    - Avatar + name + phone
    - NID verification status badge
    - Language toggle বাংলা/English
    - Notification preferences
    - Help & Support

23. Settings — biometrics, PIN change, linked accounts
24. Help & Dispute screen — "Report Wrong Charge" form

ADMIN / OPERATOR (3 screens — tablet layout):
25. Toll gate dashboard — live vehicle count, revenue today, 
    gate status (Open/Closed/Maintenance), recent transactions feed

26. Manual toll entry — plate number lookup, manual charge override
27. Report screen — daily/weekly revenue bar charts

━━━━━━━━━━━━━━━━━━━━━━━━━━
UI COMPONENT SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━
Create a shared component library with:

- Balance Card: glassmorphism-style on #006A4E gradient, 
  white text, subtle highway watermark SVG in background
- Transaction Row: left icon (colored by type) + merchant name 
  + timestamp + amount (green for deposit, red for deduct)
- Vehicle Card: license plate in BD yellow-black style font
- Toll Gate Chip: location pin + gate name + road name
- Status Badge: Verified (green) | Pending (amber) | Rejected (red)
- Bottom Nav: 5 tabs — Home | Pay | Vehicles | History | Profile
- FAB: red circle, white + icon, for Add Vehicle / Pay Toll
- OTP Input: 6 large rounded boxes, auto-focus, green fill on entry
- Amount Input: large ৳ prefix, Roboto Mono, green underline style
- Loading State: green skeleton shimmer for all cards

━━━━━━━━━━━━━━━━━━━━━━━━━━
INTERACTION NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━
- Payment success: scale + fade-in checkmark, confetti optional
- QR scanner: animated green corner brackets that pulse
- Gate opening: animated barrier GIF/Lottie embedded in success screen
- Balance card: tap to show/hide balance (privacy mode)
- Swipe left on transaction for "Dispute" action
- Pull to refresh on home and history screens
- Haptic feedback on payment confirmation

━━━━━━━━━━━━━━━━━━━━━━━━━━
LAYOUT SPECS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Frame size: 390 × 844 px (iPhone 14 standard)
Also create: 360 × 800 px (Android standard)
Grid: 16px margin, 8px gutter, 4-column
Border radius: 12px cards, 8px buttons, 100px pills
Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px
Shadow: 0 2px 12px rgba(0,0,0,0.08) on cards
Status bar: always show — use Figma's status bar component

━━━━━━━━━━━━━━━━━━━━━━━━━━
FIGMA FILE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━
Page 1: 🎨 Design System (colors, typography, components)
Page 2: 📱 User Flows (onboarding → payment → history)
Page 3: 🖥️ All Screens — Mobile
Page 4: 💻 Admin Dashboard — Tablet
Page 5: 🔄 Prototypes & Interactions
Page 6: 📐 Handoff Specs

Naming convention: [Section]/[ScreenName]/[State]
Example: Wallet/AddMoney/Default, Wallet/AddMoney/bKash-selected

Auto-layout: Use throughout. No fixed-position elements except FAB.
Variables: Create Figma Variables for all colors and spacing tokens.