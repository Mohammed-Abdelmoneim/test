import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { POUCH_IMAGE, getValidImageUrl } from '../../data/initialData';
import { Plus, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const initialForm: Omit<Category, 'id'> = {
    slug: 'new-cat',
    name: 'New Category',
    nameAr: 'قسم جديد',
    description: 'Category description',
    descriptionAr: 'وصف القسم باللغة العربية',
    image: POUCH_IMAGE,
    order: categories.length + 1,
    isVisible: true,
  };

  const [formData, setFormData] = useState<Omit<Category, 'id'>>(initialForm);

  const handleOpenNew = () => {
    setEditingCat(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c);
    setFormData({
      slug: c.slug,
      name: c.name,
      nameAr: c.nameAr,
      description: c.description,
      descriptionAr: c.descriptionAr,
      image: c.image,
      order: c.order,
      isVisible: c.isVisible,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) return;

    if (editingCat) {
      updateCategory(editingCat.id, formData);
      showToast('تم تعديل القسم وحفظ التغييرات بنجاح!', 'success');
    } else {
      addCategory(formData);
      showToast('تمت إضافة القسم الجديد بنجاح!', 'success');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2426]">أقسام المتجر (Categories)</h1>
          <p className="text-xs text-[#7B6E72]">إدارة تصنيفات المنتجات (مفروشات السرير، بوشات ومقالم...)</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D82B76] hover:bg-[#BE2063] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة قسم جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-3xl border border-[#EDE2E5] shadow-xs overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-16/9 bg-[#FAF2EB]">
              <img
                src={getValidImageUrl(cat.image, POUCH_IMAGE)}
                alt={cat.nameAr}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = POUCH_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => updateCategory(cat.id, { isVisible: !cat.isVisible })}
                className="absolute top-3 left-3 bg-white/90 p-1.5 rounded-lg text-xs font-bold"
              >
                {cat.isVisible ? <Eye className="w-4 h-4 text-[#5F8D69]" /> : <EyeOff className="w-4 h-4 text-[#8C7D82]" />}
              </button>
            </div>

            <div className="p-6 text-right space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2D2426]">{cat.nameAr}</h3>
                <p className="text-xs text-[#6B5E63] mt-1 line-clamp-2 leading-relaxed">{cat.descriptionAr}</p>
                <div className="text-[11px] font-mono text-[#8C7D82] mt-2">المسار: /{cat.slug}</div>
              </div>

              <div className="pt-4 border-t border-[#F2E5E9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 text-[#5F8D69] hover:bg-[#EAF5ED] rounded-xl transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`حذف قسم "${cat.nameAr}"؟`)) {
                        deleteCategory(cat.id);
                      }
                    }}
                    className="p-2 text-[#D82B76] hover:bg-[#FCE8F0] rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#EDE2E5] shadow-2xl text-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE2E5] shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-[#2D2426]">
                {editingCat ? `تعديل: ${editingCat.nameAr}` : 'إضافة قسم جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#8C7D82] hover:text-[#2D2426] hover:bg-gray-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">اسم القسم (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full text-right p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">اسم القسم بالإنجليزية (Slug)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full text-left font-mono p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">الوصف</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionAr}
                    onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full text-right p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <ImageUploadInput
                    value={formData.image}
                    onChange={dataUrl => setFormData({ ...formData, image: dataUrl })}
                    label="صورة القسم (رفع من جهازك مباشرة)"
                    aspectRatio="video"
                    helperText="اختاري صورة من هاتفك أو جهازك لتمثيل هذا القسم"
                  />
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
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
