import admin from 'firebase-admin'

const uid = process.argv[2]

if (!uid) {
  console.error('Usage: node scripts/grant-admin.mjs <firebase-auth-uid>')
  process.exit(1)
}

admin.initializeApp()

await admin.auth().setCustomUserClaims(uid, { admin: true })
await admin.firestore().collection('customers').doc(uid).set(
  { uid, role: 'admin', active: true, updatedAt: new Date().toISOString() },
  { merge: true },
)

console.log(`Admin access granted to ${uid}. Sign out and sign in again to refresh the token.`)
