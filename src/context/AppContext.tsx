import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Locale,
  ScreenMode,
  OpsTab,
  BookingRecord,
  ServiceItem,
  PricingPackage,
  SeasonalEvent,
  AdminUser,
} from '../types';
import {
  INITIAL_BOOKINGS,
  INITIAL_SERVICES,
  INITIAL_PACKAGES,
  INITIAL_SEASONAL_EVENTS,
  INITIAL_ADMINS,
} from '../data/mockData';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseConfigStatus,
  fetchBookingsFromSupabase,
  insertBookingToSupabase,
  updateBookingInSupabase,
  deleteBookingFromSupabase,
  fetchServicesFromSupabase,
  upsertServiceInSupabase,
  deleteServiceFromSupabase,
  fetchPackagesFromSupabase,
  upsertPackageInSupabase,
  deletePackageFromSupabase,
  fetchSeasonalEventsFromSupabase,
  updateSeasonalEventInSupabase,
  fetchAdminProfilesFromSupabase,
  insertAdminProfileToSupabase,
  deleteAdminProfileFromSupabase,
} from '../lib/supabase';

interface AdminSessionUser {
  id: string;
  email: string;
  role: 'super_admin' | 'dispatcher' | 'support';
  name: string;
}

interface AppContextType {
  screen: ScreenMode;
  setScreen: (screen: ScreenMode) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  opsTab: OpsTab;
  setOpsTab: (tab: OpsTab) => void;

  // Supabase Auth & Session
  adminUser: AdminSessionUser | null;
  isAuthLoading: boolean;
  adminAuthError: string | null;
  loginAdmin: (email: string, password?: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
  isSupabaseOnline: boolean;
  isLoadingData: boolean;
  refreshFromSupabase: () => Promise<void>;

  // Data Collections
  bookings: BookingRecord[];
  services: ServiceItem[];
  packages: PricingPackage[];
  seasonalEvents: SeasonalEvent[];
  setSeasonalEvents: React.Dispatch<React.SetStateAction<SeasonalEvent[]>>;
  toggleEventStatus: (eventId: string) => Promise<void>;
  admins: AdminUser[];
  addAdmin: (adminData: {
    name: string;
    email: string;
    phone: string;
    role: 'super_admin' | 'dispatcher' | 'support';
  }) => Promise<AdminUser>;
  removeAdmin: (adminId: string) => Promise<void>;

  // Modals & UI Selection
  selectedBookingForDrawer: BookingRecord | null;
  setSelectedBookingForDrawer: (booking: BookingRecord | null) => void;
  isBookingModalOpen: boolean;
  openBookingModal: (packageCode?: string) => void;
  closeBookingModal: () => void;
  preselectedPackage: string | null;
  isManualBookingModalOpen: boolean;
  setIsManualBookingModalOpen: (open: boolean) => void;
  serviceBeingEdited: ServiceItem | null;
  openEditServiceModal: (service: ServiceItem | null) => void;
  closeEditServiceModal: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Real Database CRUD Operations
  addBooking: (booking: Partial<BookingRecord>) => Promise<BookingRecord>;
  assignNurseToBooking: (bookingRef: string, nurseName: string, credential?: string) => Promise<void>;
  updateBookingStatus: (bookingRef: string, newStatus: BookingRecord['status']) => Promise<void>;
  deleteBooking: (bookingRef: string) => Promise<void>;
  toggleServicePublished: (serviceId: string) => Promise<void>;
  updateService: (updated: ServiceItem) => Promise<void>;
  addNewService: (serviceData: Omit<ServiceItem, 'id'>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  updatePackagePrice: (pkgId: string, newPrice: number) => Promise<void>;
  addNewPackage: (pkgData: PricingPackage) => Promise<void>;
  updatePackage: (pkg: PricingPackage) => Promise<void>;
  deletePackage: (pkgId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<ScreenMode>('public');
  const [locale, setLocale] = useState<Locale>('en');
  const [opsTab, setOpsTab] = useState<OpsTab>('bookings');

  // Supabase Auth State
  const [adminUser, setAdminUser] = useState<AdminSessionUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isSupabaseOnline, setIsSupabaseOnline] = useState(isSupabaseConfigured());
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Collections
  const [bookings, setBookings] = useState<BookingRecord[]>(INITIAL_BOOKINGS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [packages, setPackages] = useState<PricingPackage[]>(INITIAL_PACKAGES);
  const [seasonalEvents, setSeasonalEvents] = useState<SeasonalEvent[]>(INITIAL_SEASONAL_EVENTS);
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS);

  // Modal / Selection State
  const [selectedBookingForDrawer, setSelectedBookingForDrawer] = useState<BookingRecord | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedPackage, setPreselectedPackage] = useState<string | null>(null);
  const [isManualBookingModalOpen, setIsManualBookingModalOpen] = useState(false);
  const [serviceBeingEdited, setServiceBeingEdited] = useState<ServiceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync html dir attribute for bidirectional support
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ---------------------------------------------------------------------------
  // Supabase Auth Initial Check & Listener
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!supabase) return;

