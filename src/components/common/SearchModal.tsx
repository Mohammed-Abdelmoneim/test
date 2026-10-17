import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowLeft, Tag } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    products, 
    categories, 
    collections, 
    navigateToProduct, 
    navigateToCollection,
    setActivePage,
    setSearchQuery 
  } = useStore();

  const [inputVal, setInputVal] = useState('');

  const filteredResults = useMemo(() => {
    if (!inputVal.trim()) return { products: [], categories: [], collections: [] };
    const q = inputVal.toLowerCase().trim();

    const matchedProducts = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.nameAr.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.descriptionAr.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );

    const matchedCategories = categories.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.nameAr.toLowerCase().includes(q)
    );

    const matchedCollections = collections.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.nameAr.toLowerCase().includes(q)
    );

    return {
      products: matchedProducts,
      categories: matchedCategories,
      collections: matchedCollections,
    };
  }, [inputVal, products, categories, collections]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setIsSearchOpen(false);
    setInputVal('');
  };

  const handleSelectProduct = (id: string) => {
    navigateToProduct(id);
    handleClose();
  };

  const handleSelectCollection = (id: string) => {
    navigateToCollection(id);
    handleClose();
  };

  const handleSelectCategory = (slug: string) => {
    setActivePage(slug === 'bedsheets' ? 'bedsheets' : 'pouch');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-3 sm:px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-[#F1E0D6] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-[#F4E3DA] shrink-0 bg-white">
          <Search className="w-5 h-5 text-[#D82B76] shrink-0 mr-2" />
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="ابحثي عن ملايات، بوشات، خداديات، كشكشة، قطن مصري..."
            className="w-full text-right bg-transparent text-sm sm:text-base text-[#2D2426] placeholder-[#A4979C] focus:outline-hidden pr-2"
            autoFocus
          />
          {inputVal && (
            <button
              onClick={() => setInputVal('')}
              className="p-1 text-[#A4979C] hover:text-[#2D2426] rounded-md ml-2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-[#8B7C80] hover:text-[#D82B76] mr-3 px-2.5 py-1.5 bg-[#FAF3ED] rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
          {!inputVal.trim() ? (
            <div className="py-6 text-center text-[#8C7D82] space-y-3">
              <p className="text-xs sm:text-sm">اكتبي اسم المنتج أو الخامة للبحث الفوري</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                <span className="text-xs text-[#9B8C92] ml-1">كلمات شائعة:</span>
                {['بينك بلوسوم', 'بوش ميك اب', 'خداديات', 'ميرمية', 'ربيع 2026'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setInputVal(tag)}
                    className="text-xs bg-[#FAF2EB] text-[#4D4246] hover:text-[#D82B76] hover:bg-[#FCE8F0] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-[#D82B76]" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Products match */}
              {filteredResults.products.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8C7D82] uppercase mb-2">
                    المنتجات المطابقة ({filteredResults.products.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredResults.products.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product.id)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF2EB] cursor-pointer transition-colors border border-transparent hover:border-[#ECDCD2]"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.nameAr}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-lg object-cover bg-[#F5ECE5] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold text-[#2D2426] truncate">
                            {product.nameAr}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-[#7B6E72] mt-0.5">
                            <span>{product.category === 'bedsheets' ? 'مفروشات سرير' : 'بوش'}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums text-[#D82B76] font-bold">
                              {product.finalPrice} ج.م
                            </span>
                          </div>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-[#C4B3BB] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collections match */}
              {filteredResults.collections.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#8C7D82] uppercase mb-2">
                    المجموعات ({filteredResults.collections.length})
                  </h4>
                  <div className="space-y-2">
                    {filteredResults.collections.map(col => (
                      <div
                        key={col.id}
                        onClick={() => handleSelectCollection(col.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF5F2] hover:bg-[#F8ECE3] cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#2D2426]">{col.nameAr}</div>
                          <div className="text-xs text-[#7A6C71]">{col.seasonYear}</div>
                        </div>
                        <span className="text-xs text-[#D82B76] font-medium">عرض المجموعة ←</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Zero results */}
              {filteredResults.products.length === 0 && 
               filteredResults.categories.length === 0 && 
               filteredResults.collections.length === 0 && (
                <div className="py-8 text-center text-[#8C7D82]">
                  <p className="text-sm">لم نجد نتائج مطابقة لـ "{inputVal}"</p>
                  <p className="text-xs text-[#A4979C] mt-1">جربي البحث بكلمات عامة مثل "ملاية" أو "وردي" أو "بوش"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
