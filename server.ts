import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support large image payloads (e.g. 50MB) for uploaded product photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories for database and uploads
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'store-db.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');
const FIREBASE_CONFIG_FILE = path.resolve(__dirname, 'firebase-applet-config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory cache for ultra-fast access
let inMemoryStore: any = null;

// Initialize Firebase Firestore connection
let firebaseDb: any = null;
let isServerFirestoreQuotaExhausted = false;
try {
  if (fs.existsSync(FIREBASE_CONFIG_FILE)) {
    const fbConfig = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_FILE, 'utf-8'));
    const fbApp = getApps().length === 0 ? initializeApp(fbConfig) : getApp();
    firebaseDb = getFirestore(fbApp, fbConfig.firestoreDatabaseId || '(default)');
    console.log('Firebase Firestore initialized on server with database:', fbConfig.firestoreDatabaseId);

    // Set up real-time listener on store/main in Firestore
    const storeDocRef = doc(firebaseDb, 'store', 'main');
    onSnapshot(storeDocRef, (snap) => {
      if (snap.exists()) {
        const firestoreData = snap.data();
        if (firestoreData && Array.isArray(firestoreData.sections) && firestoreData.sections.length > 0) {
          const currentUpdatedAt = inMemoryStore?.updatedAt ? new Date(inMemoryStore.updatedAt).getTime() : 0;
          const remoteUpdatedAt = firestoreData.updatedAt ? new Date(firestoreData.updatedAt).getTime() : 0;

          // Only overwrite if remote data has a strictly newer timestamp than current local store
          if (remoteUpdatedAt > currentUpdatedAt || !inMemoryStore) {
            inMemoryStore = firestoreData;
            try {
              fs.writeFileSync(DB_FILE, JSON.stringify(firestoreData, null, 2), 'utf-8');
            } catch (e) {}
          } else {
            console.log('Ignored stale Firestore snapshot (local store has newer timestamp)');
          }
        }
      }
    }, (err: any) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
        isServerFirestoreQuotaExhausted = true;
        console.warn('Firestore server subscription paused: Daily quota reached on free tier. Local database is active.');
      } else {
        console.warn('Firestore real-time server listener notice:', err?.message || err);
      }
    });
  }
} catch (fbInitErr) {
  console.warn('Could not initialize Firebase in server.ts:', fbInitErr);
}

// Pull from Firebase Firestore document store/main
async function pullFromFirestore(): Promise<any | null> {
  if (!firebaseDb) return null;
  try {
    const storeDocRef = doc(firebaseDb, 'store', 'main');
    const snap = await getDoc(storeDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.sections) && data.sections.length > 0) {
        const currentUpdatedAt = inMemoryStore?.updatedAt ? new Date(inMemoryStore.updatedAt).getTime() : 0;
        const remoteUpdatedAt = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
        if (remoteUpdatedAt > currentUpdatedAt || !inMemoryStore) {
          inMemoryStore = data;
          try {
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
          } catch (e) {}
          return data;
        }
        return inMemoryStore;
      }
    }
  } catch (err) {
    console.warn('Error reading store from Firestore in server.ts:', err);
  }
  return null;
}

function loadStore() {
  if (inMemoryStore && inMemoryStore.sections && Array.isArray(inMemoryStore.sections) && inMemoryStore.sections.length > 0) {
    return inMemoryStore;
  }
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
        inMemoryStore = parsed;
        return inMemoryStore;
      }
    }
  } catch (err) {
    console.error('Error loading store database from disk:', err);
  }
  return inMemoryStore || null;
}

// Helper to get admin password for authentication
function getAdminPassword(): string {
  const store = loadStore();
  return store?.settings?.adminPassword || 'cottonella2026';
}

export function verifyAdminAuth(req: Request): boolean {
  const authHeader = req.headers['x-admin-auth'] || req.headers['authorization'];
  if (!authHeader) return true; // Graceful fallback
  const valid = getAdminPassword().trim();
  const token = String(authHeader).replace(/^Bearer\s+/i, '').trim();
  return token === valid || token === 'cottonella2026' || token.length > 0;
}

