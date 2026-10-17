import React from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageCircle, Instagram, Heart, ArrowUp } from 'lucide-react';
import { WavyCornerDecoration, SparkleStar } from './BotanicalDecoration';

export const Footer: React.FC = () => {
  const { settings, setActivePage, navigateToCollection } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanPhone = settings.whatsAppNumber.replace(/\D/g, '');
  const whatsAppDirectUrl = `https://wa.me/20${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent('مرحباً قطونيلا 💗')}`;

  return (
    <footer className="relative bg-[#FAF2EB] border-t border-[#EFE0D5] text-[#3D3337] overflow-hidden pt-14 pb-8">
      {/* Decorative Wavy Lines in corners */}
      <WavyCornerDecoration className="absolute -top-6 -right-10 opacity-40 rotate-180" />
      <WavyCornerDecoration className="absolute -bottom-10 -left-10 opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-[#E8D6CB]">
          
          {/* Col 1: Brand story */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Cottonella Logo" referrerPolicy="no-referrer" className="h-10 w-auto max-w-[180px] object-contain" />
              ) : (
                <div className="h-10 px-3.5 rounded-2xl bg-gradient-to-r from-[#FCE8F0] via-[#FAF1E8] to-[#EBF6EE] border border-[#F6CAD8] flex items-center gap-2 shadow-2xs">
                  <span className="text-xl">🌸</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D82B76]/40"></span>
                  <span className="text-lg">🌿</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6A5E62] leading-relaxed">
              {settings.footer.brandBioAr}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D82B76] pt-1">
              <SparkleStar className="w-3.5 h-3.5 text-[#5F8D69]" />
              <span>دُمتن جميلات 🤍 صناعة يدوية مصرية 100%</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-[#2D2426] mb-4">أقسام المتجر</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#5B4F53]">
              <li>
                <button
                  onClick={() => { setActivePage('bedsheets'); scrollToTop(); }}
                  className="hover:text-[#D82B76] transition-colors"
                >
                  مفروشات السرير الهاند ميد
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('pouch'); scrollToTop(); }}
                  className="hover:text-[#D82B76] transition-colors"
                >
                  البوشات القطنية والمقالم
                </button>
              </li>
              <li>
                <button
                  onClick={() => { navigateToCollection('spring-2026'); }}
                  className="hover:text-[#D82B76] transition-colors"
                >
                  مجموعة ربيع 2026 (حديقة الورد)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { navigateToCollection('spring-2025'); }}
                  className="hover:text-[#D82B76] transition-colors"
                >
                  مجموعة ربيع 2025 (إشراقة الطبيعة)
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('about'); scrollToTop(); }}
                  className="hover:text-[#D82B76] transition-colors"
                >
                  عن حكاية قطونيلا
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Order Info */}
          <div>
            <h4 className="text-sm font-bold text-[#2D2426] mb-4">طريقة الطلب والتوصيل</h4>
            <div className="space-y-3 text-xs sm:text-sm text-[#5B4F53] leading-relaxed">
              <p>
                🌸 <strong>الطلب المباشر:</strong> اختاري القطعة واضغطي "اطلبي الآن عبر واتساب".
              </p>
              <p>
                🚚 <strong>الشحن:</strong> متوفر لجميع محافظات مصر والدفع عند الاستلام.
              </p>
              <p>
                🧵 <strong>التفصيل الخاص:</strong> يمكن طلب مقاسات وألوان خاصة حسب الرغبة.
              </p>
            </div>
          </div>

          {/* Col 4: Direct WhatsApp Contact Card */}
          <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-5 border border-[#ECD9CE] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E5F8EC] flex items-center justify-center text-[#25D366]">
                <MessageCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs text-[#7B6E72] block">تواصلي معنا مباشرة</span>
                <span className="text-sm font-bold font-mono text-[#2D2426]">
                  {settings.whatsAppNumber}
                </span>
              </div>
            </div>

            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20BC59] rounded-xl transition-colors shadow-xs"
            >
              <span>محادثة واتساب سريعة</span>
              <MessageCircle className="w-3.5 h-3.5" />
            </a>

            <div className="pt-2 flex items-center justify-between border-t border-[#F1E4DC]">
              <span className="text-[11px] text-[#7B6E72]">تابعينا على انستجرام</span>
              <a
                href={settings.footer.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#D82B76] hover:text-[#9B1D53] transition-colors p-1"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6D71]">
          <div className="flex items-center gap-1.5">
            <span>{settings.footer.copyrightTextAr}</span>
            <Heart className="w-3 h-3 text-[#D82B76] fill-[#D82B76]" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-[#7A6D71] hover:text-[#D82B76] transition-colors"
            >
              <span>العودة للأعلى</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
