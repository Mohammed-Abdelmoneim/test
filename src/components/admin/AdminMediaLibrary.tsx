import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { MediaItem } from '../../types';
import { uploadImageToServer } from '../common/ImageUploadInput';
import { Trash2, Search, Copy, Check, Upload, Folder, Camera } from 'lucide-react';

export const AdminMediaLibrary: React.FC = () => {
  const { media, addMediaItem, deleteMediaItem } = useStore();

  const [activeFolder, setActiveFolder] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [targetFolder, setTargetFolder] = useState<MediaItem['folder']>('products');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders: { id: string; label: string }[] = [
    { id: 'all', label: 'جميع الصور' },
    { id: 'products', label: 'المنتجات (Products)' },
    { id: 'collections', label: 'المجموعات (Collections)' },
    { id: 'website', label: 'الموقع والواجهة (Website)' },
    { id: 'testimonials', label: 'الآراء (Testimonials)' },
  ];

  const filteredMedia = media.filter(item => {
    if (activeFolder !== 'all' && item.folder !== activeFolder) return false;
    if (search.trim()) {
      return item.title.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          const persistentUrl = await uploadImageToServer(file);
          addMediaItem({
            url: persistentUrl,
            title: file.name.replace(/\.[^/.]+$/, "") || 'صورة من الجهاز',
            folder: targetFolder,
            size: `${Math.round(file.size / 1024)} KB`,
          });
        } catch (err) {
          console.error('Error processing media file:', err);
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2426]">مكتبة الصور (Media Library)</h1>
          <p className="text-xs text-[#7B6E72]">رفع صور المنتجات والمفروشات والمجموعات مباشرة من أي جهاز واستعراضها</p>
        </div>
      </div>

      {/* Upload area directly from device */}
      <div className="bg-white p-6 rounded-3xl border border-[#EDE2E5] shadow-xs space-y-4 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE2E5]">
          <h3 className="text-xs font-bold text-[#D82B76] uppercase flex items-center gap-1.5">
            <Upload className="w-4 h-4" />
            <span>رفع صور جديدة من جهازك مباشرة (كمبيوتر أو موبايل)</span>
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#45383C]">المجلد المراد الإضافة إليه:</span>
            <select
              value={targetFolder}
              onChange={e => setTargetFolder(e.target.value as any)}
              className="text-xs p-2 rounded-xl border border-[#ECD8CE] bg-white font-semibold"
            >
              <option value="products">المنتجات (Products)</option>
              <option value="collections">المجموعات (Collections)</option>
              <option value="website">الموقع والواجهة (Website)</option>
              <option value="testimonials">الآراء (Testimonials)</option>
            </select>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUploadFiles}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#E5CAD6] hover:border-[#D82B76] hover:bg-[#FDF6F9] bg-[#FAF5F7] rounded-3xl p-8 flex flex-col items-center justify-center gap-2.5 text-center transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-[#D82B76] flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-[#2D2426]">
            انقري هنا لاختيار صور من جهازك أو التقاط صورة جديدة
          </span>
          <span className="text-xs text-[#7A6C71]">
            يمكنكِ اختيار عدة صور دفعة واحدة بدون أي تعقيد
          </span>
        </div>
      </div>

      {/* Filter Folders and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#EDE2E5] shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Folders */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeFolder === f.id
                  ? 'bg-[#D82B76] text-white font-bold shadow-xs'
                  : 'bg-[#FAF3ED] text-[#55474B] hover:text-[#2D2426]'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="البحث في الصور..."
            className="w-full text-right p-2 pr-8 text-xs rounded-xl border border-[#ECD8CE]"
          />
          <Search className="w-3.5 h-3.5 text-[#8C7D82] absolute top-2.5 right-2.5" />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.map(item => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl border border-[#EDE2E5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-square bg-[#FAF5F2] overflow-hidden">
              <img
                src={item.url}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform"
              />
              <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs">
                {item.folder}
              </span>
            </div>

            <div className="p-3 text-right space-y-2">
              <h4 className="text-xs font-bold text-[#2D2426] truncate">{item.title}</h4>
              <div className="flex items-center justify-between pt-1 border-t border-[#F2E5E9]">
                <button
                  onClick={() => handleCopyUrl(item.url, item.id)}
                  className="flex items-center gap-1 text-[11px] text-[#5F8D69] hover:underline font-medium"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === item.id ? 'تم النسخ!' : 'نسخ'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`حذف صورة ${item.title}؟`)) deleteMediaItem(item.id);
                  }}
                  className="p-1 text-[#D82B76] hover:bg-[#FCE8F0] rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
