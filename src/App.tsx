/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { TopAnnouncement } from './components/common/TopAnnouncement';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';

// Customer Store Views
import { HomeView } from './components/store/HomeView';
import { BedsheetsView } from './components/store/BedsheetsView';
import { PouchView } from './components/store/PouchView';
import { CollectionsView } from './components/store/CollectionsView';
import { CollectionDetailView } from './components/store/CollectionDetailView';
import { ProductDetailView } from './components/store/ProductDetailView';
import { AboutView } from './components/store/AboutView';
import { ContactView } from './components/store/ContactView';
import { SearchResultsView } from './components/store/SearchResultsView';

// Admin CMS Views (Simplified for ease of use)
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminSectionBuilder } from './components/admin/AdminSectionBuilder';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCollections } from './components/admin/AdminCollections';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminTestimonials } from './components/admin/AdminTestimonials';
import { AdminPromotions } from './components/admin/AdminPromotions';
import { AdminMediaLibrary } from './components/admin/AdminMediaLibrary';
import { AdminAppearance } from './components/admin/AdminAppearance';
import { AdminGeneralSettings } from './components/admin/AdminGeneralSettings';

const AppContent: React.FC = () => {
  const { currentMode, activePage, adminActiveTab, isAdminAuthenticated, toast } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF9F6] text-[#2D2426]">
      
      {/* If admin mode is active AND admin is logged in with password */}
      {currentMode === 'admin' && isAdminAuthenticated ? (
        /* ================= SIMPLIFIED ADMIN CMS ================= */
        <AdminLayout>
          {adminActiveTab === 'products' && <AdminProducts />}
          {adminActiveTab === 'sections' && <AdminSectionBuilder />}
          {adminActiveTab === 'collections' && <AdminCollections />}
          {adminActiveTab === 'categories' && <AdminCategories />}
          {adminActiveTab === 'appearance' && <AdminAppearance />}
          {adminActiveTab === 'testimonials' && <AdminTestimonials />}
          {adminActiveTab === 'promotions' && <AdminPromotions />}
          {adminActiveTab === 'media' && <AdminMediaLibrary />}
          {adminActiveTab === 'settings' && <AdminGeneralSettings />}
        </AdminLayout>
      ) : (
        /* ================= PURE CUSTOMER STOREFRONT (NO CMS BAR) ================= */
        <div className="flex-1 flex flex-col">
          <TopAnnouncement />
          <Navbar />
          
          <main className="flex-1">
            {activePage === 'home' && <HomeView />}
            {activePage === 'bedsheets' && <BedsheetsView />}
            {activePage === 'pouch' && <PouchView />}
            {activePage === 'collections' && <CollectionsView />}
            {activePage === 'collection-detail' && <CollectionDetailView />}
            {activePage === 'product-detail' && <ProductDetailView />}
            {activePage === 'about' && <AboutView />}
            {activePage === 'contact' && <ContactView />}
            {activePage === 'search' && <SearchResultsView />}
          </main>

          <Footer />
          <SearchModal />
        </div>
      )}

      {/* Password Login Modal for Admin */}
      <AdminLoginModal />

      {/* Global Toast Success / Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold bg-[#2D2426] text-white border-white/15">
            <span className="w-5 h-5 rounded-full bg-[#5F8D69] text-white flex items-center justify-center text-xs font-bold shrink-0">✓</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
