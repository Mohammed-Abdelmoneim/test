import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant } from '../../types';
import { MultiImageUpload, processAndCompressImage, uploadImageToServer } from '../common/ImageUploadInput';
import { BEDSHEET_IMAGE, HERO_IMAGE, PILLOW_IMAGE, getValidImageUrl } from '../../data/initialData';
import { 
  Plus, 
  Search, 
  Edit, 
  Copy, 
  Trash2, 
  X, 
  Upload,
  Sparkles,
  Palette,
  Camera,
  Loader2
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { 
    products, 
    categories, 
    collections, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    duplicateProduct,
    showToast 
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadingProdId, setUploadingProdId] = useState<string | null>(null);

  const handleQuickImageChange = async (prod: Product, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setUploadingProdId(prod.id);
      showToast('جاري رفع صورة المنتج وحفظها في التخزين السحابي...', 'info');
      try {
        const finalUrl = await uploadImageToServer(file);
        const updatedImages = [finalUrl, ...(prod.images || []).filter(img => img !== prod.images[0])];
        const updatedVariants = (prod.variants || []).map((v, i) => {
          if (i === 0 && (v.image === prod.images[0] || v.image === BEDSHEET_IMAGE)) {
            return { ...v, image: finalUrl };
          }
          return v;
        });

        await updateProduct(prod.id, { 
          images: updatedImages,
          variants: updatedVariants 
        });
        showToast('تم حفظ وتحديث صورة المنتج بنجاح في قاعدة البيانات!', 'success');
      } catch (err: any) {
        console.error('Error updating product image:', err);
        showToast(err.message || 'فشل تحديث صورة المنتج', 'error');
      } finally {
        setUploadingProdId(null);
        e.target.value = '';
      }
    }
  };

  // Initial Form State
  const initialFormState: Omit<Product, 'id' | 'createdAt'> = {
    slug: '',
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    category: 'bedsheets',
    collectionId: 'spring-2026',
    price: 800,
    discountEnabled: false,
    discountType: 'percentage',
    discountValue: 0,
    finalPrice: 800,
    images: [BEDSHEET_IMAGE],
    materials: '100% Egyptian Percale Cotton',
    materialsAr: 'قطن مصري 100% طبيعي فاخر بركال ناعم',
    dimensions: '240x260cm',
    dimensionsAr: 'الملاية 240×260 سم، الخداديات 50×70 سم',
    careInstructions: 'Machine wash delicate',
    careInstructionsAr: 'غسيل لطيف بماء بارد، تجفيف في الظل',
    availability: 'in_stock',
    sku: 'COT-NEW-01',
    tags: ['floral', 'cotton'],
    isFeatured: true,
    isPublished: true,
    isArchived: false,
    variants: [
      {
        id: 'var-1',
        size: 'Single',
        sizeAr: 'سرير مفرد (120×200 سم)',
        color: 'Pink',
        colorAr: 'وردي بودري (Blush Pink)',
        colorHex: '#F6CAD8',
        price: 650,
        stock: 10,
        image: BEDSHEET_IMAGE,
      },
      {
        id: 'var-2',
        size: 'Double',
        sizeAr: 'سرير مزدوج (160×200 سم)',
        color: 'Pink',
        colorAr: 'وردي بودري (Blush Pink)',
        colorHex: '#F6CAD8',
        price: 800,
        stock: 15,
        image: BEDSHEET_IMAGE,
      },
      {
        id: 'var-3',
        size: 'King',
        sizeAr: 'سرير كينج (180×200 سم)',
        color: 'Pink',
        colorAr: 'وردي بودري (Blush Pink)',
        colorHex: '#F6CAD8',
        price: 950,
        stock: 8,
        image: HERO_IMAGE,
      },
    ],
    rating: 5,
    reviewCount: 0,
  };

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>(initialFormState);

  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      slug: p.slug,
      name: p.name,
      nameAr: p.nameAr,
      description: p.description,
      descriptionAr: p.descriptionAr,
      category: p.category,
      collectionId: p.collectionId,
      price: p.price,
      discountEnabled: p.discountEnabled,
      discountType: p.discountType,
      discountValue: p.discountValue,
      finalPrice: p.finalPrice,
      images: [...p.images],
      materials: p.materials,
      materialsAr: p.materialsAr,
      dimensions: p.dimensions,
      dimensionsAr: p.dimensionsAr,
      careInstructions: p.careInstructions,
      careInstructionsAr: p.careInstructionsAr,
      availability: p.availability,
      sku: p.sku,
      tags: [...p.tags],
      isFeatured: p.isFeatured,
      isPublished: p.isPublished,
      isArchived: p.isArchived,
      variants: p.variants && p.variants.length > 0 ? [...p.variants] : [],
      rating: p.rating,
      reviewCount: p.reviewCount,
    });
    setIsModalOpen(true);
  };

  // Price & Discount Auto-Calculation
  const handlePriceChange = (val: number) => {
    const price = Math.max(0, val);
    let final = price;
    if (formData.discountEnabled && formData.discountValue > 0) {
      if (formData.discountType === 'percentage') {
        final = Math.max(0, Math.round(price * (1 - formData.discountValue / 100)));
      } else {
        final = Math.max(0, price - formData.discountValue);
      }
    }
    setFormData(prev => ({ ...prev, price, finalPrice: final }));
  };

  const handleDiscountChange = (enabled: boolean, type: 'percentage' | 'fixed', val: number) => {
    let final = formData.price;
    if (enabled && val > 0) {
      if (type === 'percentage') {
        final = Math.max(0, Math.round(formData.price * (1 - val / 100)));
      } else {
        final = Math.max(0, formData.price - val);
      }
    }
    setFormData(prev => ({
      ...prev,
      discountEnabled: enabled,
      discountType: type,
      discountValue: val,
      finalPrice: final,
    }));
  };

  // Dynamic Variants Management
  const handleAddVariant = () => {
    const defaultImg = formData.images[0] || BEDSHEET_IMAGE;
    const newV: ProductVariant = {
      id: 'var-' + Date.now(),
      size: 'Double',
      sizeAr: 'سرير مزدوج (160×200 سم)',
      color: 'Pink',
      colorAr: 'وردي بودري (Blush Pink)',
      colorHex: '#F6CAD8',
      price: formData.finalPrice || 800,
      stock: 10,
      image: defaultImg,
    };
    setFormData(prev => ({ ...prev, variants: [...prev.variants, newV] }));
  };

  const handleAutoGenerateBedVariants = () => {
    const defaultImg = formData.images[0] || BEDSHEET_IMAGE;
    const baseP = formData.finalPrice || 800;
    const generated: ProductVariant[] = [
      {
        id: 'var-single-' + Date.now(),
        size: 'Single',
        sizeAr: 'سرير مفرد (120×200 سم)',
        color: 'Pink',
        colorAr: 'وردي بودري (Blush Pink)',
        colorHex: '#F6CAD8',
        price: Math.max(100, baseP - 150),
        stock: 8,
        image: defaultImg,
      },
      {
        id: 'var-double-' + Date.now(),
        size: 'Double',
        sizeAr: 'سرير مزدوج (160×200 سم)',
        color: 'Pink',
        colorAr: 'وردي بودري (Blush Pink)',
        colorHex: '#F6CAD8',
        price: baseP,
        stock: 12,
        image: defaultImg,
      },
      {
        id: 'var-king-' + Date.now(),
        size: 'King',
        sizeAr: 'سرير كينج (180×200 سم)',
        color: 'Pink',
        colorAr: 'وردي بودري (Blush Pink)',
        colorHex: '#F6CAD8',
        price: baseP + 150,
        stock: 6,
        image: defaultImg,
      },
      {
        id: 'var-green-double-' + Date.now(),
        size: 'Double',
        sizeAr: 'سرير مزدوج (160×200 سم)',
        color: 'Green',
        colorAr: 'أخضر ميرمية (Sage Green)',
        colorHex: '#7AA383',
        price: baseP,
        stock: 7,
        image: PILLOW_IMAGE,
      },
      {
        id: 'var-beige-double-' + Date.now(),
        size: 'Double',
        sizeAr: 'سرير مزدوج (160×200 سم)',
        color: 'Beige',
        colorAr: 'بيج كريمي (Warm Beige)',
        colorHex: '#FAF2EB',
        price: baseP,
        stock: 9,
        image: HERO_IMAGE,
      },
    ];
    setFormData(prev => ({ ...prev, variants: generated }));
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setFormData(prev => {
      const vars = [...prev.variants];
      vars[index] = { ...vars[index], ...updates };
      return { ...prev, variants: vars };
    });
  };

  // Upload variant image from device
  const handleVariantFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      try {
        const finalUrl = await uploadImageToServer(files[0]);
        handleUpdateVariant(index, { image: finalUrl });
        showToast('تم رفع صورة الخيار بنجاح', 'success');
      } catch (err: any) {
        console.error('Error uploading variant image:', err);
        showToast(err.message || 'فشل رفع صورة الخيار', 'error');
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const [isSaving, setIsSaving] = useState(false);

  // Save product
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) {
      showToast('يرجى كتابة اسم المنتج باللغة العربية', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        showToast('تم تعديل المنتج وحفظ التغييرات بنجاح!', 'success');
      } else {
        await addProduct(formData);
        showToast('تمت إضافة المنتج الجديد بنجاح!', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      showToast(err.message || 'حدث خطأ أثناء حفظ المنتج في قاعدة البيانات', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameAr.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2426]">المنتجات والمقاسات</h1>
          <p className="text-xs text-[#7B6E72]">إدارة المنتجات ورفع صورها من جهازك وتحديد خيارات المقاس واللون</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D82B76] hover:bg-[#BE2063] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDE2E5] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="البحث باسم المنتج، الكود (SKU)..."
            className="w-full text-right p-2.5 pr-9 text-xs rounded-xl border border-[#ECD8CE] bg-white text-[#2D2426] focus:border-[#D82B76] focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-[#8C7D82] absolute top-3 right-3" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#7B6E72]">القسم:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-xs p-2 rounded-xl border border-[#ECD8CE] bg-white text-[#2D2426] font-medium cursor-pointer"
          >
            <option value="all">جميع الأقسام ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#EDE2E5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#FAF4F6] text-[#695D62] font-bold border-b border-[#EDE2E5]">
              <tr>
                <th className="py-3.5 px-4">المنتج</th>
                <th className="py-3.5 px-4">القسم والمجموعة</th>
                <th className="py-3.5 px-4">السعر والخصم</th>
                <th className="py-3.5 px-4">الخيارات (المقاسات والألوان)</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EBEE] text-[#42363A]">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FCF9FA] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group/thumb shrink-0">
                        <img
                          src={getValidImageUrl(prod.images[0], BEDSHEET_IMAGE)}
                          alt={prod.nameAr}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = BEDSHEET_IMAGE;
                          }}
                          className="w-12 h-12 rounded-lg object-cover bg-[#F5ECE5] border border-[#ECD8CE]"
                        />
                        <label
                          className="absolute inset-0 bg-black/60 text-white rounded-lg opacity-0 group-hover/thumb:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity"
                          title="تغيير صورة المنتج مباشرة من جهازك"
                        >
                          {uploadingProdId === prod.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Camera className="w-4 h-4 text-white" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingProdId === prod.id}
                            onChange={(e) => handleQuickImageChange(prod, e)}
                          />
                        </label>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#2D2426] flex items-center gap-1.5">
                          <span>{prod.nameAr}</span>
                          {prod.isFeatured && (
                            <span className="text-[10px] text-[#D82B76] bg-[#FDE7F0] px-1.5 py-0.2 rounded font-bold">مميز</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8C7D82] font-mono mt-0.5">SKU: {prod.sku}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#2D2426]">
                      {prod.category === 'bedsheets' ? 'مفروشات سرير' : 'بوش قطني'}
                    </div>
                    <div className="text-[11px] text-[#7A6C71]">
                      {collections.find(c => c.id === prod.collectionId)?.nameAr || 'المجموعة الأساسية'}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold font-mono text-[#D82B76] text-sm">
                        {prod.finalPrice} ج.م
                      </span>
                      {prod.discountEnabled && (
                        <span className="line-through text-[#9C8E93] font-mono text-[11px]">
                          {prod.price} ج.م
                        </span>
                      )}
                    </div>
                    {prod.discountEnabled && (
                      <span className="text-[10px] text-[#5F8D69] font-bold">
                        خصم {prod.discountType === 'percentage' ? `${prod.discountValue}%` : `${prod.discountValue} ج.م`}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-mono font-bold text-[#884B25]">
                        {prod.variants?.length || 0} خيارات متوفرة
                      </span>
                      {prod.variants && prod.variants.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {prod.variants.slice(0, 3).map((v) => (
                            <span
                              key={v.id}
                              className="text-[10px] px-1.5 py-0.5 bg-[#FAF3ED] rounded text-[#6E5F64] border border-[#F1E0D6] flex items-center gap-1"
                            >
                              {v.colorHex && (
                                <span className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: v.colorHex }} />
                              )}
                              <span>{v.size} ({v.price} ج.م)</span>
                            </span>
                          ))}
                          {prod.variants.length > 3 && (
                            <span className="text-[10px] text-[#9A8D92]">+{prod.variants.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => updateProduct(prod.id, { isPublished: !prod.isPublished })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        prod.isPublished
                          ? 'bg-[#EBF6EE] text-[#5F8D69]'
                          : 'bg-[#FAF0F4] text-[#D82B76]'
                      }`}
                    >
                      {prod.isPublished ? 'منشور بالموقع' : 'مسودة مخفية'}
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-[#5F8D69] hover:bg-[#EAF5ED] rounded-lg transition-colors"
                        title="تعديل المنتج والخيارات"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => duplicateProduct(prod.id)}
                        className="p-1.5 text-[#884B25] hover:bg-[#FAF1E8] rounded-lg transition-colors"
                        title="تكرار المنتج"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ${prod.nameAr}؟`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-[#D82B76] hover:bg-[#FCE8F0] rounded-lg transition-colors"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDE2E5] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE2E5] shrink-0 bg-white">
              <h2 className="text-lg sm:text-xl font-bold text-[#2D2426]">
                {editingProduct ? `تعديل: ${editingProduct.nameAr}` : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#8C7D82] hover:text-[#2D2426] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden text-right">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">
              
              {/* Product Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">اسم المنتج (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder="طقم سرير بينك بلوسوم هاند ميد"
                    className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426] focus:border-[#D82B76]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">اسم المنتج (English)</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Pink Blossom Quilted Bed Set"
                    className="w-full text-left p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426] focus:border-[#D82B76]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#45383C]">وصف المنتج التفصيلي (بالعربية) *</label>
                <textarea
                  rows={2}
                  value={formData.descriptionAr}
                  onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder="وصف الخامات، النقوش، الكشكشة..."
                  className="w-full text-right p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426] focus:border-[#D82B76]"
                />
              </div>

              {/* Category, Collection & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">القسم (Category)</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">المجموعة (Collection)</label>
                  <select
                    value={formData.collectionId}
                    onChange={e => setFormData({ ...formData, collectionId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426]"
                  >
                    {collections.map(col => (
                      <option key={col.id} value={col.id}>{col.nameAr} ({col.seasonYear})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#45383C]">كود المنتج (SKU)</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full font-mono text-left p-2.5 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426]"
                  />
                </div>
              </div>

              {/* Pricing & Discount */}
              <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FBE3ED] space-y-3">
                <h3 className="text-xs font-bold text-[#D82B76] uppercase">السعر الأساسي والعروض</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">السعر الأصلي (ج.م) *</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.price}
                      onChange={e => handlePriceChange(Number(e.target.value))}
                      className="w-full text-left font-mono font-bold p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45383C]">الخصم</label>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-[#2D2426] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.discountEnabled}
                          onChange={e => handleDiscountChange(e.target.checked, formData.discountType, formData.discountValue)}
                          className="rounded text-[#D82B76]"
                        />
                        <span>تفعيل الخصم</span>
                      </label>
                    </div>
                  </div>

                  {formData.discountEnabled && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45383C]">نسبة الخصم (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={formData.discountValue}
                        onChange={e => handleDiscountChange(true, 'percentage', Number(e.target.value))}
                        className="w-full text-left font-mono font-bold p-2.5 rounded-xl border border-[#ECD8CE] text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ================= UPLOAD PRODUCT IMAGES DIRECTLY FROM DEVICE ================= */}
              <div className="p-5 rounded-2xl bg-[#FAF6F8] border border-[#ECDCE2]">
                <MultiImageUpload
                  images={formData.images}
                  onChange={newImages => {
                    setFormData(prev => {
                      const updatedVariants = prev.variants.map((v, i) => {
                        // If variant was using the old primary image or default bedsheet image, update it to the new primary image
                        if (i === 0 && newImages.length > 0 && (v.image === prev.images[0] || v.image === BEDSHEET_IMAGE)) {
                          return { ...v, image: newImages[0] };
                        }
                        return v;
                      });
                      return {
                        ...prev,
                        images: newImages,
                        variants: updatedVariants,
                      };
                    });
                  }}
                  label="صور المنتج (رفع من جهازك مباشرة بدون روابط)"
                />
              </div>

              {/* ================= DYNAMIC VARIANTS BUILDER (Size, Color, Price, Stock, Image from Device) ================= */}
              <div className="p-5 rounded-3xl bg-[#FAF5F7] border border-[#ECDCE2] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#2D2426] flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#D82B76]" />
                      <span>خيارات المنتج والمقاسات والألوان (Dynamic Variants)</span>
                    </h3>
                    <p className="text-[11px] text-[#7A6C71]">
                      لكل خيار: حددي المقاس واللون وسعره وصورته المرفوعة من جهازك مباشرة.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoGenerateBedVariants}
                      className="px-3 py-1.5 bg-[#EAF5ED] text-[#5F8D69] hover:bg-[#DEEFE3] text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                      title="إنشاء مقاسات السرير المعتادة بنقرة واحدة"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>توليد مقاسات وألوان جاهزة</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-[#D82B76] hover:bg-[#BF2064] text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      + خيار جديد
                    </button>
                  </div>
                </div>

                {/* Variants List / Editor */}
                <div className="space-y-3">
                  {formData.variants.map((v, idx) => (
                    <div 
                      key={v.id} 
                      className="p-4 bg-white rounded-2xl border border-[#EDE0E4] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#F4E9ED] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#FAF1E8] text-[#884B25] text-xs font-bold font-mono flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#2D2426]">
                            {v.sizeAr || v.size} - {v.colorAr || v.color}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف الخيار</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
                        
                        {/* Size Selection */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#55474B]">المقاس (Size)</label>
                          <input
                            type="text"
                            value={v.sizeAr}
                            onChange={e => handleUpdateVariant(idx, { sizeAr: e.target.value, size: e.target.value })}
                            placeholder="سرير مزدوج (160×200)"
                            className="w-full text-right p-2 text-xs rounded-xl border border-[#ECD8CE]"
                          />
                        </div>

                        {/* Color Selection & Swatch */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#55474B]">اللون (Color)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={v.colorHex || '#F6CAD8'}
                              onChange={e => handleUpdateVariant(idx, { colorHex: e.target.value })}
                              className="w-8 h-8 rounded-lg border border-black/10 cursor-pointer p-0.5"
                              title="اختيار لون العينة"
                            />
                            <input
                              type="text"
                              value={v.colorAr}
                              onChange={e => handleUpdateVariant(idx, { colorAr: e.target.value, color: e.target.value })}
                              placeholder="وردي بودري"
                              className="flex-1 text-right p-2 text-xs rounded-xl border border-[#ECD8CE]"
                            />
                          </div>
                        </div>

                        {/* Variant Price */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#55474B]">السعر (ج.م)</label>
                          <input
                            type="number"
                            min={0}
                            value={v.price}
                            onChange={e => handleUpdateVariant(idx, { price: Number(e.target.value) })}
                            className="w-full text-left font-mono font-bold p-2 text-xs rounded-xl border border-[#ECD8CE]"
                          />
                        </div>

                        {/* Stock */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#55474B]">الكمية (Stock)</label>
                          <input
                            type="number"
                            min={0}
                            value={v.stock}
                            onChange={e => handleUpdateVariant(idx, { stock: Number(e.target.value) })}
                            className="w-full text-left font-mono p-2 text-xs rounded-xl border border-[#ECD8CE]"
                          />
                        </div>

                        {/* Variant Image Upload from Device */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-[#55474B]">صورة هذا المقاس/اللون</label>
                            {formData.images && formData.images.length > 0 && (
                              <button
                                type="button"
                                onClick={() => handleUpdateVariant(idx, { image: formData.images[0] })}
                                className="text-[10px] text-[#5F8D69] hover:underline font-bold cursor-pointer"
                                title="استخدام صورة المنتج الرئيسية لهذا الخيار"
                              >
                                نفس الرئيسية
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {v.image && (
                              <img
                                src={getValidImageUrl(v.image)}
                                alt="Variant"
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-lg object-cover border border-[#ECD8CE] shrink-0"
                              />
                            )}
                            <label className="flex-1 cursor-pointer py-1.5 px-2.5 bg-[#FAF3ED] hover:bg-[#FCE8F0] text-[#D82B76] text-[11px] font-bold rounded-xl border border-[#F3CBDC] text-center flex items-center justify-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{v.image ? 'تغيير الصورة' : 'رفع صورة'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleVariantFileUpload(idx, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}

                  {formData.variants.length === 0 && (
                    <div className="p-6 text-center text-xs text-[#8C7D82] bg-white rounded-2xl border border-dashed border-[#ECD8CE]">
                      لا توجد خيارات مضافة حالياً. اضغطي على "+ خيار جديد" أو "توليد مقاسات وألوان جاهزة"
                    </div>
                  )}
                </div>
              </div>

              </div>

              {/* Submit buttons - Pinned at bottom */}
              <div className="px-6 py-4 border-t border-[#EDE2E5] bg-[#FAF5F7] flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#ECD8CE] text-xs font-bold text-[#6D5F64] hover:bg-white transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#D82B76] hover:bg-[#BF2064] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ وتحديث المتجر...' : 'حفظ المنتج وتحديث المتجر'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