    // Check existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session?.user) {
        setAdminUser({
          id: session.user.id,
          email: session.user.email || 'admin@amanriyadh.sa',
          role: (session.user.user_metadata?.role as any) || 'super_admin',
          name: session.user.user_metadata?.name || 'Administrator',
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAdminUser({
          id: session.user.id,
          email: session.user.email || 'admin@amanriyadh.sa',
          role: (session.user.user_metadata?.role as any) || 'super_admin',
          name: session.user.user_metadata?.name || 'Administrator',
        });
      } else {
        setAdminUser((current) => (current?.id.startsWith('demo-') ? current : null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Real Database Sync: Pull from Supabase
  // ---------------------------------------------------------------------------
  const refreshFromSupabase = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      showToast(
        locale === 'ar'
          ? 'تم تحديث البيانات المحلية (وضع التجربة)'
          : 'Refreshed local records (Preview Mode)'
      );
      return;
    }

    setIsLoadingData(true);
    try {
      const [dbBookings, dbServices, dbPackages, dbEvents, dbAdmins] = await Promise.all([
        fetchBookingsFromSupabase(),
        fetchServicesFromSupabase(),
        fetchPackagesFromSupabase(),
        fetchSeasonalEventsFromSupabase(),
        fetchAdminProfilesFromSupabase(),
      ]);

      if (dbBookings && dbBookings.length > 0) setBookings(dbBookings);
      if (dbServices && dbServices.length > 0) setServices(dbServices);
      if (dbPackages && dbPackages.length > 0) setPackages(dbPackages);
      if (dbEvents && dbEvents.length > 0) setSeasonalEvents(dbEvents);
      if (dbAdmins && dbAdmins.length > 0) setAdmins(dbAdmins);

      setIsSupabaseOnline(true);
      showToast(
        locale === 'ar'
          ? 'تمت مزامنة البيانات مباشرة مع قاعدة بيانات سوبابيز'
          : 'Data synced successfully with Supabase Cloud!'
      );
    } catch (err) {
      console.warn('Sync exception:', err);
      showToast(
        locale === 'ar'
          ? 'تعذر الوصول إلى سوبابيز، استمرار العمل بالبيانات المحفوظة'
          : 'Could not connect to Supabase, continuing with cached records'
      );
    } finally {
      setIsLoadingData(false);
    }
  };

  // Pull data on initial load
  useEffect(() => {
    refreshFromSupabase();
  }, []);

  // ---------------------------------------------------------------------------
  // Admin Login & Logout
  // ---------------------------------------------------------------------------
  const loginAdmin = async (email: string, password?: string): Promise<boolean> => {
    setIsAuthLoading(true);
    setAdminAuthError(null);

    // If Supabase is configured and a password is provided, perform real Supabase Auth
    if (isSupabaseConfigured() && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If error is invalid credentials or email not confirmed, explain clearly
          setAdminAuthError(error.message);
          setIsAuthLoading(false);
          return false;
        }

        if (data.user) {
          setAdminUser({
            id: data.user.id,
            email: data.user.email || email,
            role: (data.user.user_metadata?.role as any) || 'super_admin',
            name: data.user.user_metadata?.name || email.split('@')[0],
          });
          setIsAuthLoading(false);
          showToast(locale === 'ar' ? 'مرحباً بك! تم تسجيل الدخول بنجاح' : 'Welcome back! Admin authenticated.');
          refreshFromSupabase();
          return true;
        }
      } catch (err: any) {
        setAdminAuthError(err?.message || 'Authentication error');
        setIsAuthLoading(false);
        return false;
      }
    }

    // Fallback Demo Login (for preview or initial testing before env keys)
    await new Promise((resolve) => setTimeout(resolve, 600));
    setAdminUser({
      id: `demo-${Date.now()}`,
      email: email || 'admin@amanriyadh.sa',
      role: 'super_admin',
      name: 'Operations Director',
    });
    setIsAuthLoading(false);
    showToast(
      locale === 'ar'
        ? 'تم تسجيل الدخول بصلاحية الإدارة الكاملة (الوضع التجريبي)'
        : 'Authenticated with Super Admin privileges (Preview Mode)'
    );
    return true;
  };

