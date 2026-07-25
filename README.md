# Partner Order

Customer-facing wholesale pharmaceutical ordering PWA built as a separate React, TypeScript, Vite and Firebase project.

## Stack

React, TypeScript, Vite, React Router, Firebase Authentication, Cloud Firestore, Firebase Hosting, IndexedDB via `idb`, `vite-plugin-pwa`, `lucide-react`, Vitest and React Testing Library.

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

Authentication uses Firebase email/password. Public registration is intentionally not implemented.

Admin access in the client comes from `customers/{uid}.role`, but production Firestore rules require a secure Firebase Auth custom claim: `request.auth.token.admin == true`. Create that claim only through a trusted backend/Admin SDK environment.

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

## PWA

The app includes a manifest, service worker, install guidance, standalone display mode, theme colors, offline shell caching, and static catalogue/offers caching. Customer order data is not cached globally by the service worker.

## Known Limitations

- No public registration.
- No account-management UI.
- Admin custom claims must be created securely outside this app.
- No ERP SSO yet.
- Offline checkout is disabled rather than queued.
- Images use external URLs.

## Future SSO

Future ERP SSO requires secure backend token exchange, documented in `FUTURE_INTEGRATION.md`.
