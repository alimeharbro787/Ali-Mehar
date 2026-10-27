import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RIYADH_DISTRICTS } from '../../data/mockData';

export const ManualBookingModal: React.FC = () => {
  const { isManualBookingModalOpen, setIsManualBookingModalOpen, addBooking, locale } = useApp();
  const isAr = locale === 'ar';

  const [familyName, setFamilyName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Diplomatic Quarter (DQ)');
  const [packageTitle, setPackageTitle] = useState('Comprehensive Postpartum Care (Night Shift)');
  const [shiftDuration, setShiftDuration] = useState('12h Night Shift (19:00 - 07:00)');
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isManualBookingModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBooking({
      familyName: familyName.trim() || 'Manual Client',
      clientPhone: phone.trim() || '+966 59 500 2539',
      district,
      serviceCategory: 'Newborn Care',
      serviceTitle: packageTitle,
      scheduleTitle: shiftDuration,
      shiftDuration,
      shiftType: shiftDuration.toLowerCase().includes('night') ? 'night' : 'day',
      urgentDispatch: isUrgent,
      notes,
      startDate: 'Immediate',
    });
    setIsManualBookingModalOpen(false);
    setFamilyName('');
    setPhone('');
    setNotes('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aman-logo.png"
              alt="AMAN Care"
              className="h-6.5 sm:h-7 w-auto object-contain"
            />
            <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[#064E3B]">
              {isAr ? 'حجز يدوي جديد لعائلة بالرياض' : 'New Manual Family Booking'}
            </h3>
          </div>
          <button
            onClick={() => setIsManualBookingModalOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'اسم العائلة / العميل *' : 'Client / Family Name *'}
            </label>
            <input
              type="text"
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder={isAr ? 'مثال: عائلة آل عثمان' : 'e.g. Al-Otaibi Family'}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isAr ? 'رقم الواتساب السعودي *' : 'WhatsApp Phone (+966) *'}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="59 500 2539"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isAr ? 'الحي بالرياض *' : 'Riyadh District *'}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
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
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'باقة الرعاية المطلوبة' : 'Service Package'}
            </label>
            <select
              value={packageTitle}
              onChange={(e) => setPackageTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            >
              <option value="Comprehensive Postpartum Care (Night Shift)">
                {isAr ? 'الرعاية الشاملة بعد الولادة (مناوبة ليلية)' : 'Comprehensive Postpartum Care (Night Shift)'}
              </option>
              <option value="Essential Newborn Start (Day Shift)">
                {isAr ? 'الباقة الأساسية لحديثي الولادة (مناوبة نهارية)' : 'Essential Newborn Start (Day Shift)'}
              </option>
              <option value="Ramadan Kareem Care & Taraweeh Vigil">
                {isAr ? '🌙 باقة رعاية رمضان المبارك وسهر التراويح' : '🌙 Ramadan Care & Taraweeh Vigil'}
              </option>
              <option value="Eid Family Gathering & Infant Soothing">
                {isAr ? '🎉 باقة بهجة وبركة العيد ومجالسة الأطفال' : '🎉 Eid Family Gathering & Infant Soothing'}
              </option>
              <option value="12 Rabi' ul Awwal & Aqiqah Blessing">
                {isAr ? '🌸 باقة بركة ١٢ ربيع الأول والعقيقة للمواليد' : "🌸 12 Rabi' ul Awwal & Aqiqah Blessing"}
              </option>
              <option value="Complete Home Harmony (Care + Domestic)">
                {isAr ? 'التناغم المنزلي (تمريض + نظافة منزلية)' : 'Complete Home Harmony (Care + Domestic)'}
              </option>
              <option value="Urgent Feeding & Lactation Support">
                {isAr ? 'استشارة رضاعة وتغذية طارئة' : 'Urgent Feeding & Lactation Support'}
              </option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'فترة ومناوبة العمل' : 'Shift Duration'}
            </label>
            <select
              value={shiftDuration}
              onChange={(e) => setShiftDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            >
              <option value="12h Night Shift (19:00 - 07:00)">12h Night Shift (19:00 - 07:00)</option>
              <option value="6h Day Shift (08:00 - 14:00)">6h Day Shift (08:00 - 14:00)</option>
              <option value="10h Full Day Care (08:00 - 18:00)">10h Full Day Care (08:00 - 18:00)</option>
              <option value="24/7 Live-In Rotational Care">24/7 Live-In Rotational Care</option>
            </select>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-50 border border-pink-100">
            <input
              id="urgentManualToggle"
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="rounded text-[#BE185D] focus:ring-[#BE185D]"
            />
            <label htmlFor="urgentManualToggle" className="cursor-pointer text-gray-700">
              <span className="font-bold text-[#BE185D]">{isAr ? 'حالة طارئة' : 'Urgent Priority'}</span>{' '}
              {isAr ? '(تتطلب ممرضة خلال 20 دقيقة)' : '(Requires nurse dispatch in <20 min)'}
            </label>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'ملاحظات وتوجيهات للتمريض' : 'Clinical & Shift Instructions'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isAr ? 'أي توصيات خاصة بالعائلة والمولود...' : 'Specific family requirements...'}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsManualBookingModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#003527] text-white font-bold transition-all shadow-sm"
            >
              {isAr ? 'حفظ وتوجيه العمليات' : 'Save & Notify Dispatch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
