import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Lock, KeyRound, X, Sparkles, AlertCircle } from 'lucide-react';

export const AdminLoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginAdmin } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(password);
    if (!success) {
      setError(true);
    } else {
      setError(false);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#F2E0D4] shadow-2xl space-y-6 text-right relative max-h-[90vh] overflow-y-auto overscroll-contain"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setIsLoginModalOpen(false);
            setError(false);
            setPassword('');
            try {
              if (window.location.pathname.startsWith('/admin') || window.location.hash.includes('admin')) {
                window.history.pushState(null, '', '/');
              }
            } catch (e) {
              window.location.hash = '';
            }
          }}
          className="absolute top-5 left-5 p-1.5 text-[#8C7D82] hover:text-[#2D2426] rounded-xl transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-[#FCE8F0] text-[#D82B76] flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D2426]">دخول إدارة Cottonella</h2>
          <p className="text-xs text-[#7A6C71]">
            لوحة إدارة وتعديل محتوى المتجر، المنتجات، والصور
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#423539] block">
              كلمة مرور الإدارة *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="أدخلي كلمة المرور..."
                className="w-full text-right p-3 pr-10 rounded-xl border border-[#ECD8CE] text-sm text-[#2D2426] focus:border-[#D82B76] focus:outline-hidden"
              />
              <KeyRound className="w-4 h-4 text-[#8C7D82] absolute top-3.5 right-3" />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold pt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-[#FAF3ED] rounded-xl text-[11px] text-[#7A6C71] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D82B76] shrink-0" />
            <span>كلمة المرور الافتراضية المحددة لمديرة المتجر هي: <strong className="font-mono text-[#D82B76]">cottonella2026</strong></span>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#D82B76] hover:bg-[#BE2063] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md shadow-[#D82B76]/20"
          >
            تسجيل الدخول إلى لوحة التحكم
          </button>
        </form>
      </div>
    </div>
  );
};
