import React from 'react';
import { useStore } from '../../context/StoreContext';
import { WavyCornerDecoration, SparkleStar, BotanicalLeafIcon, RoseFloralIcon } from '../common/BotanicalDecoration';
import { Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { setActivePage } = useStore();

  return (
    <div className="py-8 sm:py-14 space-y-16">
      {/* Editorial Header */}
      <div className="relative bg-[#FAF2EB] border-b border-[#EFE0D5] py-12 sm:py-18 overflow-hidden">
        <WavyCornerDecoration className="absolute -top-4 -left-6 opacity-45" />
        <WavyCornerDecoration className="absolute -bottom-6 -right-6 opacity-45 rotate-180" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D82B76] bg-[#FCE8F0] px-4 py-1.5 rounded-full">
            <SparkleStar className="w-3.5 h-3.5 text-[#5F8D69]" />
            <span>حكاية قطونيلا Cottonella</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2D2426] leading-tight">
            مفروشات هاند ميد تصنع لغرفتك دفء لا ينتهي
          </h1>

          <p className="text-sm sm:text-base text-[#6C5F64] leading-relaxed max-w-2xl mx-auto">
            بدأنا بشغف بسيط: تحويل غرفة النوم لمكان دافئ يشبهك في كل تفصيلة، خيوط قطنية نقية ولمسات كشكشة رومانسية تفرّح القلب كل صباح ومساء.
          </p>
        </div>
      </div>

      {/* Story Sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F2E0D4] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE8F0] flex items-center justify-center text-[#D82B76]">
              <RoseFloralIcon className="w-6 h-6 text-[#D82B76]" />
            </div>
            <h3 className="text-lg font-bold text-[#2D2426]">شغف التصميم الأنثوي</h3>
            <p className="text-xs sm:text-sm text-[#6C5F64] leading-relaxed">
              كل نقشة ولون يتم اختياره بعناية مستوحى من درجات البودرة والورد البلدي وأوراق الميرمية الهادئة.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F2E0D4] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] flex items-center justify-center text-[#5F8D69]">
              <BotanicalLeafIcon className="w-6 h-6 text-[#5F8D69]" />
            </div>
            <h3 className="text-lg font-bold text-[#2D2426]">100% قطن مصري أصيل</h3>
            <p className="text-xs sm:text-sm text-[#6C5F64] leading-relaxed">
              لا نستخدم خامات بوليستر أو ألياف صناعية. قطن طبيعي بركال بارد ومريح للبشرة وصديق للنوم العميق.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F2E0D4] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF1E8] flex items-center justify-center text-[#B4673B]">
              <Heart className="w-6 h-6 fill-[#B4673B]" />
            </div>
            <h3 className="text-lg font-bold text-[#2D2426]">صنع بأيدي حرفيات مصريات</h3>
            <p className="text-xs sm:text-sm text-[#6C5F64] leading-relaxed">
              كل غرزة كشكشة وسحاب يتم تفصيله وتقفيله يدوياً بإتقان فائق وتغليف شيك يشبه الهدايا.
            </p>
          </div>
        </div>

        {/* The wac.png message highlight */}
        <div className="bg-[#FAF3ED] rounded-3xl p-8 sm:p-12 border border-[#EFE0D5] relative overflow-hidden text-center space-y-6">
          <WavyCornerDecoration className="absolute -top-6 -left-6 opacity-30" />
          <WavyCornerDecoration className="absolute -bottom-6 -right-6 opacity-30 rotate-180" />

          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <span className="text-xs font-bold text-[#D82B76] uppercase tracking-wider">
              رسالتنا لكل عميلة جميلة
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D2426] font-brand">
              "رفيقتكِ الجديدة وصلت إلى يديكِ لترافقكِ في أجمل لحظاتكِ وتفاصيلكِ اليومية"
            </h2>
            <p className="text-xs sm:text-sm text-[#685C60] leading-relaxed">
              دُمتن جميلات 🤍 نسعد دائماً برؤية صوركم وتنسيقاتكم الجميلة لغرف نومكم وقطعكم المفضلة.
            </p>
            <div className="pt-2">
              <button
                onClick={() => { setActivePage('bedsheets'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-[#D82B76] hover:bg-[#C21E62] rounded-xl transition-all shadow-sm"
              >
                تصفحي تشكيلة كوتونيلا الآن
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
