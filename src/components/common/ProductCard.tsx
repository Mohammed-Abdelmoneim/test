import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { getValidImageUrl, BEDSHEET_IMAGE } from '../../data/initialData';
import { MessageCircle, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showCategory = true }) => {
  const { navigateToProduct, generateWhatsAppOrderUrl } = useStore();

  const handleOrderWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateWhatsAppOrderUrl(product);
    window.open(url, '_blank');
  };

  const discountAmount = product.discountEnabled && product.price > product.finalPrice
    ? product.price - product.finalPrice
    : 0;

  return (
    <div
      onClick={() => navigateToProduct(product.id)}
      className="group cursor-pointer bg-white rounded-2xl border border-[#F4E4DC] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col h-full"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-4/3 w-full bg-[#FAF5F2] overflow-hidden">
        {product.images && product.images[0] ? (
          <img
            src={getValidImageUrl(product.images[0])}
            alt={product.nameAr || product.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = BEDSHEET_IMAGE;
            }}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-103"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#FDF0F5] text-[#D82B76]">
            <span className="text-sm font-medium">Cottonella Textile</span>
          </div>
        )}

        {/* Discount Badge */}
        {discountAmount > 0 && (
          <span className="absolute top-3 right-3 bg-[#D82B76] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
            وفرت {discountAmount} ج.م
          </span>
        )}

        {/* Quick View overlay indicator */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-[#2D2426] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5 text-[#D82B76]" />
            <span>عرض التفاصيل</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Metadata clean unboxed */}
          {showCategory && (
            <div className="flex items-center gap-2 text-xs text-[#7B6E72] mb-1.5">
              <span>{product.category === 'bedsheets' ? 'مفروشات سرير' : 'بوش قطني'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#5F8D69] font-medium">هاند ميد 100%</span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-bold text-[#2D2426] group-hover:text-[#D82B76] transition-colors line-clamp-1 leading-snug">
            {product.nameAr || product.name}
          </h3>

          <p className="text-xs text-[#6F6266] mt-1 line-clamp-2 leading-relaxed">
            {product.descriptionAr || product.description}
          </p>
        </div>

        {/* Price & Primary CTA */}
        <div className="pt-2 border-t border-[#F8EFEA] flex items-center justify-between gap-2">
          {/* Price display */}
          <div className="flex flex-col">
            {discountAmount > 0 ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-[#9B8E92]">
                  <span className="line-through font-mono tabular-nums">
                    {product.price} ج.م
                  </span>
                  <span className="text-[#5F8D69] font-bold text-[10px] bg-[#EAF5ED] px-1.5 py-0.5 rounded">
                    - {discountAmount} ج.م
                  </span>
                </div>
                <span className="text-base font-extrabold text-[#D82B76] font-mono tabular-nums">
                  {product.finalPrice} ج.م
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-[#2D2426] font-mono tabular-nums">
                {product.price} ج.م
              </span>
            )}
          </div>

          {/* Order via WhatsApp Button */}
          <button
            onClick={handleOrderWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20BD5A] active:scale-97 rounded-lg transition-all shadow-xs whitespace-nowrap"
            title="اطلبي فوراً عبر واتساب"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>اطلبي الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
