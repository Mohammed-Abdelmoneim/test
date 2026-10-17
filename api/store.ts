import fs from 'fs';
import path from 'path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

let memoryCache: any = null;
const TMP_FILE = '/tmp/cottonella-store-db.json';
const REPO_DB_FILE = path.resolve(process.cwd(), 'data', 'store-db.json');
const FIREBASE_CONFIG_FILE = path.resolve(process.cwd(), 'firebase-applet-config.json');

// Initialize Firebase Firestore connection
let firebaseDb: any = null;
let isServerlessFirestoreQuotaExhausted = false;
try {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    const fbConfig = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8'));
    const fbApp = getApps().length === 0 ? initializeApp(fbConfig) : getApp();
    firebaseDb = getFirestore(fbApp, fbConfig.firestoreDatabaseId || '(default)');
  }
} catch (e) {
  console.warn('Firebase init warning in api/store.ts:', e);
}

async function getStoreData() {
  if (memoryCache && memoryCache.sections && Array.isArray(memoryCache.sections) && memoryCache.sections.length > 0) {
    return memoryCache;
  }

  // 1. Try Firestore if quota is available
  if (firebaseDb && !isServerlessFirestoreQuotaExhausted) {
    try {
      const storeRef = doc(firebaseDb, 'store', 'main');
      const snap = await getDoc(storeRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.sections) && data.sections.length > 0) {
          memoryCache = data;
          return memoryCache;
        }
      }
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        isServerlessFirestoreQuotaExhausted = true;
      } else {
        console.warn('Firestore read error in api/store.ts:', err);
      }
    }
  }

  // 2. Try /tmp or repository file
  try {
    if (fs.existsSync(TMP_FILE)) {
      const content = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        memoryCache = parsed;
        return memoryCache;
      }
    }
    if (fs.existsSync(REPO_DB_FILE)) {
      const content = fs.readFileSync(REPO_DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        memoryCache = parsed;
        return memoryCache;
      }
    }
  } catch (err) {
    console.error('Error reading fallback store:', err);
  }
  return memoryCache || null;
}

async function setStoreData(data: any) {
  memoryCache = data;
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data), 'utf-8');
  } catch (err) {
    console.error('Error writing /tmp store:', err);
  }

  // Sync to Firestore if quota is available
  if (firebaseDb && !isServerlessFirestoreQuotaExhausted) {
    try {
      const storeRef = doc(firebaseDb, 'store', 'main');
      await setDoc(storeRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (fbErr: any) {
      if (fbErr?.code === 'resource-exhausted' || fbErr?.message?.includes('resource-exhausted') || fbErr?.message?.includes('Quota limit exceeded')) {
        isServerlessFirestoreQuotaExhausted = true;
        console.warn('Firestore write quota limit reached in api/store.ts. Local storage active.');
      } else {
        console.error('Error writing to Firestore in api/store.ts:', fbErr);
      }
    }
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const store = await getStoreData();
    return res.status(200).json({
      success: true,
      data: store,
      hasServerData: Boolean(store),
      timestamp: Date.now(),
    });
  }

  if (req.method === 'POST') {
    const currentStore = await getStoreData();
    const authHeader = req.headers['x-admin-auth'] || req.headers['authorization'];
    const validPassword = (currentStore?.settings?.adminPassword || 'cottonella2026').trim();
    const token = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';

    if (!token || token !== validPassword) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required to modify store' });
    }

    const body = req.body;
    if (body && typeof body === 'object') {
      await setStoreData(body);
      return res.status(200).json({
        success: true,
        timestamp: Date.now(),
      });
    }
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
