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

The login page has been removed. The app now expects launch parameters from CISapp for the customer name and role.

Admin access in the UI comes from the CISapp launch role, but production Firestore rules still require a secure Firebase Auth custom claim for protected order reads: `request.auth.token.admin == true`. A URL parameter is only for routing the UI and must not be treated as secure authorization for Firestore data.

## CISapp Launch

Ordering App is intended to be opened from `https://cisapp-236ab.web.app/` with two query parameters:

```text
https://orderapp-35200.web.app/?uid=FIREBASE_UID&customerId=CUSTOMER_CODE
```

The app loads `customers/{uid}` from Firestore, verifies `customerId` against the profile `customerCode` or `uid`, then uses `businessName` and `role` from that profile.

- `customer` opens the mobile-first ordering experience and uses `customerName` in the customer UI.
- `admin` opens `/admin/orders` and only exposes order-management navigation.
- Launches with parameters are accepted only when the browser referrer is `cisapp-236ab.web.app`.

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
