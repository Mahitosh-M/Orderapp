# Firebase Setup

1. Create a new Firebase project dedicated to Partner Order.
2. Register a Web app and copy its browser configuration into `.env`.
3. Enable Authentication, then enable Email/Password sign-in.
4. Create Cloud Firestore in production mode.
5. Create customer documents at `customers/{uid}` after creating users in Firebase Authentication.
6. Deploy rules with `firebase deploy --only firestore:rules`.
7. Deploy indexes with `firebase deploy --only firestore:indexes`.
8. Initialize Hosting for the separate Firebase project if needed.
9. Build with `npm run build`.
10. Deploy Hosting with `firebase deploy --only hosting`.
11. Create the first admin securely with Firebase Admin SDK custom claims, for example setting `admin: true` on the admin UID from a trusted backend or local admin script that is never shipped to the browser.
12. Create customer accounts safely in Firebase Console or a secure backend. Do not add public registration to this app.

To grant admin access to an existing Firebase user, run the server-side helper with Firebase Admin credentials. Never run this from the browser:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS='C:\path\to\service-account.json'
npm run grant-admin -- D8Zlt4kTdOZl8kZ8xhFd1pLYY1M2
```

The helper sets the `admin: true` custom claim and updates `customers/{uid}.role` to `admin`. Sign out and sign in again after running it.

Required `.env` values:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Do not commit real secrets or service-account credentials.
