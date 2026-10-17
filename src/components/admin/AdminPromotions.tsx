import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Promotion } from '../../types';
import { Plus, Edit, Trash2, X, Tag, Check } from 'lucide-react';

export const AdminPromotions: React.FC = () => {
  const { promotions, addPromotion, updatePromotion, deletePromotion, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Promotion | null>(null);

  const initialForm: Omit<Promotion, 'id'> = {
    title: 'Spring Discount',
    titleAr: 'خصم الربيع الخاص',
    code: 'SPRING20',
    discountType: 'percentage',
    discountValue: 20,
    appliesTo: 'all',
    bannerText: 'خصم 20% لفترة محدودة على جميع المنتجات',
    bannerTextAr: '🌸 خصم 20% لفترة محدودة على تشكيلة ربيع 2026 — اطلبي الآن عبر واتساب!',
    isActive: true,
    startDate: '2026-03-01',
    endDate: '2026-04-30',
  };

  const [formData, setFormData] = useState<Omit<Promotion, 'id'>>(initialForm);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Promotion) => {
    setEditingItem(p);
    setFormData({
      title: p.title,
      titleAr: p.titleAr,
      code: p.code,
      discountType: p.discountType,
      discountValue: p.discountValue,
      appliesTo: p.appliesTo,
      bannerText: p.bannerText,
      bannerTextAr: p.bannerTextAr,
      isActive: p.isActive,
      startDate: p.startDate,
      endDate: p.endDate,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr.trim()) return;

    if (editingItem) {
      updatePromotion(editingItem.id, formData);
      showToast('تم تعديل العرض وحفظ التغييرات بنجاح!', 'success');
    } else {
      addPromotion(formData);
      showToast('تمت إضافة العرض الجديد بنجاح!', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2426]">العروض والخصومات (Promotions)</h1>
          <p className="text-xs text-[#7B6E72]">إنشاء وإدارة البانرات الترويجية ونسب الخصومات النشطة</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D82B76] hover:bg-[#BE2063] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة عرض جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map(promo => (
          <div key={promo.id} className="bg-white rounded-3xl p-6 border border-[#EDE2E5] shadow-xs text-right space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-[#FAF1E8] text-[#884B25] px-2.5 py-1 rounded-lg">
                  كود: {promo.code}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  promo.isActive ? 'bg-[#EBF6EE] text-[#5F8D69]' : 'bg-[#FAF0F4] text-[#D82B76]'
                }`}>
                  {promo.isActive ? 'نشط الآن' : 'غير نشط'}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#2D2426]">{promo.titleAr}</h3>
              <p className="text-xs text-[#6B5E63] leading-relaxed">{promo.bannerTextAr}</p>

              <div className="pt-2 flex items-center gap-3 text-xs">
                <span className="font-bold text-[#D82B76]">
                  قيمة الخصم: {promo.discountValue}{promo.discountType === 'percentage' ? '%' : ' ج.م'}
                </span>
                <span className="text-[#8C7D82]">
                  يسري حتى: {promo.endDate}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2E5E9] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(promo)}
                  className="p-1.5 text-[#5F8D69] hover:bg-[#EAF5ED] rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`حذف العرض "${promo.titleAr}"؟`)) deletePromotion(promo.id);
                  }}
                  className="p-1.5 text-[#D82B76] hover:bg-[#FCE8F0] rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => updatePromotion(promo.id, { isActive: !promo.isActive })}
                className="text-xs font-bold text-[#7A6C71] hover:text-[#D82B76]"
              >
                {promo.isActive ? 'إيقاف مؤقت' : 'تفعيل العرض'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#EDE2E5] shadow-2xl text-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE2E5] shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-[#2D2426]">
                {editingItem ? 'تعديل العرض الترويجي' : 'إضافة عرض ترويجي جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#8C7D82] hover:text-[#2D2426] hover:bg-gray-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">عنوان العرض *</label>
                  <input
                    type="text"
                    required
                    value={formData.titleAr}
                    onChange={e => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder="عرض موسم الربيع"
                    className="w-full text-right p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">قيمة الخصم (%)</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full font-mono text-left p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">نص البانر الترويجي</label>
                  <textarea
                    rows={2}
                    value={formData.bannerTextAr}
                    onChange={e => setFormData({ ...formData, bannerTextAr: e.target.value })}
                    placeholder="🌸 خصم 20% على جميع المفروشات..."
                    className="w-full text-right p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-[#D82B76]"
                    />
                    <span>تفعيل هذا العرض في المتجر</span>
                  </label>
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-[#EDE2E5] bg-gray-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#7A6C71] hover:bg-white cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#D82B76] hover:bg-[#BF2064] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  حفظ العرض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
