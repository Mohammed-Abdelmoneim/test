import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { RotateCcw, Check, Lock, KeyRound, Database, Download, Upload, RefreshCw, ShieldCheck } from 'lucide-react';

export const AdminGeneralSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetAllData, 
    showToast,
    products,
    collections,
    categories,
    testimonials,
    promotions,
    sections,
    media,
    syncStatus,
    lastSyncedAt,
    syncWithServer,
    restoreFromBackup
  } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [brandName, setBrandName] = useState(settings.brandNameAr);
  const [tagline, setTagline] = useState(settings.taglineAr);
  const [password, setPassword] = useState(settings.adminPassword || 'cottonella2026');
  const [whatsAppNum, setWhatsAppNum] = useState(settings.whatsAppNumber);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      brandNameAr: brandName,
      taglineAr: tagline,
      adminPassword: password.trim(),
      whatsAppNumber: whatsAppNum.trim(),
    });
    setSaved(true);
    showToast('تم حفظ الإعدادات وبيانات المتجر بنجاح ومزامنتها على الخادم!', 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('هل ترغبين في استعادة البيانات التجريبية الأصلية لمتجر كوتونيلا؟')) {
      resetAllData();
      showToast('تمت استعادة البيانات الافتراضية بنجاح 💗', 'success');
    }
  };

  // Export full backup
  const handleExportBackup = () => {
    const backupData = {
      app: 'Cottonella Store',
      version: '2.0',
      exportDate: new Date().toISOString(),
      store: {
        products,
        collections,
        categories,
        testimonials,
        promotions,
        sections,
        media,
        settings,
      },
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cottonella-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير وتحميل النسخة الاحتياطية بنجاح! احتفظي بهذا الملف بأمان.', 'success');
  };

  // Import / restore backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const storeData = parsed.store || parsed;

        if (storeData.products && Array.isArray(storeData.products)) {
          const ok = await restoreFromBackup(storeData);
          if (ok) {
            showToast('تمت استعادة كافة المنتجات والصور والإعدادات بنجاح ومزامنتها مع الخادم!', 'success');
          } else {
            showToast('حدث خطأ أثناء استعادة البيانات', 'error');
          }
        } else {
          showToast('ملف النسخة الاحتياطية غير صالح أو غير مكتمل', 'error');
        }
      } catch (err) {
        showToast('تعذر قراءة ملف النسخة الاحتياطية. تأكدي من اختيار ملف .json صالح', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl text-right">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2426]">الإعدادات وكلمة المرور (Settings)</h1>
        <p className="text-xs text-[#7B6E72]">
          التحكم بكلمة مرور لوحة الإدارة ورقم الواتساب وبيانات المتجر الأساسية.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-[#EBF6EE] text-[#5F8D69] text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>تم حفظ الإعدادات وكلمة المرور بنجاح!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE2E5] shadow-xs space-y-5">
        
        {/* Admin Password Setting */}
        <div className="p-4 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-2">
          <label className="text-xs font-bold text-[#D82B76] flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            <span>كلمة مرور الدخول للوحة الإدارة (Admin Password) *</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full text-left font-mono font-bold p-3 rounded-xl border border-[#ECD8CE] text-sm text-[#2D2426]"
            />
            <KeyRound className="w-4 h-4 text-[#8C7D82] absolute top-3.5 right-3" />
          </div>
          <span className="text-[11px] text-[#7A6C71] block">
            يمكنكِ تغيير كلمة المرور في أي وقت. (الافتراضية: cottonella2026)
          </span>
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#45383C]">رقم الواتساب لاستقبال طلبات العميلات</label>
          <input
            type="text"
            value={whatsAppNum}
            onChange={e => setWhatsAppNum(e.target.value)}
            className="w-full text-left font-mono p-3 rounded-xl border text-xs"
          />
        </div>

        {/* Brand Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#45383C]">اسم المتجر بالعربية</label>
          <input
            type="text"
            value={brandName}
            onChange={e => setBrandName(e.target.value)}
            className="w-full text-right p-3 rounded-xl border text-xs"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#45383C]">شعار المتجر (Tagline)</label>
          <input
            type="text"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            className="w-full text-right p-3 rounded-xl border text-xs"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-[#D82B76] hover:bg-[#BF2064] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          حفظ التغييرات
        </button>
      </form>

      {/* Database & Cloud Backup card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE2E5] shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#F0E5E8] pb-4">
          <div className="flex items-center gap-2.5 text-[#2D2426]">
            <Database className="w-5 h-5 text-[#D82B76]" />
            <div>
              <h3 className="text-sm font-bold">قاعدة بيانات المتجر والنسخ الاحتياطي (Database & Backup)</h3>
              <p className="text-[11px] text-[#7B6E72]">
                بياناتكِ وصوركِ مفصولة تماماً ومحفوظة بقاعدة بيانات مستقلة. لن تفقدي أي صور أو منتجات عند تحديث كود الموقع.
              </p>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div>
            {syncStatus === 'synced' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>متزامن مع الخادم السحابي</span>
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                <span>جاري المزامنة...</span>
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                <span>تخزين محلي مؤقت</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Export Backup */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3 bg-[#FAF5F7] hover:bg-[#FCE8F0] border border-[#ECD8E2] text-[#D82B76] text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>تصدير نسخة احتياطية (JSON)</span>
          </button>

          {/* Import Backup */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#F5F8F5] hover:bg-[#EAF3EA] border border-[#D5E6D6] text-[#4F7E59] text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-2xs"
            >
              <Upload className="w-4 h-4" />
              <span>استعادة نسخة احتياطية</span>
            </button>
          </div>

          {/* Manual Sync */}
          <button
            type="button"
            onClick={() => syncWithServer()}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-[#FAF9F8] border border-[#E0D8D5] text-[#2D2426] text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>مزامنة فورية الآن</span>
          </button>
        </div>

        <div className="p-3 bg-[#FAF8F5] rounded-xl text-[11px] text-[#78696F] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#5F8D69] shrink-0" />
          <span>
            يتم حفظ كافة الصور المرفوعة والمنتجات تلقائياً في خادم المتجر والمتصفح، ويمكنكِ في أي وقت تنزيل نسخة احتياطية واستعادتها بضغطة زر واحدة.
          </span>
        </div>
      </div>

      {/* Reset Data card */}
      <div className="bg-[#FFF8FA] p-6 rounded-3xl border border-[#FCDCE8] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#D82B76]">
          <Database className="w-5 h-5" />
          <h3 className="text-sm font-bold">إعادة ضبط المتجر إلى البيانات الأصلية</h3>
        </div>
        <p className="text-xs text-[#6B5A61] leading-relaxed">
          في حال قمتِ باختبار إضافة أو تعديل منتجات وترغبين في إعادة المتجر لحالته النموذجية مع الصور الأصلية، يمكنكِ الضغط هنا.
        </p>
        <button
          onClick={handleResetData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2B7C8] hover:bg-[#FAF0F4] text-[#D82B76] text-xs font-bold rounded-xl transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>استعادة البيانات الافتراضية الآن</span>
        </button>
      </div>
    </div>
  );
};