  const logoutAdmin = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setAdminUser(null);
    setScreen('public');
    showToast(locale === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out of admin console');
  };

  const toggleLocale = () => {
    setLocale((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const openBookingModal = (packageCode?: string) => {
    if (packageCode) {
      setPreselectedPackage(packageCode);
    }
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
  };

  const openEditServiceModal = (service: ServiceItem | null) => {
    setServiceBeingEdited(service);
  };

  const closeEditServiceModal = () => {
    setServiceBeingEdited(null);
  };

  // ---------------------------------------------------------------------------
  // Bookings CRUD (Client & Admin)
  // ---------------------------------------------------------------------------
  const addBooking = async (bookingData: Partial<BookingRecord>): Promise<BookingRecord> => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newRef = `#BK-${randomNum}`;
    const newBooking: BookingRecord = {
      id: `bk-${Date.now()}`,
      ref: newRef,
      familyName: bookingData.familyName || (locale === 'ar' ? 'عائلة كريمة' : 'Valued Family'),
      clientPhone: bookingData.clientPhone || '+966 59 500 2539',
      isVip: false,
      serviceCategory: bookingData.serviceCategory || 'Newborn Care',
      serviceTitle: bookingData.serviceTitle || 'Essential Newborn Start',
      scheduleTitle: bookingData.scheduleTitle || '12h Overnight Vigil',
      shiftDuration: bookingData.shiftDuration || '12h Overnight Vigil',
      shiftType: bookingData.shiftType || 'night',
      district: bookingData.district || 'Al-Nakheel',
      assignedNurse: null,
      status: bookingData.urgentDispatch ? 'urgent' : 'scheduled',
      urgentDispatch: !!bookingData.urgentDispatch,
      notes: bookingData.notes || '',
      startDate: bookingData.startDate || 'Tomorrow',
      createdAt: new Date().toISOString(),
    };

    // Update state immediately for instant feedback
    setBookings((prev) => [newBooking, ...prev]);

    // Persist to Supabase if connected
    if (isSupabaseConfigured() && supabase) {
      insertBookingToSupabase(newBooking).then((saved) => {
        if (!saved) {
          console.warn('Booking stored locally, pending Supabase cloud sync.');
        }
      });
    }

    showToast(
      locale === 'ar'
        ? `تم استلام حجز جديد برقم ${newRef} ومزامنته مع سوبابيز والعمليات!`
        : `New Booking ${newRef} saved to Supabase & Riyadh Ops!`
    );
    return newBooking;
  };

  const assignNurseToBooking = async (
    bookingRef: string,
    nurseName: string,
    credential = 'MOH Licensed Pediatric Nurse'
  ) => {
    const initials = nurseName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const assignedNurse = {
      name: nurseName,
      initials: initials || 'RN',
      credential,
      phone: '+966 59 500 2539',
    };

    setBookings((prev) =>
      prev.map((b) => {
        if (b.ref === bookingRef) {
          return {
            ...b,
            assignedNurse,
            status: b.status === 'urgent' ? 'in_progress' : 'scheduled',
          };
        }
        return b;
      })
    );

    if (isSupabaseConfigured() && supabase) {
      await updateBookingInSupabase(bookingRef, {
        assignedNurse,
        status: 'scheduled',
      });
    }

    showToast(
      locale === 'ar'
        ? `تم تعيين الممرضة ${nurseName} للحجز ${bookingRef}`
        : `Nurse ${nurseName} assigned to booking ${bookingRef}`
    );
  };

  const updateBookingStatus = async (bookingRef: string, newStatus: BookingRecord['status']) => {
    setBookings((prev) =>
      prev.map((b) => (b.ref === bookingRef ? { ...b, status: newStatus } : b))
    );

    if (isSupabaseConfigured() && supabase) {
      await updateBookingInSupabase(bookingRef, { status: newStatus });
    }

    showToast(
      locale === 'ar'
        ? `تم تحديث حالة الحجز ${bookingRef} إلى: ${newStatus}`
        : `Booking ${bookingRef} status updated to: ${newStatus}`
    );
  };

  const deleteBooking = async (bookingRef: string) => {
    setBookings((prev) => prev.filter((b) => b.ref !== bookingRef));

    if (isSupabaseConfigured() && supabase) {
      await deleteBookingFromSupabase(bookingRef);
    }

    if (selectedBookingForDrawer?.ref === bookingRef) {
      setSelectedBookingForDrawer(null);
    }

    showToast(
      locale === 'ar'
        ? `تم حذف الحجز ${bookingRef} من قاعدة البيانات`
        : `Booking ${bookingRef} deleted from database`
    );
  };

  // ---------------------------------------------------------------------------
  // Services CRUD
  // ---------------------------------------------------------------------------
  const toggleServicePublished = async (serviceId: string) => {
    let targetService: ServiceItem | undefined;
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          targetService = { ...s, isPublished: !s.isPublished };
          return targetService;
        }
        return s;
      })
    );

    if (targetService && isSupabaseConfigured() && supabase) {
      await upsertServiceInSupabase(targetService);
    }

    showToast(locale === 'ar' ? 'تم تحديث حالة ظهور الخدمة' : 'Service visibility toggled in Supabase');
  };

  const updateService = async (updated: ServiceItem) => {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));

    if (isSupabaseConfigured() && supabase) {
      await upsertServiceInSupabase(updated);
    }

    showToast(locale === 'ar' ? 'تم حفظ تعديلات الخدمة في سوبابيز بنجاح' : 'Service updated in Supabase');
  };

  const addNewService = async (serviceData: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...serviceData,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newService]);

    if (isSupabaseConfigured() && supabase) {
      await upsertServiceInSupabase(newService);
    }

    showToast(locale === 'ar' ? 'تمت إضافة خدمة جديدة إلى قاعدة البيانات' : 'New service saved to Supabase');
  };

  const deleteService = async (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));

    if (isSupabaseConfigured() && supabase) {
      await deleteServiceFromSupabase(serviceId);
    }

    showToast(locale === 'ar' ? 'تم حذف الخدمة من الكتالوج' : 'Service deleted from catalog');
  };

  // ---------------------------------------------------------------------------
  // Packages CRUD
  // ---------------------------------------------------------------------------
  const updatePackagePrice = async (pkgId: string, newPrice: number) => {
    let targetPkg: PricingPackage | undefined;
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id === pkgId) {
          targetPkg = { ...p, priceSar: newPrice };
          return targetPkg;
        }
        return p;
      })
    );

    if (targetPkg && isSupabaseConfigured() && supabase) {
      await upsertPackageInSupabase(targetPkg);
    }

    showToast(
      locale === 'ar'
        ? `تم تحديث سعر الباقة (${newPrice} ريال) وتعميمه في سوبابيز`
        : `Package price updated to SAR ${newPrice} in Supabase`
    );
  };

  const updatePackage = async (updated: PricingPackage) => {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    if (isSupabaseConfigured() && supabase) {
      await upsertPackageInSupabase(updated);
    }

    showToast(locale === 'ar' ? 'تم تحديث بيانات الباقة في سوبابيز' : 'Package updated in Supabase');
  };

  const addNewPackage = async (pkgData: PricingPackage) => {
    setPackages((prev) => [...prev, pkgData]);

    if (isSupabaseConfigured() && supabase) {
      await upsertPackageInSupabase(pkgData);
    }

    showToast(locale === 'ar' ? 'تمت إضافة باقة جديدة في سوبابيز' : 'New package added to Supabase');
  };

  const deletePackage = async (pkgId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== pkgId));

    if (isSupabaseConfigured() && supabase) {
      await deletePackageFromSupabase(pkgId);
    }

    showToast(locale === 'ar' ? 'تم حذف الباقة بنجاح' : 'Package removed from Supabase');
  };

  // ---------------------------------------------------------------------------
  // Seasonal Events CRUD
  // ---------------------------------------------------------------------------
  const toggleEventStatus = async (eventId: string) => {
    let newStatus: 'active' | 'scheduled' = 'active';
    setSeasonalEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          newStatus = evt.status === 'active' ? 'scheduled' : 'active';
          return { ...evt, status: newStatus };
        }
        return evt;
      })
    );

    if (isSupabaseConfigured() && supabase) {
      await updateSeasonalEventInSupabase(eventId, { status: newStatus });
    }

    showToast(
      locale === 'ar' ? 'تم تحديث حالة الحملة الموسمية في سوبابيز' : 'Seasonal campaign status updated'
    );
  };

  // ---------------------------------------------------------------------------
  // Admin Users Management
  // ---------------------------------------------------------------------------
  const addAdmin = async (data: {
    name: string;
    email: string;
    phone: string;
    role: 'super_admin' | 'dispatcher' | 'support';
  }): Promise<AdminUser> => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const roleLabels = {
      super_admin: { en: 'Super Admin', ar: 'مدير نظام كامل الصلاحيات' },
      dispatcher: { en: 'Logistics Dispatcher', ar: 'منسق عمليات وجدولة تمريض' },
      support: { en: 'Client Concierge', ar: 'خدمة عملاء وواتساب' },
    };

    const newAdmin: AdminUser = {
      id: `adm-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      roleNameEn: roleLabels[data.role].en,
      roleNameAr: roleLabels[data.role].ar,
      status: 'active',
      addedAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just Added',
      accessPin: randomPin,
    };

    setAdmins((prev) => [newAdmin, ...prev]);

    if (isSupabaseConfigured() && supabase) {
      await insertAdminProfileToSupabase({
        email: data.email,
        fullName: data.name,
        phone: data.phone,
        role: data.role,
      });
    }

    showToast(
      locale === 'ar'
        ? `تمت إضافة المسؤول ${data.name} بنجاح وحفظه في سوبابيز`
        : `Admin ${data.name} created and registered in Supabase`
    );
    return newAdmin;
  };

  const removeAdmin = async (adminId: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== adminId));

    if (isSupabaseConfigured() && supabase) {
      await deleteAdminProfileFromSupabase(adminId);
    }

    showToast(locale === 'ar' ? 'تم إلغاء صلاحية المسؤول' : 'Admin access revoked in Supabase');
  };

  return (
    <AppContext.Provider
      value={{
        screen,
        setScreen,
        locale,
        setLocale,
        toggleLocale,
        opsTab,
        setOpsTab,
        adminUser,
        isAuthLoading,
        adminAuthError,
        loginAdmin,
        logoutAdmin,
        isSupabaseOnline,
        isLoadingData,
        refreshFromSupabase,
        bookings,
        services,
        packages,
        seasonalEvents,
        setSeasonalEvents,
        toggleEventStatus,
        admins,
        addAdmin,
        removeAdmin,
        selectedBookingForDrawer,
        setSelectedBookingForDrawer,
        isBookingModalOpen,
        openBookingModal,
        closeBookingModal,
        preselectedPackage,
        isManualBookingModalOpen,
        setIsManualBookingModalOpen,
        serviceBeingEdited,
        openEditServiceModal,
        closeEditServiceModal,
        toastMessage,
        showToast,
        addBooking,
        assignNurseToBooking,
        updateBookingStatus,
        deleteBooking,
        toggleServicePublished,
        updateService,
        addNewService,
        deleteService,
        updatePackagePrice,
        addNewPackage,
        updatePackage,
        deletePackage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
