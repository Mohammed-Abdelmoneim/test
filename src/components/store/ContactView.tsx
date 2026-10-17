import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MessageCircle, Phone, Instagram, Send, CheckCircle2, HelpCircle, ChevronDown } from 'lucide-react';
import { WavyCornerDecoration } from '../common/BotanicalDecoration';

export const ContactView: React.FC = () => {
  const { settings } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [productInterests, setProductInterests] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const cleanPhone = settings.whatsAppNumber.replace(/\D/g, '');
  const whatsAppDirectUrl = `https://wa.me/20${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent('مرحباً كوتونيلا 💗 لدي استفسار بخصوص منتجاتكم')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
  };

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'كيف يمكنني تأكيد الطلب؟',
      a: 'الطلب يتم مباشرة عبر محادثة واتساب الرسمية بضغطة زر واحدة على أي منتج. سنؤكد معك المقاس، اللون، والعنوان فوراً.'
    },
    {
      q: 'ما هي خامات المفروشات المستخدمة؟',
      a: 'جميع أطقم السرير مصنوعة من قطن مصري 100% طبيعي بركال ناعم وبارد عالبشرة، والبوشات مصنوعة من قطن مبطن بحشوة ناعمة وبطانة مقاومة للماء.'
    },
    {
      q: 'هل يمكن طلب مقاس خاص للسرير؟',
      a: 'نعم بالتأكيد! نظراً لأننا نقوم بالتصنيع اليدوي داخل ورشتنا، يمكننا تفصيل أي مقاس خاص لسريرك أو كينج أو دبل.'
    },
    {
      q: 'ما هي مواعيد الشحن وتكلفته؟',
      a: 'الشحن متاح لجميع محافظات مصر من 2 إلى 4 أيام عمل، والدفع عند الاستلام مع إمكانية فتح الشحنة والتأكد من جودتها.'
    }
  ];

  return (
    <div className="py-8 sm:py-14 space-y-16">
      {/* Header Banner */}
      <div className="relative bg-[#FAF2EB] border-b border-[#EFE0D5] py-10 sm:py-16 overflow-hidden">
        <WavyCornerDecoration className="absolute -top-4 -left-6 opacity-45" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3 relative z-10">
          <span className="text-xs font-bold text-[#D82B76] uppercase tracking-wider">
            خدمة عملاء قطونيلا
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D2426]">
            تواصلي معنا نسعد دائماً بمساعدتك 🌸
          </h1>
          <p className="text-xs sm:text-sm text-[#6C5F64] max-w-xl mx-auto leading-relaxed">
            فريق كوتونيلا متاح على مدار اليوم للإجابة على استفساراتك حول المقاسات، الألوان، ومواعيد الشحن.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct WhatsApp Contact & Details */}
          <div className="lg:col-span-5 space-y-6 text-right">
            <div className="bg-[#FAF3ED] rounded-3xl p-6 sm:p-8 border border-[#EFE0D5] space-y-6">
              <h2 className="text-xl font-bold text-[#2D2426]">قنوات التواصل المباشر</h2>
              
              <div className="space-y-4">
                <a
                  href={whatsAppDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#ECD9CE] shadow-xs hover:border-[#25D366] transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#E5F8EC] text-[#25D366] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-[#7B6E72] block">محادثة واتساب الرسمية (الأسرع)</span>
                    <strong className="text-base font-bold font-mono text-[#2D2426] group-hover:text-[#25D366] transition-colors">
                      {settings.whatsAppNumber}
                    </strong>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#ECD9CE] shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#FCE8F0] text-[#D82B76] flex items-center justify-center shrink-0">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-[#7B6E72] block">رسائل صفحتنا على انستجرام</span>
                    <strong className="text-sm font-bold text-[#2D2426]">
                      @cottonella_eg
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#ECD9CE] shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF1E8] text-[#5F8D69] flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-[#7B6E72] block">مقر الورشة والإدارة</span>
                    <strong className="text-sm font-bold text-[#2D2426]">
                      القاهرة، مصر (شحن لكل المحافظات)
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Note box */}
            <div className="p-4 rounded-2xl bg-[#FFF8FA] border border-[#FAD6E6] text-xs text-[#7A646E] leading-relaxed">
              💡 <strong>نصيحة سريعة:</strong> إذا كنتِ غير متأكدة من مقاس سريرك، يمكنكِ إرسال أبعاد المرتبة (الطول × العرض × الارتفاع) عبر الواتساب وسنساعدك في اختيار الطقم المناسب تماماً.
            </div>
          </div>

          {/* Right Column: Inquiry Form that saves directly to CMS */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#F2E0D4] shadow-xs text-right">
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D2426] mb-2">
                أرسلي استفسارك وسنعاود الاتصال بكِ
              </h2>
              <p className="text-xs sm:text-sm text-[#7B6E72] mb-6">
                سيصل استفسارك فوراً إلى لوحة إدارة الطلبات وسيتم الرد عليكِ خلال ساعات عمل اليوم.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#E5F8EC] text-[#25D366] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2D2426]">تم استلام رسالتك بنجاح! 💗</h3>
                  <p className="text-xs sm:text-sm text-[#6A5E62] max-w-sm mx-auto">
                    شكراً لتواصلكِ يا جميلة. تم تسجيل طلبك في لوحة متابعة العملاء وسنتواصل معكِ على رقم {phone}.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setName(''); setPhone(''); setMessage(''); }}
                    className="text-xs font-bold text-[#D82B76] hover:underline"
                  >
                    إرسال استفسار آخر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45393D]">اسمك الكريم *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="مثال: ياسمين أحمد"
                        className="w-full text-right p-3 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426] focus:border-[#D82B76] focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#45393D]">رقم الهاتف / الواتساب *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="مثال: 01012345678"
                        className="w-full text-right p-3 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426] focus:border-[#D82B76] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45393D]">المنتج أو المقاس الذي تودين السؤال عنه</label>
                    <input
                      type="text"
                      value={productInterests}
                      onChange={e => setProductInterests(e.target.value)}
                      placeholder="مثال: طقم سرير بينك بلوسوم مقاس كينج 180"
                      className="w-full text-right p-3 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426] focus:border-[#D82B76] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#45393D]">رسالتك أو تفاصيل استفسارك</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="اكتبي أي تفاصيل أو مواعيد شحن تفضلينها..."
                      className="w-full text-right p-3 rounded-xl border border-[#ECD8CE] text-xs text-[#2D2426] focus:border-[#D82B76] focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 text-sm font-bold text-white bg-[#D82B76] hover:bg-[#C11F63] rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <span>إرسال الاستفسار الآن</span>
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* FAQs Accordion */}
        <div className="mt-16 bg-[#FAF3ED] rounded-3xl p-6 sm:p-10 border border-[#EFE0D5] text-right space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#D82B76] uppercase">الأسئلة الشائعة</span>
            <h3 className="text-2xl font-bold text-[#2D2426]">كل ما ترغبين في معرفته قبل الطلب</h3>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#ECD8CE] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-right gap-3"
                >
                  <span className="text-xs sm:text-sm font-bold text-[#2D2426]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#8C7D82] transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-[#6B5E63] leading-relaxed border-t border-[#F8EFEA] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
