import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';
import { WavyCornerDecoration } from '../common/BotanicalDecoration';

export const BedsheetsView: React.FC = () => {
  const { products } = useStore();

  const [selectedSort, setSelectedSort] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [discountOnly, setDiscountOnly] = useState<boolean>(false);

  const bedsheetProducts = useMemo(() => {
    return products.filter(p => p.category === 'bedsheets' && p.isPublished && !p.isArchived);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...bedsheetProducts];

    if (discountOnly) {
      list = list.filter(p => p.discountEnabled);
    }

    if (sizeFilter !== 'all') {
      list = list.filter(p => p.variants?.some(v => (v.size || v.sizeAr || '').toLowerCase().includes(sizeFilter.toLowerCase())));
    }

    if (selectedSort === 'price-asc') {
      list.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (selectedSort === 'price-desc') {
      list.sort((a, b) => b.finalPrice - a.finalPrice);
    }

    return list;
  }, [bedsheetProducts, selectedSort, sizeFilter, discountOnly]);

  return (
    <div className="py-8 sm:py-12 space-y-10">
      {/* Category Header Banner */}
      <div className="relative bg-[#FAF2EB] border-b border-[#EFE0D5] py-10 sm:py-14 overflow-hidden">
        <WavyCornerDecoration className="absolute -top-4 -left-6 opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D82B76] bg-[#FCE8F0] px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مفروشات سرير هاند ميد من القطن المصري</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D2426]">
            مفروشات السرير (Bedsheets)
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5F64] max-w-2xl leading-relaxed">
            ملايات وأطقم سرير مصنوعة يدوياً بحب من قطن مصري 100% بركال عالي الجودة بنقوش الورد البودري وتفاصيل الكشكشة الرقيقة.
          </p>
        </div>
      </div>

      {/* Main Content & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Interactive Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#F2E3DA] shadow-xs flex flex-wrap items-center justify-between gap-4 mb-8">
          
          {/* Size segmented filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7A6C71] ml-1">المقاس:</span>
            <div className="flex items-center gap-1 bg-[#FAF3ED] p-1 rounded-xl">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'single', label: 'مفرد (Single)' },
                { id: 'double', label: 'مزدوج (Double)' },
                { id: 'king', label: 'كينج (King)' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSizeFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    sizeFilter === tab.id
                      ? 'bg-white text-[#D82B76] font-bold shadow-xs'
                      : 'text-[#5E5156] hover:text-[#2D2426]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Controls: Discount toggle & Sort */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#4D4145]">
              <input
                type="checkbox"
                checked={discountOnly}
                onChange={e => setDiscountOnly(e.target.checked)}
                className="rounded text-[#D82B76] focus:ring-[#D82B76]"
              />
              <span>العروض والخصومات فقط</span>
            </label>

            <div className="flex items-center gap-1 border-r border-[#F3E2D8] pr-3">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8A7B80]" />
              <select
                value={selectedSort}
                onChange={e => setSelectedSort(e.target.value as any)}
                aria-label="ترتيب حسب"
                className="text-xs bg-transparent text-[#2D2426] font-medium border-0 focus:ring-0 cursor-pointer"
              >
                <option value="featured">المميز أولاً</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#F2E3DA] p-8 space-y-3">
            <p className="text-base font-bold text-[#2D2426]">لا توجد قطع مطابقة للفلتر المحدد</p>
            <p className="text-xs text-[#827479]">جربي إلغاء تحديد الخصم أو اختيار مقاس آخر</p>
            <button
              onClick={() => { setSizeFilter('all'); setDiscountOnly(false); }}
              className="mt-2 text-xs font-bold text-[#D82B76] hover:underline"
            >
              عرض جميع مفروشات السرير
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
