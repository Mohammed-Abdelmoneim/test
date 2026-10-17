import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { Heart, Sparkles } from 'lucide-react';
import { WavyCornerDecoration } from '../common/BotanicalDecoration';

export const PouchView: React.FC = () => {
  const { products } = useStore();

  const pouchProducts = products.filter(
    p => p.category === 'pouch' && p.isPublished && !p.isArchived
  );

  return (
    <div className="py-8 sm:py-12 space-y-10">
      {/* Category Header Banner */}
      <div className="relative bg-[#FAF2EB] border-b border-[#EFE0D5] py-10 sm:py-14 overflow-hidden">
        <WavyCornerDecoration className="absolute -top-4 -left-6 opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D82B76] bg-[#FCE8F0] px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوشات ومقالم مبطنة هاند ميد</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D2426]">
            بوشات ومقالم (Pouches & Bags)
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5F64] max-w-2xl leading-relaxed">
            بوشات كوزمتيكس ومقالم قطنية مبطنة بحشوة ناعمة مقاومة للماء مع سحاب ذهبي راقي لحفظ مستحضراتك وأشيائك اليومية بأناقة.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Subtle Inspiration Banner */}
        <div className="bg-[#FFF8FA] border border-[#FBE0EC] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center text-[#D82B76] shrink-0">
              <Heart className="w-5 h-5 fill-[#D82B76]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#2D2426]">الهدية المثالية لأعز صاحبة 🌸</h3>
              <p className="text-[11px] sm:text-xs text-[#7A6C71]">جميع البوشات تأتي مغلفة بعناية مع كارت إهداء "دُمتن جميلات" مجاناً مع كل طلب.</p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pouchProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};
