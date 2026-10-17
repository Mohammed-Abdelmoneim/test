import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Collection,
  Category,
  Testimonial,
  Promotion,
  HomePageSection,
  StoreSettings,
  MediaItem,
  ProductVariant
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_COLLECTIONS,
  INITIAL_PRODUCTS,
  INITIAL_TESTIMONIALS,
  INITIAL_PROMOTIONS,
  INITIAL_SECTIONS,
  INITIAL_MEDIA,
  INITIAL_SETTINGS,
  getValidImageUrl,
  BEDSHEET_IMAGE,
  HERO_IMAGE,
  POUCH_IMAGE,
  COLLECTION_BANNER,
} from '../data/initialData';
import { idbStorage } from '../utils/idbStorage';
import { 
  saveStoreToFirestore, 
  subscribeToStoreInFirestore, 
  testFirestoreConnection 
} from '../firebase';

interface StoreContextType {
  // Navigation & View state
  currentMode: 'store' | 'admin';
  setCurrentMode: (mode: 'store' | 'admin') => void;
  activePage: string;
  setActivePage: (page: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  selectedCollectionId: string | null;
  setSelectedCollectionId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;

  // Admin Auth
  isAdminAuthenticated: boolean;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;

  // Data
  products: Product[];
  collections: Collection[];
  categories: Category[];
  testimonials: Testimonial[];
  promotions: Promotion[];
  sections: HomePageSection[];
  media: MediaItem[];
  settings: StoreSettings;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<Product> | Product;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void> | void;
  deleteProduct: (id: string) => Promise<void> | void;
  duplicateProduct: (id: string) => Promise<void> | void;

  // Collection Actions
  addCollection: (col: Omit<Collection, 'id'>) => Collection;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  deleteCollection: (id: string) => void;

  // Category Actions
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Section Builder Actions
  addSection: (sec: Omit<HomePageSection, 'id' | 'order'>) => HomePageSection;
  updateSection: (id: string, updates: Partial<HomePageSection>) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  reorderSections: (newSections: HomePageSection[]) => void;
  moveSectionOrder: (id: string, direction: 'up' | 'down') => void;

  // Testimonial Actions
  addTestimonial: (test: Omit<Testimonial, 'id' | 'date'>) => Testimonial;
  updateTestimonial: (id: string, updates: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  // Promotion Actions
  addPromotion: (promo: Omit<Promotion, 'id'>) => Promotion;
  updatePromotion: (id: string, updates: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;

  // Media Actions
  addMediaItem: (item: Omit<MediaItem, 'id' | 'uploadedAt'>) => MediaItem;
  deleteMediaItem: (id: string) => void;

  // Settings Actions
  updateSettings: (updates: Partial<StoreSettings>) => void;

  // Helpers
  generateWhatsAppOrderUrl: (product: Product, selectedVariant?: ProductVariant, customNote?: string) => string;
  resetAllData: () => void;
  navigateToProduct: (productId: string) => void;
  navigateToCollection: (collectionId: string) => void;

  // Global Notification Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Server Synchronization
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: Date | null;
  syncWithServer: () => Promise<void>;
  restoreFromBackup: (storeData: any) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'cottonella_store_v3_';

function getInitialStoreValue<T>(key: string, defaultValue: T): T {
  // 1. Highest Priority: Server-injected data from window.__INITIAL_STORE_DATA__ (0ms latency, zero flash)
  try {
    if (typeof window !== 'undefined' && (window as any).__INITIAL_STORE_DATA__) {
      const serverVal = (window as any).__INITIAL_STORE_DATA__[key];
      if (serverVal !== undefined && serverVal !== null) {
        if (Array.isArray(serverVal)) {
          if (serverVal.length > 0) {
            safeSaveItem(key, serverVal);
            return serverVal as unknown as T;
          }
        } else if (typeof serverVal === 'object') {
          if (Object.keys(serverVal).length > 0) {
            safeSaveItem(key, serverVal);
            return serverVal as unknown as T;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error reading __INITIAL_STORE_DATA__ for', key, err);
  }

  // 2. Second Priority: Local Storage cache (for offline/standalone)
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key);
    if (item) {
      const parsed = JSON.parse(item);
      if (parsed !== undefined && parsed !== null) {
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as unknown as T;
        if (typeof parsed === 'object' && Object.keys(parsed).length > 0) return parsed as unknown as T;
      }
    }
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
  }

  // 3. Fallback: bundled initial data
  return defaultValue;
}

function safeSaveItem(key: string, value: any) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    // Quota warning - clear redundant large items to free up space
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'media');
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(value));
    } catch (e2) {
      console.warn(`Storage quota exceeded for ${key}:`, e2);
    }
  }
}

// Normalization functions to guarantee images use bundled/valid assets
function normalizeProduct(p: Product): Product {
  return {
    ...p,
    images: (p.images || []).map(img => getValidImageUrl(img, BEDSHEET_IMAGE)),
    variants: (p.variants || []).map(v => ({
      ...v,
      image: getValidImageUrl(v.image, BEDSHEET_IMAGE),
    })),
  };
}

function normalizeCollection(c: Collection): Collection {
  return {
    ...c,
    coverImage: getValidImageUrl(c.coverImage, COLLECTION_BANNER),
    bannerImage: getValidImageUrl(c.bannerImage, COLLECTION_BANNER),
  };
}

function normalizeCategory(c: Category): Category {
  return {
    ...c,
    image: getValidImageUrl(c.image, POUCH_IMAGE),
  };
}

function normalizeSection(s: HomePageSection): HomePageSection {
  const content = { ...s.content };
  if (content.imageUrl) {
    content.imageUrl = getValidImageUrl(content.imageUrl, HERO_IMAGE);
  }
  if (s.type === 'hero') {
    if (content.showFloatingCard === undefined) content.showFloatingCard = true;
    if (content.floatingBadgeTitleAr === undefined) content.floatingBadgeTitleAr = 'تفاصيل تفرّح القلب';
    if (content.floatingBadgeTextAr === undefined) content.floatingBadgeTextAr = 'تطريزات وكشكشة بألوان الباستيل الهادية';
    if (content.floatingBadgeIcon === undefined) content.floatingBadgeIcon = 'heart';
    if (content.floatingPosition === undefined) content.floatingPosition = 'bottom-left';
    if (content.showTrustMarkers === undefined) content.showTrustMarkers = true;
    if (content.trustText1Ar === undefined) content.trustText1Ar = 'خياطة وتطريز يدوي 100%';
    if (content.trustText2Ar === undefined) content.trustText2Ar = 'قطن مصري أصيل';
    if (content.trustText3Ar === undefined) content.trustText3Ar = 'توصيل لباب بيتك والدفع عند الاستلام';
  }
  if (Array.isArray(content.instagramPosts)) {
    content.instagramPosts = content.instagramPosts.map((post: any) => ({
      ...post,
      image: getValidImageUrl(post.image, BEDSHEET_IMAGE),
    }));
  }
  return { ...s, content };
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation states
  const [currentMode, setCurrentMode] = useState<'store' | 'admin'>('store');
  const [activePage, setActivePage] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [adminActiveTab, setAdminActiveTab] = useState<string>('products');

  // Admin Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const isAuth = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_auth') === 'true';
    const token = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_token');
    return isAuth && Boolean(token);
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Stored state items (instant hydration from server injection without 1s flash)
  const [products, setProducts] = useState<Product[]>(() => getInitialStoreValue('products', INITIAL_PRODUCTS).map(normalizeProduct));
  const [collections, setCollections] = useState<Collection[]>(() => getInitialStoreValue('collections', INITIAL_COLLECTIONS).map(normalizeCollection));
  const [categories, setCategories] = useState<Category[]>(() => getInitialStoreValue('categories', INITIAL_CATEGORIES).map(normalizeCategory));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getInitialStoreValue('testimonials', INITIAL_TESTIMONIALS));
  const [promotions, setPromotions] = useState<Promotion[]>(() => getInitialStoreValue('promotions', INITIAL_PROMOTIONS));
  const [sections, setSections] = useState<HomePageSection[]>(() => getInitialStoreValue('sections', INITIAL_SECTIONS).map(normalizeSection));
  const [media, setMedia] = useState<MediaItem[]>(() => getInitialStoreValue('media', INITIAL_MEDIA));
  const [settings, setSettings] = useState<StoreSettings>(() => getInitialStoreValue('settings', INITIAL_SETTINGS));

