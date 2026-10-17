import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { WavyCornerDecoration } from '../common/BotanicalDecoration';

export const CollectionsView: React.FC = () => {
  const { collections, products, navigateToCollection } = useStore();

  const publishedCollections = collections.filter(c => c.isPublished);

  return (
    <div className="py-8 sm:py-12 space-y-10">
      {/* Header Banner */}
      <div className="relative bg-[#FAF2EB] border-b border-[#EFE0D5] py-10 sm:py-14 overflow-hidden">
        <WavyCornerDecoration className="absolute -top-4 -left-6 opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F8D69] bg-[#EAF5ED] px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>تشكيلات حصرية مستوحاة من فصول السنة</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D2426]">
            مجموعات قطونيلا (Collections)
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5F64] max-w-2xl leading-relaxed">
            كل مجموعة لها حكاية خاصة ونقوش أقمشة متناسقة تجمع بين المفروشات والبوشات لغرفة نوم متناغمة.
          </p>
        </div>
      </div>

      {/* Collections List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {publishedCollections.map((col) => {
          const colProducts = products.filter(p => col.productIds.includes(p.id));

          return (
            <div
              key={col.id}
              className="bg-white rounded-3xl border border-[#F1E0D6] shadow-xs overflow-hidden transition-all hover:shadow-md"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Banner / Cover Column */}
                <div className="lg:col-span-6 relative aspect-16/10 lg:aspect-auto bg-[#F7ECE4]">
                  <img
                    src={col.coverImage}
                    alt={col.nameAr}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs text-[#2D2426] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs">
                    {col.seasonYear}
                  </span>
                </div>

                {/* Details Column */}
                <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between text-right space-y-6">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#D82B76] tracking-wide uppercase">
                      {col.seasonYear}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426]">
                      {col.nameAr}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6A5D62] leading-relaxed">
                      {col.descriptionAr}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs text-[#7A6C71]">
                      <span>تحتوي المجموعة على:</span>
                      <strong className="text-[#2D2426]">{colProducts.length} قطع متناسقة</strong>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#F5EAE1]">
                    <button
                      onClick={() => navigateToCollection(col.id)}
                      className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#D82B76] hover:bg-[#C21E62] rounded-xl transition-all shadow-xs"
                    >
                      <span>استكشاف قطع المجموعة بالكامل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
