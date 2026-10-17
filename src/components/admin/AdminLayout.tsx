import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Package,
  Layers,
  FolderTree,
  Star,
  Tag,
  Image as ImageIcon,
  Palette,
  Settings,
  Blocks,
  Store,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { 
    adminActiveTab, 
    setAdminActiveTab, 
    setCurrentMode, 
    products, 
    settings,
    logoutAdmin,
    syncStatus,
    lastSyncedAt,
    syncWithServer
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simplified friendly menu items for a simple girl to manage her shop
  const menuItems = [
    { id: 'products', label: 'المنتجات والمقاسات', icon: Package, count: products.length },
    { id: 'sections', label: 'تصميم الصفحة الرئيسية', icon: Blocks, badge: 'المظهر' },
    { id: 'collections', label: 'المجموعات الموسمية', icon: Layers },
    { id: 'categories', label: 'أقسام المتجر (ملايات/بوش)', icon: FolderTree },
    { id: 'appearance', label: 'اللوجو والهيدر والألوان', icon: Palette },
    { id: 'testimonials', label: 'آراء العميلات 💗', icon: Star },
    { id: 'promotions', label: 'العروض والخصومات', icon: Tag },
    { id: 'media', label: 'مكتبة الصور', icon: ImageIcon },
    { id: 'settings', label: 'إعدادات وكلمة المرور', icon: Settings },
  ];

  const handleReturnToStore = () => {
    setCurrentMode('store');
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      window.location.hash = '';
    }
  };

  const handleLogout = () => {
    logoutAdmin();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F8] text-[#241C1E] flex flex-col md:flex-row antialiased">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#2D2426] text-white px-4 py-3 flex items-center justify-between border-b border-black/20 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-white/80 hover:text-white rounded-lg"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-brand font-bold text-lg text-[#F9A8C5]">
            {settings.brandNameAr || 'قطونيلا'} CMS
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs bg-white/15 text-white px-3 py-1.5 rounded-lg font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 right-0 z-40 h-screen w-72 bg-[#2D2426] text-white flex flex-col justify-between transition-transform duration-200 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-brand text-2xl font-bold text-[#F9A8C5]">
                    {settings.brandNameAr || 'قطونيلا'}
                  </span>
                  <span className="text-[10px] font-mono tracking-wider bg-white/15 px-2 py-0.5 rounded text-white/80">CMS</span>
                </div>
                <span className="text-xs text-white/60 block mt-0.5">لوحة التحكم البسيطة</span>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation items */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminActiveTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#D82B76] text-white shadow-xs'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/60'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/15 text-white">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom actions: View site & Logout */}
          <div className="pt-4 border-t border-white/10 space-y-2 mt-4">
            <button
              onClick={handleReturnToStore}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-colors"
            >
              <Store className="w-4 h-4 text-[#F9A8C5]" />
              <span>مشاهدة المتجر كعميلة</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/10 text-xs font-bold rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج من الإدارة</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Top bar with breadcrumb */}
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-[#EDE2E5] shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#7B6E72]">
            <span className="font-semibold text-[#2D2426]">إدارة كوتونيلا</span>
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="text-[#D82B76] font-bold">
              {menuItems.find(m => m.id === adminActiveTab)?.label || adminActiveTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Server Synchronization status */}
            <div className="hidden sm:flex items-center gap-2">
              {syncStatus === 'synced' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متزامن مع الخادم</span>
                </span>
              )}
              {syncStatus === 'syncing' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                  <span>جاري المزامنة...</span>
                </span>
              )}
              {syncStatus === 'error' && (
                <button
                  onClick={() => syncWithServer()}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  title="إعادة محاولة المزامنة"
                >
                  <RefreshCw className="w-3 h-3 text-rose-600" />
                  <span>إعادة المزامنة</span>
                </button>
              )}
            </div>

            <button
              onClick={handleReturnToStore}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D82B76] hover:bg-[#FDEBF1] px-3 py-1.5 rounded-lg transition-colors border border-[#F6CBDC]"
            >
              <Store className="w-3.5 h-3.5" />
              <span>زيارة المتجر</span>
            </button>
          </div>
        </div>

        {children}
      </main>

    </div>
  );
};
