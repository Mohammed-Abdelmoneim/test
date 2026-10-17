import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Collection } from '../../types';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { COLLECTION_BANNER, getValidImageUrl } from '../../data/initialData';
import { Plus, Edit, Trash2, X, Check, Layers } from 'lucide-react';

export const AdminCollections: React.FC = () => {
  const { collections, addCollection, updateCollection, deleteCollection, products, showToast } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<Collection | null>(null);

  const initialForm: Omit<Collection, 'id'> = {
    slug: 'spring-new',
    name: 'New Collection',
    nameAr: 'مجموعة جديدة',
    description: 'Collection description',
    descriptionAr: 'وصف المجموعة ونقوش الأقمشة',
    coverImage: COLLECTION_BANNER,
    bannerImage: COLLECTION_BANNER,
    isPublished: true,
    isFeatured: false,
    productIds: [],
    seasonYear: 'Spring 2026',
  };

  const [formData, setFormData] = useState<Omit<Collection, 'id'>>(initialForm);

  const handleOpenNew = () => {
    setEditingCol(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: Collection) => {
    setEditingCol(col);
    setFormData({
      slug: col.slug,
      name: col.name,
      nameAr: col.nameAr,
      description: col.description,
      descriptionAr: col.descriptionAr,
      coverImage: col.coverImage,
      bannerImage: col.bannerImage,
      isPublished: col.isPublished,
      isFeatured: col.isFeatured,
      productIds: [...col.productIds],
      seasonYear: col.seasonYear,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) return;

    if (editingCol) {
      updateCollection(editingCol.id, formData);
      showToast('تم تعديل المجموعة وحفظ التغييرات بنجاح!', 'success');
    } else {
      addCollection(formData);
      showToast('تمت إضافة المجموعة الجديدة بنجاح!', 'success');
    }
    setIsModalOpen(false);
  };

  const toggleProductInCollection = (productId: string) => {
    setFormData(prev => {
      const exists = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: exists
          ? prev.productIds.filter(id => id !== productId)
          : [...prev.productIds, productId]
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2426]">المجموعات الموسمية (Collections)</h1>
          <p className="text-xs text-[#7B6E72]">إدارة مجموعات ربيع 2026، ربيع 2025 وربطها بالمنتجات</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D82B76] hover:bg-[#BE2063] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ إنشاء مجموعة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collections.map(col => {
          const colProducts = products.filter(p => col.productIds.includes(p.id));

          return (
            <div key={col.id} className="bg-white rounded-3xl border border-[#EDE2E5] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-16/9 bg-[#FAF2EB]">
                <img src={col.coverImage} alt={col.nameAr} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <span className="absolute top-3 right-3 bg-white/90 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {col.seasonYear}
                </span>
                <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  col.isPublished ? 'bg-[#EBF6EE] text-[#5F8D69]' : 'bg-[#FAF0F4] text-[#D82B76]'
                }`}>
                  {col.isPublished ? 'منشورة' : 'مسودة'}
                </span>
              </div>

              <div className="p-6 text-right space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#2D2426]">{col.nameAr}</h3>
                  <p className="text-xs text-[#6B5E63] mt-1 line-clamp-2 leading-relaxed">{col.descriptionAr}</p>
                  <div className="mt-3 text-xs text-[#5F8D69] font-medium">
                    تحتوي على {colProducts.length} منتجات مرتبطة
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F2E5E9] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(col)}
                      className="p-2 text-[#5F8D69] hover:bg-[#EAF5ED] rounded-xl transition-colors"
                      title="تعديل المجموعة"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`حذف مجموعة "${col.nameAr}"؟`)) {
                          deleteCollection(col.id);
                        }
                      }}
                      className="p-2 text-[#D82B76] hover:bg-[#FCE8F0] rounded-xl transition-colors"
                      title="حذف المجموعة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => updateCollection(col.id, { isPublished: !col.isPublished })}
                    className="text-xs font-semibold text-[#8B7C81] hover:text-[#2D2426]"
                  >
                    {col.isPublished ? 'إلغاء النشر' : 'نشر بالمتجر'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#EDE2E5] shadow-2xl text-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE2E5] shrink-0 bg-white">
              <h3 className="text-base sm:text-lg font-bold text-[#2D2426]">
                {editingCol ? `تعديل: ${editingCol.nameAr}` : 'إنشاء مجموعة جديدة'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-[#8C7D82] hover:text-[#2D2426] hover:bg-gray-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">اسم المجموعة (بالعربية) *</label>
                    <input
                      type="text"
                      required
                      value={formData.nameAr}
                      onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full text-right p-2.5 rounded-xl border text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">الموسم والسنة (Season Tag)</label>
                    <input
                      type="text"
                      value={formData.seasonYear}
                      onChange={e => setFormData({ ...formData, seasonYear: e.target.value })}
                      placeholder="Spring 2026"
                      className="w-full text-right p-2.5 rounded-xl border text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">وصف المجموعة</label>
                  <textarea
                    rows={2}
                    value={formData.descriptionAr}
                    onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                    className="w-full text-right p-2.5 rounded-xl border text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <ImageUploadInput
                    value={formData.coverImage}
                    onChange={dataUrl => setFormData({ ...formData, coverImage: dataUrl, bannerImage: dataUrl })}
                    label="صورة غلاف المجموعة (رفع من جهازك مباشرة)"
                    aspectRatio="banner"
                    helperText="اختاري صورة البانر من جهازك لعرضها كواجهة للمجموعة"
                  />
                </div>

                {/* Assign products */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#45383C]">ربط المنتجات بالمجموعة:</label>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#EDE2E5] p-3 rounded-xl">
                    {products.map(p => {
                      const isSelected = formData.productIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProductInCollection(p.id)}
                          className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-[#FDF2F6] text-[#D82B76] font-bold' : 'hover:bg-gray-50'
                          }`}
                        >
                          <span>{p.nameAr}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#D82B76]" />}
                        </div>
                      );
                    })}
                  </div>
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
                  حفظ المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
