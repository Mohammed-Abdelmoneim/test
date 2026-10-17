import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, ChevronDown, MessageCircle, Instagram, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    setIsSearchOpen, 
    settings,
    navigateToCollection 
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);

  const handleNavClick = (page: string) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setCollectionsDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = settings.whatsAppNumber.replace(/\D/g, '');
  const whatsAppDirectUrl = `https://wa.me/20${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent('مرحباً كوتونيلا 💗 أود الاستفسار عن منتجاتكم')}`;

  return (
    <header className="sticky top-0 z-30 bg-[#FDF9F6]/95 backdrop-blur-md border-b border-[#F4E3DA] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Zone 1: Brand Logo (Pure Image Upload from device - Strictly Image, No Text) */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center hover:opacity-90 transition-opacity text-right group py-1"
            title="الصفحة الرئيسية"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Cottonella Logo"
                referrerPolicy="no-referrer"
                className="h-10 sm:h-12 w-auto max-w-[180px] sm:max-w-[240px] object-contain"
              />
            ) : (
              <div className="h-10 sm:h-11 px-3.5 rounded-2xl bg-gradient-to-r from-[#FCE8F0] via-[#FAF1E8] to-[#EBF6EE] border border-[#F6CAD8] flex items-center gap-2 shadow-2xs">
                <span className="text-xl">🌸</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D82B76]/40"></span>
                <span className="text-lg">🌿</span>
              </div>
            )}
          </button>

          {/* Zone 2: Clean 4–6 text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#4A3E42]">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-[#D82B76] transition-colors py-1 ${activePage === 'home' ? 'text-[#D82B76] font-semibold border-b-2 border-[#D82B76]' : ''}`}
            >
              الرئيسية
            </button>

            <button
              onClick={() => handleNavClick('bedsheets')}
              className={`hover:text-[#D82B76] transition-colors py-1 ${activePage === 'bedsheets' ? 'text-[#D82B76] font-semibold border-b-2 border-[#D82B76]' : ''}`}
            >
              مفروشات السرير
            </button>

            <button
              onClick={() => handleNavClick('pouch')}
              className={`hover:text-[#D82B76] transition-colors py-1 ${activePage === 'pouch' ? 'text-[#D82B76] font-semibold border-b-2 border-[#D82B76]' : ''}`}
            >
              بوشات ومقالم
            </button>

            {/* Collections dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCollectionsDropdownOpen(true)}
              onMouseLeave={() => setCollectionsDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavClick('collections')}
                className={`flex items-center gap-1 hover:text-[#D82B76] transition-colors py-1 ${activePage === 'collections' || activePage === 'collection-detail' ? 'text-[#D82B76] font-semibold border-b-2 border-[#D82B76]' : ''}`}
              >
                <span>المجموعات</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {collectionsDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-[#F3DEE7] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => {
                      navigateToCollection('spring-2026');
                      setCollectionsDropdownOpen(false);
                    }}
                    className="w-full text-right px-4 py-2.5 text-xs text-[#3D3337] hover:bg-[#FDF2F6] hover:text-[#D82B76] transition-colors flex items-center justify-between"
                  >
                    <span>ربيع 2026 (حديقة الورد)</span>
                    <span className="text-[10px] text-[#D82B76] font-bold">جديد</span>
                  </button>
                  <button
                    onClick={() => {
                      navigateToCollection('spring-2025');
                      setCollectionsDropdownOpen(false);
                    }}
                    className="w-full text-right px-4 py-2.5 text-xs text-[#3D3337] hover:bg-[#FDF2F6] hover:text-[#D82B76] transition-colors"
                  >
                    ربيع 2025 (إشراقة الطبيعة)
                  </button>
                  <div className="border-t border-[#F5EAEF] my-1"></div>
                  <button
                    onClick={() => handleNavClick('collections')}
                    className="w-full text-right px-4 py-2 text-xs font-semibold text-[#D82B76] hover:bg-[#FDF2F6] transition-colors"
                  >
                    عرض كل المجموعات ←
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('about')}
              className={`hover:text-[#D82B76] transition-colors py-1 ${activePage === 'about' ? 'text-[#D82B76] font-semibold border-b-2 border-[#D82B76]' : ''}`}
            >
              عن قطونيلا
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`hover:text-[#D82B76] transition-colors py-1 ${activePage === 'contact' ? 'text-[#D82B76] font-semibold border-b-2 border-[#D82B76]' : ''}`}
            >
              تواصلي معنا
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Search, Instagram, WhatsApp) */}
          <div className="flex items-center gap-3">
            {settings.header?.showSearch !== false && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#4A3E42] hover:text-[#D82B76] hover:bg-[#F6E8EF] rounded-full transition-colors"
                title="بحث في المتجر"
                aria-label="بحث في المنتجات"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            )}

            {settings.header?.showInstagram !== false && (
              <a
                href={settings.footer.instagramUrl || 'https://instagram.com/cottonella_eg'}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex p-2 text-[#4A3E42] hover:text-[#D82B76] hover:bg-[#F6E8EF] rounded-full transition-colors"
                title="صفحتنا على انستجرام"
                aria-label="انستجرام"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
            )}

            {settings.header?.showWhatsApp !== false && (
              <a
                href={whatsAppDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20BE5B] rounded-lg transition-colors shadow-xs whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">واتساب</span>
                <span className="font-mono text-[11px] ltr:font-sans">{settings.whatsAppNumber}</span>
              </a>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#4A3E42] hover:bg-[#F6E8EF] rounded-lg transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#F4E3DA] px-4 pt-3 pb-6 space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col space-y-2 text-sm font-medium text-[#4A3E42]">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-right py-2 px-3 rounded-lg ${activePage === 'home' ? 'bg-[#FDF2F6] text-[#D82B76] font-bold' : ''}`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => handleNavClick('bedsheets')}
              className={`text-right py-2 px-3 rounded-lg ${activePage === 'bedsheets' ? 'bg-[#FDF2F6] text-[#D82B76] font-bold' : ''}`}
            >
              مفروشات السرير
            </button>
            <button
              onClick={() => handleNavClick('pouch')}
              className={`text-right py-2 px-3 rounded-lg ${activePage === 'pouch' ? 'bg-[#FDF2F6] text-[#D82B76] font-bold' : ''}`}
            >
              بوشات ومقالم
            </button>
            <button
              onClick={() => handleNavClick('collections')}
              className={`text-right py-2 px-3 rounded-lg ${activePage === 'collections' ? 'bg-[#FDF2F6] text-[#D82B76] font-bold' : ''}`}
            >
              المجموعات (ربيع 2026 & 2025)
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`text-right py-2 px-3 rounded-lg ${activePage === 'about' ? 'bg-[#FDF2F6] text-[#D82B76] font-bold' : ''}`}
            >
              عن قطونيلا
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`text-right py-2 px-3 rounded-lg ${activePage === 'contact' ? 'bg-[#FDF2F6] text-[#D82B76] font-bold' : ''}`}
            >
              تواصلي معنا
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
