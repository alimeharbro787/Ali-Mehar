import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopModeSwitcher } from './components/common/TopModeSwitcher';
import { PublicPortal } from './components/public/PublicPortal';
import { BookingModal } from './components/public/BookingModal';
import { OpsConsole } from './components/ops/OpsConsole';
import { AdminLoginScreen } from './components/ops/AdminLoginScreen';
import { VitalsDetailDrawer } from './components/ops/VitalsDetailDrawer';
import { ManualBookingModal } from './components/ops/ManualBookingModal';
import { EditServiceModal } from './components/ops/EditServiceModal';

const AppContent: React.FC = () => {
  const { screen, toastMessage, adminUser } = useApp();

  return (
    <div className="min-h-screen flex flex-col w-full relative">
      {/* Top Universal Mode Switcher & Language Bar */}
      <TopModeSwitcher />

      {/* Main View: Public Portal vs Operations Hub (Protected by Supabase Auth) */}
      <main className="flex-1 w-full">
        {screen === 'public' ? (
          <PublicPortal />
        ) : adminUser ? (
          <OpsConsole />
        ) : (
          <AdminLoginScreen />
        )}
      </main>

      {/* Global Modals & Slide-out Drawers */}
      <BookingModal />
      {adminUser && (
        <>
          <VitalsDetailDrawer />
          <ManualBookingModal />
          <EditServiceModal />
        </>
      )}

      {/* Floating System Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 z-50 transition-all animate-bounce">
          <div className="px-5 py-3 rounded-2xl bg-[#003527] text-white shadow-2xl border border-emerald-600/40 flex items-center gap-2.5 text-xs font-semibold">
            <span className="text-emerald-300 text-base">✓</span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
