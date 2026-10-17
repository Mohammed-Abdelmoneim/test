import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  getDocFromServer 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Dynamic config resolver: prioritizes Vercel / Vite environment variables, falls back to config file
export function getResolvedFirebaseConfig() {
  const env = typeof import.meta !== 'undefined' ? (import.meta as any).env || {} : {};
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
    projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
    appId: env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
    firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '(default)',
  };
}

export const activeFirebaseConfig = getResolvedFirebaseConfig();

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(activeFirebaseConfig) : getApp();

// Initialize Firestore with specific databaseId
export const db = getFirestore(app, activeFirebaseConfig.firestoreDatabaseId || '(default)');

// Initialize Firebase Cloud Storage for permanent image hosting
export const storage = getStorage(app, activeFirebaseConfig.storageBucket);

const QUOTA_STORAGE_KEY = 'cottonella_firestore_quota_exhausted_date';
let lastWrittenHash = '';
let quotaExhaustedMemory = false;

// Clear any stale legacy lockout date so Firestore is fully accessible
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
  } catch (e) {}
}

// Check if Firestore quota was exhausted
export function isFirestoreQuotaExhausted(): boolean {
  return quotaExhaustedMemory;
}

// Mark temporary write backoff (resets automatically after 10s instead of blocking whole day)
export function markFirestoreQuotaExhausted() {
  quotaExhaustedMemory = true;
  setTimeout(() => {
    quotaExhaustedMemory = false;
  }, 10000);
}

// Validate connection to Firestore safely
export async function testFirestoreConnection(): Promise<boolean> {
  if (isFirestoreQuotaExhausted()) {
    return false;
  }
  try {
    const testDoc = await getDocFromServer(doc(db, 'test', 'connection'));
    return testDoc.exists();
  } catch (error: any) {
    if (error?.code === 'resource-exhausted' || error?.message?.includes('Quota limit exceeded') || error?.message?.includes('resource-exhausted')) {
      markFirestoreQuotaExhausted();
    } else if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline: Check Firebase configuration or network connection.');
    }
    return false;
  }
}

// Check if Firebase Storage bucket is initialized and ready
export async function checkFirebaseStorageReady(): Promise<{ isReady: boolean; bucket: string; error?: string }> {
  try {
    const bucket = activeFirebaseConfig.storageBucket || '';
    if (!bucket) {
      return { isReady: false, bucket: '', error: 'Missing storageBucket configuration' };
    }
    return { isReady: true, bucket };
  } catch (err: any) {
    return { isReady: false, bucket: activeFirebaseConfig.storageBucket || '', error: err?.message || 'Storage check error' };
  }
}

/**
 * Upload an image (File, Blob, or base64 Data URL) to Firebase Cloud Storage.
 * Generates a permanent Google Cloud public download URL stored directly in Firestore.
 */
export async function uploadImageToFirebaseStorage(
  fileOrDataUrl: File | Blob | string,
  filename?: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  const timestamp = Date.now();
  let cleanName = (filename || 'image')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  if (!cleanName) cleanName = 'product_photo';

  let blob: Blob;
  let contentType = 'image/jpeg';
  let ext = 'jpg';

  if (typeof fileOrDataUrl === 'string') {
    const commaIdx = fileOrDataUrl.indexOf(',');
    if (fileOrDataUrl.startsWith('data:') && commaIdx !== -1) {
      const meta = fileOrDataUrl.slice(5, commaIdx);
      const base64Data = fileOrDataUrl.slice(commaIdx + 1).replace(/\s+/g, '');
      contentType = meta.split(';')[0] || 'image/jpeg';
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      blob = new Blob([bytes], { type: contentType });
    } else {
      throw new Error('Invalid image data URL format');
    }
  } else if (fileOrDataUrl instanceof Blob) {
    blob = fileOrDataUrl;
    contentType = blob.type || 'image/jpeg';
  } else {
    throw new Error('Unsupported image payload type');
  }

  if (contentType.includes('png')) ext = 'png';
  else if (contentType.includes('webp')) ext = 'webp';
  else if (contentType.includes('svg')) ext = 'svg';

  const fullPath = `uploads/products/${timestamp}_${cleanName}.${ext}`;
  const storageRef = ref(storage, fullPath);

  const uploadTask = uploadBytesResumable(storageRef, blob, {
    contentType,
    cacheControl: 'public, max-age=31536000',
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(progress);
        }
      },
      (error) => {
        console.warn('Firebase Storage upload error:', error.code, error.message);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url: downloadUrl, path: fullPath });
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

// Fetch store data from Firestore document store/main
export async function fetchStoreFromFirestore(): Promise<any | null> {
  if (isFirestoreQuotaExhausted()) {
    return null;
  }
  try {
    const storeRef = doc(db, 'store', 'main');
    const snap = await getDoc(storeRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded')) {
      markFirestoreQuotaExhausted();
    }
  }
  return null;
}

// Persist full store data directly to Firestore document store/main with quota guard
export async function saveStoreToFirestore(storeData: any): Promise<boolean> {
  if (isFirestoreQuotaExhausted()) {
    return false;
  }

  try {
    const serialized = JSON.stringify(storeData);
    if (serialized === lastWrittenHash) {
      return true;
    }

    const storeRef = doc(db, 'store', 'main');
    const sanitizedMedia = (storeData.media || []).filter((m: any) => !m.url?.startsWith('data:') || m.url.length < 35000);
    const payload = {
      ...storeData,
      media: sanitizedMedia,
      updatedAt: storeData.updatedAt || new Date().toISOString()
    };
    await setDoc(storeRef, payload, { merge: true });
    lastWrittenHash = serialized;
    return true;
  } catch (err: any) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota limit exceeded') || err?.message?.includes('resource-exhausted')) {
      markFirestoreQuotaExhausted();
      console.warn('Firestore daily write quota reached on free tier. Fallback persistence active.');
      return false;
    }
    console.warn('Notice saving store to Firestore:', err?.message || err);
    return false;
  }
}

// Listen to real-time updates from Firestore with graceful error fallback
export function subscribeToStoreInFirestore(callback: (data: any) => void): () => void {
  if (isFirestoreQuotaExhausted()) {
    return () => {};
  }
  try {
    const storeRef = doc(db, 'store', 'main');
    return onSnapshot(
      storeRef,
      (snap) => {
        try {
          if (snap.exists()) {
            const data = snap.data();
            callback(data);
          }
        } catch (e) {
          console.warn('Firestore snapshot handler notice:', e);
        }
      },
      (err: any) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('resource-exhausted') || err?.message?.includes('Quota limit exceeded')) {
          markFirestoreQuotaExhausted();
          console.warn('Firestore snapshot listener paused: Quota limit reached for today.');
        } else {
          console.warn('Firestore real-time subscription notice:', err?.message || err);
        }
      }
    );
  } catch (initErr) {
    console.warn('Could not attach Firestore listener:', initErr);
    return () => {};
  }
}