  // Server sync state
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const isHydratedRef = React.useRef(false);
  const saveTimeoutRef = React.useRef<any>(null);
  const lastLocalEditTimeRef = React.useRef<number>(0);
  const isRemoteSyncRef = React.useRef<boolean>(false);
  const hasPendingLocalEditsRef = React.useRef<boolean>(false);

  const registerLocalEdit = () => {
    lastLocalEditTimeRef.current = Date.now();
    hasPendingLocalEditsRef.current = true;
  };

  // Ref tracking freshest store state to eliminate race conditions
  const storeStateRef = React.useRef({
    products,
    collections,
    categories,
    testimonials,
    promotions,
    sections,
    media,
    settings,
  });

  // Keep storeStateRef in sync with React states
  useEffect(() => {
    storeStateRef.current = {
      products,
      collections,
      categories,
      testimonials,
      promotions,
      sections,
      media,
      settings,
    };
  }, [products, collections, categories, testimonials, promotions, sections, media, settings]);

  // Push to server API reliably (server persists locally and syncs to Firestore)
  const pushToServer = async (overrideData?: any): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      if (overrideData) {
        Object.assign(storeStateRef.current, overrideData);
      }
      const payload = {
        products: storeStateRef.current.products,
        collections: storeStateRef.current.collections,
        categories: storeStateRef.current.categories,
        testimonials: storeStateRef.current.testimonials,
        promotions: storeStateRef.current.promotions,
        sections: storeStateRef.current.sections,
        media: storeStateRef.current.media,
        settings: storeStateRef.current.settings,
        ...overrideData,
      };

