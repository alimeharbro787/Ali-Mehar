import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RIYADH_DISTRICTS } from '../../data/mockData';

export const BookingModal: React.FC = () => {
  const { isBookingModalOpen, closeBookingModal, preselectedPackage, addBooking, locale } = useApp();
  const isAr = locale === 'ar';

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [carePackage, setCarePackage] = useState<string>('Essential Newborn Start');
  const [specificService, setSpecificService] = useState<string>('Newborn Care at Home');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [shiftDuration, setShiftDuration] = useState<string>('12h Overnight Vigil (19:00 - 07:00)');
  const [startDate, setStartDate] = useState<string>('');
  const [district, setDistrict] = useState<string>('Al-Nakheel');
  const [familyName, setFamilyName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bookingRef, setBookingRef] = useState<string>('');

  // Set default tomorrow date
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setStartDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Sync package when modal is opened with preselected package
  useEffect(() => {
    if (preselectedPackage) {
      if (preselectedPackage === 'ESSENTIAL' || preselectedPackage.includes('Essential')) {
        setCarePackage('Essential Newborn Start');
      } else if (preselectedPackage === 'POSTPARTUM' || preselectedPackage.includes('Postpartum')) {
        setCarePackage('Comprehensive Postpartum');
      } else if (preselectedPackage === 'HARMONY' || preselectedPackage.includes('Harmony')) {
        setCarePackage('Complete Home Harmony');
      } else if (preselectedPackage === 'RAMADAN' || preselectedPackage.toLowerCase().includes('ramadan')) {
        setCarePackage('Ramadan Kareem Care & Taraweeh Vigil');
      } else if (preselectedPackage === 'EID' || preselectedPackage.toLowerCase().includes('eid')) {
        setCarePackage('Eid Family Gathering & Infant Soothing');
      } else if (
        preselectedPackage === '12_RABI' ||
        preselectedPackage.toLowerCase().includes('rabi') ||
        preselectedPackage.includes('12')
      ) {
        setCarePackage("12 Rabi' ul Awwal & Aqiqah Blessing");
      }
    }
    if (isBookingModalOpen) {
      setStep(1);
    }
  }, [isBookingModalOpen, preselectedPackage]);

  if (!isBookingModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await addBooking({
      familyName: familyName.trim() || (isAr ? 'عائلة كريمة' : 'Valued Family'),
      clientPhone: phone.trim() || '+966 59 500 2539',
      serviceCategory: 'Newborn Care',
      serviceTitle: carePackage,
      scheduleTitle: shiftDuration,
      shiftDuration: shiftDuration,
      shiftType: shiftDuration.toLowerCase().includes('night') ? 'night' : 'day',
      district: district,
      urgentDispatch: isUrgent,
      notes: notes,
      startDate: startDate,
    });
    setBookingRef(created.ref);
    setStep(4);
  };

  const whatsappMessage = encodeURIComponent(
    isAr
      ? `مرحباً أمان لرعاية المواليد بالرياض،\nلقد قمت بطلب حجز عبر بوابتكم الإلكترونية:\n\n` +
          `رقم المرجع: ${bookingRef}\n` +
          `اسم العائلة: ${familyName || 'عائلة كريمة'}\n` +
          `رقم الجوال: ${phone || '+966 59 500 2539'}\n` +
          `الباقة المختارة: ${carePackage}\n` +
          `المناوبة: ${shiftDuration}\n` +
          `الحي: ${district}\n` +
          `تاريخ البدء: ${startDate}\n` +
          (isUrgent ? `⚠️ طلب توجيه طارئ (خلال ساعتين)\n` : '') +
          `ملاحظات: ${notes || 'لا توجد ملاحظات إضافية'}\n\n` +
          `نرجو تأكيد توفر الممرضة المعتمدة.`
      : `Hello AMAN Care Riyadh,\nI just submitted a care request via your online portal.\n\n` +
          `Ref: ${bookingRef}\n` +
          `Family Name: ${familyName || 'Valued Family'}\n` +
          `Phone: ${phone || '+966 59 500 2539'}\n` +
          `Care Package: ${carePackage}\n` +
          `Shift: ${shiftDuration}\n` +
          `District: ${district}\n` +
          `Start Date: ${startDate}\n` +
          (isUrgent ? `⚠️ URGENT DISPATCH REQUESTED (Within 2 Hours)\n` : '') +
          `Notes: ${notes || 'None'}\n\n` +
          `Kindly confirm availability of a certified nurse.`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 transition-all">
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-[#064E3B] via-[#0F5132] to-[#134e4a] text-white p-6 sm:p-7">
          <button
            onClick={closeBookingModal}
            type="button"
            aria-label="Close modal"
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            ✕
          </button>
          <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs shrink-0">
              <img
                src="/assets/aman-logo.png"
                alt="AMAN Care"
                className="h-6 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              {isAr
                ? 'مركز عمليات أمان الرياض • توجيه مباشر وموثق 24/7'
                : 'AMAN Riyadh Operations Hub • 24/7 Verified Dispatch'}
            </div>
          </div>
          <h3 className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {isAr ? 'طلب حجز رعاية منزلية لحديثي الولادة' : 'Request In-Home Care Booking'}
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            {isAr
              ? 'ممرضات أطفال مرخصات، عناية ليلية، وأخصائيات نفاس في جميع أحياء الرياض.'
              : 'Licensed pediatric caregivers, night nurses, & postpartum specialists in Riyadh.'}
          </p>
        </div>

        {/* Progress Steps Tracker */}
        {step < 4 && (
          <div className="bg-[#FAF8F5] px-6 py-3 border-b border-gray-100 flex items-center justify-between text-xs font-semibold">
            <div
              className={`flex items-center gap-2 ${
                step === 1 ? 'text-[#064E3B] font-bold' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 1 ? 'bg-[#064E3B] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                1
              </span>
              <span>{isAr ? 'اختيار الرعاية' : 'Select Care'}</span>
            </div>
            <div className="h-[1px] flex-1 bg-gray-200 mx-2"></div>
            <div
              className={`flex items-center gap-2 ${
                step === 2 ? 'text-[#064E3B] font-bold' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 2 ? 'bg-[#064E3B] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </span>
              <span>{isAr ? 'المناوبة والحي' : 'Schedule & District'}</span>
            </div>
            <div className="h-[1px] flex-1 bg-gray-200 mx-2"></div>
            <div
              className={`flex items-center gap-2 ${
                step === 3 ? 'text-[#064E3B] font-bold' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 3 ? 'bg-[#064E3B] text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </span>
              <span>{isAr ? 'بيانات التواصل' : 'Family Contact'}</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Special Islamic Events Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/5 via-pink-900/5 to-emerald-900/5 border border-emerald-800/20">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-[#064E3B] flex items-center gap-1.5">
                    <span>✨</span>
                    <span>{isAr ? 'باقات المناسبات والمواسم المباركة' : 'Blessed Occasions & Event Packages'}</span>
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-[#064E3B] px-2 py-0.5 rounded-full">
                    {isAr ? 'متاحة للحجز بالرياض' : 'Available in Riyadh'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Ramadan Event */}
                  <div
                    onClick={() => setCarePackage('Ramadan Kareem Care & Taraweeh Vigil')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      carePackage === 'Ramadan Kareem Care & Taraweeh Vigil'
                        ? 'border-emerald-700 bg-emerald-50 shadow-xs'
                        : 'border-emerald-200/80 bg-white hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">🌙</span>
                      <span className="text-[10px] font-bold text-emerald-800">
                        {isAr ? 'شهر رمضان المبارك' : 'Ramadan Care'}
                      </span>
                    </div>
                    <h5 className="font-serif-title font-bold text-xs text-[#064E3B]">
                      {isAr ? 'رعاية رمضان وتراويح' : 'Taraweeh Vigil'}
                    </h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {isAr ? 'سهر ليلي أثناء صلاة التراويح وراحة الأم حتى السحور' : 'Night vigils during prayers & Suhoor rest'}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-emerald-100 flex items-center justify-between text-[11px] font-bold text-[#064E3B]">
                      <span>550 SAR</span>
                      <span className="text-[9px] text-gray-400">{isAr ? '/ ليلة' : '/ night'}</span>
                    </div>
                  </div>

                  {/* Eid Event */}
                  <div
                    onClick={() => setCarePackage('Eid Family Gathering & Infant Soothing')}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      carePackage === 'Eid Family Gathering & Infant Soothing'
                        ? 'border-[#BE185D] bg-pink-50 shadow-xs'
                        : 'border-pink-200 bg-white hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">🎉</span>
                      <span className="text-[10px] font-bold text-[#BE185D]">
                        {isAr ? 'أيام العيد المبارك' : 'Eid Festive'}
                      </span>
                    </div>
                    <h5 className="font-serif-title font-bold text-xs text-[#BE185D]">
                      {isAr ? 'بهجة وبركة العيد' : 'Eid Gathering'}
                    </h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {isAr ? 'تهدئة المولود أثناء استقبال الضيوف ومجالسة الأطفال' : 'Soothing baby & sibling care during majlis'}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-pink-100 flex items-center justify-between text-[11px] font-bold text-[#BE185D]">
                      <span>600 SAR</span>
                      <span className="text-[9px] text-gray-400">{isAr ? '/ مناوبة' : '/ shift'}</span>
                    </div>
                  </div>

                  {/* 12 Rabi ul Awwal Event */}
                  <div
                    onClick={() => setCarePackage("12 Rabi' ul Awwal & Aqiqah Blessing")}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      carePackage === "12 Rabi' ul Awwal & Aqiqah Blessing"
                        ? 'border-amber-600 bg-amber-50 shadow-xs'
                        : 'border-amber-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base">🌸</span>
                      <span className="text-[10px] font-bold text-amber-800">
                        {isAr ? '١٢ ربيع الأول والعقيقة' : "12 Rabi' ul Awwal"}
                      </span>
                    </div>
                    <h5 className="font-serif-title font-bold text-xs text-amber-900">
                      {isAr ? 'بركة المولد والعقيقة' : 'Mawlid & Aqiqah'}
                    </h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {isAr ? 'رعاية سنن المولود، تدليك الزيوت وتنسيق العقيقة' : 'Sunnah care, gentle oils & Aqiqah support'}
                    </p>
                    <div className="mt-2 pt-1.5 border-t border-amber-100 flex items-center justify-between text-[11px] font-bold text-amber-900">
                      <span>500 SAR</span>
                      <span className="text-[9px] text-gray-400">{isAr ? '/ باقة' : '/ pkg'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Care Packages */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                  {isAr ? 'باقات الرعاية التأسيسية' : 'Core Care Packages'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setCarePackage('Essential Newborn Start')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      carePackage === 'Essential Newborn Start'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] block mb-1">
                      {isAr ? 'تأسيسية' : 'Foundation'}
                    </span>
                    <h4 className="font-serif-title font-bold text-sm text-[#064E3B]">
                      {isAr ? 'الأساسية لحديثي الولادة' : 'Essential Newborn'}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                      {isAr ? 'استحمام إسفنجي، عناية بالسرة ومساعدة رضاعة' : 'Gentle sponge baths, hygiene & latch support'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-emerald-100 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#064E3B]">450 SAR</span>
                      <span className="text-[10px] text-gray-400">{isAr ? '/ مناوبة' : '/ shift'}</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setCarePackage('Comprehensive Postpartum')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      carePackage === 'Comprehensive Postpartum'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#BE185D] block mb-1">
                      {isAr ? 'الأكثر طلباً' : 'Most Loved'}
                    </span>
                    <h4 className="font-serif-title font-bold text-sm text-[#064E3B]">
                      {isAr ? 'الرعاية الشاملة بعد الولادة' : 'Comprehensive Postpartum'}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                      {isAr ? 'سهر ليلي كامل، راحة الأم وتخفيف المغص' : 'Full overnight infant vigil, recovery & colic relief'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#064E3B]">850 SAR</span>
                      <span className="text-[10px] text-gray-400">{isAr ? '/ ليلة' : '/ night'}</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setCarePackage('Complete Home Harmony')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      carePackage === 'Complete Home Harmony'
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                      {isAr ? 'متكاملة' : 'Hybrid Care'}
                    </span>
                    <h4 className="font-serif-title font-bold text-sm text-[#064E3B]">
                      {isAr ? 'التناغم المنزلي' : 'Complete Home Harmony'}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-tight">
                      {isAr ? 'تمريض للمولود + تنظيف خفيف ومجالسة أطفال' : 'Newborn nursing + light house chores & childcare'}
                    </p>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-baseline justify-between">
                      <span className="text-xs font-bold text-[#064E3B]">1,400 SAR</span>
                      <span className="text-[10px] text-gray-400">{isAr ? '/ يوم كامل' : '/ full day'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {isAr ? 'الخدمة التمريضية المحددة أو مناسبة الزيارة' : 'Specific Clinical Service or Occasion'}
                </label>
                <select
                  value={specificService}
                  onChange={(e) => setSpecificService(e.target.value)}
                  className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5 bg-gray-50/50"
                >
                  <option value="Newborn Care at Home">
                    {isAr ? 'رعاية حديثي الولادة في المنزل (دعم نهاري)' : 'Newborn Care at Home (Daytime Support)'}
                  </option>
                  <option value="Overnight Nurse Vigil">
                    {isAr ? 'سهر ومراقبة ليلية للمولود (8-12 ساعة)' : 'Overnight Infant Nurse Vigil (8-12 Hours)'}
                  </option>
                  <option value="Ramadan Taraweeh Vigil">
                    {isAr ? '🌙 رعاية وسهر رمضان وصلاة التراويح' : '🌙 Ramadan Care & Taraweeh Night Vigil'}
                  </option>
                  <option value="Eid Majlis & Childcare">
                    {isAr ? '🎉 بهجة العيد واستقبال الضيوف ومجالسة الأطفال' : '🎉 Eid Majlis Reception & Childcare Support'}
                  </option>
                  <option value="12 Rabi ul Awwal & Aqiqah">
                    {isAr ? '🌸 بركة ١٢ ربيع الأول والعقيقة ومباركة المولود' : "🌸 12 Rabi' ul Awwal & Aqiqah Celebration Support"}
                  </option>
                  <option value="Feeding & Lactation Support">
                    {isAr ? 'دعم الرضاعة الطبيعية واستشارات التغذية' : 'Feeding & Lactation Latch Support'}
                  </option>
                  <option value="Postpartum Mother Recovery">
                    {isAr ? 'عناية وراحة الأم في فترة النفاس' : 'Postpartum Mother Recovery & Emotional Comfort'}
                  </option>
                  <option value="Baby Bathing & Hygiene Routine">
                    {isAr ? 'استحمام الرضيع، تعقيم السرة والعناية بالبشرة' : 'Baby Bathing, Skincare & Umbilical Cord Sanitization'}
                  </option>
                  <option value="Babysitting & Childcare">
                    {isAr ? 'مجالسة الأطفال الصغار ومرافقة الأخوة' : 'Babysitting & Toddler Routine Care'}
                  </option>
                </select>
              </div>

              {/* Priority Urgent Dispatch Checkbox */}
              <div className="p-3.5 rounded-2xl bg-[#FDF2F4] border border-[#FBCFE8] flex items-start gap-3">
                <input
                  id="urgentToggle"
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-pink-300 text-[#BE185D] focus:ring-[#BE185D] mt-0.5 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="urgentToggle" className="text-xs text-gray-700 cursor-pointer">
                  <span className="font-bold text-[#BE185D] block">
                    {isAr ? 'توجيه طارئ فوري (خلال ساعتين في الرياض)' : 'Priority Urgent Dispatch (Within 2 Hours)'}
                  </span>
                  {isAr
                    ? 'في حالات الإرهاق الشديد بعد الولادة، صعوبات الرضاعة، أو الخروج غير المتوقع من المستشفى.'
                    : 'Immediate assistance needed for feeding crisis, postpartum exhaustion, or unexpected early hospital discharge.'}
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 bg-[#064E3B] hover:bg-[#003527] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow transition-all"
                >
                  <span>{isAr ? 'المتابعة لتحديد الموعد والحي' : 'Continue to Schedule'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  {isAr ? 'فترة ومناوبة الرعاية المفضلة' : 'Preferred Care Shift'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { val: '12h Overnight Vigil (19:00 - 07:00)', tagEn: 'Night', tagAr: 'ليلي' },
                    { val: '6h Daytime Shift (09:00 - 15:00)', tagEn: 'Day', tagAr: 'نهاري' },
                    { val: '12h Daytime Full Vigil (08:00 - 20:00)', tagEn: 'Full Day', tagAr: 'يوم كامل' },
                    { val: '24/7 Rotational Nursing (Live-in)', tagEn: 'Live-In', tagAr: 'إقامة كاملة' },
                  ].map((s) => (
                    <div
                      key={s.val}
                      onClick={() => setShiftDuration(s.val)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        shiftDuration === s.val
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          checked={shiftDuration === s.val}
                          onChange={() => setShiftDuration(s.val)}
                          className="text-[#064E3B] focus:ring-[#064E3B]"
                        />
                        <span className="text-xs font-semibold text-gray-800">{s.val}</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#059669] bg-white px-2 py-0.5 rounded-md border border-emerald-100">
                        {isAr ? s.tagAr : s.tagEn}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {isAr ? 'تاريخ البدء المتوقع *' : 'Estimated Start Date *'}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {isAr ? 'حي السكن في الرياض *' : 'Riyadh District / Zone *'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
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

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-gray-500 hover:text-[#064E3B] px-4 py-2.5 rounded-xl border border-gray-200 transition-colors"
                >
                  ← {isAr ? 'العودة لاختيار الباقة' : 'Back to Packages'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 bg-[#064E3B] hover:bg-[#003527] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow transition-all"
                >
                  <span>{isAr ? 'المتابعة لبيانات العائلة' : 'Continue to Contact'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {isAr ? 'اسم العائلة أو المسؤول *' : 'Family Contact Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder={isAr ? 'مثال: نورة الدوسري' : 'e.g. Noura Al-Dosari'}
                    className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    {isAr ? 'رقم الواتساب السعودي *' : 'Saudi Phone / WhatsApp *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 5X XXX XXXX"
                    className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  {isAr ? 'عمر المولود / ملاحظات طبية أو احتياجات خاصة' : "Baby Age / Clinical Notes or Routine Requests"}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: مولود عمره أسبوعين، حاجة لممرضة ليلية لتأمين نوم الأم ومساعدة في الرضاعة...'
                      : 'e.g. 2-week-old newborn, seeking overnight nurse for maternal sleep recovery; gentle latch support requested...'
                  }
                  className="w-full text-xs rounded-xl border-gray-300 focus:border-[#064E3B] focus:ring-[#064E3B] py-2.5"
                ></textarea>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-center gap-3">
                <span className="text-base">🔒</span>
                <span>
                  {isAr
                    ? 'ضمان الخصوصية: يتم مشاركة ملفات الممرضات المرخصات من هيئة التخصصات الصحية السعودية بسرية تامة.'
                    : 'Privacy Guarantee: Caregiver profiles with Saudi MOH licensing and verified background checks are shared strictly confidentially.'}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-gray-500 hover:text-[#064E3B] px-4 py-2.5 rounded-xl border border-gray-200 transition-colors"
                >
                  ← {isAr ? 'العودة للمناوبة' : 'Back to Schedule'}
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-[#064E3B] hover:bg-[#003527] text-white font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-lg transition-all"
                >
                  <span>{isAr ? 'تأكيد الحجز وتوجيه المنسقة' : 'Confirm & Dispatch Coordinator'}</span>
                  <span>✓</span>
                </button>
              </div>
            </form>
          )}

          {/* SUCCESS VIEW */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                ✓
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F4] text-[#BE185D] text-xs font-bold uppercase tracking-wider">
                {isAr ? 'تم استلام وتوثيق طلبك' : 'Booking Dispatch Initialized'}
              </div>
              <h4 className="font-serif-title text-2xl font-bold text-[#064E3B]">
                {isAr ? 'شكراً لك، تم استلام طلب الحجز بنجاح!' : 'We Have Received Your Request!'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                {isAr
                  ? 'تقوم منسقة الرعاية في الرياض بمراجعة طلبك الآن ومطابقة الممرضة الأنسب وفقاً لحي سكنك واحتياجات طفلك.'
                  : 'Your dedicated female care coordinator in Riyadh is reviewing your preferences right now. We will contact you immediately.'}
              </p>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-100 max-w-sm mx-auto text-left text-xs space-y-1.5">
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'رقم المرجع:' : 'Reference:'}</span>
                  <span className="font-mono font-bold text-[#064E3B]">{bookingRef}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'الباقة:' : 'Care Package:'}</span>
                  <span className="font-bold text-gray-700">{carePackage}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'الحي:' : 'District:'}</span>
                  <span className="font-bold text-gray-700">{district}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{isAr ? 'المناوبة:' : 'Shift:'}</span>
                  <span className="font-bold text-gray-700">{shiftDuration}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/966595002539?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#064E3B] hover:bg-[#003527] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all"
                >
                  <span>💬</span>
                  <span>{isAr ? 'فتح المحادثة الفورية على الواتساب' : 'Open Family WhatsApp Chat'}</span>
                </a>
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {isAr ? 'إغلاق النافذة' : 'Close Window'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
