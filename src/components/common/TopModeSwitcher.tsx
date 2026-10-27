import React from 'react';
import { useApp } from '../../context/AppContext';

export const TopModeSwitcher: React.FC = () => {
  const { screen, setScreen, locale, toggleLocale, bookings, adminUser, logoutAdmin } = useApp();

  const isAr = locale === 'ar';
  const pendingCount = bookings.filter((b) => b.status === 'urgent' || !b.assignedNurse).length;

  return (
    <div className="w-full bg-[#003527] text-white border-b border-[#064E3B] text-xs py-2 px-4 sm:px-8 flex flex-wrap items-center justify-between gap-3 z-50 sticky top-0 shadow-md">
      {/* Left: Current Active Operations Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-200">
            {isAr ? 'مركز عمليات الرياض مباشر:' : 'Riyadh Hub Live:'}
          </span>
          <span className="text-gray-300 hidden sm:inline">
            {isAr ? 'حي النخيل، الملقا، والسفارات' : 'Al-Nakheel, Al-Malqa & DQ'}
          </span>
        </div>

        <span className="text-emerald-700 hidden md:inline">|</span>

        {/* WhatsApp Direct */}
        <a
          href="https://wa.me/966595002539?text=Hello%20AMAN%20Riyadh"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors"
        >
          <span className="font-mono font-semibold">+966 59 500 2539</span>
          <span className="text-[10px] bg-emerald-900/80 px-1.5 py-0.5 rounded text-emerald-200">
            {isAr ? 'واتساب ٢٤/٧' : '24/7 Support'}
          </span>
        </a>
      </div>

      {/* Right: Screen Mode Switcher, Admin Info & Language Toggle */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Navigation Mode Switcher */}
        <div className="flex items-center bg-[#064E3B] p-0.5 rounded-lg border border-emerald-800/80">
          <button
            onClick={() => setScreen('public')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              screen === 'public'
                ? 'bg-white text-[#003527] shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>👶</span>
            <span>{isAr ? 'بوابة العائلات (الموقع العام)' : 'Public Client Portal'}</span>
          </button>

          <button
            onClick={() => setScreen('ops')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              screen === 'ops'
                ? 'bg-white text-[#003527] shadow-sm'
                : 'text-emerald-200 hover:text-white'
            }`}
          >
            <span>📋</span>
            <span>{isAr ? 'لوحة المشرف والعمليات' : 'Admin & Ops Portal'}</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#BE185D] text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Logged in Admin Badge & Sign Out */}
        {adminUser && (
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#04281e] border border-emerald-800 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-200 truncate max-w-[120px] font-medium" title={adminUser.email}>
              {adminUser.email}
            </span>
            <button
              onClick={logoutAdmin}
              className="text-stone-300 hover:text-rose-300 font-semibold underline text-[10px] transition-colors"
              title={isAr ? 'تسجيل الخروج' : 'Sign Out'}
            >
              {isAr ? 'خروج' : 'Logout'}
            </button>
          </div>
        )}

        {/* Language Switcher */}
        <button
          onClick={toggleLocale}
          className="px-2.5 py-1 rounded-md bg-[#064E3B] hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 border border-emerald-700 transition-colors"
          title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <span>🌐</span>
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>
      </div>
    </div>
  );
};
