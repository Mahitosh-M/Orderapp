import admin from 'firebase-admin'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const projectId = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || 'orderapp-35200'
const hostingOrigin = process.env.CATEGORY_IMAGE_HOSTING_ORIGIN || 'https://orderapp-35200.web.app'

const categoryImages = [
  ['ALLERGY & COUGH & COLD', 'allergy-cough-cold', 'allergy-cough-cold.jpg'],
  ['ANTIBIOTICS', 'antibiotics', 'antibiotics-category.jpg'],
  ['ANTIFUNGAL & SKIN', 'antifungal-skin', 'antifungal-skin.jpg'],
  ['ANTISPECTICS & DISINFECTANTS', 'antiseptics-disinfectants', 'antiseptics-disinfectants.jpg'],
  ['E/E DROPS', 'eye-ear-drops', 'eye-ear-drops.jpg'],
  ['GASTROINTESTINAL', 'gastrointestinal', 'gastrointestinal.jpg'],
  ['HEALTH SUPPLIMENTS', 'health-suppliments', 'health-suppliments.jpg'],
  ['HEART + BP + SUGAR', 'heart-bp-sugar', 'heart-bp-sugar.jpg'],
  ['IV FLUIDS', 'iv-fluids', 'iv-fluids.jpg'],
  ['PAINKILLERS & FEVER', 'painkillers-fever', 'painkillers-fever.jpg'],
  ['RESPULES', 'respules', 'respules.jpg'],
  ['STEROIDS / HORMONE', 'steroids-hormone', 'steroids-hormone.jpg'],
  ['SURGICALS', 'surgicals', 'surgicals.jpg'],
]

function findFirebaseApplicationDefaultCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) return process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (!process.env.APPDATA) return null

  const firebaseConfigDir = join(process.env.APPDATA, 'firebase')
  if (!existsSync(firebaseConfigDir)) return null

  const credentialFile = readdirSync(firebaseConfigDir).find((file) => file.endsWith('_application_default_credentials.json'))
  return credentialFile ? join(firebaseConfigDir, credentialFile) : null
}

const credentialPath = findFirebaseApplicationDefaultCredentials()
if (credentialPath) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialPath
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  })
}

const db = admin.firestore()
const batch = db.batch()

for (const [category, id, fileName] of categoryImages) {
  const hostingPath = `/category-images/${encodeURIComponent(fileName)}`
  batch.set(
    db.collection('categoryImages').doc(id),
    {
      category,
      categoryKey: category.toLowerCase(),
      fileName,
      hostingPath,
      imageUrl: `${hostingOrigin}${hostingPath}`,
      active: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
}

await batch.commit()

console.log(`Seeded ${categoryImages.length} category image documents in ${projectId}.`)
