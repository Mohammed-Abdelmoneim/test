import React, { useRef, useState } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Camera, 
  Link as LinkIcon, 
  Check, 
  Sparkles,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { 
  getValidImageUrl, 
  HERO_IMAGE, 
  BEDSHEET_IMAGE, 
  POUCH_IMAGE, 
  PILLOW_IMAGE, 
  COLLECTION_BANNER 
} from '../../data/initialData';
import { useStore } from '../../context/StoreContext';
import { uploadImageToFirebaseStorage } from '../../firebase';

interface ImageUploadInputProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  helperText?: string;
  objectFit?: 'cover' | 'contain';
}

// Preset store gallery pictures that admin can choose from with 1-click
const STORE_PRESETS = [
  { name: 'صورة الواجهة الرئيسية (Hero)', url: HERO_IMAGE },
  { name: 'طقم سرير بينك بلوسوم', url: BEDSHEET_IMAGE },
  { name: 'بوش ومقلمة مبطنة', url: POUCH_IMAGE },
  { name: 'خدادية ريفية كوزي', url: PILLOW_IMAGE },
  { name: 'بانر تشكيلة الربيع', url: COLLECTION_BANNER },
];

// Helper to compress image client-side to an ultra-compact, high-res web format (~25KB - 40KB)
export const processAndCompressImage = (file: File, maxWidth = 800, quality = 0.72): Promise<string> => {
  return new Promise((resolve, reject) => {
    const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try webp first for excellent compression with transparency support
        let result = '';
        try {
          result = canvas.toDataURL('image/webp', quality);
        } catch (e) {}

        if (!result || !result.startsWith('data:image/webp')) {
          if (isPng) {
            const pngResult = canvas.toDataURL('image/png');
            if (pngResult.length < 120000) {
              result = pngResult;
            } else {
              result = canvas.toDataURL('image/jpeg', quality);
            }
          } else {
            result = canvas.toDataURL('image/jpeg', quality);
          }
        }

        resolve(result);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Upload helper that sends to Firebase Storage first with permanent dataUrl fallback
export const uploadImageToServer = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  // 1. Client-side compression creates an ultra-fast, lightweight base64 representation (~70KB)
  let compressedDataUrl = '';
  try {
    compressedDataUrl = await processAndCompressImage(file, 1200, 0.82);
  } catch (compErr) {
    console.warn('Client image compression notice:', compErr);
  }

  // 2. Try Firebase Storage directly for permanent Google Cloud Storage CDN URL
  try {
    const storageRes = await uploadImageToFirebaseStorage(file, file.name, onProgress);
    if (storageRes && storageRes.url && storageRes.url.startsWith('https://')) {
      return storageRes.url;
    }
  } catch (storageErr: any) {
    console.info('Firebase Storage direct upload notice (using persistent dataUrl fallback):', storageErr?.code || storageErr?.message || storageErr);
  }

  // 3. Guaranteed zero-failure persistent image string:
  // On Vercel and serverless architectures, relative disk paths like /uploads/ cause 404s.
  // Returning the compressed dataUrl embeds the image data directly:
  // - Never 404s
  // - Never triggers "تعذر تحميل الصورة"
  // - Persists directly to Firestore store/main document
  // - Displays instantly in all browsers and devices without any network lag
  if (compressedDataUrl) {
    return compressedDataUrl;
  }

  throw new Error('فشل قراءة ملف الصورة. يرجى التأكد من اختيار صورة صالحة.');
};

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label,
  className = '',
  aspectRatio = 'auto',
  helperText,
  objectFit = 'cover',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'url'>('upload');
  const [customUrl, setCustomUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [singleUploadError, setSingleUploadError] = useState<string | null>(null);

  // Automatically reset image error state whenever value changes
  React.useEffect(() => {
    setImgError(false);
  }, [value]);

  // Read media items from global store if available
  let storeMediaItems: { id: string; url: string; title: string }[] = [];
  let addMediaToStore: ((item: any) => void) | null = null;
  try {
    const store = useStore();
    if (store && Array.isArray(store.media)) {
      storeMediaItems = store.media;
    }
    if (store && store.addMediaItem) {
      addMediaToStore = store.addMediaItem;
    }
  } catch (e) {
    // Outside StoreProvider fallback
  }

  // Combined library: stock presets + user-uploaded media library items
  const allLibraryItems = [
    ...STORE_PRESETS.map((p, idx) => ({ id: `preset-${idx}`, url: p.url, title: p.name })),
    ...storeMediaItems.map(m => ({ id: m.id, url: m.url, title: m.title })),
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      setIsUploading(true);
      setSingleUploadError(null);
      try {
        const finalUrl = await uploadImageToServer(selectedFile);
        setImgError(false);
        onChange(finalUrl);

        // Add to media library only if it is a permanent URL or compact image
        if (addMediaToStore && finalUrl && (!finalUrl.startsWith('data:') || finalUrl.length < 50000)) {
          try {
            addMediaToStore({
              url: finalUrl,
              title: selectedFile.name.replace(/\.[^/.]+$/, '') || 'صورة مرفوعة',
              folder: 'website',
              size: `${Math.round(selectedFile.size / 1024)} KB`,
            });
          } catch (err) {
            console.warn('Could not register in media library:', err);
          }
        }
      } catch (err: any) {
        console.error('Error uploading file:', err);
        setSingleUploadError(err.message || 'فشل رفع الصورة من جهازك');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setImgError(false);
      onChange(customUrl.trim());
      setCustomUrl('');
    }
  };

  const handleRemove = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImgError(false);
    setSingleUploadError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-16/9'
      : aspectRatio === 'banner'
      ? 'aspect-21/9'
      : 'aspect-auto min-h-[140px]';

  const resolvedSrc = value ? getValidImageUrl(value) : '';

  return (
    <div className={`space-y-2 text-right ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#45383C]">
            {label}
          </label>
          {value && (
            <button
              type="button"
              onClick={() => handleRemove()}
              className="text-[11px] text-red-600 hover:text-red-700 font-semibold cursor-pointer"
            >
              حذف الصورة
            </button>
          )}
        </div>
      )}

      {singleUploadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <span>{singleUploadError}</span>
          <button type="button" onClick={() => setSingleUploadError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Image Preview with Replace / Remove / Quick-change actions */
        <div className="space-y-2">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl overflow-hidden border border-[#ECD8CE] bg-[#FAF5F2] group ${aspectClass} cursor-pointer`}
            title="انقري لتغيير الصورة أو رفع صورة جديدة من جهازك"
          >
            <img
              src={resolvedSrc}
              alt="Uploaded Preview"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className={`w-full h-full ${objectFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`}
            />
            
            {imgError && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute inset-0 bg-[#FAF5F2] flex flex-col items-center justify-center p-3 text-center z-10 cursor-pointer"
              >
                <Upload className="w-6 h-6 text-[#D82B76] mb-1.5" />
                <span className="text-xs font-bold text-[#D82B76] mb-1">انقري لرفع صورة جديدة من جهازك</span>
                <span className="text-[10px] text-[#7A6C71]">اضغطي لاختيار صورة بديلة من الكمبيوتر أو الهاتف</span>
              </div>
            )}

            {/* Hover & Mobile overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <span className="px-3 py-1.5 bg-white text-[#2D2426] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 pointer-events-none">
                <Camera className="w-3.5 h-3.5 text-[#D82B76]" />
                <span>تغيير الصورة</span>
              </span>
              
              <button
                type="button"
                onClick={(e) => handleRemove(e)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                title="حذف الصورة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick change tag at bottom corner */}
            <div className="absolute bottom-2 left-2 pointer-events-none">
              <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 opacity-90">
                <Camera className="w-3 h-3" />
                <span>انقري للتغيير</span>
              </span>
            </div>
          </div>

          {/* Quick Tab Options to Replace */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-[#FAF5F7] p-2.5 rounded-xl border border-[#F2DEE7]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white hover:bg-[#FDF2F6] text-[#D82B76] border border-[#F2CBDD] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Upload className="w-3 h-3" />
                <span>رفع من الجهاز</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'library' ? 'upload' : 'library')}
                className={`font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${
                  activeTab === 'library'
                    ? 'bg-[#5F8D69] text-white'
                    : 'bg-white hover:bg-[#F0F8F2] text-[#5F8D69] border border-[#CFE6D5]'
                }`}
              >
                <FolderOpen className="w-3 h-3" />
                <span>مكتبة الصور ({allLibraryItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'url' ? 'upload' : 'url')}
                className={`font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${
                  activeTab === 'url'
                    ? 'bg-[#6D5E63] text-white'
                    : 'bg-white hover:bg-gray-100 text-[#6D5E63] border border-[#E0D4D8]'
                }`}
              >
                <LinkIcon className="w-3 h-3" />
                <span>رابط URL</span>
              </button>
            </div>

            <span className="text-[#8C7D82] text-[10px] font-medium mr-auto">
              {value.startsWith('data:') ? 'صورة مرفوعة (مضغوطة)' : value.startsWith('http') ? 'رابط خارجي' : 'صورة داخلية'}
            </span>
          </div>
        </div>
      ) : (
        /* Empty Upload State with Tabs */
        <div className="bg-[#FAF5F7] rounded-2xl border border-[#ECD8CE] overflow-hidden">
          {/* Method Tabs */}
          <div className="flex border-b border-[#F0DDE5] bg-white text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
                activeTab === 'upload' 
                  ? 'text-[#D82B76] border-b-2 border-[#D82B76] bg-[#FAF5F7]' 
                  : 'text-[#7A6C71] hover:text-[#2D2426]'
              }`}
            >
              رفع من جهازك
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'library' 
                  ? 'text-[#D82B76] border-b-2 border-[#D82B76] bg-[#FAF5F7]' 
                  : 'text-[#7A6C71] hover:text-[#2D2426]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>مكتبة الصور ({allLibraryItems.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${
                activeTab === 'url' 
                  ? 'text-[#D82B76] border-b-2 border-[#D82B76] bg-[#FAF5F7]' 
                  : 'text-[#7A6C71] hover:text-[#2D2426]'
              }`}
            >
              رابط مباشر URL
            </button>
          </div>

          <div className="p-3">
            {activeTab === 'upload' && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full border-2 border-dashed border-[#E5CAD6] hover:border-[#D82B76] hover:bg-[#FDF6F9] rounded-xl p-5 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer bg-white ${aspectClass}`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF1F5] shadow-2xs text-[#D82B76] flex items-center justify-center">
                  {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </div>
                <span className="text-xs font-bold text-[#D82B76]">
                  {isUploading ? 'جاري رفع وضغط الصورة...' : 'اختاري صورة من هاتفك أو جهازك'}
                </span>
                <span className="text-[11px] text-[#7A6C71]">
                  انقري لفتح استوديو الصور أو الكاميرا مباشرة (PNG, JPG, WebP)
                </span>
              </button>
            )}

            {activeTab === 'library' && (
              <div className="space-y-2 p-1">
                <span className="text-[11px] font-bold text-[#55474B] block">
                  انقري على أي صورة من مكتبة المتجر لتحديدها فوراً:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
                  {allLibraryItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setImgError(false);
                        onChange(item.url);
                      }}
                      className="group relative rounded-xl overflow-hidden border border-[#ECD8CE] hover:border-[#D82B76] hover:ring-2 hover:ring-[#D82B76]/20 bg-white text-right p-1.5 transition-all cursor-pointer flex flex-col gap-1"
                    >
                      <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-[#FAF5F2]">
                        <img 
                          src={getValidImageUrl(item.url)} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#2D2426] truncate block">{item.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'url' && (
              <div className="space-y-2 p-1">
                <label className="text-[11px] font-bold text-[#55474B] block">
                  الصقي رابط الصورة المباشر من الإنترنت (HTTPS):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 p-2 text-xs rounded-xl border border-[#ECD8CE] text-left font-mono bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-4 py-2 bg-[#D82B76] hover:bg-[#BF2064] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    تطبيق
                  </button>
                </div>
                <span className="text-[10px] text-[#8C7D82] block">
                  يمكنك استخدام روابط من Unsplash أو أي خدمة رفع صور خارجية.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded library when replacing image */}
      {value && activeTab === 'library' && (
        <div className="p-3 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#55474B] block">
              اختاري صورة بديلة من مكتبة المتجر:
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="text-[11px] text-[#7A6C71] hover:text-[#2D2426]"
            >
              إغلاق المكتبة ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
            {allLibraryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setImgError(false);
                  onChange(item.url);
                  setActiveTab('upload');
                }}
                className="group rounded-xl overflow-hidden border border-[#ECD8CE] hover:border-[#D82B76] bg-white text-right p-1.5 transition-all cursor-pointer flex flex-col gap-1"
              >
                <div className="aspect-4/3 w-full rounded-lg overflow-hidden bg-[#FAF5F2]">
                  <img src={getValidImageUrl(item.url)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-[10px] font-bold text-[#2D2426] truncate block">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded URL when replacing image */}
      {value && activeTab === 'url' && (
        <div className="p-3 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#55474B] block">
              تغيير الرابط إلى رابط مباشر:
            </label>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className="text-[11px] text-[#7A6C71] hover:text-[#2D2426]"
            >
              إغلاق ✕
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 p-2 text-xs rounded-xl border border-[#ECD8CE] text-left font-mono bg-white"
            />
            <button
              type="button"
              onClick={() => {
                handleApplyUrl();
                setActiveTab('upload');
              }}
              className="px-4 py-2 bg-[#D82B76] hover:bg-[#BF2064] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              تطبيق
            </button>
          </div>
        </div>
      )}

      {helperText && (
        <span className="text-[11px] text-[#7A6C71] block">
          {helperText}
        </span>
      )}
    </div>
  );
};

interface MultiImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onChange,
  label,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [directUrl, setDirectUrl] = useState('');

  // Read media items from global store if available
  let storeMediaItems: { id: string; url: string; title: string }[] = [];
  try {
    const store = useStore();
    if (store && Array.isArray(store.media)) {
      storeMediaItems = store.media;
    }
  } catch (e) {}

  const allLibraryItems = [
    ...STORE_PRESETS.map((p, idx) => ({ id: `preset-${idx}`, url: p.url, title: p.name })),
    ...storeMediaItems.map(m => ({ id: m.id, url: m.url, title: m.title })),
  ];

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      setUploadError(null);
      const newUrls: string[] = [];
      try {
        for (let i = 0; i < files.length; i++) {
          const finalUrl = await uploadImageToServer(files[i]);
          newUrls.push(finalUrl);
        }
        // If current images only contain default placeholders, replace them with the uploaded images
        const isOnlyDefaults = images.length === 1 && (
          images[0] === BEDSHEET_IMAGE || 
          images[0] === HERO_IMAGE || 
          images[0] === POUCH_IMAGE || 
          images[0] === PILLOW_IMAGE
        );
        if (isOnlyDefaults) {
          onChange([...newUrls]);
        } else {
          onChange([...images, ...newUrls]);
        }
      } catch (err: any) {
        console.error('Error uploading file:', err);
        setUploadError(err.message || 'فشل رفع الصورة من جهازك');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleAddDirectUrl = () => {
    if (directUrl.trim()) {
      onChange([...images, directUrl.trim()]);
      setDirectUrl('');
      setIsUrlModalOpen(false);
    }
  };

  const handleSelectFromLibrary = (url: string) => {
    onChange([...images, url]);
    setIsLibraryOpen(false);
  };

  const handleRemoveOne = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  return (
    <div className="space-y-3 text-right">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label && (
          <label className="text-xs font-bold text-[#45383C] block">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsLibraryOpen(!isLibraryOpen);
              setIsUrlModalOpen(false);
            }}
            className="text-[11px] text-[#5F8D69] hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <FolderOpen className="w-3 h-3" />
            <span>+ من مكتبة الصور</span>
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setIsUrlModalOpen(!isUrlModalOpen);
              setIsLibraryOpen(false);
            }}
            className="text-[11px] text-[#D82B76] hover:underline font-semibold cursor-pointer"
          >
            + إضافة رابط URL
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/*"
        multiple
        onChange={handleMultipleFiles}
        className="hidden"
      />

      {uploadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError(null)} className="text-red-500 hover:text-red-700 font-bold">✕</button>
        </div>
      )}

      {isUploading && (
        <div className="p-2.5 bg-[#FAF5F7] border border-[#ECD8CE] text-[#D82B76] text-xs rounded-xl flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>جاري رفع وحفظ الصور إلى الخادم...</span>
        </div>
      )}

      {isUrlModalOpen && (
        <div className="p-3 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] flex gap-2">
          <input
            type="url"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="https://example.com/product-view.jpg"
            className="flex-1 p-2 text-xs rounded-xl border border-[#ECD8CE] text-left font-mono bg-white"
          />
          <button
            type="button"
            onClick={handleAddDirectUrl}
            className="px-3 py-1.5 bg-[#D82B76] text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            إضافة
          </button>
          <button
            type="button"
            onClick={() => setIsUrlModalOpen(false)}
            className="p-1.5 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLibraryOpen && (
        <div className="p-3 bg-[#FAF5F7] rounded-2xl border border-[#F2DEE7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#55474B]">انقري على الصورة لإضافتها للمنتج:</span>
            <button
              type="button"
              onClick={() => setIsLibraryOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
            {allLibraryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectFromLibrary(item.url)}
                className="group relative rounded-xl overflow-hidden border border-[#ECD8CE] hover:border-[#D82B76] bg-white p-1 text-center cursor-pointer"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-[#FAF5F2]">
                  <img src={getValidImageUrl(item.url)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-[9px] font-bold text-[#2D2426] truncate block mt-0.5">{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative w-22 h-22 rounded-2xl overflow-hidden border border-[#ECD8CE] bg-[#FAF5F2] group shadow-2xs">
            <img 
              src={getValidImageUrl(img, BEDSHEET_IMAGE)} 
              alt="Product" 
              referrerPolicy="no-referrer" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = BEDSHEET_IMAGE;
              }}
              className="w-full h-full object-cover" 
            />
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
              <button
                type="button"
                onClick={() => handleRemoveOne(i)}
                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                title="حذف الصورة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(i)}
                  className="text-[9px] bg-white/90 hover:bg-white text-[#2D2426] px-1.5 py-0.5 rounded font-bold cursor-pointer"
                >
                  تعيين كرئيسية
                </button>
              )}
            </div>

            {i === 0 && (
              <span className="absolute bottom-1 right-1 bg-[#D82B76] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                الرئيسية
              </span>
            )}
          </div>
        ))}

        {/* Upload Trigger Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-22 h-22 rounded-2xl border-2 border-dashed border-[#E5CAD6] hover:border-[#D82B76] hover:bg-[#FDF6F9] bg-[#FAF5F7] text-[#D82B76] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
        >
          <Upload className="w-5 h-5" />
          <span className="text-[10px] font-bold">+ رفع صور</span>
        </button>
      </div>

      <p className="text-[11px] text-[#7A6C71]">
        يمكنكِ اختيار عدة صور دفعة واحدة من جهازك، أو الاختيار من مكتبة الصور. الصورة الأولى ستكون الصورة الرئيسية للمنتج.
      </p>
    </div>
  );
};
