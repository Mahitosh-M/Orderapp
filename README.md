# Partner Order

Customer-facing wholesale pharmaceutical ordering PWA built as a separate React, TypeScript, Vite and Firebase project.

## Stack

React, TypeScript, Vite, React Router, Cloud Firestore, Firebase Hosting, IndexedDB via `idb`, `vite-plugin-pwa`, `lucide-react`, Vitest and React Testing Library.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Fill `.env` with the separate Ordering App Firebase web app values. Do not reuse the ERP/CRM Firebase project and do not add Admin SDK credentials to this browser app.

## Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

## Firebase

Firestore collections:

- `customers/{uid}`: active customer/admin profiles.
- `orders/{orderId}`: one submitted order document containing a snapshot of public product fields and quantities.

The login page has been removed. The app now expects launch parameters from CISapp for the customer or staff name and role.

Admin access in the UI comes from the CISapp launch role, but production Firestore rules still require a secure Firebase Auth custom claim for protected order reads: `request.auth.token.admin == true`. A URL parameter is only for routing the UI and must not be treated as secure authorization for Firestore data.

## CISapp Launch

Ordering App is intended to be opened from `https://cisapp-236ab.web.app/` with two query parameters:

```text
https://orderapp-35200.web.app/?name=CUSTOMER_OR_STAFF_NAME&role=customer
https://orderapp-35200.web.app/?name=MEDICAL_NAME&role=medical
https://orderapp-35200.web.app/?name=STAFF_NAME&role=staff
```

The app accepts `name`, `customerName`, or `userName` for the display name. The `role` value must be `customer`, `medical`, or `staff`.

Launches with parameters are accepted only when the browser referrer is `cisapp-236ab.web.app`. After a valid launch, the session is stored in `sessionStorage` so in-app navigation and refreshes continue without repeating the launch parameters.

- `customer` opens the mobile-first ordering experience and uses `customerName` in the customer UI.
- `medical` opens the same ordering experience as a customer and preserves the Medical launch role.
- `staff` opens `/staff/orders` and only exposes order-management navigation.

## Catalogue

Catalogue data is loaded from public static files:

- `/catalogue/catalogue-version.json`
- `/catalogue/catalogue.json`

The catalogue is cached in IndexedDB database `partner-order-cache`. The app reads cached data first, checks the small version file, and downloads the full catalogue only when needed or when manually refreshed.

Product data must never include selling price, purchase price, net rate, cost, margin, supplier, or internal notes. MRP is shown only as an MRP reference.

## Hosting

Firebase Hosting is configured for Vite output in `dist` with SPA rewrites and cache headers for HTML, Vite assets, and catalogue files.

Later deployment:

```bash
npm run build
firebase login
firebase use --add
firebase deploy
```

GitHub deployment is configured from branch `main`. On every push or merge to `main`, GitHub Actions runs checks, builds the Vite app, and deploys `dist` to Firebase Hosting.

Required GitHub secret:

```text
FIREBASE_SERVICE_ACCOUNT_ORDERAPP_35200
```

The secret value must be the full JSON service-account key for Firebase project `orderapp-35200`.

## PWA

The app includes a manifest, service worker, install guidance, standalone display mode, theme colors, offline shell caching, and static catalogue/offers caching. Customer order data is not cached globally by the service worker.

## Known Limitations

- No public registration or login page.
- No account-management UI.
- Admin custom claims must be created securely outside this app.
- No ERP SSO yet.
- Offline checkout is disabled rather than queued.
- Images use external URLs.

## Future SSO

Future ERP SSO requires secure backend token exchange, documented in `FUTURE_INTEGRATION.md`.

## Environment configuration

Copy `.env.example` to `.env.local` and set each configuration variable to a single-line JSON object copied from Firebase's web app settings. Only apiKey, authDomain, projectId, storageBucket, messagingSenderId and appId are allowed. Local configuration is ignored by Git.

Required GitHub Actions secrets (same JSON values as local configuration):
- `VITE_FIREBASE_CONFIG`

Set these repository secrets before merging or deploying. Existing deployment service-account secrets remain separate. Firebase web configuration is public and will be included in browser bundles; environment variables keep its values out of source control, not hidden from browser users. Never place passwords, private keys, service-account JSON, access tokens or server API keys in any VITE_* variable. Keep those in server-only environment variables or a secret store. Existing Git history is unchanged; rotate real leaked credentials before any coordinated history cleanup.

## Shared background component

Reusable shadcn-style components live in `src/components/ui`, exposed as `@/components/ui` by Vite and TypeScript. This folder and the aliases in `components.json` give the shadcn CLI a consistent installation target without moving existing components. Existing app styles remain in their original files; `src/background.css` contains the Tailwind utilities and background integration.

TypeScript is already installed. Tailwind v4 is configured through `@tailwindcss/vite`; Preflight is omitted to preserve existing forms and tables. The equivalent dependency command is `npm install clsx tailwind-merge && npm install -D tailwindcss @tailwindcss/vite`. The shadcn configuration is already present; use `npx shadcn@latest add <component>` to add components later. For a fresh project, use `npx shadcn@latest init`.

`Hero` and `HeroDemo` require no data, state, providers, images or icons. `AppBackground` mounts the decorative gradient behind all routes, fills desktop/mobile viewports, and never intercepts pointer input.