      // 1. Direct write to Firestore from browser client for instant real-time synchronization
      try {
        await saveStoreToFirestore(payload);
      } catch (fbErr) {
        console.warn('Client Firestore direct write notice:', fbErr);
      }

      const token = typeof window !== 'undefined'
        ? (localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_token') || 'cottonella2026')
        : 'cottonella2026';

      // 2. Sync to Express / Serverless backend API
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-auth': token,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        hasPendingLocalEditsRef.current = false;
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
        return true;
      } else {
        const errJson = await res.json().catch(() => ({}));
        setSyncStatus('error');
        throw new Error(errJson.error || `Failed to save store (status ${res.status})`);
      }
    } catch (err: any) {
      console.warn('Network sync error to /api/store:', err);
      setSyncStatus('error');
      throw err;
    }
  };

  const syncWithServer = async () => {
    await pushToServer();
  };

  // 1. Hydrate from IndexedDB on startup ONLY if neither injected server data nor localStorage was present
  // 2. Connect to Firebase Firestore in real-time (instant cloud sync across all devices)
  // 3. Then pull from server /api/store so any edits from other browsers/devices are reflected
  useEffect(() => {
    let isMounted = true;
    const hasInjectedData = typeof window !== 'undefined' && Boolean((window as any).__INITIAL_STORE_DATA__);

    // Validate connection to Firestore
    testFirestoreConnection().catch(() => {});

    // Real-time Firestore subscription: updates all devices & tabs immediately
    const unsubscribeFirestore = subscribeToStoreInFirestore((firestoreData) => {
      if (!isMounted || !firestoreData) return;
      // Protect recent local edits (last 60 seconds) from background race overwrites
      if (hasPendingLocalEditsRef.current || Date.now() - lastLocalEditTimeRef.current < 60000) return;

      isRemoteSyncRef.current = true;
      try {
        // IMPORTANT: Do NOT normalize images from remote data. Remote data was saved
        // with the correct uploaded image URLs (data:, https://, /uploads/). Normalizing
        // would replace them with hardcoded defaults, causing the reversion bug.
        if (Array.isArray(firestoreData.sections) && firestoreData.sections.length > 0) {
          const currentSecStr = JSON.stringify(storeStateRef.current.sections);
          const newSecStr = JSON.stringify(firestoreData.sections);
          if (currentSecStr !== newSecStr) {
            setSections(firestoreData.sections);
            safeSaveItem('sections', firestoreData.sections);
          }
        }
        if (Array.isArray(firestoreData.products) && firestoreData.products.length > 0) {
          const currentProdStr = JSON.stringify(storeStateRef.current.products);
          const newProdStr = JSON.stringify(firestoreData.products);
          if (currentProdStr !== newProdStr) {
            setProducts(firestoreData.products);
            safeSaveItem('products', firestoreData.products);
          }
        }
        if (Array.isArray(firestoreData.collections) && firestoreData.collections.length > 0) {
          if (JSON.stringify(storeStateRef.current.collections) !== JSON.stringify(firestoreData.collections)) {
            setCollections(firestoreData.collections);
            safeSaveItem('collections', firestoreData.collections);
          }
        }
        if (Array.isArray(firestoreData.categories) && firestoreData.categories.length > 0) {
          if (JSON.stringify(storeStateRef.current.categories) !== JSON.stringify(firestoreData.categories)) {
            setCategories(firestoreData.categories);
            safeSaveItem('categories', firestoreData.categories);
          }
        }
        if (Array.isArray(firestoreData.testimonials) && firestoreData.testimonials.length > 0) {
          if (JSON.stringify(storeStateRef.current.testimonials) !== JSON.stringify(firestoreData.testimonials)) {
            setTestimonials(firestoreData.testimonials);
            safeSaveItem('testimonials', firestoreData.testimonials);
          }
        }
        if (Array.isArray(firestoreData.promotions)) {
          if (JSON.stringify(storeStateRef.current.promotions) !== JSON.stringify(firestoreData.promotions)) {
            setPromotions(firestoreData.promotions);
            safeSaveItem('promotions', firestoreData.promotions);
          }
        }
        if (Array.isArray(firestoreData.media)) {
          if (JSON.stringify(storeStateRef.current.media) !== JSON.stringify(firestoreData.media)) {
            setMedia(firestoreData.media);
            safeSaveItem('media', firestoreData.media);
          }
        }
        if (firestoreData.settings && typeof firestoreData.settings === 'object' && Object.keys(firestoreData.settings).length > 0) {
          if (JSON.stringify(storeStateRef.current.settings) !== JSON.stringify(firestoreData.settings)) {
            setSettings(prev => ({ ...prev, ...firestoreData.settings }));
            safeSaveItem('settings', firestoreData.settings);
          }
        }
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      } finally {
        setTimeout(() => {
          isRemoteSyncRef.current = false;
        }, 500);
      }
    });

    if (!hasInjectedData) {
      idbStorage.getAllItems().then(items => {
        if (!isMounted) return;
        // Only load if local state is still at default
        if (items.sections && Array.isArray(items.sections) && items.sections.length > 0) {
          setSections(prev => prev.length === 0 ? items.sections : prev);
        }
        if (items.products && Array.isArray(items.products) && items.products.length > 0) {
          setProducts(prev => prev.length === 0 ? items.products : prev);
        }
        if (items.collections && Array.isArray(items.collections) && items.collections.length > 0) {
          setCollections(prev => prev.length === 0 ? items.collections : prev);
        }
        if (items.categories && Array.isArray(items.categories) && items.categories.length > 0) {
          setCategories(prev => prev.length === 0 ? items.categories : prev);
        }
      }).catch(err => {
        console.warn('Hydration from IndexedDB warning:', err);
      });
    }

    const pullFromServer = async (force = false) => {
      // Protect recent local edits (last 60 seconds) from background race overwrites
      if (!force && (hasPendingLocalEditsRef.current || Date.now() - lastLocalEditTimeRef.current < 60000)) {
        return;
      }
      try {
        const res = await fetch('/api/store?t=' + Date.now(), { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!isMounted) return;

        if (json && json.hasServerData && json.data) {
          const d = json.data;
          isRemoteSyncRef.current = true;
          try {
            // Zero-Flash Verification: only update state if the data is genuinely different!
            // IMPORTANT: Do NOT normalize images from remote data.
            // Remote data was saved with the correct uploaded image URLs.
            if (Array.isArray(d.sections) && d.sections.length > 0) {
              const currentSecStr = JSON.stringify(storeStateRef.current.sections);
              const newSecStr = JSON.stringify(d.sections);
              if (currentSecStr !== newSecStr) {
                setSections(d.sections);
                safeSaveItem('sections', d.sections);
              }
            }
            if (Array.isArray(d.products) && d.products.length > 0) {
              const currentProdStr = JSON.stringify(storeStateRef.current.products);
              const newProdStr = JSON.stringify(d.products);
              if (currentProdStr !== newProdStr) {
                setProducts(d.products);
                safeSaveItem('products', d.products);
              }
            }
            if (Array.isArray(d.collections) && d.collections.length > 0) {
              if (JSON.stringify(storeStateRef.current.collections) !== JSON.stringify(d.collections)) {
                setCollections(d.collections);
                safeSaveItem('collections', d.collections);
              }
            }
            if (Array.isArray(d.categories) && d.categories.length > 0) {
              if (JSON.stringify(storeStateRef.current.categories) !== JSON.stringify(d.categories)) {
                setCategories(d.categories);
                safeSaveItem('categories', d.categories);
              }
            }
            if (Array.isArray(d.testimonials) && d.testimonials.length > 0) {
              if (JSON.stringify(storeStateRef.current.testimonials) !== JSON.stringify(d.testimonials)) {
                setTestimonials(d.testimonials);
                safeSaveItem('testimonials', d.testimonials);
              }
            }
            if (Array.isArray(d.promotions)) {
              if (JSON.stringify(storeStateRef.current.promotions) !== JSON.stringify(d.promotions)) {
                setPromotions(d.promotions);
                safeSaveItem('promotions', d.promotions);
              }
            }
            if (Array.isArray(d.media)) {
              if (JSON.stringify(storeStateRef.current.media) !== JSON.stringify(d.media)) {
                setMedia(d.media);
                safeSaveItem('media', d.media);
              }
            }
            if (d.settings && typeof d.settings === 'object' && Object.keys(d.settings).length > 0) {
              if (JSON.stringify(storeStateRef.current.settings) !== JSON.stringify(d.settings)) {
                setSettings(prev => ({ ...prev, ...d.settings }));
                safeSaveItem('settings', d.settings);
              }
            }
            setSyncStatus('synced');
            setLastSyncedAt(new Date());
          } finally {
            setTimeout(() => {
              isRemoteSyncRef.current = false;
            }, 500);
          }
        } else if (json && !json.hasServerData && isAdminAuthenticated) {
          // If server database is empty and admin is authenticated, seed it with current defaults
          hasPendingLocalEditsRef.current = true;
          pushToServer().catch(() => {});
        }
      } catch (err) {
        console.warn('Could not connect to /api/store (local-first mode active):', err);
      } finally {
        isHydratedRef.current = true;
      }
    };

    pullFromServer(true);

    // Re-check server on window focus and every 25 seconds
    const interval = setInterval(pullFromServer, 25000);
    const onFocus = () => { pullFromServer(); };
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      if (unsubscribeFirestore) unsubscribeFirestore();
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Sync to both localStorage and IndexedDB reliably
  useEffect(() => {
    safeSaveItem('products', products);
    idbStorage.setItem('products', products);
  }, [products]);

  useEffect(() => {
    safeSaveItem('collections', collections);
    idbStorage.setItem('collections', collections);
  }, [collections]);

  useEffect(() => {
    safeSaveItem('categories', categories);
    idbStorage.setItem('categories', categories);
  }, [categories]);

  useEffect(() => {
    safeSaveItem('testimonials', testimonials);
    idbStorage.setItem('testimonials', testimonials);
  }, [testimonials]);

  useEffect(() => {
    safeSaveItem('promotions', promotions);
    idbStorage.setItem('promotions', promotions);
  }, [promotions]);

  useEffect(() => {
    safeSaveItem('sections', sections);
    idbStorage.setItem('sections', sections);
  }, [sections]);

  useEffect(() => {
    safeSaveItem('media', media);
    idbStorage.setItem('media', media);
  }, [media]);

  useEffect(() => {
    safeSaveItem('settings', settings);
    idbStorage.setItem('settings', settings);
  }, [settings]);

  // Debounced auto-sync to server whenever data changes locally
  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (isRemoteSyncRef.current) return;
    if (!hasPendingLocalEditsRef.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      hasPendingLocalEditsRef.current = false;
      pushToServer();
    }, 800);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [products, collections, categories, testimonials, promotions, sections, media, settings]);

  useEffect(() => {
    safeSaveItem('admin_auth', isAdminAuthenticated ? 'true' : 'false');
    idbStorage.setItem('admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Global notification toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // URL listener for /admin or #admin
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#/admin');

      if (isAdminRoute) {
        if (isAdminAuthenticated) {
          setCurrentMode('admin');
        } else {
          setIsLoginModalOpen(true);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [isAdminAuthenticated]);

  // Auth Functions
  const loginAdmin = (enteredPassword: string): boolean => {
    const validPassword = settings.adminPassword || 'cottonella2026';
    if (enteredPassword.trim() === validPassword.trim()) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_token', enteredPassword.trim());
        localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_auth', 'true');
      } catch (e) {}
      setCurrentMode('admin');
      setIsLoginModalOpen(false);
      try {
        if (!window.location.pathname.startsWith('/admin')) {
          window.history.pushState(null, '', '/admin');
        }
      } catch (e) {
        window.location.hash = 'admin';
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_token');
      localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_auth', 'false');
    } catch (e) {}
    setCurrentMode('store');
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      window.location.hash = '';
    }
  };

  // Product Actions
  const addProduct = async (item: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
    const isAuthed = isAdminAuthenticated || (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_auth') === 'true') || currentMode === 'admin';
    if (!isAuthed) {
      throw new Error('غير مصرح: يجب تسجيل الدخول كمسؤول أولاً');
    }
    lastLocalEditTimeRef.current = Date.now();
    hasPendingLocalEditsRef.current = true;
    const newProduct: Product = {
      ...item,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [newProduct, ...products];
    setProducts(next);
    safeSaveItem('products', next);
    idbStorage.setItem('products', next);

    await pushToServer({ products: next });
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    const isAuthed = isAdminAuthenticated || (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_auth') === 'true') || currentMode === 'admin';
    if (!isAuthed) {
      throw new Error('غير مصرح: يجب تسجيل الدخول كمسؤول أولاً');
    }
    lastLocalEditTimeRef.current = Date.now();
    hasPendingLocalEditsRef.current = true;

    const next = products.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, ...updates };
      if (updates.price !== undefined || updates.discountValue !== undefined || updates.discountEnabled !== undefined || updates.discountType !== undefined) {
        if (!updated.discountEnabled || !updated.discountValue) {
          updated.finalPrice = updated.price;
        } else if (updated.discountType === 'percentage') {
          updated.finalPrice = Math.max(0, Math.round(updated.price * (1 - updated.discountValue / 100)));
        } else {
          updated.finalPrice = Math.max(0, updated.price - updated.discountValue);
        }
      }
      return updated;
    });

    setProducts(next);
    safeSaveItem('products', next);
    idbStorage.setItem('products', next);

    await pushToServer({ products: next });
  };

  const deleteProduct = async (id: string): Promise<void> => {
    const isAuthed = isAdminAuthenticated || (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_auth') === 'true') || currentMode === 'admin';
    if (!isAuthed) {
      throw new Error('غير مصرح: يجب تسجيل الدخول كمسؤول أولاً');
    }
    lastLocalEditTimeRef.current = Date.now();
    hasPendingLocalEditsRef.current = true;
    const next = products.filter(p => p.id !== id);
    setProducts(next);
    safeSaveItem('products', next);
    idbStorage.setItem('products', next);

    await pushToServer({ products: next });
  };

  const duplicateProduct = async (id: string): Promise<void> => {
    const isAuthed = isAdminAuthenticated || (typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + 'admin_auth') === 'true') || currentMode === 'admin';
    if (!isAuthed) {
      throw new Error('غير مصرح: يجب تسجيل الدخول كمسؤول أولاً');
    }
    const existing = products.find(p => p.id === id);
    if (!existing) return;
    lastLocalEditTimeRef.current = Date.now();
    hasPendingLocalEditsRef.current = true;
    const duplicated: Product = {
      ...existing,
      id: 'prod-' + Date.now(),
      name: `${existing.name} (Copy)`,
      nameAr: `${existing.nameAr} (نسخة مكررة)`,
      sku: `${existing.sku}-CPY`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const next = [duplicated, ...products];
    setProducts(next);
    safeSaveItem('products', next);
    idbStorage.setItem('products', next);

    await pushToServer({ products: next });
  };

  // Collection Actions
  const addCollection = (col: Omit<Collection, 'id'>): Collection => {
    registerLocalEdit();
    const newCol: Collection = {
      ...col,
      id: 'col-' + Date.now(),
    };
    setCollections(prev => {
      const next = [...prev, newCol];
      pushToServer({ collections: next });
      return next;
    });
    return newCol;
  };

  const updateCollection = (id: string, updates: Partial<Collection>) => {
    registerLocalEdit();
    setCollections(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      pushToServer({ collections: next });
      return next;
    });
  };

  const deleteCollection = (id: string) => {
    registerLocalEdit();
    setCollections(prev => {
      const next = prev.filter(c => c.id !== id);
      pushToServer({ collections: next });
      return next;
    });
  };

  // Category Actions
  const addCategory = (cat: Omit<Category, 'id'>): Category => {
    registerLocalEdit();
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now(),
    };
    setCategories(prev => {
      const next = [...prev, newCat];
      pushToServer({ categories: next });
      return next;
    });
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    registerLocalEdit();
    setCategories(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      pushToServer({ categories: next });
      return next;
    });
  };

  const deleteCategory = (id: string) => {
    registerLocalEdit();
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      pushToServer({ categories: next });
      return next;
    });
  };

  // Section Builder Actions
  const addSection = (sec: Omit<HomePageSection, 'id' | 'order'>): HomePageSection => {
    registerLocalEdit();
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), 0);
    const newSection: HomePageSection = {
      ...sec,
      id: 'sec-' + Date.now(),
      order: maxOrder + 1,
    };
    setSections(prev => {
      const next = [...prev, newSection];
      pushToServer({ sections: next });
      return next;
    });
    return newSection;
  };

  const updateSection = (id: string, updates: Partial<HomePageSection>) => {
    registerLocalEdit();
    setSections(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      storeStateRef.current.sections = next;
      idbStorage.setItem('sections', next);
      safeSaveItem('sections', next);
      pushToServer({ sections: next });
      return next;
    });
  };

  const deleteSection = (id: string) => {
    registerLocalEdit();
    setSections(prev => {
      const next = prev.filter(s => s.id !== id);
      pushToServer({ sections: next });
      return next;
    });
  };

  const duplicateSection = (id: string) => {
    const target = sections.find(s => s.id === id);
    if (!target) return;
    registerLocalEdit();
    const maxOrder = sections.reduce((max, s) => Math.max(max, s.order), 0);
    const duplicated: HomePageSection = {
      ...target,
      id: 'sec-' + Date.now(),
      title: `${target.title} (Copy)`,
      titleAr: `${target.titleAr} (نسخة)`,
      order: maxOrder + 1,
    };
    setSections(prev => {
      const next = [...prev, duplicated];
      pushToServer({ sections: next });
      return next;
    });
  };

  const reorderSections = (newSections: HomePageSection[]) => {
    registerLocalEdit();
    const next = newSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(next);
    pushToServer({ sections: next });
  };

  const moveSectionOrder = (id: string, direction: 'up' | 'down') => {
    registerLocalEdit();
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = sorted[index];
    sorted[index] = sorted[swapIndex];
    sorted[swapIndex] = temp;

    const updated = sorted.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSections(updated);
    pushToServer({ sections: updated });
  };

  // Testimonial Actions
  const addTestimonial = (test: Omit<Testimonial, 'id' | 'date'>): Testimonial => {
    registerLocalEdit();
    const newTest: Testimonial = {
      ...test,
      id: 'test-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setTestimonials(prev => {
      const next = [newTest, ...prev];
      pushToServer({ testimonials: next });
      return next;
    });
    return newTest;
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    registerLocalEdit();
    setTestimonials(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      pushToServer({ testimonials: next });
      return next;
    });
  };

  const deleteTestimonial = (id: string) => {
    registerLocalEdit();
    setTestimonials(prev => {
      const next = prev.filter(t => t.id !== id);
      pushToServer({ testimonials: next });
      return next;
    });
  };

  // Promotion Actions
  const addPromotion = (promo: Omit<Promotion, 'id'>): Promotion => {
    registerLocalEdit();
    const newPromo: Promotion = {
      ...promo,
      id: 'promo-' + Date.now(),
    };
    setPromotions(prev => {
      const next = [newPromo, ...prev];
      pushToServer({ promotions: next });
      return next;
    });
    return newPromo;
  };

  const updatePromotion = (id: string, updates: Partial<Promotion>) => {
    registerLocalEdit();
    setPromotions(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      pushToServer({ promotions: next });
      return next;
    });
  };

  const deletePromotion = (id: string) => {
    registerLocalEdit();
    setPromotions(prev => {
      const next = prev.filter(p => p.id !== id);
      pushToServer({ promotions: next });
      return next;
    });
  };

  // Media Actions
  const addMediaItem = (item: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem => {
    registerLocalEdit();
    const newItem: MediaItem = {
      ...item,
      id: 'med-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setMedia(prev => {
      const next = [newItem, ...prev];
      pushToServer({ media: next });
      return next;
    });
    return newItem;
  };

  const deleteMediaItem = (id: string) => {
    registerLocalEdit();
    setMedia(prev => {
      const next = prev.filter(m => m.id !== id);
      pushToServer({ media: next });
      return next;
    });
  };

  // Settings
  const updateSettings = (updates: Partial<StoreSettings>) => {
    registerLocalEdit();
    setSettings(prev => {
      const next = { ...prev, ...updates };
      pushToServer({ settings: next });
      return next;
    });
  };

  // WhatsApp Order URL Generator
  const generateWhatsAppOrderUrl = (product: Product, selectedVariant?: ProductVariant, customNote?: string): string => {
    const finalPrice = selectedVariant?.price || product.finalPrice;
    const originalPrice = product.price;
    const discountAmount = product.discountEnabled && originalPrice > finalPrice ? originalPrice - finalPrice : 0;
    const variantText = selectedVariant ? `${selectedVariant.sizeAr} - اللون: ${selectedVariant.colorAr}` : '';
    
    let text = `مرحباً كوتونيلا 🌸، أود طلب المنتج التالي:
• اسم المنتج: ${product.nameAr || product.name}`;

    if (variantText) {
      text += `\n• المقاس واللون: ${variantText}`;
    }

    if (discountAmount > 0) {
      text += `\n• السعر الأصلي: ${originalPrice} ج.م`;
      text += `\n• قيمة الخصم: وفرت ${discountAmount} ج.م`;
      text += `\n• السعر المطلوب: ${finalPrice} ج.م`;
    } else {
      text += `\n• السعر: ${finalPrice} ج.م`;
    }

    if (customNote) {
      text += `\n• ملاحظة: ${customNote}`;
    }

    const cleanNumber = settings.whatsAppNumber.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('2') ? cleanNumber : `20${cleanNumber.startsWith('0') ? cleanNumber.slice(1) : cleanNumber}`;

    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(text)}`;
  };

  const resetAllData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCollections(INITIAL_COLLECTIONS);
    setCategories(INITIAL_CATEGORIES);
    setTestimonials(INITIAL_TESTIMONIALS);
    setPromotions(INITIAL_PROMOTIONS);
    setSections(INITIAL_SECTIONS);
    setMedia(INITIAL_MEDIA);
    setSettings(INITIAL_SETTINGS);
    try {
      localStorage.clear();
    } catch (e) {}
    idbStorage.clear();
    fetch('/api/store/reset', { method: 'POST' }).catch(() => {});
  };

  const restoreFromBackup = async (storeData: any): Promise<boolean> => {
    try {
      if (storeData.products && Array.isArray(storeData.products)) {
        setProducts(storeData.products);
      }
      if (storeData.collections && Array.isArray(storeData.collections)) {
        setCollections(storeData.collections);
      }
      if (storeData.categories && Array.isArray(storeData.categories)) {
        setCategories(storeData.categories);
      }
      if (storeData.testimonials && Array.isArray(storeData.testimonials)) {
        setTestimonials(storeData.testimonials);
      }
      if (storeData.promotions && Array.isArray(storeData.promotions)) {
        setPromotions(storeData.promotions);
      }
      if (storeData.sections && Array.isArray(storeData.sections)) {
        setSections(storeData.sections);
      }
      if (storeData.media && Array.isArray(storeData.media)) {
        setMedia(storeData.media);
      }
      if (storeData.settings && typeof storeData.settings === 'object') {
        setSettings(prev => ({ ...prev, ...storeData.settings }));
      }

      await pushToServer(storeData);
      return true;
    } catch (err) {
      console.error('Error restoring backup:', err);
      return false;
    }
  };

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActivePage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCollection = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    setActivePage('collection-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <StoreContext.Provider
      value={{
        currentMode,
        setCurrentMode,
        activePage,
        setActivePage,
        selectedProductId,
        setSelectedProductId,
        selectedCollectionId,
        setSelectedCollectionId,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        adminActiveTab,
        setAdminActiveTab,
        isAdminAuthenticated,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginAdmin,
        logoutAdmin,
        products,
        collections,
        categories,
        testimonials,
        promotions,
        sections,
        media,
        settings,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        addCollection,
        updateCollection,
        deleteCollection,
        addCategory,
        updateCategory,
        deleteCategory,
        addSection,
        updateSection,
        deleteSection,
        duplicateSection,
        reorderSections,
        moveSectionOrder,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        addPromotion,
        updatePromotion,
        deletePromotion,
        addMediaItem,
        deleteMediaItem,
        updateSettings,
        generateWhatsAppOrderUrl,
        resetAllData,
        navigateToProduct,
        navigateToCollection,
        toast,
        showToast,
        syncStatus,
        lastSyncedAt,
        syncWithServer,
        restoreFromBackup,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
