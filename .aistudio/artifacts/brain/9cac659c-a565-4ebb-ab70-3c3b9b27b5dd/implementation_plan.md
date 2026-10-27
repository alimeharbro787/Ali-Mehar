# AMAN Baby Care & Home Services Platform (Riyadh)

A comprehensive, dual-experience digital system connecting Riyadh families with licensed pediatric nurses and home care attendants, backed by a real-time Maternal & Infant Operations Center and Services CMS.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned via interactive clarifications and will guide the implementation:
>
> - **Top Navigation Mode Switcher**: Seamless switcher in the top navigation bar allowing one-click transitions between the public client portal (**AMAN Baby Care**) and the administrative hub (**Maternal & Infant Operations Center** & **Services CMS**).
> - **Live Reactive State Synchronization**: Public care bookings submitted by families immediately propagate to the Operations Center active booking roster with live notifications, status updates, and vitals tracking.
> - **Full Bilingual Experience (English & RTL Arabic)**: Instant language switching with complete bidirectional support across both the public website and the administrative operations/CMS screens.

---

## 1. Overview & Core Concept

AMAN Baby Care & Home Services provides hospital-grade, gentle in-home maternity and infant nursing care across Riyadh, Saudi Arabia (Al-Nakheel, Al-Malqa, Diplomatic Quarter, Hittin, Al-Sahafa). 

The platform features two integrated screens and workflows:
1. **Public Family Portal**: An elegant, reassuring maternity care website featuring the 6 signature newborn services, 7 home & lifestyle offerings, interactive service category filtering, 3 customized care packages, family testimonials, interactive FAQs accordion, and a 3-step interactive In-Home Care Booking wizard with direct WhatsApp integration.
2. **Operations & CMS Hub**: A high-density administrative operations center for the Riyadh care coordination team (led by Fatima Al-Otaibi), featuring live shift scheduling, caregiver dispatch roster, interactive booking detail drawers with infant vitals tracking, catalog CMS controls with live publishing, care package pricing managers, seasonal campaign schedulers, and dynamic QR code generation for clinic displays.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme (Royal Sanctuary Care)
- **Palette**:
  - Primary: Deep Forest Green (`#064E3B`, `#003527`) representing clinical security, health, and serene maternal dignity.
  - Secondary Accent: Warm Rose / Magenta (`#BE185D`, `#FD4E8A`) for high-priority maternal alerts and tender infant highlights.
  - Soft Canvas: Warm Cream / Ivory (`#FAF8F5`, `#F9F9F7`) eliminating harsh clinical white.
  - Trust Highlights: Emerald & Mint (`#059669`, `#10B981`) for verified licenses and MOH certified protocols.
  - Accents: Royal Warm Gold (`#D97706`, `#F59E0B`) for VIP tiers and verification seals.
- **Typography**:
  - Display / Hero Headlines: **Playfair Display** (600/700 weight) for editorial grace, maternal warmth, and executive authority.
  - Interface & Data Body: **Plus Jakarta Sans** (400/500/600/700 weight) with tabular figures (`tabular-nums`) for dense medical rosters, shift schedules, and pricing matrices.
- **RTL & Bilingual Engine**: Complete layout mirroring (`dir="rtl"`, mirrored icons, flipped spatial padding, and Arabic typography) across both public and administrative views.

### Screen Layouts & User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP GLOBAL BAR: [Live Riyadh Hub Status]  [EN / العربية]  [View Switcher: Public / Ops] │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     SCREEN 1: PUBLIC PORTAL     │         │     SCREEN 2: OPS & CMS HUB     │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ • Sticky Nav + WhatsApp CTA     │         │ • Sub-Bar Alert Ticker & Vitals │
│ • Hero Split (Cradling Photo)   │         │ • Riyadh Operations Hero Banner │
│ • 3 Trust Badges (Safe/Loving)  │         │ • 4 High-Impact KPI Stat Cards  │
│ • 6 Newborn Care Services       │         │ • Tab Switcher:                 │
│ • 7 Home & Lifestyle Services   │         │   1. Bookings & Live Scheduling │
│ • Interactive Category Filter   │         │   2. Services Catalog CMS       │
│ • Riyadh Landmarks Ribbon       │         │   3. Packages & Pricing Manager │
│ • Hospital-Grade Warmth Story   │         │   4. Seasonal Events Roster     │
│ • 3 Care Packages (Interactive) │         │   5. Location & Dynamic QR      │
│ • Family Testimonials Carousel  │         │   6. Backend & Security Status  │
│ • Expandable FAQs Accordion     │         │ • Slide-out Care Vitals Drawer  │
│ • Interactive 3-Step Booking    │         │ • Manual Family Booking Modal   │
│ • Footer with Riyadh Zones      │         │ • Service Node Editor Modal     │
└─────────────────────────────────┘         └─────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Unified React State vs. Isolated Screens**:
  - *Decision*: A unified shared client-side store manages both live public booking submissions and the operations dashboard schedule.
  - *Rationale*: When a family books care through the public portal, the Operations Center immediately reflects the new booking with live badge increments, urgent triage flags, and caregiver assignment prompts.
