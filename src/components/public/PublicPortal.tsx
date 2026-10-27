import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_TESTIMONIALS, INITIAL_FAQS, RIYADH_DISTRICTS } from '../../data/mockData';

export const PublicPortal: React.FC = () => {
  const { services, packages, seasonalEvents, openBookingModal, locale, addBooking, showToast } = useApp();
  const isAr = locale === 'ar';

  const [activeServiceTab, setActiveServiceTab] = useState<'all' | 'care' | 'home' | 'pets'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick inquiry form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formService, setFormService] = useState('Newborn Care at Home');
  const [formDistrict, setFormDistrict] = useState('Al-Malqa');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const newbornServices = services.filter((s) => s.category === 'newborn');
  const lifestyleServices = services.filter((s) => s.category === 'lifestyle');

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBooking({
      familyName: formName.trim() || (isAr ? 'عائلة كريمة' : 'Inquiry Client'),
      clientPhone: formPhone.trim() || '+966 59 500 2539',
      serviceCategory: 'Newborn Care',
      serviceTitle: formService,
      district: formDistrict,
      shiftDuration: 'Daytime / On-Demand Consult',
      notes: formNotes,
      startDate: formDate || 'Immediate',
    });
    showToast(
      isAr
        ? 'تم استلام طلب التواصل بنجاح! ستتواصل معك منسقة الرعاية في الرياض قريباً.'
        : 'Inquiry received! Our Riyadh care coordinator will contact you shortly on WhatsApp.'
    );
    setFormName('');
    setFormPhone('');
    setFormNotes('');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="w-full bg-[#FAF8F5] text-gray-800 font-sans selection:bg-[#064E3B] selection:text-white">
      {/* 1. MAIN NAVIGATION HEADER */}
      <header className="sticky top-9 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand Identity */}
            <a href="#home" className="flex items-center gap-3 group shrink-0">
              <img
                src="/assets/aman-logo.png"
                alt="AMAN Baby Care & Home Services"
                className="h-10 sm:h-12 md:h-13.5 max-w-[200px] sm:max-w-[240px] md:max-w-[280px] w-auto object-contain transition-transform group-hover:scale-[1.02]"
              />
              {isAr && (
                <span className="hidden xl:inline-block text-[11px] font-semibold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                  رعاية المواليد والخدمات المنزلية بالرياض
                </span>
              )}
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 rtl:space-x-reverse">
              <a href="#home" className="text-sm font-semibold text-[#064E3B] border-b-2 border-[#064E3B] pb-0.5">
                {isAr ? 'الرئيسية' : 'Home'}
              </a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-[#064E3B] transition-colors">
                {isAr ? 'من نحن' : 'About Us'}
              </a>
              <a href="#newborn-services" className="text-sm font-medium text-gray-600 hover:text-[#064E3B] transition-colors">
                {isAr ? 'خدماتنا' : 'Our Services'}
              </a>
              <a href="#packages" className="text-sm font-medium text-gray-600 hover:text-[#064E3B] transition-colors">
                {isAr ? 'الباقات والأسعار' : 'Packages'}
              </a>
              <a href="#events" className="text-sm font-medium text-emerald-800 hover:text-[#064E3B] flex items-center gap-1 transition-colors">
                <span>✨</span>
                <span>{isAr ? 'المناسبات المباركة' : 'Blessed Events'}</span>
              </a>
              <a href="#faqs" className="text-sm font-medium text-gray-600 hover:text-[#064E3B] transition-colors">
                {isAr ? 'الأسئلة الشائعة' : 'FAQs'}
              </a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-[#064E3B] transition-colors">
                {isAr ? 'آراء العائلات' : 'Testimonials'}
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-[#064E3B] transition-colors">
                {isAr ? 'تواصل معنا' : 'Contact'}
              </a>
            </nav>

            {/* Right Action Items */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-full">
                <span className="text-[#059669]">📍</span>
                <span>{isAr ? 'الرياض، المملكة' : 'Riyadh, KSA'}</span>
              </div>

              <button
                onClick={() => openBookingModal()}
                className="inline-flex items-center gap-2.5 bg-[#064E3B] hover:bg-[#003527] text-white px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow hover:shadow-md active:scale-95"
              >
                <span>💬</span>
                <span className="text-left rtl:text-right leading-tight">
                  {isAr ? 'طلب حجز سريع' : 'Chat on WhatsApp'}
                  <br />
                  <span className="text-[10px] opacity-80 font-normal">
                    {isAr ? 'احجز الآن' : 'Book Now'}
                  </span>
                </span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-[#064E3B] rounded-lg focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 bg-white space-y-2">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-semibold text-[#064E3B] bg-[#FDF2F4]/50"
              >
                {isAr ? 'الرئيسية' : 'Home'}
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {isAr ? 'من نحن' : 'About Us'}
              </a>
              <a
                href="#newborn-services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {isAr ? 'خدماتنا' : 'Our Services'}
              </a>
              <a
                href="#packages"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {isAr ? 'الباقات والأسعار' : 'Packages'}
              </a>
              <a
                href="#events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-emerald-800 bg-emerald-50/60 hover:bg-emerald-50"
              >
                ✨ {isAr ? 'المناسبات والمواسم المباركة' : 'Blessed Islamic Events'}
              </a>
              <a
                href="#faqs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {isAr ? 'الأسئلة الشائعة' : 'FAQs'}
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {isAr ? 'آراء العائلات' : 'Testimonials'}
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {isAr ? 'تواصل معنا' : 'Contact'}
              </a>
              <div className="pt-2 px-3">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openBookingModal();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#064E3B] text-white rounded-xl font-bold text-sm shadow"
                >
                  <span>{isAr ? 'احجز الآن عبر الواتساب' : 'Book Now on WhatsApp'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative hero-soft-gradient pt-8 pb-16 lg:py-20 overflow-hidden border-b border-pink-100" id="home">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left rtl:lg:text-right">
              {/* Decorative Tagline */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF2F4] border border-[#FBCFE8] text-xs sm:text-sm font-medium text-gray-700 shadow-xs">
                <span className="handwriting-note text-[#064E3B] text-base font-semibold">
                  {isAr ? 'شريككم الموثوق' : 'Your Trusted Partner'}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">
                  {isAr ? 'لغدٍ أكثر أماناً وسعادة' : 'for a Safer, Happier Tomorrow'}
                </span>
                <span className="text-[#BE185D]">❤️</span>
              </div>

              {/* Main Serif Headline */}
              <div className="space-y-3">
                <h1 className="font-serif-title text-4xl sm:text-5xl lg:text-6xl font-bold text-[#064E3B] tracking-tight leading-[1.12]">
                  {isAr ? 'رعاية حديثي الولادة في المنزل' : 'Newborn Care at Home'}
                </h1>
                <p className="font-serif-title text-2xl sm:text-3xl font-medium text-gray-800">
                  {isAr ? 'رعاية رقيقة، راحة بال مستمرة.' : 'Gentle Care, Peace of Mind.'}
                </p>
              </div>

              <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {isAr
                  ? 'رعاية طبية وإنسانية دافئة لكِ ولمولودكِ الجديد، في أقصى درجات الخصوصية والراحة داخل منزلكِ بالرياض.'
                  : 'Professional & caring support for you and your newborn, right in the comfort, privacy, and warmth of your home in Riyadh.'}
              </p>

              {/* 3 Mini Trust Pillars */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0 pt-2">
                <div className="flex flex-col items-center bg-white/80 backdrop-blur rounded-2xl p-3 border border-emerald-100 shadow-xs text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mb-1.5 text-lg">
                    🛡️
                  </div>
                  <span className="text-xs font-bold text-[#064E3B]">
                    {isAr ? 'رعاية\nآمنة' : 'Safe\nCare'}
                  </span>
                </div>

                <div className="flex flex-col items-center bg-white/80 backdrop-blur rounded-2xl p-3 border border-pink-100 shadow-xs text-center">
                  <div className="w-10 h-10 rounded-full bg-pink-50 text-[#BE185D] flex items-center justify-center mb-1.5 text-lg">
                    💖
                  </div>
                  <span className="text-xs font-bold text-[#064E3B]">
                    {isAr ? 'عناية\nمحبة' : 'Loving\nCare'}
                  </span>
                </div>

                <div className="flex flex-col items-center bg-white/80 backdrop-blur rounded-2xl p-3 border border-emerald-100 shadow-xs text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center mb-1.5 text-lg">
                    ⭐
                  </div>
                  <span className="text-xs font-bold text-[#064E3B]">
                    {isAr ? 'دعم\nاحترافي' : 'Professional\nSupport'}
                  </span>
                </div>
              </div>

              {/* WhatsApp Pill Button */}
              <div className="pt-3">
                <button
                  onClick={() => openBookingModal()}
                  className="inline-flex items-center justify-between gap-4 bg-[#064E3B] hover:bg-[#003527] text-white pl-4 pr-6 rtl:pl-6 rtl:pr-4 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-xl">
                      💬
                    </div>
                    <div className="text-left rtl:text-right">
                      <div className="text-xs uppercase tracking-wider font-semibold opacity-90">
                        {isAr ? 'احجز الآن عبر الواتساب' : 'Book Now on WhatsApp'}
                      </div>
                      <div className="text-sm font-bold">
                        {isAr ? 'حجز فوري ومباشر مع المنسقة' : 'Quick & Easy Booking'}
                      </div>
                    </div>
                  </div>
                  <span className="text-lg group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    {isAr ? '←' : '→'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Visual Image with Decorative Note */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 bg-gradient-to-tr from-pink-200/50 to-emerald-200/50 rounded-3xl blur-2xl -z-10"></div>
                <div className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDBGnR2zsKvKL1FVB2KNNrk5BiJGo9Gny1poJ02VbhsSkOz2TjBPBc3rYd0qxycq3pT_MDPRS0UNeThsMmudumYAbVqk_Jzq-HRxGNHY1uja6IfyYcH_Rw23BgHQJAZ8q29a43jI7_VYh16bzFgRlzXQH0zTaRpccJvZNmembGiIInUtYQ8t03bbIk4v5GRRJdxYSxhjCPqLuEAZUmF523nj1ndPH0IvI3kJkpYPMZIyKZxsvhNVLdDg"
                    alt="Mother lovingly cradling sleeping newborn baby"
                    className="w-full h-[440px] sm:h-[480px] object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>

                {/* Floating Handwritten Card */}
                <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-pink-200 shadow-xl max-w-[210px] transform rotate-2 hover:rotate-0 transition-transform">
                  <p className="handwriting-note text-[#064E3B] font-semibold text-sm leading-tight text-center">
                    {isAr ? 'لأن طفلكِ يستحق الرعاية الأفضل دائماً' : 'Because your baby deserves the best'}
                  </p>
                  <div className="flex justify-center mt-1 text-sm text-[#BE185D]">
                    ❤️
                  </div>
                </div>

                {/* Licensed in Riyadh Badge */}
                <div className="absolute -top-4 -left-4 bg-[#064E3B] text-white px-3.5 py-2 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{isAr ? 'مرخص ومعتمد في الرياض' : 'Licensed In Riyadh'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEWBORN CARE SERVICES (6 CARDS) */}
      <section className="py-16 sm:py-24 bg-white" id="newborn-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#FDF2F4] text-[#BE185D] text-xs font-bold tracking-wider uppercase mb-3">
              <span>❤️</span>
              <span>{isAr ? 'أخصائيات رعاية الرضع المعتمدات' : 'Dedicated Infant Specialists'}</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#064E3B] tracking-tight">
              {isAr ? 'رعاية حديثي الولادة في المنزل' : 'Newborn Care at Home'}
            </h2>
            <p className="mt-2 text-sm sm:text-base font-serif italic text-gray-600">
              {isAr ? 'رعاية رقيقة، راحة بال مستمرة' : 'Gentle Care, Peace of Mind'}
            </p>
            <p className="mt-3 text-xs sm:text-sm text-gray-500">
              {isAr
                ? 'كل أم ومولود يستحق عناية طبية مؤهلة وحنونة. فريقنا في الرياض جاهز للمساعدة ليلاً ونهاراً.'
                : 'Every mother and baby deserves delicate, qualified attention. Our Riyadh team assists with tender night and day support.'}
            </p>
          </div>

          {/* 6 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {newbornServices.map((service) => (
              <div
                key={service.id}
                className="group bg-[#FAF8F5]/60 rounded-3xl p-5 border border-pink-100 card-hover-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-5 bg-pink-50">
                    <img
                      src={service.image}
                      alt={service.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-md border border-pink-100 flex items-center justify-center text-[#BE185D] text-xl">
                      👶
                    </div>
                  </div>
                  <div className="text-center pt-2 px-2">
                    <h3 className="font-serif-title text-xl font-bold text-[#064E3B] mb-2">
                      {isAr ? service.titleAr : service.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                      {isAr ? service.descriptionAr : service.descriptionEn}
                    </p>
                  </div>
                </div>
                <div className="border-t border-pink-100 pt-3 text-center">
                  <span className="text-xs font-semibold text-[#BE185D] tracking-wide italic">
                    {isAr ? service.subtitleAr : service.subtitleEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MORE HOME & LIFESTYLE SERVICES (7 CARDS) */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4 mb-14 text-center">
            <div className="h-[1px] w-12 sm:w-24 bg-[#059669]/40"></div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#064E3B] tracking-tight">
              {isAr ? 'المزيد من الخدمات المنزلية ونمط الحياة' : 'More Home & Lifestyle Services'}
            </h2>
            <div className="h-[1px] w-12 sm:w-24 bg-[#059669]/40"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {lifestyleServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-3.5 border border-gray-100 card-hover-shadow flex flex-col justify-between text-center"
              >
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] mb-3">
                    <img
                      src={service.image}
                      alt={service.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-[#064E3B] mt-2 mb-1">
                    {isAr ? service.titleAr : service.titleEn}
                  </h4>
                  <p className="text-[11px] text-gray-500 mb-2">
                    {isAr ? service.descriptionAr : service.descriptionEn}
                  </p>
                </div>
                <p className="text-[10px] font-semibold text-[#059669] italic border-t border-gray-100 pt-2">
                  {isAr ? service.subtitleAr : service.subtitleEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SERVICES FILTER TABS */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="h-0.5 w-12 bg-emerald-200"></span>
            <div className="bg-[#064E3B] text-white px-8 py-2 rounded-full font-serif-title text-xl font-bold tracking-wide shadow-xs">
              {isAr ? 'تصفح باقات الخدمات' : 'Other Services'}
            </div>
            <span className="h-0.5 w-12 bg-emerald-200"></span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {[
              { id: 'all', en: 'All Services', ar: 'جميع الخدمات' },
              { id: 'care', en: 'Mother & Child', ar: 'الأم والطفل' },
              { id: 'home', en: 'Home Cleaning & Chores', ar: 'نظافة المنزل والتعقيم' },
              { id: 'pets', en: 'Pets & Errand Runs', ar: 'الحيوانات والمشاوير' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveServiceTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeServiceTab === tab.id
                    ? 'bg-[#064E3B] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-[#064E3B]'
                }`}
              >
                {isAr ? tab.ar : tab.en}
              </button>
            ))}
          </div>

          {/* Filtered Mini Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {(activeServiceTab === 'all' || activeServiceTab === 'pets') && (
              <div className="p-3 bg-[#FAF8F5]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mb-2 text-lg">
                  🐾
                </div>
                <p className="text-xs font-bold text-[#064E3B]">{isAr ? 'رعاية الحيوانات' : 'Dog & Cat Care'}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'اهتمام دافئ' : 'Loving care'}</span>
              </div>
            )}
            {(activeServiceTab === 'all' || activeServiceTab === 'home') && (
              <div className="p-3 bg-[#FAF8F5]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 mx-auto rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mb-2 text-lg">
                  🧹
                </div>
                <p className="text-xs font-bold text-[#064E3B]">{isAr ? 'نظافة المنزل' : 'Home Cleaning'}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'نظافة وانتعاش' : 'Clean & fresh'}</span>
              </div>
            )}
            {(activeServiceTab === 'all' || activeServiceTab === 'pets') && (
              <div className="p-3 bg-[#FAF8F5]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mb-2 text-lg">
                  🚗
                </div>
                <p className="text-xs font-bold text-[#064E3B]">{isAr ? 'التوصيل الآمن' : 'Pick-up & Drop'}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'رحلات آمنة' : 'Safe rides'}</span>
              </div>
            )}
            {(activeServiceTab === 'all' || activeServiceTab === 'care') && (
              <div className="p-3 bg-[#FAF8F5]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 mx-auto rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mb-2 text-lg">
                  🧸
                </div>
                <p className="text-xs font-bold text-[#064E3B]">{isAr ? 'مجالسة الأطفال' : 'Babysitting'}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'أمان ورعاية' : 'Safe & caring'}</span>
              </div>
            )}
            {(activeServiceTab === 'all' || activeServiceTab === 'care') && (
              <div className="p-3 bg-[#FAF8F5]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center mb-2 text-lg">
                  👵
                </div>
                <p className="text-xs font-bold text-[#064E3B]">{isAr ? 'مرافقة كبار السن' : 'Elderly Care'}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'كرامة واهتمام' : 'Dignity & help'}</span>
              </div>
            )}
            {(activeServiceTab === 'all' || activeServiceTab === 'home') && (
              <div className="p-3 bg-[#FAF8F5]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 text-lg">
                  🛍️
                </div>
                <p className="text-xs font-bold text-[#064E3B]">{isAr ? 'المهام والمشتريات' : 'Errand Service'}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'راحتكم أولاً' : 'Your needs first'}</span>
              </div>
            )}
            {(activeServiceTab === 'all' || activeServiceTab === 'home') && (
              <div className="p-3 bg-[#FAF8F5]/60 rounded-xl border border-gray-100">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#064E3B] text-white flex items-center justify-center mb-2 text-lg">
                  ✨
                </div>
                <p className="text-xs font-bold text-[#064E3B]">{isAr ? 'والمزيد...' : 'And More...'}</p>
                <span className="text-[10px] text-gray-400">{isAr ? 'تواصلوا معنا' : 'Just ask us'}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. RIYADH SKYLINE PROMOTIONAL RIBBON */}
      <section className="relative bg-gradient-to-r from-[#003527] via-[#064E3B] to-[#134e4a] text-white overflow-hidden py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left rtl:md:text-right">
            <div>
              <span className="handwriting-note text-pink-200 text-lg block">
                {isAr ? 'خطوات صغيرة...' : 'Small steps...'}
              </span>
              <span className="font-serif-title text-xl sm:text-2xl font-bold tracking-wide">
                {isAr ? 'أحلام كبيرة ❤️' : 'Big dreams ❤️'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-6 sm:px-8 py-3 rounded-full border border-white/20 shadow-inner">
              <p className="font-serif-title text-base sm:text-xl font-medium tracking-wide">
                {isAr
                  ? 'دعنا نمنح عائلتك الرعاية التي تستحقها دائماً ❤️'
                  : "Let's give your family the care they deserve ❤️"}
              </p>
            </div>

            <div>
              <span className="handwriting-note text-emerald-200 text-sm block">
                {isAr ? 'فخورون بخدمة' : 'Proud to serve'}
              </span>
              <span className="font-bold text-base sm:text-lg tracking-wide flex items-center justify-center md:justify-end gap-1.5">
                {isAr ? 'عائلات الرياض ❤️' : 'Riyadh Families ❤️'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ABOUT AMAN SECTION */}
      <section className="py-16 sm:py-24 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image Collage with 500+ stat badge */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-lg">
                <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNg0ID4xgQ6-ZBndLuSF_g2jw-Dk7p-OHUcrKZHNH6p41L9-zv7Ajn2_NCFnEhZ-2dIGlstHB7Ceg0PRPWYEzl68RTVyHoBP5m-97C9ffQ0iy3jfCVwhkPBJob67R7DFY2Y_nHjrtd7WH3EcyNeNYW8sDP1k4omYzRZHAbsHOwwqYaCU8lZZ7eMEVWv1CyHmFK6tMH5dt6tlwgnb4I4ieCDqA-ptuVGXUaPPTOAEcIxplIjpykJHUnug"
                    alt="Newborn caregiver soothing newborn baby"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                </div>

                <div className="absolute -top-4 -left-4 bg-[#064E3B] text-white p-4 rounded-2xl shadow-xl">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-serif-title">
                    500+
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-gray-200">
                    {isAr ? 'عائلة مخدومة بالرياض' : 'Riyadh Families Served'}
                  </div>
                </div>
              </div>
            </div>

            {/* Story Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold uppercase tracking-wider">
                {isAr ? 'عن أمان للرعاية' : 'About AMAN Care'}
              </div>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#064E3B] leading-tight">
                {isAr
                  ? 'نرعى أجيال الرياض القادمة بدفء أمومي وجودة طبية'
                  : "Nurturing Riyadh's New Generations With Hospital-Grade Warmth"}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {isAr
                  ? 'تأسست أمان برؤية صادقة تهدف لمنح أمهات وعائلات الرياض راحة بال مطلقة، جامعةً بين الكفاءة الطبية واللمسة الأمومية الحنونة.'
                  : 'Founded with a heartfelt mission to give parents in Riyadh peace of mind, AMAN bridges professional medical competence with tender motherly care.'}
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {isAr ? 'فحص أمني وصحي بنسبة 100%' : '100% Background Checked & Screened'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {isAr
                        ? 'تدقيق أمني، وفحص طبي دوري، وخبرة مثبتة قبل دخول أي ممرضة لمنزلك.'
                        : 'Rigorous vetting, medical clearances, and verified experience before entering your home.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-[#BE185D] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {isAr ? 'شهادات إنعاش الرضع وتعقيم الحضانة' : 'Pediatric CPR & Newborn Hygiene Certified'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {isAr
                        ? 'تدريب دقيق على الاستجابة لحالات طوارئ حديثي الولادة، والعناية بالحبل السري.'
                        : 'Trained in neonatal emergency response, sterile cord sanitization, and infant routines.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#059669] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      {isAr ? 'تنسيق واستجابة واتساب على مدار 24/7' : 'Immediate 24/7 WhatsApp Coordination'}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {isAr
                        ? 'منسقة رعاية نسائية متواجدة للرد الفوري على استفساراتك وتوجيه الممرضة المناسبة.'
                        : 'Need emergency coverage or immediate postpartum night help? Our Riyadh concierge responds in minutes.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="font-serif-title font-bold text-[#064E3B] text-base">
                    {isAr ? 'رعاية رقيقة، راحة بال' : 'Gentle Care, Peace of Mind'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isAr
                      ? 'نخدم أحياء النخيل، الملقا، السفارات، حطين، وجميع مناطق الرياض'
                      : 'Serving Al-Nakheel, Al-Malqa, Olaya, DQ & all Riyadh zones'}
                  </div>
                </div>
                <a href="#contact" className="text-xs font-bold text-[#059669] hover:underline">
                  {isAr ? 'عرض مناطق الخدمة ←' : 'View Service Areas →'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CARE PACKAGES SECTION */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-b border-gray-200/60" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[#BE185D] text-xs font-bold tracking-wider uppercase mb-3">
              {isAr ? 'باقات رعاية مخصصة' : 'Customized Care Plans'}
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#064E3B]">
              {isAr ? 'باقات الرعاية لعائلات الرياض' : 'Care Packages for Riyadh Families'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isAr
                ? 'مرونة كاملة في الحجز: مناوبة فردية، مساعدة أسبوعية، أو باقة شهرية شاملة للنفاس.'
                : 'Flexible booking: Choose by single shift, weekly assistance, or monthly comprehensive postpartum care.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-3xl p-7 flex flex-col justify-between card-hover-shadow relative ${
                  pkg.isFeatured
                    ? 'border-2 border-[#064E3B] shadow-xl'
                    : 'border border-gray-100 shadow-sm'
                }`}
              >
                {pkg.isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#064E3B] text-white text-[11px] font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow">
                    {isAr ? pkg.badgeTextAr : pkg.badgeTextEn}
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {isAr ? pkg.tierAr : pkg.tierEn}
                  </div>
                  <h3 className="font-serif-title text-2xl font-bold text-[#064E3B] mb-3">
                    {isAr ? pkg.titleAr : pkg.titleEn}
                  </h3>
                  <p className="text-xs text-gray-500 mb-6">
                    {isAr ? pkg.descriptionAr : pkg.descriptionEn}
                  </p>

                  <div
                    className={`rounded-2xl p-4 mb-6 text-center ${
                      pkg.isFeatured
                        ? 'bg-emerald-50 border border-emerald-100'
                        : 'bg-[#FDF2F4]/50'
                    }`}
                  >
                    <span className="text-xs text-gray-600 block">
                      {isAr ? 'سعر الخدمة التقديري' : 'Custom Schedules'}
                    </span>
                    <span className="font-serif-title text-2xl font-bold text-[#064E3B]">
                      {pkg.priceSar} SAR
                    </span>
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {isAr ? pkg.billingCadenceAr : pkg.billingCadenceEn}
                    </span>
                  </div>

                  <ul className="space-y-3 text-xs text-gray-600 mb-6">
                    {(isAr ? pkg.inclusionsAr : pkg.inclusionsEn).map((inc, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-[#059669] font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => openBookingModal(pkg.code)}
                  className={`w-full text-center py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
                    pkg.isFeatured
                      ? 'bg-[#064E3B] hover:bg-[#003527] text-white shadow-md'
                      : 'border border-[#064E3B] text-[#064E3B] hover:bg-[#064E3B] hover:text-white'
                  }`}
                >
                  {isAr ? 'احجز الباقة عبر الواتساب' : 'Inquire on WhatsApp'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8.5 BLESSED ISLAMIC & SEASONAL EVENTS SECTION */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] border-b border-emerald-950/10" id="events">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-[#064E3B] text-xs font-bold tracking-wider uppercase mb-3 border border-emerald-200 shadow-xs">
              <span>✨</span>
              <span>{isAr ? 'المواسم الإسلامية والمناسبات المباركة' : 'Blessed Islamic Seasons & Festivities'}</span>
              <span>✨</span>
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#064E3B]">
              {isAr ? 'رعاية المواليد في رمضان، العيد، و١٢ ربيع الأول' : 'Ramadan, Eid & 12 Rabi\' ul Awwal Care Packages'}
            </h2>
            <p className="mt-3 text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {isAr
                ? 'خصصنا باقات استثنائية لمناسباتكم الدينية والاجتماعية العزيزة: سهر ليلي لتفرغ الأم للعبادة في رمضان، عناية بالمولود وسط زوار العيد، وبركة العقيقة والسنن في ذكرى ١٢ ربيع الأول.'
                : 'Exclusive celebratory care packages designed for the Kingdom\'s most cherished occasions: peaceful Taraweeh devotion in Ramadan, joyful family gatherings during Eid, and blessed Mawlid & Aqiqah welcoming.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {seasonalEvents.map((evt) => {
              const eventCode =
                evt.id === 'evt-ramadan'
                  ? 'RAMADAN'
                  : evt.id === 'evt-eid'
                  ? 'EID'
                  : '12_RABI';
              const whatsappText = encodeURIComponent(
                isAr
                  ? evt.whatsappPrefillAr || 'مرحباً أمان، أرغب في حجز الباقة الموسمية بالرياض'
                  : evt.whatsappPrefillEn || 'Hello AMAN, I would like to book the seasonal package in Riyadh'
              );

              const isRamadan = evt.id === 'evt-ramadan';
              const isEid = evt.id === 'evt-eid';
              const isRabi = evt.id === 'evt-12-rabi-ul-awwal';

              return (
                <div
                  key={evt.id}
                  className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white border-2 ${
                    isRamadan
                      ? 'border-[#064E3B] shadow-lg ring-1 ring-[#064E3B]/20'
                      : isEid
                      ? 'border-[#BE185D] shadow-md ring-1 ring-[#BE185D]/20'
                      : 'border-amber-600 shadow-md ring-1 ring-amber-600/20'
                  }`}
                >
                  {/* Top Header Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isRamadan
                          ? 'bg-emerald-100 text-[#064E3B]'
                          : isEid
                          ? 'bg-pink-100 text-[#BE185D]'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <span className="text-sm">{evt.icon || '🌸'}</span>
                      <span>{isAr ? evt.badgeAr : evt.badgeEn}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>{isAr ? 'حجز نشط' : 'Live Booking'}</span>
                    </span>
                  </div>

                  <div>
                    {/* Event Window Dates */}
                    <div className="text-[11px] text-gray-500 font-semibold mb-1 flex items-center gap-1.5">
                      <span>🗓️</span>
                      <span>{isAr ? evt.hijriWindowAr : evt.hijriWindowEn}</span>
                      <span className="text-gray-300">•</span>
                      <span>{isAr ? evt.gregorianWindowAr : evt.gregorianWindowEn}</span>
                    </div>

                    {/* Event Title */}
                    <h3 className="font-serif-title text-2xl font-bold text-[#064E3B] mb-2 leading-tight">
                      {isAr ? evt.titleAr : evt.titleEn}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                      {isAr ? evt.descriptionAr : evt.descriptionEn}
                    </p>

                    {/* Special Festive Perk Box */}
                    <div
                      className={`rounded-2xl p-4 mb-5 border ${
                        isRamadan
                          ? 'bg-emerald-50/70 border-emerald-100'
                          : isEid
                          ? 'bg-pink-50/70 border-pink-100'
                          : 'bg-amber-50/70 border-amber-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                          <span>🎁</span>
                          <span>{isAr ? 'ميزة المناسبة الخاصة:' : 'Special Occasion Perk:'}</span>
                        </span>
                        {evt.priceSar && (
                          <div className="font-serif-title font-bold text-base text-[#064E3B]">
                            {evt.priceSar} SAR
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-gray-800 leading-snug">
                        {isAr ? evt.perkAr : evt.perkEn}
                      </p>
                    </div>

                    {/* Inclusions checklist */}
                    {evt.featuresEn && (
                      <div className="space-y-2 mb-6">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          {isAr ? 'تشمل هذه الباقة المباركة:' : 'This Package Includes:'}
                        </span>
                        {(isAr ? evt.featuresAr || evt.featuresEn : evt.featuresEn).map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                            <span className="text-[#059669] font-bold mt-0.5">✓</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions: Book in App + Direct WhatsApp */}
                  <div className="pt-4 border-t border-gray-100 space-y-2 mt-auto">
                    <button
                      onClick={() => openBookingModal(eventCode)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow text-white ${
                        isRamadan
                          ? 'bg-[#064E3B] hover:bg-[#003527]'
                          : isEid
                          ? 'bg-[#BE185D] hover:bg-[#9d174d]'
                          : 'bg-amber-700 hover:bg-amber-800'
                      }`}
                    >
                      {isAr ? `احجز ${evt.titleAr}` : `Book ${evt.titleEn}`}
                    </button>

                    <a
                      href={`https://wa.me/966595002539?text=${whatsappText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span>💬</span>
                      <span>{isAr ? 'استفسار سريع عبر الواتساب' : 'Inquire on WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Riyadh Concierge Guarantee */}
          <div className="mt-12 bg-white rounded-2xl p-6 border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left rtl:sm:text-right">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center text-xl shrink-0">
                🕌
              </div>
              <div>
                <h4 className="font-serif-title font-bold text-[#064E3B] text-base">
                  {isAr ? 'ضمان التوافق مع التقاليد والأعراف السعودية' : 'Saudi Family Traditions & Privacy Assured'}
                </h4>
                <p className="text-xs text-gray-500">
                  {isAr
                    ? 'جميع ممرضاتنا مرخصات من هيئة التخصصات الصحية ومدربات على احترام قدسية المناسبات الدينية وخصوصية المنازل بالرياض.'
                    : 'Every caregiver is MOH licensed, culturally attuned to Islamic traditions, and respectful of family sanctuary.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => openBookingModal('RAMADAN')}
              className="px-6 py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#003527] text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-colors shadow-sm"
            >
              {isAr ? 'تأكيد حجز مناسبة' : 'Reserve Event Shift'}
            </button>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS SECTION */}
      <section className="py-16 sm:py-24 bg-white" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold tracking-wider uppercase mb-3">
              {isAr ? 'آراء وتجارب العائلات' : 'Warm Feedback'}
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#064E3B]">
              {isAr ? 'أمهات وعائلات الرياض يثقون بأمان' : 'Loved by Parents in Riyadh'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isAr
                ? 'تجارب حقيقية من عائلات استقبلت ممرضات أمان في منازلها بمختلف أحياء العاصمة.'
                : 'Real experiences from families across the Kingdom who welcomed AMAN into their homes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {INITIAL_TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-[#FAF8F5]/70 rounded-3xl p-7 border border-pink-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex text-amber-400 mb-3 text-sm">★★★★★</div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                    {isAr ? t.reviewAr : t.reviewEn}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-pink-100/60">
                  <div className="w-10 h-10 rounded-full bg-pink-100 text-[#BE185D] font-bold flex items-center justify-center text-sm font-serif">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#064E3B]">
                      {isAr ? t.authorAr : t.authorEn}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {isAr ? t.districtAr : t.districtEn}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQS SECTION */}
      <section className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-gray-100" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-[#BE185D] text-xs font-bold tracking-wider uppercase mb-3">
              {isAr ? 'هل لديك استفسارات؟' : 'Got Questions?'}
            </span>
            <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#064E3B]">
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isAr
                ? 'كل ما تودين معرفته عن ممرضات حديثي الولادة والمساعدات المنزلية بالرياض.'
                : 'Everything you need to know about our newborn caregivers and home assistance in Riyadh.'}
            </p>
          </div>

          <div className="space-y-4">
            {INITIAL_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4.5 text-left rtl:text-right flex items-center justify-between gap-4 font-bold text-[#064E3B] text-sm sm:text-base hover:bg-gray-50/80 transition-colors"
                  >
                    <span>{isAr ? faq.qAr : faq.qEn}</span>
                    <span className="text-gray-400 transform transition-transform duration-200 text-lg">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                      {isAr ? faq.aAr : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. CONTACT & BOOKING SECTION */}
      <section className="py-16 sm:py-24 bg-white" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Contact Info Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#059669] text-xs font-bold uppercase tracking-wider">
                {isAr ? 'تواصل معنا مباشرة' : 'Connect With Us'}
              </div>
              <h2 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#064E3B]">
                {isAr ? 'احجز الرعاية الرقيقة اليوم' : 'Book Gentle Care Today'}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {isAr
                  ? 'لديكِ استفسارات عن أسعار الممرضات، باقات النفاس، أو رعاية الأطفال والمنزل؟ تواصلي مباشرة مع منسقة الرياض عبر الواتساب.'
                  : 'Have questions about our newborn packages, nanny rates, or home cleaning services? Message our Riyadh coordination desk directly on WhatsApp for instant assistance.'}
              </p>

              {/* Direct WhatsApp Box */}
              <div className="bg-gradient-to-br from-[#064E3B] to-[#134e4a] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                      💬
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                        {isAr ? 'الاستجابة الأسرع' : 'Fastest Response'}
                      </div>
                      <div className="text-base font-bold">
                        {isAr ? 'محادثة فورية على الواتساب' : 'Chat with us on WhatsApp'}
                      </div>
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-mono tracking-wider">+966 59 500 2539</p>
                  <p className="text-xs text-emerald-100">
                    {isAr
                      ? 'حجز سريع ومباشر • دعم على مدار الساعة لعائلات الرياض'
                      : 'Quick & Easy Booking • 24/7 Support for Riyadh Families'}
                  </p>
                  <a
                    href="https://wa.me/966595002539?text=Hello%20AMAN%2C%20I%20would%20like%20to%20inquire%20about%20your%20services"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center bg-white text-[#064E3B] py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow hover:bg-emerald-50 transition-colors"
                  >
                    {isAr ? 'بدء محادثة الواتساب الآن ←' : 'Start WhatsApp Chat →'}
                  </a>
                </div>
              </div>

              {/* Working Hours & Zone info */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#064E3B]">
                    📍
                  </div>
                  <div>
                    <span className="font-bold">{isAr ? 'نخدم كافة أحياء الرياض:' : 'Serving All Riyadh Zones:'}</span>{' '}
                    {isAr ? 'النخيل، الملقا، الصحافة، حي السفارات، حطين، وما حولها.' : 'Al-Nakheel, Al-Malqa, Al-Sahafa, Diplomatic Quarter, Hittin, & surrounds.'}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#064E3B]">
                    ⏰
                  </div>
                  <div>
                    <span className="font-bold">{isAr ? 'ساعات العمل:' : 'Availability:'}</span>{' '}
                    {isAr ? 'دعم هاتفي ومناوبات تمريضية مجدولة 24/7.' : '24/7 On-Call Support & Pre-Scheduled Home Visits.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Quick Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#FAF8F5]/80 p-8 sm:p-10 rounded-3xl border border-gray-200/70 shadow-xs">
                <h3 className="font-serif-title text-2xl font-bold text-[#064E3B] mb-2">
                  {isAr ? 'طلب اتصال واستشارة سريعة' : 'Request a Call Back'}
                </h3>
                <p className="text-xs text-gray-500 mb-6">
                  {isAr
                    ? 'سجلي متطلباتك الأساسية وستتصل بك منسقة الرعاية النسائية في الرياض بأسرع وقت.'
                    : 'Fill in your basic requirements and our female care coordinator will reach out promptly.'}
                </p>

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isAr ? 'الاسم الكامل *' : 'Your Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder={isAr ? 'مثال: سارة العتيبي' : 'e.g. Sarah Al-Otaibi'}
                        className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isAr ? 'رقم الجوال / الواتساب *' : 'Phone / WhatsApp Number *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+966 5X XXX XXXX"
                        className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isAr ? 'الخدمة المطلوبة *' : 'Service Needed *'}
                      </label>
                      <select
                        value={formService}
                        onChange={(e) => setFormService(e.target.value)}
                        className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                      >
                        <option value="Newborn Care at Home">{isAr ? 'رعاية حديثي الولادة بالمنزل' : 'Newborn Care at Home'}</option>
                        <option value="Comprehensive Postpartum">{isAr ? 'الرعاية الشاملة بعد الولادة (النفاس)' : 'Comprehensive Postpartum Support'}</option>
                        <option value="Overnight Infant Care">{isAr ? 'مناوبة ليلية لسهر المولود' : 'Overnight Infant Care'}</option>
                        <option value="Babysitting & Childcare">{isAr ? 'مجالسة الأطفال الصغار' : 'Babysitting & Child Care'}</option>
                        <option value="Home Cleaning">{isAr ? 'نظافة وتعقيم المنزل' : 'Home Cleaning & Housekeeping'}</option>
                        <option value="Elderly Care">{isAr ? 'مرافقة كبار السن' : 'Elderly Companionship'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        {isAr ? 'الحي بالرياض *' : 'Riyadh District / Neighborhood *'}
                      </label>
                      <select
                        value={formDistrict}
                        onChange={(e) => setFormDistrict(e.target.value)}
                        className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5 bg-white"
                      >
                        {RIYADH_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {isAr ? 'تاريخ البدء المتوقع أو موعد الولادة' : "Estimated Start Date or Baby's Due Date"}
                    </label>
                    <input
                      type="text"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      placeholder={isAr ? 'مثال: فوري / الشهر القادم / متوقع في شوال' : 'e.g. Immediately / Next Month / Due in October'}
                      className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {isAr ? 'ملاحظات إضافية أو رغبات خاصة' : 'Additional Notes or Special Requirements'}
                    </label>
                    <textarea
                      rows={3}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder={
                        isAr
                          ? 'أخبرينا عن طفلك، الساعات المفضلة (نهار أو ليل)، أو أي رعاية خاصة...'
                          : 'Tell us about your baby, preferred hours (day/night), or specific needs...'
                      }
                      className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#064E3B] hover:bg-[#003527] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow"
                  >
                    {isAr ? 'إرسال طلب الاستشارة' : 'Submit Inquiry'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. SITE FOOTER */}
      <footer className="bg-[#064E3B] text-white pt-14 pb-8 border-t border-[#134e4a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10 items-center">
            {/* Brand & Tagline */}
            <div className="md:col-span-4 space-y-3">
              <a href="#home" className="inline-block bg-white px-3 py-1.5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                <img
                  src="/assets/aman-logo.png"
                  alt="AMAN Baby Care & Home Services"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </a>
              <p className="text-xs text-gray-300 max-w-sm leading-relaxed">
                {isAr
                  ? 'شريككم الموثوق لغدٍ أكثر أماناً وسعادة. تمريض متقدم لحديثي الولادة، رعاية الأطفال، وخدمات الضيافة المنزلية بالرياض.'
                  : 'Your Trusted Partner for a Safer, Happier Tomorrow. Premium newborn nursing, childcare, and residential lifestyle services in Riyadh.'}
              </p>
            </div>

            {/* Quick Contact Info */}
            <div className="md:col-span-5 bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                  💬
                </div>
                <div>
                  <div className="text-[11px] text-gray-300">
                    {isAr ? 'تواصل معنا على الواتساب' : 'Chat with us on WhatsApp'}
                  </div>
                  <div className="text-sm font-bold text-white font-mono">+966 59 500 2539</div>
                </div>
              </div>
              <div className="text-right rtl:text-left">
                <span className="text-xs text-emerald-300 font-semibold block">📍 Riyadh, KSA</span>
                <span className="text-[10px] text-gray-400">{isAr ? 'رد فوري' : 'Quick Response'}</span>
              </div>
            </div>

            {/* Slogan */}
            <div className="md:col-span-3 text-center md:text-right rtl:md:text-left">
              <p className="handwriting-note text-pink-200 text-lg">
                {isAr ? 'لأن الرعاية تصنع الفرق ❤️' : 'Because it Matters ❤️'}
              </p>
              <span className="text-xs text-gray-400 block mt-1">
                {isAr ? 'مكرسون لسعادة أسر الرياض' : 'Dedicated to Happy Families'}
              </span>
            </div>
          </div>

          {/* Bottom Nav Links & Copyright */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-300">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <a href="#home" className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</a>
              <span>•</span>
              <a href="#about" className="hover:text-white transition-colors">{isAr ? 'من نحن' : 'About Us'}</a>
              <span>•</span>
              <a href="#newborn-services" className="hover:text-white transition-colors">{isAr ? 'خدماتنا' : 'Our Services'}</a>
              <span>•</span>
              <a href="#packages" className="hover:text-white transition-colors">{isAr ? 'الباقات' : 'Packages'}</a>
              <span>•</span>
              <a href="#events" className="hover:text-white text-emerald-300 font-semibold transition-colors">{isAr ? 'المناسبات المباركة' : 'Events'}</a>
              <span>•</span>
              <a href="#faqs" className="hover:text-white transition-colors">{isAr ? 'الأسئلة' : 'FAQs'}</a>
              <span>•</span>
              <a href="#testimonials" className="hover:text-white transition-colors">{isAr ? 'الآراء' : 'Testimonials'}</a>
              <span>•</span>
              <a href="#contact" className="hover:text-white transition-colors">{isAr ? 'التواصل' : 'Contact'}</a>
            </div>
            <p className="text-center text-gray-400 text-[11px]">
              © {new Date().getFullYear()} AMAN Baby Care &amp; Home Services. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