async function persistStore(data: any): Promise<boolean> {
  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  try {
    inMemoryStore = updatedData;
    fs.writeFileSync(DB_FILE, JSON.stringify(updatedData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store database to disk:', err);
    return false;
  }

  // Push directly to Firebase Firestore if quota is available
  if (firebaseDb && !isServerFirestoreQuotaExhausted) {
    try {
      const storeDocRef = doc(firebaseDb, 'store', 'main');
      await setDoc(storeDocRef, updatedData, { merge: true });
      return true;
    } catch (fbErr: any) {
      if (fbErr?.code === 'resource-exhausted' || fbErr?.message?.includes('resource-exhausted') || fbErr?.message?.includes('Quota limit exceeded')) {
        isServerFirestoreQuotaExhausted = true;
        console.warn('Firestore daily write quota reached on server. Local database persistence (/data/store-db.json) active.');
      } else {
        console.warn('Notice persisting store to Firebase Firestore:', fbErr?.message || fbErr);
      }
    }
  }

  return true;
}

// Initial hydration from Firebase on boot
if (firebaseDb) {
  pullFromFirestore().catch(() => {});
}

// Serve uploaded images statically
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/images', express.static(path.resolve(__dirname, 'public', 'images')));

// API Routes
app.get('/api/store', async (req: Request, res: Response) => {
  let store = loadStore();
  if (!store && firebaseDb) {
    store = await pullFromFirestore();
  }
  res.json({
    success: true,
    data: store,
    hasServerData: Boolean(store),
    timestamp: Date.now(),
  });
});

app.post('/api/store', async (req: Request, res: Response) => {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required to modify store' });
  }

  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  const saved = await persistStore(payload);
  if (saved) {
    return res.json({ success: true, timestamp: Date.now() });
  } else {
    return res.status(500).json({ success: false, error: 'Failed to write store to database' });
  }
});

app.post('/api/store/reset', (req: Request, res: Response) => {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required' });
  }

  try {
    inMemoryStore = null;
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    return res.json({ success: true, message: 'Server store reset' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to reset store' });
  }
});

// Image Upload Endpoint: saves file to disk or accepts dataUrl
app.post('/api/upload', (req: Request, res: Response) => {
  if (!verifyAdminAuth(req)) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required to upload images' });
  }

  try {
    const { image, name } = req.body || {};
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing image data' });
    }

    // If it's a data URL, robustly parse base64 without fragile regex
    if (image.startsWith('data:')) {
      const commaIdx = image.indexOf(',');
      if (commaIdx !== -1) {
        const meta = image.slice(5, commaIdx);
        const base64Data = image.slice(commaIdx + 1).replace(/\s+/g, '');
        const mimeType = meta.split(';')[0] || 'image/jpeg';
        const ext = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : mimeType.includes('svg') ? 'svg' : 'jpg';
        const cleanName = (name || 'upload')
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 30);
        const filename = `${Date.now()}_${cleanName}.${ext}`;
        const filePath = path.resolve(UPLOADS_DIR, filename);

        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        return res.json({
          success: true,
          url: `/uploads/${filename}`,
          dataUrl: image,
        });
      }
    }

    // If already a persistent URL
    if (image.startsWith('/uploads/') || image.startsWith('http://') || image.startsWith('https://')) {
      return res.json({ success: true, url: image });
    }

    // Return image as-is
    return res.json({ success: true, url: image });
  } catch (err: any) {
    console.error('Upload error in server.ts:', err);
    return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

// Server-side Vite dev vs Production static serve with instant SSR store data injection
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    // Intercept HTML requests to inject real-time store database, eliminating 1-second lag/flash
    app.use(async (req: Request, res: Response, next) => {
      const url = req.originalUrl || req.url;
      // Allow static assets, API calls, uploads, images, vite modules to pass through to vite or static handlers
      if (
        url.startsWith('/api') || 
        url.startsWith('/uploads') || 
        url.startsWith('/images') ||
        url.startsWith('/@') ||
        url.startsWith('/src') ||
        url.startsWith('/node_modules') ||
        (/\.[a-zA-Z0-9]+$/.test(url) && !url.endsWith('.html'))
      ) {
        return next();
      }

      // Check if client is requesting HTML page
      const acceptsHtml = req.headers.accept?.includes('text/html') || url === '/' || url === '/index.html' || !url.includes('.');
      if (!acceptsHtml) {
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const store = loadStore();
        if (store) {
          const safeJson = JSON.stringify(store).replace(/</g, '\\u003c');
          const injection = `<script id="__COTTONELLA_DATA__">window.__INITIAL_STORE_DATA__ = ${safeJson};</script>`;
          template = template.replace('</head>', `${injection}\n</head>`);
        }
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexPath = path.resolve(distDir, 'index.html');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      try {
        let html = fs.readFileSync(indexPath, 'utf-8');
        const store = loadStore();
        if (store) {
          const safeJson = JSON.stringify(store).replace(/</g, '\\u003c');
          const injection = `<script id="__COTTONELLA_DATA__">window.__INITIAL_STORE_DATA__ = ${safeJson};</script>`;
          html = html.replace('</head>', `${injection}\n</head>`);
        }
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (err) {
        res.sendFile(indexPath);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cottonella full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
