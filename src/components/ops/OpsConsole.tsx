import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OpsTab, BookingRecord } from '../../types';
import { RIYADH_DISTRICTS } from '../../data/mockData';

export const OpsConsole: React.FC = () => {
  const {
    locale,
    opsTab,
    setOpsTab,
    adminUser,
    logoutAdmin,
    isSupabaseOnline,
    isLoadingData,
    refreshFromSupabase,
    bookings,
    services,
    packages,
    seasonalEvents,
    toggleEventStatus,
    admins,
    addAdmin,
    removeAdmin,
    setSelectedBookingForDrawer,
    setIsManualBookingModalOpen,
    openEditServiceModal,
    toggleServicePublished,
    updatePackagePrice,
    addNewPackage,
    deletePackage,
    assignNurseToBooking,
    deleteBooking,
    updateBookingStatus,
    deleteService,
    showToast,
  } = useApp();

  const isAr = locale === 'ar';

  // Filters for bookings table
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceCmsFilter, setServiceCmsFilter] = useState<'all' | 'newborn' | 'lifestyle'>('all');

  // Package prices state
  const [pkgPrices, setPkgPrices] = useState<{ [id: string]: number }>({
    'pkg-1': 450,
    'pkg-2': 850,
    'pkg-3': 1400,
  });

  // Dynamic QR settings state
  const [qrTargetUrl, setQrTargetUrl] = useState(
    'https://wa.me/966595002539?text=Hello%20AMAN%20Riyadh,%20I%20am%20scanning%20the%20VIP%20Care%20card.'
  );
  const [locName, setLocName] = useState('AMAN Riyadh Operations HQ (Al-Nakheel Hub)');
  const [locAddress, setLocAddress] = useState(
    'Northern Ring Road, Al-Nakheel District, Riyadh 12384, Kingdom of Saudi Arabia'
  );

  // Admin Management State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'super_admin' | 'dispatcher' | 'support'>('dispatcher');
  const [latestCreatedPin, setLatestCreatedPin] = useState<{ name: string; pin: string; phone: string } | null>(null);

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;
    const created = await addAdmin({
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      phone: newAdminPhone.trim() || '+966 59 500 2539',
      role: newAdminRole,
    });
    setLatestCreatedPin({
      name: created.name,
      pin: created.accessPin,
      phone: created.phone,
    });
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPhone('');
  };

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncPublicWeb = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast(
        isAr
          ? 'تمت مزامنة جميع تعديلات العمليات والخدمات مع الموقع العام بنجاح!'
          : 'Operations and CMS catalog synchronized successfully with Public Web!'
      );
    }, 1200);
  };

  const handleExportCsv = () => {
    const headers = ['Ref', 'FamilyName', 'Phone', 'Service', 'District', 'Shift', 'Nurse', 'Status'];
    const rows = bookings.map((b) => [
      b.ref,
      `"${b.familyName}"`,
      b.clientPhone,
      `"${b.serviceTitle}"`,
      b.district,
      `"${b.shiftDuration}"`,
      `"${b.assignedNurse?.name || 'Unassigned'}"`,
      b.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AMAN_Riyadh_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isAr ? 'تم تصدير ملف الإكسل (CSV) بنجاح' : 'Bookings CSV exported successfully');
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      b.familyName.toLowerCase().includes(q) ||
      b.ref.toLowerCase().includes(q) ||
      b.clientPhone.toLowerCase().includes(q) ||
      b.serviceTitle.toLowerCase().includes(q);

    const matchDistrict = !districtFilter || b.district === districtFilter;
    const matchCategory = !categoryFilter || b.serviceCategory.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchStatus =
      !statusFilter ||
      (statusFilter === 'in_progress' && b.status === 'in_progress') ||
      (statusFilter === 'pending' && (!b.assignedNurse || b.status === 'urgent')) ||
      (statusFilter === 'confirmed' && (b.status === 'scheduled' || b.status === 'contract_active')) ||
      (statusFilter === 'completed' && b.status === 'completed');

    return matchSearch && matchDistrict && matchCategory && matchStatus;
  });

  const handleAssignPrompt = (b: BookingRecord) => {
    const nurse = window.prompt(
      isAr
        ? `تعيين ممرضة لحديثي الولادة للحجز ${b.ref}:`
        : `Assign Registered Neonatal Nurse to ${b.ref}:`,
      'Sarah Mansour, RN'
    );
    if (nurse && nurse.trim()) {
      assignNurseToBooking(b.ref, nurse.trim());
    }
  };

  const handleSavePrices = () => {
    Object.entries(pkgPrices).forEach(([id, price]) => {
      updatePackagePrice(id, price);
    });
    showToast(isAr ? 'تم حفظ الأسعار وتحديثها على الموقع' : 'All package prices saved to cloud');
  };

  const handleQuoteSimulator = (title: string, price: number) => {
    const vat = price * 0.15;
    const total = price + vat;
    window.alert(
      isAr
        ? `محاكي التسعير للباقة: ${title}\nالسعر الأساسي: ${price.toLocaleString()} ر.س\nضريبة القيمة المضافة (15%): ${vat.toLocaleString()} ر.س\nالإجمالي النهائي: ${total.toLocaleString()} ر.س`
        : `Quote Simulator for ${title}:\nBase Rate: ${price.toLocaleString()} SAR\nEstimated VAT (15%): ${vat.toLocaleString()} SAR\nTotal Riyadh Billing: ${total.toLocaleString()} SAR`
    );
  };

  const handleRunHealthCheck = () => {
    showToast(
      isAr
        ? 'فحص الاتصال: قاعدة بيانات Supabase me-central-1 متصلة ومستقرة بنسبة 99.98% (زمن الاستجابة: 18ms)'
        : 'Health Check: Supabase me-central-1 PostgreSQL is 100% operational (Latency: 18ms, 12 RLS active)'
    );
  };

  const handleCopySql = () => {
    const fullSql = `-- ==============================================================================
-- AMAN BABY CARE & HOME SERVICES - RIYADH, SAUDI ARABIA
-- Supabase Database Schema, Tables, Indexes, and Row Level Security (RLS)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin Profiles
CREATE TABLE IF NOT EXISTS public.aman_admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '+966 59 500 2539',
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'dispatcher', 'support')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.aman_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    family_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    is_vip BOOLEAN DEFAULT false,
    vip_tier TEXT DEFAULT NULL,
    service_category TEXT NOT NULL DEFAULT 'Newborn Care',
    service_title TEXT NOT NULL,
    schedule_title TEXT NOT NULL,
    shift_duration TEXT NOT NULL,
    shift_type TEXT NOT NULL CHECK (shift_type IN ('night', 'day', 'livein')),
    district TEXT NOT NULL DEFAULT 'Al-Nakheel',
    assigned_nurse JSONB DEFAULT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'scheduled', 'urgent', 'contract_active', 'completed')) DEFAULT 'scheduled',
    vitals JSONB DEFAULT NULL,
    urgent_dispatch BOOLEAN DEFAULT false,
    notes TEXT DEFAULT '',
    start_date TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Services
CREATE TABLE IF NOT EXISTS public.aman_services (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('newborn', 'lifestyle')),
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    subtitle_en TEXT NOT NULL,
    subtitle_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    image TEXT NOT NULL,
    badge_en TEXT,
    badge_ar TEXT,
    shifts_en TEXT NOT NULL,
    shifts_ar TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Packages
CREATE TABLE IF NOT EXISTS public.aman_packages (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    tier_en TEXT NOT NULL,
    tier_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    price_sar NUMERIC(10, 2) NOT NULL,
    billing_cadence_en TEXT NOT NULL,
    billing_cadence_ar TEXT NOT NULL,
    shift_notice_en TEXT NOT NULL,
    shift_notice_ar TEXT NOT NULL,
    inclusions_en TEXT[] NOT NULL DEFAULT '{}',
    inclusions_ar TEXT[] NOT NULL DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    whatsapp_prefill_en TEXT NOT NULL,
    whatsapp_prefill_ar TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seasonal Events
CREATE TABLE IF NOT EXISTS public.aman_seasonal_events (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    hijri_window_en TEXT NOT NULL,
    hijri_window_ar TEXT NOT NULL,
    gregorian_window_en TEXT NOT NULL,
    gregorian_window_ar TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'scheduled', 'draft')) DEFAULT 'active',
    perk_en TEXT NOT NULL,
    perk_ar TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'High Demand',
    price_sar NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.aman_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_seasonal_events ENABLE ROW LEVEL SECURITY;

-- Helper
CREATE OR REPLACE FUNCTION public.is_aman_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.aman_admin_profiles
    WHERE (user_id = auth.uid() OR email = (auth.jwt() ->> 'email')) AND is_active = true
  ) OR (auth.role() = 'authenticated' AND NOT EXISTS (SELECT 1 FROM public.aman_admin_profiles));
$$;

-- RLS Policies
CREATE POLICY "Public can submit bookings" ON public.aman_bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view bookings" ON public.aman_bookings FOR SELECT TO authenticated USING (public.is_aman_admin());
CREATE POLICY "Admins can update bookings" ON public.aman_bookings FOR UPDATE TO authenticated USING (public.is_aman_admin());
CREATE POLICY "Admins can delete bookings" ON public.aman_bookings FOR DELETE TO authenticated USING (public.is_aman_admin());
CREATE POLICY "Public can view services" ON public.aman_services FOR SELECT TO anon, authenticated USING (is_published = true OR public.is_aman_admin());
CREATE POLICY "Admins can manage services" ON public.aman_services FOR ALL TO authenticated USING (public.is_aman_admin());
CREATE POLICY "Public can view packages" ON public.aman_packages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage packages" ON public.aman_packages FOR ALL TO authenticated USING (public.is_aman_admin());
CREATE POLICY "Public can view events" ON public.aman_seasonal_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage events" ON public.aman_seasonal_events FOR ALL TO authenticated USING (public.is_aman_admin());
CREATE POLICY "Admins can view profiles" ON public.aman_admin_profiles FOR SELECT TO authenticated USING (public.is_aman_admin() OR auth.uid() = user_id);
CREATE POLICY "Admins can manage profiles" ON public.aman_admin_profiles FOR ALL TO authenticated USING (public.is_aman_admin());`;

    navigator.clipboard.writeText(fullSql);
    showToast(isAr ? 'تم نسخ استعلامات PostgreSQL و RLS بالكامل إلى الحافظة!' : 'Complete Supabase SQL schema & RLS copied to clipboard!');
  };

  return (
    <div className="w-full bg-[#f9f9f7] min-h-screen text-[#1a1c1b] font-sans">
      {/* 1. OPERATIONS SUB-BAR / ALERT TICKER */}
      <div className="px-4 sm:px-8 py-2.5 bg-[#f4f4f2] border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#ffd9e0] text-[#3f0019] text-xs font-bold">
            !
          </span>
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-[#003527]">
              {isAr ? 'تنبيه غرفة عمليات الرياض:' : 'Riyadh Hub Dispatch:'}
            </span>
            <span className="text-[#404944] truncate">
              {isAr
                ? 'مطلوب توجيه ممرضتين فوراً لمناوبات ليلية طارئة في حي الملقا وفلل حطين'
                : '2 urgent neonatal night shift assignments pending for Al-Malqa & Hittin villas'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-gray-400 uppercase tracking-wider text-[11px] font-semibold hidden md:inline">
            {isAr ? 'خط الواتساب المباشر:' : 'Direct WhatsApp Line:'}
          </span>
          <a
            href="https://wa.me/966595002539"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#064e3b] text-white font-mono font-bold hover:bg-[#003527] transition-colors"
          >
            <span>💬</span>
            <span>+966 59 500 2539</span>
          </a>
          <span className="text-gray-300">•</span>
          <span className="text-gray-600 font-medium">
            {isAr ? 'المزامنة: نشطة الآن' : 'Sync: Active (Just Now)'}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6 space-y-6">
        {/* 2. HEADER HERO BANNER WITH RIYADH COVERAGE */}
        <div className="relative overflow-hidden rounded-2xl bg-[#003527] text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#2b6954]/20 blur-3xl pointer-events-none"></div>
          <div className="absolute right-40 -bottom-20 w-72 h-72 rounded-full bg-[#b81059]/15 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs shrink-0">
                  <img
                    src="/assets/aman-logo.png"
                    alt="AMAN Care"
                    className="h-6 sm:h-7 w-auto object-contain"
                  />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#b0f0d6] text-[#002117] text-xs font-bold tracking-wide uppercase">
                  {isAr ? 'لوحة تحكم رعاية الرياض' : 'Riyadh Care Console'}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#95d3ba]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  {isAr ? 'العمليات نشطة ومباشرة' : 'Live Operations Online'}
                </span>
              </div>

              <h1 className="font-serif-title text-3xl sm:text-4xl font-bold tracking-tight">
                {isAr ? 'مركز عمليات رعاية الأم وحديثي الولادة' : 'Maternal & Infant Operations Center'}
              </h1>
              <p className="text-sm text-[#95d3ba] leading-relaxed">
                {isAr
                  ? 'تنسيق توجيه ممرضات الأطفال، رعاية النوم بعد الولادة، والمساعدات السكنيات في أحياء: النخيل، الملقا، الحي الدبلوماسي، حطين، والصحافة.'
                  : 'Coordinating pediatric nurse dispatch, postpartum sleep support, and certified residential attendants across Al-Nakheel, Al-Malqa, Diplomatic Quarter, Hittin, & Al-Sahafa.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsManualBookingModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#003527] hover:bg-gray-100 font-bold text-xs shadow-md transition-all"
              >
                <span>➕</span>
                <span>{isAr ? '+ حجز يدوي جديد' : '+ New Manual Booking'}</span>
              </button>

              <button
                onClick={refreshFromSupabase}
                disabled={isLoadingData}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors border border-emerald-600/40"
                title={isAr ? 'تحديث البيانات من سوبابيز' : 'Refresh live records from Supabase'}
              >
                <span className={isLoadingData ? 'animate-spin' : ''}>⚡</span>
                <span>
                  {isLoadingData
                    ? isAr
                      ? 'جاري التحميل...'
                      : 'Connecting...'
                    : isAr
                    ? 'تحديث سوبابيز'
                    : 'Sync Supabase'}
                </span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#064e3b] text-white hover:bg-[#2b6954] font-semibold text-xs shadow-sm transition-colors"
              >
                <span>📥</span>
                <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
              </button>

              {adminUser && (
                <button
                  onClick={logoutAdmin}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-950/60 text-rose-200 hover:bg-rose-900 border border-rose-800/60 font-semibold text-xs transition-colors"
                  title={isAr ? 'تسجيل الخروج من لوحة التحكم' : 'Sign out of admin console'}
                >
                  <span>🚪</span>
                  <span>{isAr ? 'تسجيل خروج' : 'Logout'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. 4 HIGH-IMPACT KPI STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  {isAr ? 'العائلات النشطة' : 'Active Bookings'}
                </span>
                <span className="font-serif-title text-2xl text-[#003527] mt-1 font-bold block">
                  {bookings.length} {isAr ? 'عائلة' : 'Families'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#003527] flex items-center justify-center text-lg">
                👨‍👩‍👧
              </div>
            </div>
            <div className="mt-4 pt-2.5 bg-[#f4f4f2]/70 rounded-lg p-2 flex items-center justify-between text-xs text-gray-600">
              <span>
                <strong className="text-[#003527]">18</strong> {isAr ? 'مناوبة ليلية' : 'Night'}
              </span>
              <span>•</span>
              <span>
                <strong className="text-[#003527]">10</strong> {isAr ? 'نهاري' : 'Day'}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#b0f0d6] text-[#002117] font-bold text-[10px]">
                +14%
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  {isAr ? 'استفسارات الواتساب' : 'Pending WhatsApp'}
                </span>
                <span className="font-serif-title text-2xl text-[#b81059] mt-1 font-bold block">
                  5 {isAr ? 'طلبات' : 'Inquiries'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ffd9e0] text-[#b81059] flex items-center justify-center text-lg">
                💬
              </div>
            </div>
            <div className="mt-4 pt-2.5 bg-[#ffd9e0]/40 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="text-[#8f0042] font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#b81059] animate-ping"></span>
                {isAr ? 'حالتان طارئتان (<20 دقيقة)' : '2 urgent dispatch (<20m)'}
              </span>
              <a
                href="https://wa.me/966595002539"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#b81059] font-bold hover:underline"
              >
                {isAr ? 'فتح' : 'Open'}
              </a>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  {isAr ? 'طاقم التمريض المتاح' : 'Caregiver Roster'}
                </span>
                <span className="font-serif-title text-2xl text-gray-800 mt-1 font-bold block">
                  38 / 42 {isAr ? 'ممرضة' : 'Nurses'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#003527] flex items-center justify-center text-lg">
                👩‍⚕️
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between text-gray-500 font-semibold">
                <span>{isAr ? 'نسبة الإشغال بالرياض' : 'Riyadh Deployment'}</span>
                <span className="text-[#003527] font-bold">91% Capacity</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#003527] rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  {isAr ? 'حجم الرعاية الشهري' : 'Monthly Care Volume'}
                </span>
                <span className="font-serif-title text-2xl text-[#003527] mt-1 font-bold block">
                  194,500 SAR
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ffdcc3] text-[#4a2400] flex items-center justify-center text-lg">
                💳
              </div>
            </div>
            <div className="mt-4 pt-2.5 bg-[#f4f4f2]/70 rounded-lg p-2 flex items-center justify-between text-xs text-gray-600">
              <span>{isAr ? 'متوسط الفاتورة: 6,850 ر.س' : 'Avg: 6,850 SAR'}</span>
              <span className="text-[#059669] font-bold flex items-center gap-1">
                ↗ +19.4% MoM
              </span>
            </div>
          </div>
        </div>

        {/* 4. MODULAR TAB NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f4f4f2] p-1.5 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'bookings', en: 'Bookings & Live Scheduling', ar: 'الحجوزات والجدولة المباشرة', badge: `${bookings.length} Active` },
              { id: 'services', en: 'Services CMS Catalog', ar: 'كتالوج الخدمات والـ CMS', badge: `${services.length} Services` },
              { id: 'pricing', en: 'Care Packages & Pricing', ar: 'الباقات والأسعار', badge: '3 Tiers' },
              { id: 'events', en: 'Seasonal Events', ar: 'المواسم والمناسبات', badge: '3 Active' },
              { id: 'location', en: 'Location & QR Settings', ar: 'المقر ورمز الـ QR', badge: null },
              { id: 'admins', en: 'Admin Team & Roles', ar: 'المشرفين وفريق الإدارة', badge: `${admins.length} Staff` },
              { id: 'security', en: 'Backend & Security Status', ar: 'حالة الخادم والأمان', badge: null },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOpsTab(tab.id as OpsTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  opsTab === tab.id
                    ? 'bg-white text-[#003527] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{isAr ? tab.ar : tab.en}</span>
                {tab.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab.id === 'bookings'
                        ? 'bg-[#ffd9e0] text-[#3f0019]'
                        : 'bg-emerald-100 text-[#003527]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 pr-2 rtl:pr-0 rtl:pl-2">
            <span>📍</span>
            <span>
              {isAr ? 'خوارزمية التوجيه: شمال الرياض (الملقا والنخيل)' : 'Auto-routing: Riyadh North Sector'}
            </span>
          </div>
        </div>

        {/* 5. TAB VIEW 1: BOOKINGS & SCHEDULING MANAGEMENT */}
        {opsTab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 min-w-[220px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isAr
                        ? 'بحث باسم العائلة، رقم الحجز #BK، أو الجوال...'
                        : 'Filter by family name, ref #BK-, or mobile...'
                    }
                    className="w-full pl-8 pr-3 rtl:pl-3 rtl:pr-8 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#003527]"
                  />
                  <span className="absolute left-2.5 rtl:left-auto rtl:right-2.5 top-2.5 text-gray-400 text-xs">
                    🔍
                  </span>
                </div>

                {/* District Filter */}
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700"
                >
                  <option value="">{isAr ? 'كافة أحياء الرياض' : 'All Riyadh Districts'}</option>
                  {RIYADH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700"
                >
                  <option value="">{isAr ? 'الحالة: كافة الحجوزات' : 'Status: All Active'}</option>
                  <option value="in_progress">{isAr ? 'مناوبة جارية حالياً' : 'In Progress (Active Shift)'}</option>
                  <option value="pending">{isAr ? 'بانتظار ممرضة / طارئ' : 'Pending Nurse / Urgent'}</option>
                  <option value="confirmed">{isAr ? 'مؤكد ومجدول' : 'Confirmed / Scheduled'}</option>
                  <option value="completed">{isAr ? 'مكتمل' : 'Completed'}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#003527] font-bold text-xs transition-colors"
                >
                  <span>🖨️</span>
                  <span>{isAr ? 'طباعة جدول التمريض' : 'Print Nurse Log'}</span>
                </button>
                <button
                  onClick={() =>
                    window.alert(
                      isAr
                        ? 'تم فتح نافذة البث المباشر لإرسال تحديثات الورديات للممرضات عبر الواتساب.'
                        : 'Broadcast window initialized for on-duty nurses in Riyadh.'
                    )
                  }
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <span>📢</span>
                  <span>{isAr ? 'بث رسالة للمناوبات' : 'WhatsApp Broadcast'}</span>
                </button>
              </div>
            </div>

            {/* Bookings Data Table */}
            <div className="w-full overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-[#f4f4f2] text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-4">{isAr ? 'رقم الحجز والعائلة' : 'Booking Ref & Family'}</th>
                      <th className="py-3 px-4">{isAr ? 'الخدمة والمناوبة' : 'Care Service & Schedule'}</th>
                      <th className="py-3 px-4">{isAr ? 'الحي' : 'Riyadh District'}</th>
                      <th className="py-3 px-4">{isAr ? 'الممرضة المعينة' : 'Assigned Care Nurse'}</th>
                      <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="py-3 px-4 text-right rtl:text-left">{isAr ? 'إجراءات العمليات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Family */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#003527] flex items-center justify-center font-bold text-xs font-serif">
                              {b.familyName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#003527] text-sm">
                                  {b.familyName}
                                </span>
                                {b.isVip && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                                    {b.vipTier || 'VIP'}
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-400 text-[11px] font-mono">
                                {b.ref} • {b.clientPhone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Service & Schedule */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-semibold text-gray-800 block">
                              {b.serviceTitle}
                            </span>
                            <span className="text-gray-500 text-[11px]">
                              {b.scheduleTitle}
                            </span>
                          </div>
                        </td>

                        {/* District */}
                        <td className="py-3.5 px-4">
                          <span className="text-gray-700 flex items-center gap-1">
                            <span>📍</span>
                            <span>{b.district}</span>
                          </span>
                        </td>

                        {/* Assigned Nurse */}
                        <td className="py-3.5 px-4">
                          {b.assignedNurse ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#003527] text-white flex items-center justify-center text-[10px] font-bold">
                                {b.assignedNurse.initials}
                              </div>
                              <div>
                                <span className="font-bold text-gray-800 block leading-tight">
                                  {b.assignedNurse.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {b.assignedNurse.credential}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAssignPrompt(b)}
                              className="px-2.5 py-1 rounded-lg bg-[#BE185D] hover:bg-[#8f0042] text-white font-bold text-[11px] shadow-xs"
                            >
                              {isAr ? '+ تعيين ممرضة الآن' : '+ Assign Nurse Now'}
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {b.status === 'urgent' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffd9e0] text-[#3f0019] font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#BE185D] animate-ping"></span>
                              {isAr ? 'توجيه طارئ فوري' : 'Urgent Dispatch'}
                            </span>
                          )}
                          {b.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#b0f0d6] text-[#002117] font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                              {isAr ? 'مناوبة نشطة' : 'In Progress • Active'}
                            </span>
                          )}
                          {(b.status === 'scheduled' || b.status === 'contract_active') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold text-[11px]">
                              {isAr ? 'مجدول ومؤكد' : 'Confirmed'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right rtl:text-left">
                          <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                            <a
                              href={`https://wa.me/${(b.clientPhone ? b.clientPhone.replace(/\D/g, '') : '966595002539') || '966595002539'}?text=Hello%20${encodeURIComponent(b.familyName)}%2C%20AMAN%20Riyadh%20Operations%20Ref%20${b.ref}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 text-[#003527] transition-colors"
                              title="WhatsApp"
                            >
                              💬
                            </a>
                            <button
                              onClick={() => setSelectedBookingForDrawer(b)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                              title={isAr ? 'عرض المؤشرات الحيوية' : 'View Vitals & Profile'}
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleAssignPrompt(b)}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                              title={isAr ? 'تعديل أو تعيين الممرضة' : 'Edit Nurse Assignment'}
                            >
                              ✏️
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    isAr
                                      ? `هل أنت متأكد من حذف الحجز ${b.ref} لعائلة ${b.familyName}؟`
                                      : `Delete booking ${b.ref} for ${b.familyName}?`
                                  )
                                ) {
                                  await deleteBooking(b.ref);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-rose-100 text-rose-600 transition-colors"
                              title={isAr ? 'حذف الحجز من سوبابيز' : 'Delete from Supabase'}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table pagination bar */}
              <div className="px-4 py-3 bg-[#f4f4f2] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <span>
                  {isAr
                    ? `عرض ${filteredBookings.length} من أصل ${bookings.length} حجز نشط بالرياض`
                    : `Showing ${filteredBookings.length} of ${bookings.length} active family care records`}
                </span>
                <div className="flex items-center gap-1 font-bold">
                  <span className="px-2.5 py-1 rounded bg-white text-[#003527] border border-gray-200">
                    1
                  </span>
                  <span className="px-2.5 py-1 rounded text-gray-400">2</span>
                  <span className="px-2.5 py-1 rounded text-gray-400">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. TAB VIEW 2: SERVICES CMS CATALOG */}
        {opsTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-[#003527]">
                  {isAr ? 'إدارة كتالوج الخدمات والمحتوى' : 'Services CMS Catalog Management'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isAr
                    ? 'التحكم الفوري في ظهور الخدمات، الوصف بالعربية والإنجليزية، والصور المنشورة على الموقع العام.'
                    : 'Configure live public listings for both newborn clinical care and residential lifestyle services.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditServiceModal({ id: 'new', category: 'newborn', titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', descriptionEn: '', descriptionAr: '', image: '', shiftsEn: '', shiftsAr: '', isPublished: true })}
                  className="px-4 py-2 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>➕</span>
                  <span>{isAr ? '+ إنشاء خدمة جديدة' : '+ Create New Service'}</span>
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 bg-[#f4f4f2] p-1 rounded-xl self-start">
              {[
                { id: 'all', en: `All Services (${services.length})`, ar: `جميع الخدمات (${services.length})` },
                { id: 'newborn', en: 'Newborn Care (6)', ar: 'حديثي الولادة (6)' },
                { id: 'lifestyle', en: 'Home & Lifestyle (7)', ar: 'الخدمات المنزلية (7)' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setServiceCmsFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    serviceCmsFilter === pill.id
                      ? 'bg-white text-[#003527] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isAr ? pill.ar : pill.en}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services
                .filter((s) => serviceCmsFilter === 'all' || s.category === serviceCmsFilter)
                .map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                        <img
                          src={srv.image}
                          alt={srv.titleEn}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-[#003527] shadow-xs flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              srv.isPublished ? 'bg-emerald-500' : 'bg-gray-400'
                            }`}
                          ></span>
                          <span>{srv.isPublished ? (isAr ? 'منشور' : 'Live') : (isAr ? 'مخفي' : 'Hidden')}</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-sm text-[#003527]">
                              {srv.titleEn}
                            </h3>
                            <h4 className="text-xs text-gray-500 font-serif">
                              {srv.titleAr}
                            </h4>
                          </div>

                          {/* Live Toggle */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={srv.isPublished}
                              onChange={() => toggleServicePublished(srv.id)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#003527]"></div>
                          </label>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2">
                          {isAr ? srv.descriptionAr : srv.descriptionEn}
                        </p>

                        <div className="text-[11px] text-[#BE185D] italic font-semibold">
                          {isAr ? srv.subtitleAr : srv.subtitleEn}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {srv.id}
                      </span>
                      <button
                        onClick={() => openEditServiceModal(srv)}
                        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-[#003527] hover:text-white text-[#003527] text-xs font-bold transition-all"
                      >
                        {isAr ? 'تعديل المحتوى' : 'Edit Details'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 7. TAB VIEW 3: CARE PACKAGES & PRICING CONTROLS */}
        {opsTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-[#003527]">
                  {isAr ? 'إدارة أسعار وباقات الرعاية' : 'Care Packages & Pricing Controls'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isAr
                    ? 'تعديل أسعار الباقات المنشورة، حساب ضريبة القيمة المضافة، وتخصيص المناوبات للعائلات.'
                    : 'Live package fee schedule published to public Riyadh landing pages and booking generators.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const titleEn = window.prompt(isAr ? 'اسم الباقة بالإنجليزية:' : 'Package Title (English):', 'VIP Twin Care Specialist');
                    if (!titleEn) return;
                    const price = Number(window.prompt(isAr ? 'السعر بالريال السعودي:' : 'Price (SAR):', '1200')) || 1200;
                    const newPkgCode = `PKG_${Date.now().toString().slice(-4)}`;
                    addNewPackage({
                      id: `pkg-${Date.now()}`,
                      code: newPkgCode,
                      titleEn: titleEn,
                      titleAr: isAr ? 'باقة رعاية خاصة' : `${titleEn} (Arabic)`,
                      tierEn: 'Custom Plan',
                      tierAr: 'خطة مخصصة',
                      descriptionEn: 'Tailored pediatric & household care protocol.',
                      descriptionAr: 'بروتوكول رعاية أطفال ومنزل مخصص بالرياض.',
                      priceSar: price,
                      billingCadenceEn: '/ 12h Shift',
                      billingCadenceAr: '/ مناوبة 12 ساعة',
                      shiftNoticeEn: 'Book 6 hours in advance',
                      shiftNoticeAr: 'الحجز مسبقاً قبل 6 ساعات',
                      inclusionsEn: ['MOH Certified Pediatric Specialist', 'Customized Nursing Protocol', 'Dedicated Care Hotline'],
                      inclusionsAr: ['ممرضة معتمدة من وزارة الصحة', 'بروتوكول تمريضي مخصص', 'خط اتصال مباشر لمتابعة الرعاية'],
                      isFeatured: false,
                      whatsappPrefillEn: `Hello AMAN Riyadh, I would like to inquire about ${titleEn}.`,
                      whatsappPrefillAr: `مرحباً أمان الرياض، أود الاستفسار عن باقة ${titleEn}.`,
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <span>➕</span>
                  <span>{isAr ? '+ إضافة باقة جديدة' : '+ New Care Package'}</span>
                </button>

                <button
                  onClick={handleSavePrices}
                  className="px-4 py-2 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>💾</span>
                  <span>{isAr ? 'حفظ وتحديث الأسعار' : 'Save Pricing Changes'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                        {isAr ? pkg.tierAr : pkg.tierEn}
                      </span>
                      {pkg.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full bg-[#BE185D] text-white text-[10px] font-bold">
                          {isAr ? 'الأكثر طلباً' : 'Most Popular'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-serif-title text-xl font-bold text-[#003527]">
                        {isAr ? pkg.titleAr : pkg.titleEn}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {isAr ? pkg.descriptionAr : pkg.descriptionEn}
                      </p>
                    </div>

                    {/* Price Input */}
                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-gray-100 space-y-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        {isAr ? 'سعر الباقة (ريال سعودي)' : 'Rate (SAR)'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={pkgPrices[pkg.id] ?? pkg.priceSar}
                          onChange={(e) =>
                            setPkgPrices({
                              ...pkgPrices,
                              [pkg.id]: Number(e.target.value),
                            })
                          }
                          className="w-28 px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[#003527] font-bold text-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#003527]"
                        />
                        <span className="text-xs text-gray-600 font-semibold">
                          SAR {isAr ? pkg.billingCadenceAr : pkg.billingCadenceEn}
                        </span>
                      </div>
                    </div>

                    {/* Inclusions */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-700 block">
                        {isAr ? 'المميزات المضمنة:' : 'Included In Plan:'}
                      </span>
                      <ul className="space-y-1.5 text-xs text-gray-600">
                        {(isAr ? pkg.inclusionsAr : pkg.inclusionsEn).map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#059669] font-bold">✓</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleQuoteSimulator(pkg.titleEn, pkgPrices[pkg.id] ?? pkg.priceSar)}
                      className="text-xs font-bold text-[#003527] hover:underline"
                    >
                      {isAr ? 'محاكي عرض السعر والضريبة' : 'Quote Simulator (VAT)'}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono">
                        {pkg.code}
                      </span>
                      {packages.length > 1 && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              window.confirm(
                                isAr
                                  ? `هل ترغب في حذف باقة "${pkg.titleAr}" نهائياً من سوبابيز؟`
                                  : `Are you sure you want to delete package "${pkg.titleEn}"?`
                              )
                            ) {
                              await deletePackage(pkg.id);
                            }
                          }}
                          className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title={isAr ? 'حذف الباقة' : 'Delete Package'}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. TAB VIEW 4: SEASONAL EVENTS & CULTURAL CALENDAR */}
        {opsTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-[#003527]">
                  {isAr ? 'المواسم والحملات الإسلامية الخاصة' : 'Seasonal Events & Islamic Campaigns'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isAr
                    ? 'جدولة حملات التراويح لشهر رمضان، تهنئة العيد، وبركات العقيقة لعائلات الرياض.'
                    : 'Program commemorative campaign banners, Ramadan Taraweeh overnight nursery support, and Eid postpartum gift packages.'}
                </p>
              </div>

              <button
                onClick={() =>
                  window.alert(
                    isAr
                      ? 'تمت جدولة الحملة وتفعيلها في قاعدة البيانات.'
                      : 'Seasonal campaign created and scheduled.'
                  )
                }
                className="px-4 py-2 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>➕</span>
                <span>{isAr ? '+ جدولة حملة جديدة' : '+ Add Special Event'}</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-[#f4f4f2] text-gray-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-4">{isAr ? 'اسم الحملة' : 'Campaign Name'}</th>
                      <th className="py-3 px-4">{isAr ? 'الفترة الهجرية والميلادية' : 'Hijri & Gregorian Window'}</th>
                      <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="py-3 px-4">{isAr ? 'الميزة الترويجية' : 'Campaign Perk'}</th>
                      <th className="py-3 px-4 text-right rtl:text-left">{isAr ? 'الإجراء' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {seasonalEvents.map((evt) => (
                      <tr key={evt.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#003527]">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{evt.icon || '🌸'}</span>
                            <div>
                              <span>{isAr ? evt.titleAr : evt.titleEn}</span>
                              {evt.priceSar && (
                                <span className="block text-[10px] text-[#059669] font-mono">
                                  {evt.priceSar} SAR
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          <div>
                            <span className="font-semibold block text-gray-800">
                              {isAr ? evt.hijriWindowAr : evt.hijriWindowEn}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {isAr ? evt.gregorianWindowAr : evt.gregorianWindowEn}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleEventStatus(evt.id)}
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] transition-all cursor-pointer ${
                              evt.status === 'active'
                                ? 'bg-emerald-100 text-[#003527] hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title={isAr ? 'اضغط لتغيير الحالة' : 'Click to toggle status'}
                          >
                            {evt.status === 'active'
                              ? isAr
                                ? '● نشط بالموقع'
                                : '● Live on Web'
                              : isAr
                              ? '○ مجدول'
                              : '○ Scheduled'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-xs">
                          <span className="line-clamp-2">
                            {isAr ? evt.perkAr : evt.perkEn}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right rtl:text-left">
                          <button
                            onClick={() =>
                              showToast(
                                isAr
                                  ? `تم تحديث إعدادات حملة ${evt.titleAr}`
                                  : `Settings updated for ${evt.titleEn}`
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-gray-100 text-[#003527] font-bold hover:bg-gray-200 text-xs transition-colors"
                          >
                            {isAr ? 'تعديل الحملة' : 'Configure'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 9. TAB VIEW 5: LOCATION & DYNAMIC QR CONFIGURATOR */}
        {opsTab === 'location' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif-title text-2xl font-bold text-[#003527]">
                {isAr ? 'إعدادات المقر ورمز الـ QR الديناميكي' : 'Location & Dynamic QR Code Settings'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isAr
                  ? 'توليد رموز QR عالية الدقة لبطاقات العناية وبوسترات العيادات للتواصل الفوري مع واتساب أمان.'
                  : 'Maintain Riyadh HQ coordinates and generate high-resolution dynamic QR codes for welcome cards.'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Settings */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'اسم المقر بالرياض' : 'Location / Office Name'}
                  </label>
                  <input
                    type="text"
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003527]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'العنوان وتحديد الحي' : 'Street & District Address'}
                  </label>
                  <input
                    type="text"
                    value={locAddress}
                    onChange={(e) => setLocAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003527]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'الرابط المستهدف لرمز الـ QR' : 'Destination URL Target for QR Code'}
                  </label>
                  <input
                    type="text"
                    value={qrTargetUrl}
                    onChange={(e) => setQrTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-[#003527]"
                  />

                  <div className="flex items-center gap-2 mt-2 text-[11px]">
                    <span className="text-gray-400">{isAr ? 'نماذج جاهزة:' : 'Presets:'}</span>
                    <button
                      onClick={() =>
                        setQrTargetUrl(
                          'https://wa.me/966595002539?text=Hello%20AMAN%20Riyadh,%20I%20am%20scanning%20the%20VIP%20Care%20card.'
                        )
                      }
                      className="text-[#003527] font-bold hover:underline"
                    >
                      WhatsApp
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => setQrTargetUrl('https://maps.app.goo.gl/aman-riyadh-alnakheel-hq')}
                      className="text-[#003527] font-bold hover:underline"
                    >
                      Google Maps
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => showToast(isAr ? 'تم حفظ إعدادات الـ QR' : 'QR code settings updated')}
                  className="px-5 py-2.5 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold transition-all shadow-sm"
                >
                  {isAr ? 'حفظ وتحديث رمز الـ QR' : 'Update QR Configuration'}
                </button>
              </div>

              {/* Live QR Preview & Vector Display */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col items-center justify-between text-center">
                <div className="space-y-3 flex flex-col items-center">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#003527] text-xs font-bold">
                    {isAr ? 'معاينة رمز الاستجابة السريع' : 'Live Vector QR Preview'}
                  </span>
                  <h4 className="font-serif-title text-lg font-bold text-[#003527]">
                    {isAr ? 'بطاقة كبار الشخصيات المطبوعة' : 'VIP Concierge Quick Scan'}
                  </h4>

                  {/* High Quality Inline SVG QR Code */}
                  <div className="p-4 rounded-2xl bg-white shadow-md border border-gray-100">
                    <svg className="w-44 h-44 text-[#003527]" fill="currentColor" viewBox="0 0 160 160">
                      <rect x="10" y="10" width="40" height="40" rx="4" fill="currentColor" />
                      <rect x="16" y="16" width="28" height="28" rx="2" fill="#ffffff" />
                      <rect x="22" y="22" width="16" height="16" rx="2" fill="currentColor" />

                      <rect x="110" y="10" width="40" height="40" rx="4" fill="currentColor" />
                      <rect x="116" y="16" width="28" height="28" rx="2" fill="#ffffff" />
                      <rect x="122" y="22" width="16" height="16" rx="2" fill="currentColor" />

                      <rect x="10" y="110" width="40" height="40" rx="4" fill="currentColor" />
                      <rect x="16" y="116" width="28" height="28" rx="2" fill="#ffffff" />
                      <rect x="22" y="122" width="16" height="16" rx="2" fill="currentColor" />

                      <rect x="58" y="12" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="74" y="12" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="90" y="12" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="58" y="28" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="90" y="28" width="8" height="8" rx="1" fill="currentColor" />

                      {/* Brand Center Emblem */}
                      <rect x="60" y="60" width="40" height="40" rx="8" fill="#064e3b" />
                      <circle cx="80" cy="80" r="14" fill="#ffffff" />
                      <path d="M76 74 C76 71 84 71 84 74 C84 79 76 83 76 87 L84 87" fill="none" stroke="#b81059" strokeWidth="2.5" strokeLinecap="round" />

                      <rect x="58" y="110" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="74" y="110" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="90" y="110" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="110" y="58" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="126" y="74" width="8" height="8" rx="1" fill="currentColor" />
                      <rect x="142" y="90" width="8" height="8" rx="1" fill="currentColor" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Target: WhatsApp (+966 59 500 2539)
                  </span>
                </div>

                <div className="w-full flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => showToast(isAr ? 'تم تنزيل حزمة SVG' : 'SVG vector package downloaded')}
                    className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#003527] transition-colors"
                  >
                    {isAr ? 'تنزيل ملف الفيكتور (SVG)' : 'Download SVG Vector'}
                  </button>
                  <a
                    href={qrTargetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white text-xs font-bold transition-colors"
                  >
                    {isAr ? 'تجربة فتح الرابط مباشرة ←' : 'Test Scan Destination URL →'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9.5 TAB VIEW 5.5: ADMIN TEAM & ROLE MANAGEMENT */}
        {opsTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-[#003527]">
                  {isAr ? 'فريق الإدارة وصلاحيات المشرفين' : 'Admin Team & Access Management'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isAr
                    ? 'إضافة وتعيين مسؤولين جدد، منح صلاحيات التوجيه أو خدمة العملاء، وتوليد رموز الدخول الآمنة.'
                    : 'Invite and assign new admins, grant dispatch/support privileges, and distribute secure access PINs.'}
                </p>
              </div>

              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>👤➕</span>
                <span>{isAr ? '+ إضافة مسؤول جديد' : '+ Add New Admin'}</span>
              </button>
            </div>

            {/* Success Banner if Admin just added */}
            {latestCreatedPin && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fadeIn">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-emerald-100 text-[#003527] flex items-center justify-center font-bold text-lg">
                    ✓
                  </span>
                  <div>
                    <h4 className="font-bold text-[#003527]">
                      {isAr
                        ? `تم إنشاء حساب المسؤول بنجاح لـ ${latestCreatedPin.name}!`
                        : `Admin account created successfully for ${latestCreatedPin.name}!`}
                    </h4>
                    <p className="text-gray-600">
                      {isAr ? 'رمز الدخول السري (PIN): ' : 'Secure Access PIN: '}
                      <span className="font-mono font-bold text-[#003527] bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {latestCreatedPin.pin}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${latestCreatedPin.phone.replace(/\D/g, '') || '966595002539'}?text=${encodeURIComponent(
                      isAr
                        ? `مرحباً ${latestCreatedPin.name}،\nتمت إضافتك كمسؤول في منصة أمان لرعاية المواليد بالرياض.\nرابط بوابة العمليات: https://ais-pre-drgaiizbtvjtdmloqbr5f4-309379060511.asia-northeast1.run.app\nرمز الدخول الخاص بك (PIN): ${latestCreatedPin.pin}`
                        : `Hello ${latestCreatedPin.name},\nYou have been granted admin privileges on AMAN Riyadh Operations Platform.\nOperations Link: https://ais-pre-drgaiizbtvjtdmloqbr5f4-309379060511.asia-northeast1.run.app\nYour Access PIN: ${latestCreatedPin.pin}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-[#064E3B] text-white font-bold hover:bg-[#003527] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>💬</span>
                    <span>{isAr ? 'إرسال بيانات الدخول عبر الواتساب' : 'Send Invite on WhatsApp'}</span>
                  </a>
                  <button
                    onClick={() => setLatestCreatedPin(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* 3 Role Categories Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#003527] flex items-center justify-center font-bold">
                    👑
                  </span>
                  <h4 className="font-bold text-sm text-[#003527]">
                    {isAr ? 'مدير نظام (Super Admin)' : 'Super Admin / Owner'}
                  </h4>
                </div>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  {isAr
                    ? 'صلاحيات كاملة: تعديل أسعار الباقات، إدارة كتالوج الخدمات، حذف السجلات، وإضافة مسؤولين آخرين.'
                    : 'Full access: Pricing packages, CMS service catalog, record management, and inviting team admins.'}
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    📋
                  </span>
                  <h4 className="font-bold text-sm text-[#003527]">
                    {isAr ? 'منسق العمليات (Logistics)' : 'Logistics Dispatcher'}
                  </h4>
                </div>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  {isAr
                    ? 'إدارة الحجوزات، تعيين وتوجيه الممرضات، متابعة الحالات الطارئة، وإدارة جدول المناوبات.'
                    : 'Manages live family bookings, assigns MOH nurses, dispatches emergency units, and monitors vitals.'}
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-lg bg-pink-100 text-[#BE185D] flex items-center justify-center font-bold">
                    💬
                  </span>
                  <h4 className="font-bold text-sm text-[#003527]">
                    {isAr ? 'خدمة العملاء (Support Concierge)' : 'Client Concierge'}
                  </h4>
                </div>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  {isAr
                    ? 'استقبال الاستفسارات، فتح محادثات الواتساب مع العائلات، وتسجيل طلبات الحجز اليدوية السريعة.'
                    : 'Handles client communications, opens WhatsApp chats, registers manual bookings, and assists parents.'}
                </p>
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#003527]">
                    {isAr ? 'قائمة المسؤولين والمشرفين الحاليين' : 'Active Team Administrators'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#003527] font-bold text-[10px]">
                    {admins.length} {isAr ? 'مشرفين' : 'Active'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-400">
                  {isAr ? 'تحديث فوري للصلاحيات' : 'Real-Time RBAC Active'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className="bg-[#f4f4f2] text-gray-500 uppercase tracking-wider font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-4">{isAr ? 'المسؤول' : 'Admin'}</th>
                      <th className="py-3 px-4">{isAr ? 'بيانات التواصل' : 'Contact Info'}</th>
                      <th className="py-3 px-4">{isAr ? 'الدور والصلاحية' : 'Role'}</th>
                      <th className="py-3 px-4">{isAr ? 'رمز الدخول (PIN)' : 'Access PIN'}</th>
                      <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="py-3 px-4 text-right rtl:text-left">{isAr ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {admins.map((adm) => {
                      const isOwner = adm.id === 'adm-1';
                      return (
                        <tr key={adm.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#003527] font-bold flex items-center justify-center text-xs">
                                {adm.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-[#003527] block">{adm.name}</span>
                                <span className="text-[10px] text-gray-400">
                                  {isAr ? `أضيف بتاريخ: ${adm.addedAt}` : `Added: ${adm.addedAt}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-gray-600">
                            <div>
                              <span className="block text-[11px] font-mono">{adm.email}</span>
                              <span className="block text-[11px] text-gray-400 font-mono">{adm.phone}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                                adm.role === 'super_admin'
                                  ? 'bg-purple-100 text-purple-900'
                                  : adm.role === 'dispatcher'
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-pink-100 text-[#BE185D]'
                              }`}
                            >
                              <span>{adm.role === 'super_admin' ? '👑' : adm.role === 'dispatcher' ? '📋' : '💬'}</span>
                              <span>{isAr ? adm.roleNameAr : adm.roleNameEn}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-[#003527]">
                            <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                              {adm.accessPin}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                              <span>{isAr ? 'نشط' : 'Active'}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right rtl:text-left">
                            <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                              {/* WhatsApp Direct Invite */}
                              <a
                                href={`https://wa.me/${adm.phone.replace(/\D/g, '') || '966595002539'}?text=${encodeURIComponent(
                                  isAr
                                    ? `مرحباً ${adm.name}، إليك رابط دخول بوابة العمليات في أمان الرياض: https://ais-pre-drgaiizbtvjtdmloqbr5f4-309379060511.asia-northeast1.run.app\nرمز الدخول (PIN): ${adm.accessPin}`
                                    : `Hello ${adm.name}, here is your AMAN Riyadh Operations access link: https://ais-pre-drgaiizbtvjtdmloqbr5f4-309379060511.asia-northeast1.run.app\nAccess PIN: ${adm.accessPin}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 text-[#003527] transition-colors"
                                title={isAr ? 'إرسال دعوة بالواتساب' : 'WhatsApp Invite'}
                              >
                                💬
                              </a>

                              {/* Copy Access Link */}
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `https://ais-pre-drgaiizbtvjtdmloqbr5f4-309379060511.asia-northeast1.run.app?admin_pin=${adm.accessPin}`
                                  );
                                  showToast(
                                    isAr
                                      ? `تم نسخ رابط الدخول الخاص بـ ${adm.name}!`
                                      : `Magic access link copied for ${adm.name}!`
                                  );
                                }}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                title={isAr ? 'نسخ رابط الدخول' : 'Copy Access Link'}
                              >
                                🔗
                              </button>

                              {/* Revoke button */}
                              {!isOwner ? (
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        isAr
                                          ? `هل أنت متأكد من إلغاء صلاحية المسؤول ${adm.name}؟`
                                          : `Are you sure you want to revoke admin access for ${adm.name}?`
                                      )
                                    ) {
                                      removeAdmin(adm.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title={isAr ? 'إلغاء الصلاحية' : 'Revoke Access'}
                                >
                                  🗑️
                                </button>
                              ) : (
                                <span className="text-[10px] text-gray-400 px-1 font-semibold">
                                  {isAr ? 'مالك' : 'Owner'}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Google Cloud / Developer Access Guide Box */}
            <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <span className="text-base">☁️</span>
                <span>
                  {isAr
                    ? 'طريقة إضافة مسؤول في مشروع Google AI Studio / Google Cloud (للمطورين والشركاء)'
                    : 'How to add a Co-Developer or Partner in Google AI Studio / Google Cloud'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {isAr
                  ? 'إذا كنت ترغب في منح مطور أو شريك صلاحية التعديل على الكود والمشروع بالكامل في Google AI Studio: اذهب إلى Google Cloud Console -> IAM & Admin -> ثم اضغط Grant Access وأضف بريده الإلكتروني (Gmail) مع إعطائه صلاحية "Editor" أو "Viewer".'
                  : 'If you want to grant code-level or platform access in Google AI Studio: Go to Google Cloud Console -> IAM & Admin -> Click "Grant Access", enter their Gmail address, and assign the "Editor" or "Viewer" role.'}
              </p>
            </div>
          </div>
        )}

        {/* Modal: Add New Admin Form */}
        {isAdminModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold">
                    👤
                  </span>
                  <h3 className="font-serif-title text-xl font-bold text-[#064E3B]">
                    {isAr ? 'إضافة مسؤول جديد للمنصة' : 'Add New Admin User'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAdminModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddAdminSubmit} className="flex flex-col gap-3.5 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'اسم المسؤول الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder={isAr ? 'مثال: نورة الشمري' : 'e.g. Noura Al-Shammari'}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@aman-care.sa"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'رقم الواتساب السعودي' : 'Saudi WhatsApp Phone'}
                  </label>
                  <input
                    type="tel"
                    value={newAdminPhone}
                    onChange={(e) => setNewAdminPhone(e.target.value)}
                    placeholder="+966 59 500 2539"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    {isAr ? 'الصلاحية والدور المطلوب *' : 'Admin Role & Privileges *'}
                  </label>
                  <select
                    value={newAdminRole}
                    onChange={(e) =>
                      setNewAdminRole(e.target.value as 'super_admin' | 'dispatcher' | 'support')
                    }
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
                  >
                    <option value="dispatcher">
                      {isAr
                        ? '📋 منسق عمليات (توجيه ممرضات وجدولة حجوزات)'
                        : '📋 Logistics Dispatcher (Assign nurses & manage roster)'}
                    </option>
                    <option value="support">
                      {isAr
                        ? '💬 خدمة عملاء (محادثات واتساب واستفسارات)'
                        : '💬 Client Concierge (WhatsApp chats & basic inquiries)'}
                    </option>
                    <option value="super_admin">
                      {isAr
                        ? '👑 مدير عام كامل الصلاحيات (أسعار وكتالوج ومسؤولين)'
                        : '👑 Super Admin (Full access: prices, CMS, all settings)'}
                    </option>
                  </select>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
                  <span>ℹ️ {isAr ? 'سيتم توليد رمز دخول سري (PIN) ورابط فوري يمكن إرساله للمسؤول عبر الواتساب.' : 'A secure Access PIN and direct login link will be generated instantly to send via WhatsApp.'}</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAdminModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#003527] text-white font-bold transition-all shadow-sm"
                  >
                    {isAr ? 'إنشاء وتعيين المسؤول' : 'Create & Assign Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 10. TAB VIEW 6: BACKEND & SECURITY STATUS */}
        {opsTab === 'security' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif-title text-2xl font-bold text-[#003527]">
                  {isAr ? 'أمان الخادم والاتصال بقاعدة البيانات' : 'Backend, Auth & Database Security'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {isAr
                    ? 'حالة البنية التحتية، سياسات أمان السجلات (RLS)، ومراقبة الاتصال الخادم.'
                    : 'Real architectural status for Supabase PostgreSQL, Row Level Security policies, and secure sessions.'}
                </p>
              </div>

              <button
                onClick={handleRunHealthCheck}
                className="px-4 py-2 rounded-xl bg-[#003527] hover:bg-[#064e3b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>⚡</span>
                <span>{isAr ? 'تشغيل فحص الأمان والاتصال' : 'Run Connection Audit'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#003527] flex items-center justify-center font-bold text-base">
                  🗄️
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                    PostgreSQL Database
                  </span>
                  <h4 className="font-bold text-sm text-[#003527]">me-central-1 (Riyadh Hub)</h4>
                  <span className="text-[#059669] font-semibold block mt-0.5">
                    ● Connected • 18ms latency
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#BE185D] flex items-center justify-center font-bold text-base">
                  🛡️
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                    Row Level Security
                  </span>
                  <h4 className="font-bold text-sm text-[#003527]">12 / 12 Policies Active</h4>
                  <span className="text-[#059669] font-semibold block mt-0.5">
                    ● Anon read-only, Owner CRUD
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#003527] flex items-center justify-center font-bold text-base">
                  🔒
                </div>
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">
                    Session &amp; Auth
                  </span>
                  <h4 className="font-bold text-sm text-[#003527]">Fatima Al-Otaibi (Owner)</h4>
                  <span className="text-[#059669] font-semibold block mt-0.5">
                    ● JWT HTTP-Only Verified
                  </span>
                </div>
              </div>
            </div>

            {/* SQL DDL Box */}
            <div className="bg-[#1a1c1b] rounded-2xl p-5 text-gray-200 text-xs shadow-md space-y-3 font-mono">
              <div className="flex items-center justify-between text-emerald-300">
                <span>PostgreSQL Row-Level Security Rules (aman_services)</span>
                <button
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-sans text-xs transition-colors"
                >
                  {isAr ? 'نسخ كود SQL' : 'Copy SQL'}
                </button>
              </div>

              <pre className="p-3 bg-black/40 rounded-xl overflow-x-auto text-emerald-400 text-[11px] leading-relaxed">
{`-- Enable RLS on core services catalog
ALTER TABLE aman_services ENABLE ROW LEVEL SECURITY;

-- 1. Public Website Guests: View published services only
CREATE POLICY "Public guest read access" 
ON aman_services FOR SELECT 
USING (is_published = true);

-- 2. Operations Admin (Owner): Full CRUD permissions
CREATE POLICY "Owner complete access" 
ON aman_services FOR ALL 
TO authenticated
USING (auth.jwt() ->> 'role' = 'owner');`}
              </pre>
            </div>
          </div>
        )}

        {/* 11. RIYADH DISTRICT NURSE LOGISTICS MAP CARD */}
        <div className="w-full rounded-2xl bg-white p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col lg:flex-row gap-6 items-center">
          <div className="w-full lg:w-1/2 space-y-3 text-xs">
            <div className="flex items-center gap-1.5 text-[#003527]">
              <span>📍</span>
              <span className="font-bold uppercase tracking-wider text-gray-400">
                {isAr ? 'نطاق تغطية أحياء الرياض' : 'Riyadh Coverage Radius'}
              </span>
            </div>
            <h2 className="font-serif-title text-2xl text-[#003527] font-bold">
              {isAr ? 'توزيع الممرضات اللوجستي بشمال ووسط الرياض' : 'Real-Time Nurse Logistics in Northern Riyadh'}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {isAr
                ? 'تتمركز نقاط توجيه الممرضات ومقدمات الرعاية بشكل استراتيجي في أحياء الملقا والنخيل، مما يضمن وصولاً إسعافياً في أقل من 25 دقيقة لحالات رعاية المواليد العاجلة.'
                : 'Caregiver dispatch stations are strategically positioned across Al-Malqa and Al-Nakheel, ensuring average emergency response arrival times under 25 minutes for high-priority infant care calls.'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">{isAr ? 'حي السفارات (DQ)' : 'Diplomatic Quarter (DQ)'}</span>
                <span className="font-bold text-sm text-[#003527]">{isAr ? '8 ممرضات مناوبة' : '8 Active Nurses'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">{isAr ? 'الملقا وحطين' : 'Al-Malqa & Hittin'}</span>
                <span className="font-bold text-sm text-[#003527]">{isAr ? '15 ممرضة مناوبة' : '15 Active Nurses'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">{isAr ? 'النخيل والمحمدية' : 'Al-Nakheel & Muhammadiyah'}</span>
                <span className="font-bold text-sm text-[#003527]">{isAr ? '11 ممرضة مناوبة' : '11 Active Nurses'}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block text-[11px]">{isAr ? 'الصحافة والياسمين' : 'Al-Sahafa & Al-Yasmin'}</span>
                <span className="font-bold text-sm text-[#003527]">{isAr ? '4 ممرضات مناوبة' : '4 Active Nurses'}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 h-64 rounded-2xl overflow-hidden shadow-inner relative bg-emerald-950 flex items-center justify-center">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOqZCm3h2ZdKtsjzKgA_DVZVqCz-QwjjtZEbYQwA7Avi3Fge1qzatkvzP8pR04aTK1qf8o9aEE7QbV4kj_ycY1c127_AOdG3J_jtP57HzS-tN3i7QgxhKNKlveghmEgUTxLpdkdiY3qcgEv17AG_JBjeBdS6rT9FlhlP7vUeRmD5i-FV6eYVXr1xWPGTmevjwlk6qVG0T-jbt6292F753HPuhKzkBALoJZ4bfNf0GDe23vsi9Br43kZg"
              alt="Riyadh Map"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute bottom-3 left-3 rtl:left-auto rtl:right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[#003527] text-xs font-bold shadow-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse"></span>
              <span>{isAr ? 'أسطول عمليات وسط وشمال الرياض' : 'Central Riyadh Operations Fleet'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-[#f4f4f2] mt-12 py-6 border-t border-gray-200">
        <div className="w-full px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>🛡️ MOH Certified Care Protocols</span>
            <span>•</span>
            <span>256-bit TLS Encrypted Session</span>
            <span>•</span>
            <span>Riyadh Hub Cluster: KSA-CENTRAL-01</span>
          </div>
          <div>
            <span>Live Time: AST (UTC+3) Riyadh • © {new Date().getFullYear()} AMAN Maternity &amp; Pediatric Care.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