- **Bilingual RTL Architecture**:
  - *Decision*: Direct reactive translation dictionary with bidirectional document flow manipulation (`dir="rtl"` / `dir="ltr"`).
  - *Rationale*: Eliminates external library overhead while guaranteeing zero layout clipping on mirrored cards, Arabic numeral formatting, and RTL table headers.
- **Direct WhatsApp Deep Linking**:
  - *Decision*: Every booking submission dynamically formats a pre-filled, URI-encoded WhatsApp message containing the booking reference code (`#BK-XXXX`), chosen shift duration, district, and clinical notes, ready to launch the official concierge chat.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REACT SPA (Vite)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  AppContext (Locale: EN/AR, CurrentScreen, BookingsStore, CatalogStore)     │
│                                                                             │
│  ┌─────────────────────────────┐     ┌───────────────────────────────────┐  │
│  │     PublicPortalView        │     │         OpsConsoleView            │  │
│  │                             │     │                                   │  │
│  │ • HeroSection               │     │ • OpsHeader & KPIStrip            │  │
│  │ • ServicesGrid (13 items)   │     │ • BookingsTable (Filter/Search)   │  │
│  │ • PackagesSection           │     │ • VitalsDetailDrawer              │  │
│  │ • InteractiveBookingModal   │     │ • ServicesCmsEditor               │  │
│  │ • FaqAccordion              │     │ • PricingTiersManager             │  │
│  │ • ContactAndFooter          │     │ • LocationQrGenerator             │  │
│  └──────────────┬──────────────┘     └─────────────────┬─────────────────┘  │
│                 │                                      │                    │
│                 └──────────────┐        ┌──────────────┘                    │
│                                ▼        ▼                                   │
│                        ┌───────────────────────┐                            │
│                        │    Shared Data API    │                            │
│                        │  • Initial Bookings   │                            │
│                        │  • Riyadh Districts   │                            │
│                        │  • Catalog Schema     │                            │
│                        │  • WhatsApp Formatter │                            │
│                        └───────────────────────┘                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Entities & Schema
- **BookingRecord**: `id`, `ref` (`#BK-XXXX`), `familyName`, `clientPhone`, `serviceId`, `packageTitle`, `shiftDuration`, `district`, `status` (`in_progress`, `scheduled`, `urgent`, `contract_active`), `assignedNurse` (name, credential), `vitals` (feeding, sleep, temperature, cordStatus), `urgentDispatch` (boolean), `createdAt`.
- **ServiceItem**: `id`, `category` (`newborn` | `lifestyle`), `titleEn`, `titleAr`, `taglineEn`, `taglineAr`, `descriptionEn`, `descriptionAr`, `image`, `badge`, `isActive`.
- **PricingPackage**: `id`, `tierKey`, `titleEn`, `titleAr`, `subtitleEn`, `subtitleAr`, `priceSar`, `shiftDescriptionEn`, `shiftDescriptionAr`, `inclusionsEn`, `inclusionsAr`, `isFeatured`.

---

## 5. Verification & Implementation Steps

1. **Step 1: Core Localization & Data Store Setup**: Implement bilingual dictionaries (English and Arabic), types, mock data seeding (28 Riyadh active bookings, 13 verified services), and state management hooks.
2. **Step 2: Public Client Portal Implementation**: Build the responsive landing page mirroring reference HTML and images, featuring responsive grid layouts, service filters, package cards, and testimonials.
3. **Step 3: 3-Step Care Booking Wizard**: Implement the interactive multi-step booking modal with real validation, district dropdowns, pricing calculators, and WhatsApp dispatch integration.
4. **Step 4: Operations Center & Live Scheduling**: Build the executive administrative console with KPI stat cards, searchable bookings data table, caregiver assignments, and vitals detail drawer.
5. **Step 5: Services CMS & Pricing Tier Manager**: Build the catalog CMS with live toggles, bilingual copy editing, pricing tier updating, and dynamic QR code generation.
6. **Step 6: Top Bar Navigation & Mode Switcher**: Integrate one-click view switching, notification toasts, and full RTL layout validation.
7. **Step 7: Verification**: Run `compile_applet` and `lint_applet` to confirm clean compilation with zero warnings.
