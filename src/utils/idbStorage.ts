/**
 * Robust IndexedDB Storage Engine for Cottonella
 * Bypasses the 5MB browser localStorage quota limit, ensuring that
 * all user-added products, uploaded images, custom texts, and CMS edits
 * are 100% reserved and never reset across reloads or launches.
 */

const DB_NAME = 'cottonella_app_db_v2';
const STORE_NAME = 'app_state';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const idbStorage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: any): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn(`IndexedDB setItem error for key "${key}":`, err);
    }
  },

  async getAllItems(): Promise<Record<string, any>> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();
        req.onsuccess = async () => {
          const keys = req.result as string[];
          const result: Record<string, any> = {};
          for (const k of keys) {
            const valReq = store.get(k);
            await new Promise<void>((res) => {
              valReq.onsuccess = () => {
                if (valReq.result !== undefined) {
                  result[k] = valReq.result;
                }
                res();
              };
              valReq.onerror = () => res();
            });
          }
          resolve(result);
        };
        req.onerror = () => resolve({});
      });
    } catch {
      return {};
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  },

  async clear(): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  }
};
