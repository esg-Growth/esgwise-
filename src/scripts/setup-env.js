const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const keyPath = path.join(root, 'docs-private', 'esgwise-6d39e-firebase-adminsdk-fbsvc-cd84fcaa0c.json');
const envPath = path.join(root, '.env.local');

const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const minified = JSON.stringify(key);

const env = [
  'GEMINI_API_KEY=""',
  'AUTH_SECRET="f395c1a8e7b4478198f12a1f2b1d5e68"',
  `FIREBASE_SERVICE_ACCOUNT='${minified}'`,
].join('\n') + '\n';

fs.writeFileSync(envPath, env);
console.log('✅ .env.local configured with service account key');
