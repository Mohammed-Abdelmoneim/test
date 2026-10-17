import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { ArrowRight, Sparkles } from 'lucide-react';
import { WavyCornerDecoration } from '../common/BotanicalDecoration';

export const CollectionDetailView: React.FC = () => {
  const { collections, selectedCollectionId, products, setActivePage } = useStore();

  const collection = collections.find(c => c.id === selectedCollectionId) || collections[0];
  const colProducts = products.filter(p => collection?.productIds.includes(p.id) && p.isPublished);

  if (!collection) {
    return (
      <div className="py-20 text-center">
        <p>المجموعة غير موجودة</p>
        <button onClick={() => setActivePage('collections')} className="mt-4 text-[#D82B76]">
          العودة للمجموعات
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-12">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setActivePage('collections')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C71] hover:text-[#D82B76] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لجميع المجموعات</span>
        </button>
      </div>

      {/* Collection Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#FAF3ED] border border-[#F1DFD5] shadow-sm">
          <WavyCornerDecoration className="absolute -top-4 -left-6 opacity-40 z-10" />
          <div className="relative aspect-21/9 sm:aspect-16/6 w-full bg-[#EADBD1]">
            <img
              src={collection.bannerImage || collection.coverImage}
              alt={collection.nameAr}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white text-right">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FCD5E4] bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full w-fit mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{collection.seasonYear}</span>
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-brand mb-2">
                {collection.nameAr}
              </h1>
              <p className="text-xs sm:text-base text-white/90 max-w-2xl leading-relaxed">
                {collection.descriptionAr}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#F2E3DA] pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#2D2426]">
            قطع المجموعة ({colProducts.length})
          </h2>
          <span className="text-xs text-[#7B6E73]">
            صُنع يدوياً بالطلب والتوصيل لجميع المحافظات
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {colProducts.map(prod => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </div>
  );
};
