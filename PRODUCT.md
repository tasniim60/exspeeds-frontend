# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: ops teams + shippers/sellers (e-commerce merchants) doing daily parcel work. #1 job on login → dashboard: see where every shipment stands, create/dispatch new shipments, track in real time, resolve exceptions fast. Secondary: end recipients tracking via tracking/AWB links.

## Product Purpose

XSPEED — Express Logistics & Technology Platform. Fastest regional express delivery across Egypt + GCC with automated dispatching, real-time tracking, and full supply-chain visibility across 220+ global branches. Success = shipper dispatches in seconds, always knows parcel state, ops clears exceptions without hunting.

## Positioning

Speed + live visibility you can act on: automated dispatch meets real-time tracking across 220+ branches, Egypt/GCC-first, bilingual AR/EN by default. A neighboring courier cannot truthfully copy the combined automated-dispatch + live-telemetry + Egypt/GCC network story.

## Operating Context

Daily workflows: login → command-center dashboard (stats, AWB shipments, client orders, CRM, invoices, warehouse, telemetry, reports) → ship/create → track → exception handling. Environments: desktop ops back-office + mobile shippers; Arabic RTL default, English LTR alternate. Tools: AWB/waybill numbers (LTR-preserved), COD, customs clearance docs, WhatsApp/phone support (+201208027171).

## Capabilities and Constraints

Confirmed functionality: Next.js 14 App Router `[locale]` (ar/en), next-auth + backend login, admin command center, client portal, public tracking/blog, PDF/XLSX reporting. Constraints: UI-only overhaul — no logic/API/auth/i18n-key changes; preserve all routes, roles, forms, validation; bilingual AR-RTL/EN-LTR with Cairo font required; tracking numbers/codes stay LTR.

Undecided: exact dashboard IA grouping (preserve current groupings unless user approves change).

## Brand Commitments

Name: XSPEED / إكس سبيد (exspeeds.com). Binding visual constraint from user: keep latte/offwhite + dark orange family only — offwhite/latte grounds (#FFFFFF, #F9FAFB, #F3F4F6 + latte tint), dark orange accent (#C45B2A, #D4723F light, #A34920 deep), ink #251516. Existing voice: fast, reliable, regional. Assets: `/assets/Favlogo-DSIHncWK.png`, `/assets/xspeed_about_showcase.jpg`.

## Evidence on Hand

Real: runnable Next.js codebase at `src/app/[locale]` (auth login/register/forgot, admin, client, dashboard→/admin redirect, public), design tokens in `tailwind.config.js` + `src/app/globals.css`, trilingual SEO/metadata in `src/app/[locale]/layout.tsx`. No invented testimonials, prices, or benchmarks — do not fabricate.

## Product Principles

1. Speed is the product — every screen must answer "where is my parcel" in seconds.
2. Bilingual by default — AR-RTL parity is a correctness issue, not a variant.
3. Ops + shipper share one truth — dashboard, tracking, and admin read the same shipment state.
4. Comfort under load — high-volume scanning days stay legible, calm, tappable.
5. No logic risk — visual overhaul never breaks auth, dispatch, or reporting flows.

## Accessibility & Inclusion

Bilingual AR (Cairo, RTL, letter-spacing normal) / EN (LTR); LTR-preserved tracking numbers/codes; keyboard-focusable auth + dashboard controls; target WCAG 2.2 AA contrast on orange-on-latte combinations.
