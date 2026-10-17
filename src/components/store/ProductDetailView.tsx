import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { ProductVariant } from '../../types';
import { getValidImageUrl, BEDSHEET_IMAGE } from '../../data/initialData';
import { 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Check, 
  PackageCheck
} from 'lucide-react';
import { BotanicalLeafIcon, RoseFloralIcon } from '../common/BotanicalDecoration';

export const ProductDetailView: React.FC = () => {
  const { 
    products, 
    selectedProductId, 
    setActivePage, 
    generateWhatsAppOrderUrl,
    settings 
  } = useStore();

  const product = products.find(p => p.id === selectedProductId) || products[0];

  const [activeImage, setActiveImage] = useState<string>(
    product?.images && product.images.length > 0 ? product.images[0] : ''
  );
  
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants && product.variants.length > 0 ? product.variants[0].id : ''
  );
  
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'shipping'>('details');

  // When product changes, reset default image to product's primary image
  useEffect(() => {
    if (product) {
      if (product.images && product.images.length > 0) {
        setActiveImage(product.images[0]);
      } else if (product.variants && product.variants.length > 0 && product.variants[0].image) {
        setActiveImage(product.variants[0].image);
      }
      if (product.variants && product.variants.length > 0) {
        setSelectedVariantId(product.variants[0].id);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p>المنتج غير موجود</p>
        <button onClick={() => setActivePage('bedsheets')} className="mt-4 text-[#D82B76]">
          العودة للتسوق
        </button>
      </div>
    );
  }

  // Selected variant
  const selectedVariant: ProductVariant | undefined = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];
  const currentPrice = selectedVariant ? selectedVariant.price : product.finalPrice;

  // Handle variant selection: update variant AND switch image to variant image!
  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
    if (variant.image) {
      setActiveImage(variant.image);
    }
  };

  const handleOrderWhatsApp = () => {
    const url = generateWhatsAppOrderUrl(product, selectedVariant);
    window.open(url, '_blank');
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category && p.isPublished)
    .slice(0, 3);

  const imagesList = Array.from(new Set([
    ...(product.images || []),
    ...(product.variants?.map(v => v.image).filter(Boolean) as string[] || [])
  ]));

  return (
    <div className="py-6 sm:py-10 space-y-14">
      {/* Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setActivePage(product.category === 'bedsheets' ? 'bedsheets' : 'pouch')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6C71] hover:text-[#D82B76] transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى {product.category === 'bedsheets' ? 'مفروشات السرير' : 'البوشات والمقالم'}</span>
        </button>
      </div>

      {/* Main PDP Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Gallery Column (Sticky left on RTL) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-4/3 sm:aspect-16/11 w-full bg-[#FAF5F2] rounded-3xl overflow-hidden border border-[#F1E0D6] shadow-sm">
              <img
                src={getValidImageUrl(activeImage || imagesList[0])}
                alt={product.nameAr}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = BEDSHEET_IMAGE;
                }}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
              {product.discountEnabled && product.price > currentPrice && (
                <span className="absolute top-4 right-4 bg-[#D82B76] text-white text-xs font-extrabold px-3 py-1 rounded-md shadow-xs">
                  وفرت {product.price - currentPrice} ج.م
                </span>
              )}

              {selectedVariant?.colorAr && (
                <span className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs text-[#2D2426] text-xs font-bold px-3 py-1 rounded-lg shadow-xs flex items-center gap-1.5">
                  {selectedVariant.colorHex && (
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: selectedVariant.colorHex }} />
                  )}
                  <span>اللون المعروض: {selectedVariant.colorAr}</span>
                </span>
              )}
            </div>

            {/* Thumbnails row */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === img
                        ? 'border-[#D82B76] ring-2 ring-[#D82B76]/20'
                        : 'border-[#ECD9CE] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getValidImageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = BEDSHEET_IMAGE;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Handcrafted Guarantee Card */}
            <div className="bg-[#FAF3ED] rounded-2xl p-4 sm:p-5 border border-[#F2E0D4] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center text-[#D82B76] shrink-0">
                  <RoseFloralIcon className="w-5 h-5 text-[#D82B76]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#2D2426]">خياطة وتطريز هاند ميد 100%</h4>
                  <p className="text-[11px] sm:text-xs text-[#73656A]">كل قطعة تُصنع يدوياً بحب في مصر بأجود خامات القطن الطبيعي.</p>
                </div>
              </div>
              <span className="hidden sm:inline-block text-xs font-bold text-[#5F8D69] bg-[#EAF5ED] px-2.5 py-1 rounded-lg">
                قطن مصري أصيل
              </span>
            </div>
          </div>

          {/* Purchase Module Column (Sticky right on RTL) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 text-right">
            <div>
              {/* Category & Status */}
              <div className="flex items-center gap-2 text-xs text-[#7B6E72] mb-2">
                <span>{product.category === 'bedsheets' ? 'مفروشات السرير' : 'بوشات ومقالم'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5F8D69] font-semibold flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>متوفر للتسليم الفوري</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[11px]">كود: {selectedVariant?.sku || product.sku}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426] leading-snug">
                {product.nameAr}
              </h1>

              {/* Price Display */}
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#D82B76] font-mono tabular-nums">
                  {currentPrice} ج.م
                </span>
                {product.discountEnabled && product.price > currentPrice && (
                  <>
                    <span className="text-sm sm:text-base text-[#9A8D92] line-through font-mono tabular-nums">
                      السعر الأصلي: {product.price} ج.م
                    </span>
                    <span className="text-xs font-bold text-[#5F8D69] bg-[#EBF6EE] px-2.5 py-1 rounded-md">
                      وفرت {product.price - currentPrice} ج.م
                    </span>
                  </>
                )}
                <span className="text-xs text-[#7A6C71]">
                  (شامل جميع القطع المذكورة)
                </span>
              </div>
            </div>

            {/* ================= DYNAMIC VARIANTS SELECTOR (Size & Color) ================= */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-[#F2E2D8]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#42363A]">
                    المقاس واللون المتوفرين:
                  </label>
                  {selectedVariant && (
                    <span className="text-xs text-[#D82B76] font-bold">
                      {selectedVariant.sizeAr} ({selectedVariant.colorAr})
                    </span>
                  )}
                </div>

                {/* Variant cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariantId === v.id;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'border-[#D82B76] bg-[#FDF2F6] text-[#D82B76] shadow-xs ring-1 ring-[#D82B76]/30'
                            : 'border-[#ECD9CE] bg-white text-[#4A3E42] hover:border-[#D82B76]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {v.colorHex && (
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: v.colorHex }}
                              />
                            )}
                            <span className="text-xs font-bold">{v.sizeAr || v.size}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#D82B76]" />}
                        </div>

                        <div className="flex items-center justify-between w-full text-[11px] text-[#7A6C71] pt-1 border-t border-black/5">
                          <span>{v.colorAr || v.color}</span>
                          <span className="font-mono font-bold text-[#2D2426]">{v.price} ج.م</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Primary Order Conversion: WhatsApp Button */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={handleOrderWhatsApp}
                className="w-full py-4 px-6 text-sm sm:text-base font-extrabold text-white bg-[#25D366] hover:bg-[#1EBE58] active:scale-98 rounded-2xl transition-all shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-5 h-5" />
                <span>اطلبي الآن عبر واتساب</span>
              </button>

              <p className="text-[11px] text-[#7A6C71] text-center">
                يتم إرسال المقاس المختار ({selectedVariant?.sizeAr || 'الافتراضي'}) واللون والسعر تلقائياً إلى واتساب قطونيلا المباشر ({settings.whatsAppNumber})
              </p>
            </div>

            {/* Trust and Delivery Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F2E2D8] text-xs text-[#5D5054]">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5F2]">
                <Truck className="w-4 h-4 text-[#5F8D69] shrink-0" />
                <span>توصيل لجميع المحافظات</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF5F2]">
                <ShieldCheck className="w-4 h-4 text-[#D82B76] shrink-0" />
                <span>الدفع عند الاستلام</span>
              </div>
            </div>

            {/* Product Specifications Tabs */}
            <div className="pt-4 border-t border-[#F2E2D8] space-y-3">
              <div className="flex items-center gap-2 border-b border-[#F2E2D8] pb-1">
                {[
                  { id: 'details', label: 'الخامات والمقاسات' },
                  { id: 'care', label: 'طريقة الغسيل' },
                  { id: 'shipping', label: 'التوصيل والاستلام' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-xs pb-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-[#D82B76] border-b-2 border-[#D82B76] font-bold'
                        : 'text-[#7B6E73] hover:text-[#2D2426]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#675A5F] leading-relaxed pt-1">
                {activeTab === 'details' && (
                  <div className="space-y-2">
                    <p><strong>🧵 الخامة:</strong> {product.materialsAr || product.materials}</p>
                    <p><strong>📏 المقاسات:</strong> {product.dimensionsAr || product.dimensions}</p>
                    <p><strong>✨ التصنيع:</strong> هاند ميد 100% في ورشتنا المتخصصة بالقاهرة.</p>
                  </div>
                )}
                {activeTab === 'care' && (
                  <div className="space-y-1.5">
                    <p>{product.careInstructionsAr || product.careInstructions}</p>
                    <p className="text-[#5F8D69]">✓ يفضل الغسيل بماء بارد للمحافظة على ألوان الورد الزاهية.</p>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-1.5">
                    <p>• التوصيل داخل القاهرة والجيزة خلال 48-72 ساعة.</p>
                    <p>• باقي المحافظات خلال 3-5 أيام عمل.</p>
                    <p>• الدفع عند الاستلام مع إمكانية فتح الشحنة والتأكد من جودة القطع قبل الدفع.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-[#F2E3DA]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#2D2426]">
              قطع تليق بنفس الذوق 🌸
            </h3>
            <span className="text-xs text-[#D82B76] font-semibold">تنسيقات مفضلة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
