import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { Search } from 'lucide-react';

export const SearchResultsView: React.FC = () => {
  const { searchQuery, setSearchQuery, products, setActivePage } = useStore();

  const results = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.nameAr.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.descriptionAr.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="py-8 sm:py-12 space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      <div className="bg-[#FAF3ED] p-6 sm:p-8 rounded-3xl border border-[#F1E0D6] space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426]">
          نتائج البحث {searchQuery ? `عن "${searchQuery}"` : ''}
        </h1>
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحثي عن ملايات، بوشات، خداديات..."
            className="w-full text-right p-3 pr-10 rounded-xl border border-[#ECD9CE] bg-white text-xs text-[#2D2426] focus:outline-hidden focus:border-[#D82B76]"
          />
          <Search className="w-4 h-4 text-[#8C7D82] absolute top-3.5 right-3" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-[#7B6E73]">
          تم العثور على <strong>{results.length}</strong> قطعة
        </span>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#F2E0D4] space-y-3">
          <p className="text-base font-bold text-[#2D2426]">لا توجد نتائج مطابقة لبحثك</p>
          <button
            onClick={() => setActivePage('bedsheets')}
            className="text-xs font-bold text-[#D82B76] hover:underline"
          >
            تصفحي جميع مفروشات السرير
          </button>
        </div>
      )}
    </div>
  );
};
