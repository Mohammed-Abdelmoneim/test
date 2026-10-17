import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { StoreSettings } from '../../types';
import { Layout, Check, Palette, Sparkles, Save, CheckCircle2 } from 'lucide-react';

export const AdminAppearance: React.FC = () => {
  const { settings, updateSettings, showToast } = useStore();

  // Local draft state so changes are only committed when the user clicks "Save"
  const [draft, setDraft] = useState<StoreSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, []);

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings(draft);
    showToast('تم حفظ مظهر المتجر واللوجو بنجاح!', 'success');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  const handleLogoUpload = (dataUrl: string) => {
    setDraft(prev => ({ ...prev, logoUrl: dataUrl }));
    updateSettings({ logoUrl: dataUrl });
    showToast('تم تحديث وحفظ لوجو المتجر بنجاح!', 'success');
  };

  return (
    <div className="space-y-8 max-w-4xl text-right pb-12">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#EDE2E5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2D2426]">لوجو المتجر والمظهر (Logo & Appearance)</h1>
          <p className="text-xs text-[#7B6E72] mt-1">
            عدّلي اللوجو، شريط الإعلانات، أيقونات الهيدر، والألوان ثم اضغطي على زر الحفظ
          </p>
        </div>

        <button
          onClick={() => handleSaveAll()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D82B76] hover:bg-[#BF2064] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ مظهر المتجر</span>
        </button>
      </div>

      {isSaved && (
        <div className="p-4 bg-[#EBF6EE] text-[#5F8D69] text-xs font-bold rounded-2xl flex items-center gap-2.5 border border-[#CDE8D4] animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#5F8D69] shrink-0" />
          <span>تم حفظ التعديلات بنجاح ودمجها في المتجر المباشر! لن تتغير البيانات أثناء الكتابة إلا بعد الضغط على الحفظ.</span>
        </div>
      )}

      {/* ================= 1. LOGO UPLOADER (DIRECT FILE LOCATOR FROM DEVICE) ================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE2E5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE2E5]">
          <h2 className="text-base font-bold text-[#2D2426] flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#D82B76]" />
            <span>لوجو المتجر (رفع من جهازك مباشرة)</span>
          </h2>
          <span className="text-xs text-[#5F8D69] font-medium">يظهر في أعلى الهيدر والفوتر كصورة</span>
        </div>

        <div className="max-w-md">
          <ImageUploadInput
            value={draft.logoUrl}
            onChange={handleLogoUpload}
            label="اختاري ملف صورة اللوجو من جهازك (PNG شفاف / JPG / WEBP)"
            objectFit="contain"
            helperText="يدعم ملفات PNG الشفافة بدقة عالية. يتم الحفاظ على خلفية PNG الشفافة بدون أي تشويه."
          />
        </div>

        {/* Live Header Logo Preview Box */}
        <div className="p-4 bg-[#FAF3ED] rounded-2xl border border-[#EFE0D5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#7B6E72]">معاينة شكل اللوجو بعد الرفع:</span>
          <div className="bg-white px-5 py-2.5 rounded-xl shadow-2xs border border-[#F1E2DA] flex items-center justify-center min-h-[48px] max-w-full overflow-hidden">
            {draft.logoUrl ? (
              <img src={draft.logoUrl} alt="Logo Preview" referrerPolicy="no-referrer" className="h-10 w-auto object-contain max-w-[200px]" />
            ) : (
              <span className="text-xs text-[#9B8C91]">لم يتم رفع صورة لوجو بعد (اختاري صورة أعلاه)</span>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. ANNOUNCEMENT BAR ================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE2E5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE2E5]">
          <h2 className="text-base font-bold text-[#2D2426] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D82B76]" />
            <span>شريط الإعلانات أعلى الموقع (Announcement Bar)</span>
          </h2>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2D2426]">
            <input
              type="checkbox"
              checked={draft.announcementBar.enabled}
              onChange={e => {
                setDraft(prev => ({
                  ...prev,
                  announcementBar: { ...prev.announcementBar, enabled: e.target.checked }
                }));
              }}
              className="rounded text-[#D82B76]"
            />
            <span>تفعيل الشريط</span>
          </label>
        </div>

        {draft.announcementBar.enabled && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#45383C]">نص الإعلان المعروض</label>
              <input
                type="text"
                value={draft.announcementBar.textAr}
                onChange={e => {
                  setDraft(prev => ({
                    ...prev,
                    announcementBar: { ...prev.announcementBar, textAr: e.target.value }
                  }));
                }}
                className="w-full text-right p-3 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#45383C]">لون خلفية الشريط</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draft.announcementBar.bgColor}
                  onChange={e => {
                    setDraft(prev => ({
                      ...prev,
                      announcementBar: { ...prev.announcementBar, bgColor: e.target.value }
                    }));
                  }}
                  className="w-9 h-9 rounded-lg border cursor-pointer"
                />
                <input
                  type="text"
                  value={draft.announcementBar.bgColor}
                  onChange={e => {
                    setDraft(prev => ({
                      ...prev,
                      announcementBar: { ...prev.announcementBar, bgColor: e.target.value }
                    }));
                  }}
                  className="flex-1 font-mono text-left p-2 rounded-xl border text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= 3. HEADER ICONS & NAVIGATION ================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE2E5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EDE2E5]">
          <h2 className="text-base font-bold text-[#2D2426] flex items-center gap-2">
            <Layout className="w-4 h-4 text-[#D82B76]" />
            <span>عناصر الهيدر وأيقونات التواصل (Header Controls)</span>
          </h2>
          <span className="text-xs text-[#5F8D69] font-medium">التحكم في الأيقونات الظاهرة في الهيدر</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="p-3.5 rounded-2xl border border-[#EDE2E5] bg-[#FAF5F7] flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold text-[#2D2426]">أيقونة البحث</span>
            <input
              type="checkbox"
              checked={draft.header.showSearch}
              onChange={e => {
                setDraft(prev => ({
                  ...prev,
                  header: { ...prev.header, showSearch: e.target.checked }
                }));
              }}
              className="rounded text-[#D82B76]"
            />
          </label>

          <label className="p-3.5 rounded-2xl border border-[#EDE2E5] bg-[#FAF5F7] flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold text-[#2D2426]">زر الواتساب السريع</span>
            <input
              type="checkbox"
              checked={draft.header.showWhatsApp}
              onChange={e => {
                setDraft(prev => ({
                  ...prev,
                  header: { ...prev.header, showWhatsApp: e.target.checked }
                }));
              }}
              className="rounded text-[#D82B76]"
            />
          </label>

          <label className="p-3.5 rounded-2xl border border-[#EDE2E5] bg-[#FAF5F7] flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold text-[#2D2426]">أيقونة الانستجرام</span>
            <input
              type="checkbox"
              checked={draft.header.showInstagram}
              onChange={e => {
                setDraft(prev => ({
                  ...prev,
                  header: { ...prev.header, showInstagram: e.target.checked }
                }));
              }}
              className="rounded text-[#D82B76]"
            />
          </label>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-[#45383C]">رقم واتساب الطلبات المعروض في الهيدر والصفحات</label>
          <input
            type="text"
            value={draft.whatsAppNumber}
            onChange={e => {
              setDraft(prev => ({ ...prev, whatsAppNumber: e.target.value }));
            }}
            placeholder="01116009563"
            className="w-full text-left font-mono p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
          />
        </div>
      </div>

      {/* ================= 4. BRAND COLORS ================= */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE2E5] shadow-xs space-y-6">
        <h2 className="text-base font-bold text-[#2D2426] flex items-center gap-2">
          <Palette className="w-4 h-4 text-[#D82B76]" />
          <span>ألوان المتجر الرئيسية</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Primary Fuchsia */}
          <div className="space-y-2 p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7]">
            <label className="text-xs font-bold text-[#2D2426] block">
              اللون الأساسي (أزرار الطلب والأسعار)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.primaryColor}
                onChange={e => {
                  setDraft(prev => ({ ...prev, primaryColor: e.target.value }));
                }}
                className="w-10 h-10 rounded-xl border border-black/10 cursor-pointer"
              />
              <input
                type="text"
                value={draft.primaryColor}
                onChange={e => {
                  setDraft(prev => ({ ...prev, primaryColor: e.target.value }));
                }}
                className="flex-1 font-mono text-left p-2 rounded-xl border text-xs"
              />
            </div>
          </div>

          {/* Secondary Sage */}
          <div className="space-y-2 p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7]">
            <label className="text-xs font-bold text-[#2D2426] block">
              اللون الثانوي النباتي (Sage Green)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={draft.secondaryColor}
                onChange={e => {
                  setDraft(prev => ({ ...prev, secondaryColor: e.target.value }));
                }}
                className="w-10 h-10 rounded-xl border border-black/10 cursor-pointer"
              />
              <input
                type="text"
                value={draft.secondaryColor}
                onChange={e => {
                  setDraft(prev => ({ ...prev, secondaryColor: e.target.value }));
                }}
                className="flex-1 font-mono text-left p-2 rounded-xl border text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky-friendly Save Button */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-[#EDE2E5] shadow-lg">
        <span className="text-xs font-bold text-[#6B5A60]">
          اضغطي هنا لحفظ التعديلات وتطبيقها على المتجر مباشرة:
        </span>
        <button
          onClick={() => handleSaveAll()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D82B76] hover:bg-[#BF2064] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>حفظ التعديلات الآن</span>
        </button>
      </div>
    </div>
  );
};
