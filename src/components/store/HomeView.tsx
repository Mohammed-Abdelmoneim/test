import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { WavyCornerDecoration, SparkleStar, BotanicalLeafIcon, RoseFloralIcon } from '../common/BotanicalDecoration';
import { getValidImageUrl, BEDSHEET_IMAGE, HERO_IMAGE, PILLOW_IMAGE } from '../../data/initialData';
import { MessageCircle, ArrowLeft, Heart, Star, Instagram, Sparkles } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { 
    sections, 
    products, 
    categories, 
    collections, 
    testimonials, 
    setActivePage, 
    navigateToProduct, 
    navigateToCollection,
    settings 
  } = useStore();

  const sortedSections = [...sections]
    .filter(s => s.isVisible)
    .sort((a, b) => a.order - b.order);

  const cleanPhone = settings.whatsAppNumber.replace(/\D/g, '');
  const whatsAppDirectUrl = `https://wa.me/20${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}`;

  return (
    <div className="space-y-16 sm:space-y-24 pb-16 overflow-hidden">
      {sortedSections.map((section) => {
        switch (section.type) {
          
          /* ----------------- 1. HERO SECTION ----------------- */
          case 'hero': {
            const headline = section.content.headlineAr || 'خلي سريرك يحكي عنك';
            const subheadline = section.content.subheadlineAr || 'مفروشات هاند ميد بتفاصيل أنثوية رقيقة تحوّل أوضتك لمكان يشبهك.';
            const ctaText = section.content.ctaTextAr || 'اكتشفي المجموعة';
            const ctaLink = section.content.ctaLink || '/bedsheets';
            const secondaryText = section.content.secondaryCtaTextAr || 'تواصلي معنا عبر واتساب';
            const imageUrl = section.content.imageUrl;
            const badge = section.content.badgeTextAr || 'صُنع بحب في مصر 🤍 دُمتن جميلات';
            const showTrust = section.content.showTrustMarkers !== false;
            const trust1 = section.content.trustText1Ar || 'قطن مصري طبيعي 100%';
            const trust2 = section.content.trustText2Ar || 'خياطة يدوية دقيقة';
            const trust3 = section.content.trustText3Ar || 'دفع عند الاستلام';
            const showFloating = section.content.showFloatingCard !== false;
            const floatingTitle = section.content.floatingBadgeTitleAr !== undefined ? section.content.floatingBadgeTitleAr : 'تفاصيل تفرّح القلب';
            const floatingText = section.content.floatingBadgeTextAr !== undefined ? section.content.floatingBadgeTextAr : 'تطريزات وكشكشة بألوان الباستيل الهادية';
            const floatingIcon = section.content.floatingBadgeIcon || 'heart';
            const floatingPos = section.content.floatingPosition || 'bottom-left';
            const imageRatio = section.content.imageAspectRatio || '4/3';
            const aspectClass =
              imageRatio === '16/9'
                ? 'aspect-16/9'
                : imageRatio === '3/4'
                ? 'aspect-3/4'
                : imageRatio === '1/1'
                ? 'aspect-square'
                : 'aspect-4/3 sm:aspect-16/11';
            const heroBg = section.backgroundColor || '#FAF3ED';

            return (
              <section 
                key={section.id}
                style={{ backgroundColor: heroBg }}
                className="relative border-b border-[#F0DFD4] pt-8 sm:pt-14 pb-12 sm:pb-20 overflow-hidden"
              >
                {/* Wavy Corner decorations matching wac.png */}
                <WavyCornerDecoration className="absolute -top-4 -left-6 opacity-60" />
                <WavyCornerDecoration className="absolute -bottom-8 -right-8 opacity-45 rotate-180" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* Text Column */}
                    <div className="lg:col-span-6 space-y-6 text-right">
                      {/* Quiet metadata kicker */}
                      {badge && (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#D82B76] bg-[#FDE7F0] px-3 py-1.5 rounded-full border border-[#F9CADC]">
                          <SparkleStar className="w-3.5 h-3.5 text-[#5F8D69]" />
                          <span>{badge}</span>
                        </div>
                      )}

                      {/* Headline in characterful display face */}
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2D2426] leading-[1.25] tracking-tight">
                        {headline}
                      </h1>

                      <p className="text-sm sm:text-base md:text-lg text-[#665A5E] leading-relaxed max-w-xl">
                        {subheadline}
                      </p>

                      {/* Primary and secondary CTAs */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                        <button
                          onClick={() => {
                            if (ctaLink.includes('bedsheet')) setActivePage('bedsheets');
                            else if (ctaLink.includes('pouch')) setActivePage('pouch');
                            else setActivePage('collections');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-6 py-3.5 text-sm font-bold text-white bg-[#D82B76] hover:bg-[#C21E62] active:scale-98 rounded-xl transition-all shadow-md shadow-[#D82B76]/20 flex items-center gap-2"
                        >
                          <span>{ctaText}</span>
                          <ArrowLeft className="w-4 h-4" />
                        </button>

                        <a
                          href={whatsAppDirectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-3.5 text-sm font-bold text-[#2D2426] hover:text-[#25D366] bg-white hover:bg-[#FDF9F6] border border-[#ECD9CE] rounded-xl transition-all shadow-xs flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          <span>{secondaryText}</span>
                        </a>
                      </div>

                      {/* Subtle trust markers */}
                      {showTrust && (
                        <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[#7A6D71] border-t border-[#EFE0D5]/70">
                          {trust1 && (
                            <div className="flex items-center gap-1.5">
                              <BotanicalLeafIcon className="w-4 h-4 text-[#5F8D69]" />
                              <span>{trust1}</span>
                            </div>
                          )}
                          {trust1 && trust2 && <span aria-hidden="true">·</span>}
                          {trust2 && (
                            <div className="flex items-center gap-1.5">
                              <RoseFloralIcon className="w-4 h-4 text-[#D82B76]" />
                              <span>{trust2}</span>
                            </div>
                          )}
                          {trust2 && trust3 && <span aria-hidden="true">·</span>}
                          {trust3 && <span>{trust3}</span>}
                        </div>
                      )}
                    </div>

                    {/* Image Column */}
                    <div className="lg:col-span-6 relative">
                      <div className="relative mx-auto max-w-md lg:max-w-none">
                        <div className={`relative ${aspectClass} rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-[#FAF5F2]`}>
                          {imageUrl ? (
                            <img
                              src={getValidImageUrl(imageUrl, HERO_IMAGE)}
                              alt="Cottonella Bedroom Decor"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = HERO_IMAGE;
                              }}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#9A8D92]">
                              <span className="text-4xl mb-2">🌸</span>
                              <span className="text-xs font-semibold">صورة بانر الواجهة</span>
                            </div>
                          )}
                        </div>

                        {/* Floating subtle card */}
                        {showFloating && (
                          <div 
                            className={`mt-3 sm:mt-0 ${
                              floatingPos === 'bottom-right' 
                                ? 'sm:absolute sm:-bottom-5 sm:-right-4 md:right-4'
                                : floatingPos === 'center'
                                ? 'sm:absolute sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2'
                                : floatingPos === 'top-right'
                                ? 'sm:absolute sm:top-4 sm:-right-4 md:right-4'
                                : 'sm:absolute sm:-bottom-5 sm:-left-4 md:left-4'
                            } bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-[#F1E0D6] shadow-lg max-w-sm flex items-center gap-3 z-10 transition-all`}
                          >
                            <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center text-[#D82B76] shrink-0">
                              {floatingIcon === 'sparkles' && <Sparkles className="w-5 h-5 text-[#D82B76]" />}
                              {floatingIcon === 'star' && <Star className="w-5 h-5 fill-[#E5A826] text-[#E5A826]" />}
                              {floatingIcon === 'rose' && <RoseFloralIcon className="w-5 h-5 text-[#D82B76]" />}
                              {floatingIcon === 'leaf' && <BotanicalLeafIcon className="w-5 h-5 text-[#5F8D69]" />}
                              {floatingIcon === 'gift' && <SparkleStar className="w-5 h-5 text-[#D82B76]" />}
                              {(floatingIcon === 'heart' || !['sparkles', 'star', 'rose', 'leaf', 'gift'].includes(floatingIcon)) && (
                                <Heart className="w-5 h-5 fill-[#D82B76]" />
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-[#2D2426] block">{floatingTitle}</span>
                              <span className="text-[11px] text-[#786A6F] leading-tight">{floatingText}</span>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                  </div>
                </div>
              </section>
            );
          }

          /* ----------------- 2. CATEGORIES SECTION ----------------- */
          case 'categories': {
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                  <span className="text-xs font-bold text-[#D82B76] tracking-wide uppercase">
                    {section.titleAr || 'أقسام المتجر'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426]">
                    {section.subtitleAr || 'تصفحي تشكيلة كوتونيلا الهاند ميد'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {categories.filter(c => c.isVisible).map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setActivePage(cat.slug === 'bedsheets' ? 'bedsheets' : 'pouch');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer relative rounded-3xl overflow-hidden bg-white border border-[#F1E0D6] shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <div className="aspect-16/10 relative overflow-hidden bg-[#F6ECE4]">
                        <img
                          src={getValidImageUrl(cat.image, BEDSHEET_IMAGE)}
                          alt={cat.nameAr}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = BEDSHEET_IMAGE;
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white text-right">
                          <h3 className="text-xl sm:text-2xl font-bold font-brand mb-1">
                            {cat.nameAr}
                          </h3>
                          <p className="text-xs sm:text-sm text-white/90 line-clamp-2 max-w-md">
                            {cat.descriptionAr}
                          </p>
                          <div className="pt-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-lg group-hover:bg-[#D82B76] group-hover:text-white transition-colors">
                              <span>تصفحي المنتجات</span>
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          /* ----------------- 3. FEATURED PRODUCTS ----------------- */
          case 'featured_products': {
            const limit = section.content.displayLimit || 4;
            const featuredList = products
              .filter(p => p.isPublished && !p.isArchived)
              .filter(p => section.content.selectedProductIds?.length 
                ? section.content.selectedProductIds.includes(p.id) 
                : p.isFeatured)
              .slice(0, limit);

            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#D82B76] tracking-wide block mb-1">
                      {section.titleAr || 'القطع الأكثر حباً 💗'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426]">
                      {section.subtitleAr || 'اختيارات مفضلة لغرف نوم ساحرة'}
                    </h2>
                  </div>

                  <button
                    onClick={() => { setActivePage('bedsheets'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-xs font-bold text-[#D82B76] hover:text-[#9F1752] transition-colors flex items-center gap-1"
                  >
                    <span>عرض جميع المنتجات</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredList.map(prod => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </section>
            );
          }

          /* ----------------- 4. PROMO BANNER ----------------- */
          case 'promo_banner': {
            const bg = section.backgroundColor || '#D82B76';
            const headline = section.content.headlineAr || '🌸 خصم 20% لفترة محدودة على تشكيلة ربيع 2026';
            const subheadline = section.content.subheadlineAr || 'اطلبي الآن وخلي كوتونيلا توصل لباب بيتك بأجمل تغليف هدية.';
            const btnText = section.content.buttonTextAr || 'اطلبي الآن عبر واتساب';

            return (
              <section 
                key={section.id} 
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
              >
                <div 
                  className="rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-lg"
                  style={{ backgroundColor: bg }}
                >
                  <WavyCornerDecoration className="absolute -top-6 -left-6 opacity-30 text-white" />
                  <WavyCornerDecoration className="absolute -bottom-6 -right-6 opacity-30 text-white rotate-180" />

                  <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <span className="inline-block text-xs font-bold tracking-widest bg-white/20 px-3 py-1 rounded-full uppercase">
                      عرض خاص ومحدود
                    </span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-snug">
                      {headline}
                    </h2>
                    <p className="text-xs sm:text-base text-white/90 leading-relaxed">
                      {subheadline}
                    </p>
                    <div className="pt-2">
                      <a
                        href={whatsAppDirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-[#D82B76] bg-white hover:bg-[#FDF2F6] active:scale-98 rounded-xl transition-all shadow-md"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        <span>{btnText}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          /* ----------------- 5. FEATURED COLLECTION ----------------- */
          case 'featured_collection': {
            const targetCol = collections.find(c => c.id === (section.content.collectionId || 'spring-2026')) || collections[0];
            const colProducts = products.filter(p => targetCol?.productIds.includes(p.id)).slice(0, 3);

            return (
              <section key={section.id} className="bg-[#FAF3ED] py-14 sm:py-20 border-y border-[#EFE0D5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
                    <div className="lg:col-span-8 text-right space-y-2">
                      <span className="text-xs font-bold text-[#5F8D69] tracking-wider uppercase">
                        {targetCol?.seasonYear || 'تشكيلة الموسم'}
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2D2426]">
                        {targetCol?.nameAr}
                      </h2>
                      <p className="text-xs sm:text-base text-[#6F6166] max-w-2xl leading-relaxed">
                        {targetCol?.descriptionAr}
                      </p>
                    </div>

                    <div className="lg:col-span-4 text-left">
                      <button
                        onClick={() => navigateToCollection(targetCol?.id || 'spring-2026')}
                        className="px-5 py-3 text-xs sm:text-sm font-bold text-[#D82B76] bg-white hover:bg-[#FDECF2] border border-[#F3CBDC] rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
                      >
                        <span>تصفحي المجموعة كاملة</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Curated Products within this collection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {colProducts.map(prod => (
                      <ProductCard key={prod.id} product={prod} />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ----------------- 6. IMAGE + TEXT STORY ----------------- */
          case 'image_text': {
            const headline = section.content.headlineAr || 'صناعة يدوية تهتم بأدق تفاصيلك';
            const body = section.content.bodyTextAr || 'في قطونيلا بنؤمن إن السرير مش مجرد مكان للنوم، بل الملاذ الدافي اللي بتبدأي وتنهي فيه يومك.';
            const img = section.content.imageUrl;
            const btnText = section.content.buttonTextAr || 'تعرفي على قصتنا كاملة';

            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 border border-[#F1E0D6] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  <div className="lg:col-span-6 relative">
                    <div className="aspect-4/3 rounded-2xl overflow-hidden shadow-md">
                      <img
                        src={getValidImageUrl(img, PILLOW_IMAGE || BEDSHEET_IMAGE)}
                        alt="Cottonella Story"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = BEDSHEET_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-6 text-right space-y-4">
                    <span className="text-xs font-bold text-[#D82B76] tracking-wide uppercase">
                      {section.titleAr || 'حكاية قطونيلا'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426] leading-tight">
                      {headline}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6E6165] leading-relaxed">
                      {body}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => { setActivePage('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="px-5 py-3 text-xs sm:text-sm font-bold text-white bg-[#D82B76] hover:bg-[#C01F62] rounded-xl transition-all shadow-xs inline-flex items-center gap-2"
                      >
                        <span>{btnText}</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              </section>
            );
          }

          /* ----------------- 7. TESTIMONIALS ----------------- */
          case 'testimonials': {
            const publishedReviews = testimonials.filter(t => t.isPublished).slice(0, 3);

            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
                  <span className="text-xs font-bold text-[#D82B76] tracking-wide uppercase">
                    {section.titleAr || 'قالوا عن Cottonella 💗'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426]">
                    {section.subtitleAr || 'كلمات من قلوب عميلاتنا الجميلات'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {publishedReviews.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-6 border border-[#F3E2D8] shadow-xs flex flex-col justify-between text-right space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Rating stars */}
                        <div className="flex items-center gap-1 justify-end text-[#F59E0B]">
                          {[...Array(item.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-[#5A4F53] leading-relaxed italic">
                          "{item.review}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#F8EFEA] flex items-center justify-between">
                        <span className="text-[11px] text-[#5F8D69] font-semibold bg-[#EAF5ED] px-2 py-0.5 rounded-md">
                          عميلة موثقة ✓
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[#2D2426]">{item.customerName}</h4>
                          {item.city && <span className="text-[10px] text-[#8E8085]">{item.city}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          /* ----------------- 8. INSTAGRAM COMMUNITY ----------------- */
          case 'instagram': {
            const posts = section.content.instagramPosts || [];

            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#D82B76] block mb-1">
                      {section.content.instagramHandle || '@cottonella_eg'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426]">
                      {section.titleAr || 'شاركينا جمال غرفتك على انستجرام'}
                    </h2>
                  </div>

                  <a
                    href="https://instagram.com/cottonella_eg"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#D82B76] bg-[#FDE7F0] hover:bg-[#F9D4E3] rounded-xl transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>متابعة على انستجرام</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {posts.map(post => (
                    <div
                      key={post.id}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-[#FAF3ED] border border-[#F0DFD4]"
                    >
                      <img
                        src={getValidImageUrl(post.image, BEDSHEET_IMAGE)}
                        alt="Cottonella Instagram"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = BEDSHEET_IMAGE;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5">
                        <Heart className="w-4 h-4 fill-white" />
                        <span className="text-xs font-bold font-mono">{post.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
