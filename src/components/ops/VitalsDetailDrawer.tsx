import React from 'react';
import { useApp } from '../../context/AppContext';

export const VitalsDetailDrawer: React.FC = () => {
  const {
    selectedBookingForDrawer,
    setSelectedBookingForDrawer,
    locale,
    assignNurseToBooking,
    updateBookingStatus,
    deleteBooking,
  } = useApp();
  const isAr = locale === 'ar';

  if (!selectedBookingForDrawer) return null;

  const booking = selectedBookingForDrawer;
  const vitals = booking.vitals || {
    lastFeedingTime: '05:30 AM (90ml)',
    sleepDuration: '4h 15m Continuous',
    temperature: '36.8°C (Normal)',
    cordCareStatus: 'Clean & Dry',
    notes: 'Normal healthy postpartum vigil. Infant settled comfortably after feeding.',
  };

  const handleAssignNursePrompt = () => {
    const nurse = window.prompt(
      isAr
        ? `تعيين ممرضة لحديثي الولادة للحجز ${booking.ref}:`
        : `Assign Registered Pediatric Nurse to ${booking.ref}:`,
      'Sarah Mansour, RN'
    );
    if (nurse && nurse.trim()) {
      assignNurseToBooking(booking.ref, nurse.trim());
    }
  };

  const whatsappMessage = encodeURIComponent(
    isAr
      ? `مرحباً ${booking.familyName}،\nمعكم منسقة الرعاية في أمان الرياض بخصوص حجزكم رقم ${booking.ref}.\nالممرضة المعينة: ${booking.assignedNurse?.name || 'قيد التعيين'}.\nكيف يمكننا خدمتكم اليوم؟`
      : `Hello ${booking.familyName},\nThis is AMAN Riyadh Operations regarding your booking ${booking.ref}.\nAssigned Nurse: ${booking.assignedNurse?.name || 'Pending Assignment'}.\nHow can we support your newborn today?`
  );

  return (
    <div
      className="fixed inset-y-0 right-0 rtl:right-auto rtl:left-0 z-50 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col justify-between border-l rtl:border-l-0 rtl:border-r border-gray-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="p-6 flex flex-col gap-5 overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold text-sm">
              🩺
            </span>
            <span className="font-title-lg text-lg text-[#064E3B] font-bold">
              {isAr ? 'ملف متابعة الرعاية والمؤشرات' : 'Booking Care Profile'}
            </span>
          </div>
          <button
            onClick={() => setSelectedBookingForDrawer(null)}
            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Family Summary Card */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-gray-100 flex flex-col gap-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            {isAr ? 'العائلة / الحساب' : 'Family / Account'}
          </span>
          <div className="flex items-center justify-between">
            <h3 className="font-title-lg text-lg text-[#064E3B] font-bold">
              {booking.familyName}
            </h3>
            {booking.isVip && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                {booking.vipTier || 'VIP'}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span className="font-mono font-semibold">{booking.ref}</span>
            <span>{booking.clientPhone}</span>
          </div>
        </div>

        {/* Shift Specifications */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isAr ? 'مواصفات المناوبة والتمريض' : 'Shift Specifications'}
          </span>

          <div className="p-3 rounded-xl bg-gray-50 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 block">
                {isAr ? 'الممرضة المعينة:' : 'Assigned Care Nurse:'}
              </span>
              <span className="font-semibold text-sm text-[#064E3B]">
                {booking.assignedNurse?.name || (isAr ? 'بانتظار التعيين' : 'Pending Assignment')}
              </span>
              {booking.assignedNurse?.credential && (
                <span className="text-[11px] text-gray-400 block">
                  {booking.assignedNurse.credential}
                </span>
              )}
            </div>
            <button
              onClick={handleAssignNursePrompt}
              className="px-2.5 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-[#064E3B] text-xs font-bold transition-colors"
            >
              {booking.assignedNurse ? (isAr ? 'تغيير' : 'Reassign') : (isAr ? 'تعيين الآن' : 'Assign')}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 flex flex-col gap-1">
            <span className="text-xs text-gray-500">
              {isAr ? 'الحي وموقع السكن:' : 'Location & District:'}
            </span>
            <span className="font-semibold text-xs text-gray-800">
              {booking.district}, Riyadh
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 flex flex-col gap-1">
            <span className="text-xs text-gray-500">
              {isAr ? 'البروتوكول والباقة المعتمدة:' : 'Selected Protocol:'}
            </span>
            <span className="font-semibold text-xs text-gray-800">
              {booking.serviceTitle} ({booking.shiftDuration})
            </span>
          </div>
        </div>

        {/* Last Shift Infant Vitals */}
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isAr ? 'المؤشرات الحيوية للمولود (آخر مناوبة)' : 'Last Shift Infant Vitals'}
          </span>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-100">
              <span className="text-[11px] text-gray-400 block mb-0.5">
                {isAr ? 'موعد الرضاعة' : 'Feeding Time'}
              </span>
              <span className="font-bold text-[#064E3B] block">
                {vitals.lastFeedingTime || '05:30 AM (90ml)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-100">
              <span className="text-[11px] text-gray-400 block mb-0.5">
                {isAr ? 'ساعات النوم' : 'Sleep Duration'}
              </span>
              <span className="font-bold text-[#064E3B] block">
                {vitals.sleepDuration || '4h 15m Continuous'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-100">
              <span className="text-[11px] text-gray-400 block mb-0.5">
                {isAr ? 'درجة الحرارة' : 'Temperature'}
              </span>
              <span className="font-bold text-[#059669] block">
                {vitals.temperature || '36.8°C (Normal)'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-gray-100">
              <span className="text-[11px] text-gray-400 block mb-0.5">
                {isAr ? 'عناية السرة' : 'Cord Care Status'}
              </span>
              <span className="font-bold text-[#059669] block">
                {vitals.cordCareStatus || 'Clean & Dry'}
              </span>
            </div>
          </div>

          {vitals.notes && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 mt-1">
              <span className="font-bold block text-gray-700 mb-0.5">
                {isAr ? 'ملاحظات الممرضة:' : "Nurse's Clinical Notes:"}
              </span>
              <p>{vitals.notes}</p>
            </div>
          )}
        </div>

        {/* Live Status Management & Admin Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isAr ? 'حالة الحجز في قاعدة بيانات سوبابيز' : 'Supabase Booking Status'}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={booking.status}
              onChange={(e) => updateBookingStatus(booking.ref, e.target.value as any)}
              className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003527]"
            >
              <option value="scheduled">{isAr ? 'مجدول ومؤكد (Scheduled)' : 'Scheduled / Confirmed'}</option>
              <option value="in_progress">{isAr ? 'مناوبة جارية (In Progress)' : 'In Progress (Active)'}</option>
              <option value="urgent">{isAr ? 'توجيه طارئ (Urgent Dispatch)' : 'Urgent Dispatch'}</option>
              <option value="contract_active">{isAr ? 'عقد شهري مستمر (Retainer Active)' : 'Retainer Contract Active'}</option>
              <option value="completed">{isAr ? 'مكتمل (Completed)' : 'Completed'}</option>
            </select>
            <button
              type="button"
              onClick={async () => {
                if (
                  window.confirm(
                    isAr
                      ? `هل ترغب في حذف سجل الحجز ${booking.ref} نهائياً؟`
                      : `Permanently delete booking ${booking.ref}?`
                  )
                ) {
                  await deleteBooking(booking.ref);
                }
              }}
              className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
              title={isAr ? 'حذف الحجز' : 'Delete Booking'}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
        <a
          href={`https://wa.me/${(booking.clientPhone ? booking.clientPhone.replace(/\D/g, '') : '966595002539') || '966595002539'}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2.5 rounded-xl bg-[#064E3B] hover:bg-[#003527] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
        >
          {isAr ? 'فتح محادثة واتساب العائلة' : 'Open Family WhatsApp'}
        </a>
        <button
          onClick={() => setSelectedBookingForDrawer(null)}
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
        >
          {isAr ? 'إغلاق' : 'Dismiss'}
        </button>
      </div>
    </div>
  );
};
