import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured, getSupabaseConfigStatus } from '../../lib/supabase';

export const AdminLoginScreen: React.FC = () => {
  const { locale, setScreen, loginAdmin, adminAuthError, isAuthLoading } = useApp();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const supabaseStatus = getSupabaseConfigStatus();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError(
        isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your email and password'
      );
      return;
    }

    const success = await loginAdmin(email.trim(), password.trim());
    if (!success && !adminAuthError) {
      setLocalError(
        isAr
          ? 'تعذر تسجيل الدخول. تأكد من صحة البيانات أو قم بتشغيل كود SQL في Supabase'
          : 'Unable to sign in. Verify credentials or run the Supabase SQL schema.'
      );
    }
  };

  const handleDemoLogin = async () => {
    setLocalError(null);
    await loginAdmin('admin@amanriyadh.sa', 'amanAdmin2026!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#f8faf8] via-[#f3f7f4] to-[#eaf2ec]">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-emerald-900/10 p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-700/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/aman-logo.png"
              alt="AMAN Baby Care & Home Services"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-xs"
            />
          </div>
          <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
            {isAr ? 'بوابة إدارة العمليات المشفرة' : 'Secure Operations Console'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#003527] font-serif">
            {isAr ? 'تسجيل دخول المشرفين' : 'Admin & Staff Access'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-sm mx-auto">
            {isAr
              ? 'إدارة حجوزات المواليد، الكتالوج، وتسعير الخدمات عبر نظام سوبابيز الآمن'
              : 'Manage infant bookings, clinical roster, and catalog via Supabase Auth.'}
          </p>
        </div>

        {/* Supabase Connection Pill */}
        <div className="mb-6 p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                supabaseStatus.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-medium text-stone-700">
              {supabaseStatus.isConfigured
                ? isAr
                  ? 'سوبابيز: متصل بالسحابة'
                  : 'Supabase: Cloud Connected'
                : isAr
                ? 'وضع التجربة / انتظار الربط'
                : 'Preview / Local Mode'}
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">
            {supabaseStatus.isConfigured ? supabaseStatus.url : 'mock fallback'}
          </span>
        </div>

        {/* Error Notice */}
        {(localError || adminAuthError) && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 font-medium">{localError || adminAuthError}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {isAr ? 'البريد الإلكتروني للمسؤول' : 'Authorized Admin Email'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@amanriyadh.sa"
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              {isAr ? 'كلمة المرور المشفرة' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent bg-stone-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 rtl:right-auto rtl:left-3 flex items-center text-xs text-stone-400 hover:text-stone-700"
              >
                {showPassword ? (isAr ? 'إخفاء' : 'Hide') : isAr ? 'إظهار' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#003527] hover:bg-[#004735] text-white font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAuthLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isAr ? 'جاري التحقق والمصادقة...' : 'Verifying Credentials...'}</span>
              </>
            ) : (
              <span>{isAr ? 'دخول لوحة التحكم' : 'Sign In to Admin Panel'}</span>
            )}
          </button>
        </form>

        {/* Demo Fast Login Bypass */}
        <div className="mt-6 pt-5 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-500 mb-3">
            {isAr
              ? 'هل ترغب في تجربة لوحة الإدارة الفورية قبل إدخال مفاتيح سوبابيز؟'
              : 'Testing or reviewing before configuring your Supabase project keys?'}
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isAuthLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>
              {isAr ? 'دخول تجريبي فوري بصلاحية مدير كامل' : 'Quick Preview Demo Login (Super Admin)'}
            </span>
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="mt-6 flex items-center justify-between text-xs text-stone-500 pt-3">
          <button
            type="button"
            onClick={() => setScreen('public')}
            className="hover:text-emerald-800 transition-colors flex items-center gap-1 font-medium"
          >
            <span>{isAr ? '← العودة للموقع العام' : '← Back to Public Website'}</span>
          </button>

          <a
            href="https://wa.me/966595002539?text=Hello%20AMAN%20Riyadh,%20I%20am%20an%20admin%20requesting%20access%20credentials."
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-800 hover:underline flex items-center gap-1 font-medium"
          >
            <span>{isAr ? 'طلب صلاحية عبر واتساب' : 'Staff Support (WhatsApp)'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
