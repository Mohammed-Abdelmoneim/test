import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Testimonial } from '../../types';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { Plus, Edit, Trash2, X, Star, CheckCircle2 } from 'lucide-react';

export const AdminTestimonials: React.FC = () => {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const initialForm: Omit<Testimonial, 'id' | 'date'> = {
    customerName: '',
    review: '',
    rating: 5,
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isFeatured: true,
    isPublished: true,
    city: 'القاهرة',
    productPurchased: 'طقم سرير هاند ميد',
  };

  const [formData, setFormData] = useState<Omit<Testimonial, 'id' | 'date'>>(initialForm);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingItem(t);
    setFormData({
      customerName: t.customerName,
      review: t.review,
      rating: t.rating,
      customerAvatar: t.customerAvatar,
      isFeatured: t.isFeatured,
      isPublished: t.isPublished,
      city: t.city,
      productPurchased: t.productPurchased,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.review.trim()) return;

    if (editingItem) {
      updateTestimonial(editingItem.id, formData);
      showToast('تم تعديل رأي العميلة وحفظ التغييرات بنجاح!', 'success');
    } else {
      addTestimonial(formData);
      showToast('تمت إضافة رأي العميلة بنجاح!', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2426]">آراء وتقييمات العميلات (Testimonials)</h1>
          <p className="text-xs text-[#7B6E72]">إدارة قسم "قالوا عن Cottonella 💗" المعروض في الصفحة الرئيسية</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D82B76] hover:bg-[#BE2063] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة رأي عميلة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map(t => (
          <div key={t.id} className="bg-white rounded-3xl p-6 border border-[#EDE2E5] shadow-xs flex flex-col justify-between text-right space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex text-[#F59E0B]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  t.isPublished ? 'bg-[#EBF6EE] text-[#5F8D69]' : 'bg-[#FAF0F4] text-[#D82B76]'
                }`}>
                  {t.isPublished ? 'معروض' : 'مخفي'}
                </span>
              </div>

              <p className="text-xs text-[#524549] leading-relaxed italic">
                "{t.review}"
              </p>
            </div>

            <div className="pt-3 border-t border-[#F2E5E9] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#2D2426]">{t.customerName}</h4>
                <div className="text-[10px] text-[#8C7D82]">{t.city} · {t.productPurchased}</div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-1.5 text-[#5F8D69] hover:bg-[#EAF5ED] rounded-lg"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`حذف تقييم ${t.customerName}؟`)) deleteTestimonial(t.id);
                  }}
                  className="p-1.5 text-[#D82B76] hover:bg-[#FCE8F0] rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
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
                {editingItem ? 'تعديل رأي العميلة' : 'إضافة رأي عميلة جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#8C7D82] hover:text-[#2D2426] hover:bg-gray-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">اسم العميلة *</label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="مثال: ياسمين أحمد"
                      className="w-full text-right p-2.5 rounded-xl border text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">المدينة / المحافظة</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="القاهرة، المعادي"
                      className="w-full text-right p-2.5 rounded-xl border text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">القطعة المشتراة</label>
                  <input
                    type="text"
                    value={formData.productPurchased}
                    onChange={e => setFormData({ ...formData, productPurchased: e.target.value })}
                    placeholder="طقم سرير بينك بلوسوم"
                    className="w-full text-right p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">التقييم (النجوم)</label>
                  <select
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border text-xs"
                  >
                    <option value={5}>5 نجوم ★★★★★</option>
                    <option value={4}>4 نجوم ★★★★☆</option>
                    <option value={3}>3 نجوم ★★★☆☆</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">نص التقييم والتجربة *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.review}
                    onChange={e => setFormData({ ...formData, review: e.target.value })}
                    placeholder="رأي العميلة في الخامة والتغليف والملمس..."
                    className="w-full text-right p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <ImageUploadInput
                    value={formData.customerAvatar}
                    onChange={dataUrl => setFormData({ ...formData, customerAvatar: dataUrl })}
                    label="صورة العميلة أو صورة تجربة المنتج (رفع من جهازك)"
                    aspectRatio="square"
                    helperText="اختاري صورة من جهازك لعرضها بجانب التقييم"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="rounded text-[#D82B76]"
                    />
                    <span>عرض في الصفحة الرئيسية</span>
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
                  حفظ التقييم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
