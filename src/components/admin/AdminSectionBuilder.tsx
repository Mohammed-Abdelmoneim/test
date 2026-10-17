import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { HomePageSection, SectionType } from '../../types';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { HERO_IMAGE, getValidImageUrl, BEDSHEET_IMAGE } from '../../data/initialData';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Trash2, 
  Copy, 
  Check, 
  X,
  Save,
  CheckCircle2,
  Heart,
  Sparkles,
  Star,
  Gift,
  RotateCcw
} from 'lucide-react';

export const AdminSectionBuilder: React.FC = () => {
  const { 
    sections, 
    updateSection, 
    deleteSection, 
    duplicateSection, 
    addSection, 
    moveSectionOrder,
    products, 
    collections,
    showToast,
    syncWithServer
  } = useStore();

  const [activeEditingId, setActiveEditingId] = useState<string | null>(sections[0]?.id || null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [draftSection, setDraftSection] = useState<HomePageSection | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync draft when active section ID changes or sections load
  useEffect(() => {
    if (!activeEditingId && sections.length > 0) {
      setActiveEditingId(sections[0].id);
    }
    const currentId = activeEditingId || (sections[0] ? sections[0].id : null);
    if (!currentId) return;

    const sec = sections.find(s => s.id === currentId);
    if (sec) {
      setDraftSection(prev => {
        // If switching sections or draft is empty or draft is out of date with current active ID
        if (!prev || prev.id !== currentId) {
          return JSON.parse(JSON.stringify(sec));
        }
        return prev;
      });
    }
  }, [activeEditingId, sections]);

  const handleSelectSection = (id: string) => {
    setActiveEditingId(id);
    const sec = sections.find(s => s.id === id);
    if (sec) {
      setDraftSection(JSON.parse(JSON.stringify(sec)));
    }
  };

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const sectionTypeOptions: { type: SectionType; titleAr: string; desc: string }[] = [
    { type: 'hero', titleAr: 'بانر رئيسي (Hero Banner)', desc: 'صورة عريضة مع عنوان كبير وزري تحويل للطلب والواتساب' },
    { type: 'categories', titleAr: 'أقسام المتجر (Categories)', desc: 'شبكة عرض مفروشات السرير والبوشات المبطنة' },
    { type: 'featured_products', titleAr: 'منتجات مختارة (Featured Products)', desc: 'عرض شبكة أو كاروسيل لقطع محددة مع الأسعار وزر الطلب' },
    { type: 'featured_collection', titleAr: 'مجموعة موسمية (Collection Spotlight)', desc: 'تسليط الضوء على ربيع 2026 أو ربيع 2025' },
    { type: 'promo_banner', titleAr: 'بانر خصم وعرض خاص (Promo Banner)', desc: 'شريط عريض بلون الفوشيا مع نص العرض وزر مباشر' },
    { type: 'image_text', titleAr: 'صورة + نص (Image & Story)', desc: 'فقرة حكاية قطونيلا، جودة الخامات القطنية والصناعة اليدوية' },
    { type: 'testimonials', titleAr: 'آراء العميلات (Testimonials)', desc: 'عرض تقييمات العميلات وكلماتهن الرقيقة 💗' },
    { type: 'instagram', titleAr: 'انستجرام (Instagram Grid)', desc: 'شبكة صور من انستجرام مع حساب البراند @cottonella_eg' },
  ];

  const handleAddNewSection = (type: SectionType, titleAr: string) => {
    const created = addSection({
      type,
      title: `${type.toUpperCase()} Section`,
      titleAr,
      subtitle: 'Section Subtitle',
      subtitleAr: 'وصف القسم الإضافي',
      isVisible: true,
      backgroundColor: '#FAF3ED',
      content: {
        headlineAr: `عنوان قسم ${titleAr}`,
        subheadlineAr: 'مفروشات هاند ميد من أجود خامات القطن المصري بتفاصيل أنثوية رقيقة.',
        ctaTextAr: 'اكتشفي المزيد',
        imageUrl: HERO_IMAGE,
      },
    });
    setIsNewModalOpen(false);
    setActiveEditingId(created.id);
    showToast('تمت إضافة القسم الجديد بنجاح!', 'success');
  };

  const updateDraft = (updates: Partial<HomePageSection>) => {
    setDraftSection(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      updateSection(updated.id, updated);
      return updated;
    });
  };

  const updateDraftContent = (contentUpdates: Record<string, any>) => {
    setDraftSection(prev => {
      if (!prev) return null;
      const updated = { ...prev, content: { ...prev.content, ...contentUpdates } };
      updateSection(updated.id, updated);
      return updated;
    });
  };

  const handleSaveDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!draftSection) return;

    updateSection(draftSection.id, draftSection);
    await syncWithServer();
    showToast('تم حفظ تعديلات القسم وتحديث المتجر ومزامنته على السيرفر بنجاح!', 'success');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#EDE2E5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D2426]">منشئ وتصميم الصفحة الرئيسية (Section Builder)</h1>
          <p className="text-xs text-[#7B6E72] mt-1">
            عدّلي نصوص وترتيب وصور أقسام المتجر واضغطي على زر الحفظ لتثبيت التغييرات.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D82B76] hover:bg-[#BE2063] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة قسم جديد</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 bg-[#EBF6EE] text-[#5F8D69] text-xs font-bold rounded-2xl flex items-center gap-2.5 border border-[#CDE8D4] animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#5F8D69] shrink-0" />
          <span>تم حفظ تعديلات القسم بنجاح! تم تحديث القسم في المتجر المباشر وفي لوحة الإدارة.</span>
        </div>
      )}

      {/* Main Grid: Left is Section list, Right is Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Section List / Tree Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#EDE2E5] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE2E5]">
            <span className="text-xs font-bold text-[#2D2426]">أقسام الواجهة ({sortedSections.length})</span>
            <span className="text-[11px] text-[#7A6C71]">انقري للتحرير أو الترتيب</span>
          </div>

          <div className="space-y-2">
            {sortedSections.map((sec, idx) => {
              const isSelected = activeEditingId === sec.id;

              return (
                <div
                  key={sec.id}
                  onClick={() => handleSelectSection(sec.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'border-[#D82B76] bg-[#FDF2F6] shadow-xs ring-1 ring-[#D82B76]/20'
                      : 'border-[#EDE0E4] bg-white hover:border-[#D82B76]/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#FAF1E8] text-[#884B25] text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      {sec.order}
                    </span>
                    <div className="min-w-0 text-right">
                      <h4 className="text-xs font-bold text-[#2D2426] truncate">
                        {sec.titleAr || sec.title}
                      </h4>
                      <span className="text-[10px] text-[#8A7C80] block font-mono">
                        نوع: {sec.type}
                      </span>
                    </div>
                  </div>

                  {/* Quick controls: Visibility, Move Up, Move Down, Duplicate, Delete */}
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        updateSection(sec.id, { isVisible: !sec.isVisible });
                        showToast(`تم ${sec.isVisible ? 'إخفاء' : 'إظهار'} القسم بنجاح`, 'info');
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        sec.isVisible ? 'text-[#5F8D69] hover:bg-[#EBF6EE]' : 'text-[#8A7C80] hover:bg-gray-100'
                      }`}
                      title={sec.isVisible ? 'إخفاء القسم' : 'إظهار القسم'}
                    >
                      {sec.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      disabled={idx === 0}
                      onClick={() => moveSectionOrder(sec.id, 'up')}
                      className="p-1.5 text-[#6D5E63] hover:bg-[#F2E8EC] disabled:opacity-30 rounded-lg transition-colors"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      disabled={idx === sortedSections.length - 1}
                      onClick={() => moveSectionOrder(sec.id, 'down')}
                      className="p-1.5 text-[#6D5E63] hover:bg-[#F2E8EC] disabled:opacity-30 rounded-lg transition-colors"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        duplicateSection(sec.id);
                        showToast('تم تكرار القسم بنجاح', 'success');
                      }}
                      className="p-1.5 text-[#884B25] hover:bg-[#FAF1E8] rounded-lg transition-colors"
                      title="تكرار القسم"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {sections.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنتِ متأكدة من حذف قسم "${sec.titleAr}"؟`)) {
                            deleteSection(sec.id);
                            showToast('تم حذف القسم بنجاح', 'info');
                          }
                        }}
                        className="p-1.5 text-[#D82B76] hover:bg-[#FCE8F0] rounded-lg transition-colors"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Detail Editor Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-[#EDE2E5] shadow-xs space-y-6 text-right">
          {draftSection ? (
            <>
              {/* Editor Header with prominent Save Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE2E5]">
                <div>
                  <span className="text-[11px] font-bold text-[#D82B76] uppercase">تحرير القسم المحدد</span>
                  <h3 className="text-base sm:text-lg font-bold text-[#2D2426]">
                    {draftSection.titleAr} ({draftSection.type})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveDraft()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#D82B76] hover:bg-[#BF2064] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ تعديلات القسم</span>
                  </button>
                </div>
              </div>

              {/* General Settings */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">عنوان القسم (بالعربية)</label>
                    <input
                      type="text"
                      value={draftSection.titleAr}
                      onChange={e => updateDraft({ titleAr: e.target.value })}
                      className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">لون الخلفية (Hex Code)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={draftSection.backgroundColor || '#FAF3ED'}
                        onChange={e => updateDraft({ backgroundColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-[#ECD8CE] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={draftSection.backgroundColor || '#FAF3ED'}
                        onChange={e => updateDraft({ backgroundColor: e.target.value })}
                        className="flex-1 font-mono text-left p-2 text-xs rounded-xl border border-[#ECD8CE]"
                      />
                    </div>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">العنوان الفرعي المعروض للعملاء</label>
                  <input
                    type="text"
                    value={draftSection.subtitleAr || ''}
                    onChange={e => updateDraft({ subtitleAr: e.target.value })}
                    className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                  />
                </div>

                {/* Specific Fields depending on Section Type */}
                {draftSection.type === 'hero' && (
                  <div className="p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-5">
                    <h4 className="text-xs font-bold text-[#D82B76] uppercase">محتويات وإعدادات بانر الواجهة (Hero) الكاملة</h4>
                    
                    {/* Badge Kicker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">النص الصغير أعلى العنوان (Badge Kicker)</label>
                      <input
                        type="text"
                        value={draftSection.content.badgeTextAr || ''}
                        onChange={e => updateDraftContent({ badgeTextAr: e.target.value })}
                        placeholder="صُنع بحب في مصر 🤍 دُمتن جميلات"
                        className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                      />
                    </div>

                    {/* Main Headline */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">العنوان الرئيسي العاطفي *</label>
                      <input
                        type="text"
                        value={draftSection.content.headlineAr || ''}
                        onChange={e => updateDraftContent({ headlineAr: e.target.value })}
                        placeholder="خلي سريرك يحكي عنك 🌸"
                        className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                      />
                    </div>

                    {/* Subheadline / Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">الوصف التفصيلي</label>
                      <textarea
                        rows={2}
                        value={draftSection.content.subheadlineAr || ''}
                        onChange={e => updateDraftContent({ subheadlineAr: e.target.value })}
                        placeholder="مفروشات هاند ميد بتفاصيل ناعمة وألوان تحوّل أوضتك لمكان يشبهك..."
                        className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                      />
                    </div>

                    {/* Buttons Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[#EDE0E5]">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#45383C]">نص الزر الأساسي</label>
                        <input
                          type="text"
                          value={draftSection.content.ctaTextAr || ''}
                          onChange={e => updateDraftContent({ ctaTextAr: e.target.value })}
                          placeholder="اكتشفي المجموعة"
                          className="w-full text-right p-2 text-xs rounded-xl border border-[#ECD8CE]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#45383C]">صفحة التوجيه للزر الأساسي</label>
                        <select
                          value={draftSection.content.ctaLink || '/bedsheets'}
                          onChange={e => updateDraftContent({ ctaLink: e.target.value })}
                          className="w-full p-2 text-xs rounded-xl border border-[#ECD8CE]"
                        >
                          <option value="/bedsheets">صفحة مفروشات السرير</option>
                          <option value="/pouch">صفحة البوشات والمقالم</option>
                          <option value="/collections">صفحة المجموعات</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-[#45383C]">نص زر الواتساب الثانوي</label>
                        <input
                          type="text"
                          value={draftSection.content.secondaryCtaTextAr || ''}
                          onChange={e => updateDraftContent({ secondaryCtaTextAr: e.target.value })}
                          placeholder="تواصلي معنا عبر واتساب"
                          className="w-full text-right p-2 text-xs rounded-xl border border-[#ECD8CE]"
                        />
                      </div>
                    </div>

                    {/* Trust Highlights below CTAs */}
                    <div className="p-3 bg-white rounded-xl border border-[#EDE0E5] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2426]">مزايا الثقة أسفل الأزرار</span>
                        <label className="flex items-center gap-1.5 text-xs text-[#5F8D69] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftSection.content.showTrustMarkers !== false}
                            onChange={e => updateDraftContent({ showTrustMarkers: e.target.checked })}
                            className="rounded text-[#D82B76]"
                          />
                          <span>تفعيل المزايا الثلاث</span>
                        </label>
                      </div>

                      {draftSection.content.showTrustMarkers !== false && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={draftSection.content.trustText1Ar || 'خياطة وتطريز يدوي 100%'}
                            onChange={e => updateDraftContent({ trustText1Ar: e.target.value })}
                            className="p-2 text-xs rounded-xl border border-[#ECD8CE] text-right"
                          />
                          <input
                            type="text"
                            value={draftSection.content.trustText2Ar || 'قطن مصري أصيل'}
                            onChange={e => updateDraftContent({ trustText2Ar: e.target.value })}
                            className="p-2 text-xs rounded-xl border border-[#ECD8CE] text-right"
                          />
                          <input
                            type="text"
                            value={draftSection.content.trustText3Ar || 'توصيل لباب بيتك'}
                            onChange={e => updateDraftContent({ trustText3Ar: e.target.value })}
                            className="p-2 text-xs rounded-xl border border-[#ECD8CE] text-right"
                          />
                        </div>
                      )}
                    </div>

                    {/* Image Box Settings & Upload from Device */}
                    <div className="p-3 bg-white rounded-xl border border-[#EDE0E5] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#2D2426]">إعدادات صندوق صورة الواجهة</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateDraftContent({ imageUrl: HERO_IMAGE })}
                            className="text-[11px] text-[#D82B76] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            title="إعادة تعيين الصورة الافتراضية"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>استعادة الصورة الأصلية</span>
                          </button>

                          <div className="flex items-center gap-1.5 border-r border-[#ECD8CE] pr-2">
                            <span className="text-[11px] text-[#7A6C71]">أبعاد الصورة:</span>
                            <select
                              value={draftSection.content.imageAspectRatio || '4/3'}
                              onChange={e => updateDraftContent({ imageAspectRatio: e.target.value })}
                              className="text-xs p-1 rounded-lg border border-[#ECD8CE] bg-white"
                            >
                              <option value="4/3">كلاسيكي (4:3)</option>
                              <option value="16/9">بانورامي عريض (16:9)</option>
                              <option value="3/4">طولي عمودي (3:4)</option>
                              <option value="1/1">مربع (1:1)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <ImageUploadInput
                        value={draftSection.content.imageUrl}
                        onChange={dataUrl => updateDraftContent({ imageUrl: dataUrl })}
                        label="صورة بانر الواجهة (رفع من جهازك أو اختيار من صور المتجر)"
                        helperText="اختاري صورة من هاتفك أو جهازك أو اختاري من صور المتجر الجاهزة عالية الدقة"
                      />

                      {/* Floating Card under/over Image Settings */}
                      <div className="pt-3 border-t border-[#F2E0E6] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#45383C] block">البطاقة العائمة على/أسفل صورة الواجهة</span>
                            <span className="text-[11px] text-[#7A6C71]">البطاقة الزجاجية الأنيقة التي تبرز تفاصيل المفروشات مع الأيقونة 💗</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                updateDraftContent({
                                  floatingBadgeTitleAr: 'تفاصيل تفرّح القلب',
                                  floatingBadgeTextAr: 'تطريزات وكشكشة بألوان الباستيل الهادية',
                                  floatingBadgeIcon: 'heart',
                                  floatingPosition: 'bottom-left',
                                  showFloatingCard: true,
                                });
                              }}
                              className="text-[11px] text-[#5F8D69] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              title="استعادة النص والأيقونة الافتراضية للبطاقة"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>استعادة النص الأصلي</span>
                            </button>

                            <label className="flex items-center gap-1.5 text-xs text-[#5F8D69] cursor-pointer font-bold">
                              <input
                                type="checkbox"
                                checked={draftSection.content.showFloatingCard !== false}
                                onChange={e => updateDraftContent({ showFloatingCard: e.target.checked })}
                                className="rounded text-[#D82B76] w-4 h-4 cursor-pointer"
                              />
                              <span>إظهار البطاقة</span>
                            </label>
                          </div>
                        </div>

                        {draftSection.content.showFloatingCard !== false && (
                          <div className="p-3 bg-[#FAF8F6] rounded-xl border border-[#EDE0E5] space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-[#45383C]">عنوان البطاقة</label>
                                <input
                                  type="text"
                                  value={draftSection.content.floatingBadgeTitleAr !== undefined ? draftSection.content.floatingBadgeTitleAr : 'تفاصيل تفرّح القلب'}
                                  onChange={e => updateDraftContent({ floatingBadgeTitleAr: e.target.value })}
                                  placeholder="تفاصيل تفرّح القلب"
                                  className="w-full p-2.5 text-xs rounded-xl border border-[#ECD8CE] text-right bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-[#45383C]">نص ووصف البطاقة</label>
                                <input
                                  type="text"
                                  value={draftSection.content.floatingBadgeTextAr !== undefined ? draftSection.content.floatingBadgeTextAr : 'تطريزات وكشكشة بألوان الباستيل الهادية'}
                                  onChange={e => updateDraftContent({ floatingBadgeTextAr: e.target.value })}
                                  placeholder="تطريزات وكشكشة بألوان الباستيل الهادية"
                                  className="w-full p-2.5 text-xs rounded-xl border border-[#ECD8CE] text-right bg-white"
                                />
                              </div>
                            </div>

                            {/* Icon Picker & Position Picker */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#F0DDE5]">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-[#45383C]">أيقونة البطاقة</label>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {[
                                    { id: 'heart', label: '💗 قلب' },
                                    { id: 'sparkles', label: '✨ بريق' },
                                    { id: 'star', label: '⭐ نجمة' },
                                    { id: 'rose', label: '🌸 وردة' },
                                    { id: 'leaf', label: '🌿 قطن' },
                                    { id: 'gift', label: '🎁 هدية' },
                                  ].map(ico => {
                                    const isCurrent = (draftSection.content.floatingBadgeIcon || 'heart') === ico.id;
                                    return (
                                      <button
                                        key={ico.id}
                                        type="button"
                                        onClick={() => updateDraftContent({ floatingBadgeIcon: ico.id })}
                                        className={`px-2 py-1 text-xs rounded-lg border font-bold transition-all cursor-pointer ${
                                          isCurrent 
                                            ? 'bg-[#D82B76] text-white border-[#D82B76] shadow-2xs' 
                                            : 'bg-white text-[#45383C] border-[#ECD8CE] hover:border-[#D82B76]'
                                        }`}
                                      >
                                        {ico.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-xs font-bold text-[#45383C]">موضع البطاقة</label>
                                <select
                                  value={draftSection.content.floatingPosition || 'bottom-left'}
                                  onChange={e => updateDraftContent({ floatingPosition: e.target.value })}
                                  className="w-full p-2 text-xs rounded-xl border border-[#ECD8CE] text-right bg-white"
                                >
                                  <option value="bottom-left">أسفل اليسار (كلاسيكي وأنيق)</option>
                                  <option value="bottom-right">أسفل اليمين</option>
                                  <option value="center">وسط الصورة بالأسفل</option>
                                  <option value="top-right">أعلى اليمين</option>
                                </select>
                              </div>
                            </div>

                            {/* Interactive Live Preview Box */}
                            <div className="pt-3 border-t border-[#F0DDE5] space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[#55474B]">معاينة حية لشكل البطاقة على الصورة:</span>
                                <span className="text-[#5F8D69] font-bold">● كما ستظهر للعميلات في المتجر</span>
                              </div>

                              <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-md bg-[#FAF5F2] aspect-16/10 max-w-sm mx-auto">
                                <img
                                  src={getValidImageUrl(draftSection.content.imageUrl, HERO_IMAGE)}
                                  alt="Hero Preview"
                                  className="w-full h-full object-cover"
                                />
                                <div 
                                  className={`absolute ${
                                    draftSection.content.floatingPosition === 'bottom-right'
                                      ? 'bottom-2 right-2'
                                      : draftSection.content.floatingPosition === 'center'
                                      ? 'bottom-2 left-1/2 -translate-x-1/2'
                                      : draftSection.content.floatingPosition === 'top-right'
                                      ? 'top-2 right-2'
                                      : 'bottom-2 left-2'
                                  } bg-white/95 backdrop-blur-md p-2 rounded-xl border border-[#F1E0D6] shadow-md flex items-center gap-2 max-w-[85%] z-10`}
                                >
                                  <div className="w-7 h-7 rounded-full bg-[#FCE8F0] flex items-center justify-center text-[#D82B76] shrink-0">
                                    {draftSection.content.floatingBadgeIcon === 'sparkles' && <Sparkles className="w-3.5 h-3.5 text-[#D82B76]" />}
                                    {draftSection.content.floatingBadgeIcon === 'star' && <Star className="w-3.5 h-3.5 fill-[#E5A826] text-[#E5A826]" />}
                                    {draftSection.content.floatingBadgeIcon === 'rose' && <span className="text-xs">🌸</span>}
                                    {draftSection.content.floatingBadgeIcon === 'leaf' && <span className="text-xs">🌿</span>}
                                    {draftSection.content.floatingBadgeIcon === 'gift' && <Gift className="w-3.5 h-3.5 text-[#D82B76]" />}
                                    {(draftSection.content.floatingBadgeIcon === 'heart' || !draftSection.content.floatingBadgeIcon) && (
                                      <Heart className="w-3.5 h-3.5 fill-[#D82B76]" />
                                    )}
                                  </div>
                                  <div className="text-right min-w-0">
                                    <span className="text-[11px] font-bold text-[#2D2426] block truncate">
                                      {draftSection.content.floatingBadgeTitleAr || 'تفاصيل تفرّح القلب'}
                                    </span>
                                    <span className="text-[9px] text-[#786A6F] block truncate">
                                      {draftSection.content.floatingBadgeTextAr || 'تطريزات وكشكشة بألوان الباستيل الهادية'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {draftSection.type === 'image_text' && (
                  <div className="p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-4">
                    <h4 className="text-xs font-bold text-[#D82B76]">محتويات قسم الصورة والنص (حكاية البراند)</h4>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">العنوان</label>
                      <input
                        type="text"
                        value={draftSection.content.headlineAr || ''}
                        onChange={e => updateDraftContent({ headlineAr: e.target.value })}
                        className="w-full text-right p-2.5 rounded-xl border text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">نص الحكاية</label>
                      <textarea
                        rows={3}
                        value={draftSection.content.bodyTextAr || ''}
                        onChange={e => updateDraftContent({ bodyTextAr: e.target.value })}
                        className="w-full text-right p-2.5 rounded-xl border text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <ImageUploadInput
                        value={draftSection.content.imageUrl}
                        onChange={dataUrl => updateDraftContent({ imageUrl: dataUrl })}
                        label="صورة الحكاية (رفع من جهازك مباشرة)"
                      />
                    </div>
                  </div>
                )}

                {draftSection.type === 'featured_products' && (
                  <div className="p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-4">
                    <h4 className="text-xs font-bold text-[#D82B76]">إعدادات عرض المنتجات</h4>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">عدد المنتجات المعروضة (Limit)</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={draftSection.content.displayLimit || 4}
                        onChange={e => updateDraftContent({ displayLimit: Number(e.target.value) })}
                        className="w-full text-left font-mono p-2 text-xs rounded-xl border border-[#ECD8CE]"
                      />
                    </div>
                  </div>
                )}

                {draftSection.type === 'promo_banner' && (
                  <div className="p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-4">
                    <h4 className="text-xs font-bold text-[#D82B76]">إعدادات البانر الترويجي</h4>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">نص العرض الترويجي</label>
                      <input
                        type="text"
                        value={draftSection.content.headlineAr || ''}
                        onChange={e => updateDraftContent({ headlineAr: e.target.value })}
                        className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">الوصف الإضافي للبانر</label>
                      <input
                        type="text"
                        value={draftSection.content.subheadlineAr || ''}
                        onChange={e => updateDraftContent({ subheadlineAr: e.target.value })}
                        className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <ImageUploadInput
                        value={draftSection.content.imageUrl}
                        onChange={dataUrl => updateDraftContent({ imageUrl: dataUrl })}
                        label="صورة خلفية البانر (اختياري - رفع من جهازك)"
                        aspectRatio="banner"
                        helperText="يمكنكِ رفع صورة من جهازك كخلفية للبانر الترويجي"
                      />
                    </div>
                  </div>
                )}

                {draftSection.type === 'instagram' && (
                  <div className="p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-4">
                    <h4 className="text-xs font-bold text-[#D82B76]">إعدادات معرض انستجرام</h4>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">حساب الانستجرام</label>
                      <input
                        type="text"
                        value={draftSection.content.instagramHandle || '@cottonella_eg'}
                        onChange={e => updateDraftContent({ instagramHandle: e.target.value })}
                        className="w-full text-left font-mono p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <ImageUploadInput
                        value={draftSection.content.imageUrl}
                        onChange={dataUrl => {
                          const existingPosts = draftSection.content.instagramPosts || [];
                          const updatedPosts = [
                            { id: `ig-${Date.now()}`, image: dataUrl, likes: 350 },
                            ...existingPosts.slice(0, 3)
                          ];
                          updateDraftContent({ imageUrl: dataUrl, instagramPosts: updatedPosts });
                        }}
                        label="رفع صورة جديدة لمعرض انستجرام من جهازك"
                        aspectRatio="square"
                        helperText="اختاري صورة من هاتفك أو جهازك لإضافتها لشبكة صور انستجرام بالمتجر"
                      />
                    </div>
                  </div>
                )}

                {draftSection.type === 'featured_collection' && (
                  <div className="p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-4">
                    <h4 className="text-xs font-bold text-[#D82B76]">المجموعة المحددة</h4>
                    <select
                      value={draftSection.content.collectionId || 'spring-2026'}
                      onChange={e => updateDraftContent({ collectionId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426]"
                    >
                      {collections.map(col => (
                        <option key={col.id} value={col.id}>{col.nameAr} ({col.seasonYear})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bottom Save bar */}
                <div className="sticky bottom-4 z-10 flex items-center justify-between p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-[#EDE2E5] shadow-lg">
                  <span className="text-xs font-bold text-[#6D5E63]">
                    {savedNotice ? '✓ تم حفظ التعديلات بنجاح ودمجها بالمتجر' : 'انقري للحفظ بعد الانتهاء من التعديل:'}
                  </span>
                  <button
                    onClick={() => handleSaveDraft()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#D82B76] hover:bg-[#BF2064] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ القسم</span>
                  </button>
                </div>

              </div>
            </>
          ) : (
            <div className="py-12 text-center text-[#8C7D82]">
              يرجى اختيار قسم من القائمة لبدء التعديل
            </div>
          )}
        </div>

      </div>

      {/* Add New Section Modal with Scrollable Body */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#EDE2E5] shadow-2xl text-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE2E5] shrink-0">
              <h3 className="text-lg font-bold text-[#2D2426]">اختاري نوع القسم الجديد</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-[#8C7D82] hover:text-[#2D2426]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 overscroll-contain">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sectionTypeOptions.map((opt) => (
                  <button
                    key={opt.type}
                    onClick={() => handleAddNewSection(opt.type, opt.titleAr)}
                    className="p-3.5 rounded-2xl border border-[#EDE0E4] hover:border-[#D82B76] hover:bg-[#FDF2F6] text-right transition-all group space-y-1 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#2D2426] group-hover:text-[#D82B76]">
                      {opt.titleAr}
                    </div>
                    <div className="text-[11px] text-[#7C6E73] leading-relaxed">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#EDE2E5] bg-gray-50 flex justify-end shrink-0">
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
