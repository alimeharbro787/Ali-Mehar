import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BookingRecord, ServiceItem, PricingPackage, SeasonalEvent, AdminUser } from '../types';
import {
  INITIAL_BOOKINGS,
  INITIAL_SERVICES,
  INITIAL_PACKAGES,
  INITIAL_SEASONAL_EVENTS,
  INITIAL_ADMINS,
} from '../data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 10 &&
    !supabaseUrl.includes('your-project-id') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 20 &&
    !supabaseAnonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  );
};

// Create the Supabase client instance (or null/dummy client if not configured)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  url: string;
  hasAnonKey: boolean;
}

export const getSupabaseConfigStatus = (): SupabaseConfigStatus => {
  return {
    isConfigured: isSupabaseConfigured(),
    url: supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, '').split('.')[0] + '...' : '',
    hasAnonKey: !!supabaseAnonKey && supabaseAnonKey.length > 20,
  };
};

// -----------------------------------------------------------------------------
// Database Mapping Helpers
// -----------------------------------------------------------------------------

function mapBookingFromDb(row: any): BookingRecord {
  return {
    id: row.id || `bk-${Date.now()}`,
    ref: row.ref,
    familyName: row.family_name,
    clientPhone: row.client_phone,
    isVip: !!row.is_vip,
    vipTier: row.vip_tier || undefined,
    serviceCategory: row.service_category || 'Newborn Care',
    serviceTitle: row.service_title,
    scheduleTitle: row.schedule_title,
    shiftDuration: row.shift_duration,
    shiftType: row.shift_type || 'night',
    district: row.district || 'Al-Nakheel',
    assignedNurse: row.assigned_nurse || null,
    status: row.status || 'scheduled',
    vitals: row.vitals || undefined,
    urgentDispatch: !!row.urgent_dispatch,
    notes: row.notes || '',
    startDate: row.start_date || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapBookingToDb(b: Partial<BookingRecord>): any {
  return {
    ref: b.ref,
    family_name: b.familyName,
    client_phone: b.clientPhone,
    is_vip: b.isVip ?? false,
    vip_tier: b.vipTier ?? null,
    service_category: b.serviceCategory || 'Newborn Care',
    service_title: b.serviceTitle,
    schedule_title: b.scheduleTitle,
    shift_duration: b.shiftDuration,
    shift_type: b.shiftType || 'night',
    district: b.district || 'Al-Nakheel',
    assigned_nurse: b.assignedNurse ?? null,
    status: b.status || 'scheduled',
    vitals: b.vitals ?? null,
    urgent_dispatch: b.urgentDispatch ?? false,
    notes: b.notes ?? '',
    start_date: b.startDate ?? '',
  };
}

function mapServiceFromDb(row: any): ServiceItem {
  return {
    id: row.id,
    category: row.category,
    titleEn: row.title_en,
    titleAr: row.title_ar,
    subtitleEn: row.subtitle_en,
    subtitleAr: row.subtitle_ar,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar,
    image: row.image,
    badgeEn: row.badge_en || undefined,
    badgeAr: row.badge_ar || undefined,
    shiftsEn: row.shifts_en,
    shiftsAr: row.shifts_ar,
    isPublished: row.is_published ?? true,
  };
}

function mapServiceToDb(s: ServiceItem): any {
  return {
    id: s.id,
    category: s.category,
    title_en: s.titleEn,
    title_ar: s.titleAr,
    subtitle_en: s.subtitleEn,
    subtitle_ar: s.subtitleAr,
    description_en: s.descriptionEn,
    description_ar: s.descriptionAr,
    image: s.image,
    badge_en: s.badgeEn || null,
    badge_ar: s.badgeAr || null,
    shifts_en: s.shiftsEn,
    shifts_ar: s.shiftsAr,
    is_published: s.isPublished,
  };
}

function mapPackageFromDb(row: any): PricingPackage {
  return {
    id: row.id,
    code: row.code,
    titleEn: row.title_en,
    titleAr: row.title_ar,
    tierEn: row.tier_en,
    tierAr: row.tier_ar,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar,
    priceSar: Number(row.price_sar),
    billingCadenceEn: row.billing_cadence_en,
    billingCadenceAr: row.billing_cadence_ar,
    shiftNoticeEn: row.shift_notice_en,
    shiftNoticeAr: row.shift_notice_ar,
    inclusionsEn: row.inclusions_en || [],
    inclusionsAr: row.inclusions_ar || [],
    isFeatured: !!row.is_featured,
    badgeTextEn: row.badge_text_en || undefined,
    badgeTextAr: row.badge_text_ar || undefined,
    whatsappPrefillEn: row.whatsapp_prefill_en,
    whatsappPrefillAr: row.whatsapp_prefill_ar,
  };
}

function mapPackageToDb(p: PricingPackage): any {
  return {
    id: p.id,
    code: p.code,
    title_en: p.titleEn,
    title_ar: p.titleAr,
    tier_en: p.tierEn,
    tier_ar: p.tierAr,
    description_en: p.descriptionEn,
    description_ar: p.descriptionAr,
    price_sar: p.priceSar,
    billing_cadence_en: p.billingCadenceEn,
    billing_cadence_ar: p.billingCadenceAr,
    shift_notice_en: p.shiftNoticeEn,
    shift_notice_ar: p.shiftNoticeAr,
    inclusions_en: p.inclusionsEn,
    inclusions_ar: p.inclusionsAr,
    is_featured: p.isFeatured ?? false,
    badge_text_en: p.badgeTextEn || null,
    badge_text_ar: p.badgeTextAr || null,
    whatsapp_prefill_en: p.whatsappPrefillEn,
    whatsapp_prefill_ar: p.whatsappPrefillAr,
  };
}

function mapEventFromDb(row: any): SeasonalEvent {
  return {
    id: row.id,
    titleEn: row.title_en,
    titleAr: row.title_ar,
    hijriWindowEn: row.hijri_window_en,
    hijriWindowAr: row.hijri_window_ar,
    gregorianWindowEn: row.gregorian_window_en,
    gregorianWindowAr: row.gregorian_window_ar,
    status: row.status,
    perkEn: row.perk_en,
    perkAr: row.perk_ar,
    priority: row.priority || 'High Demand',
    icon: row.icon || undefined,
    badgeEn: row.badge_en || undefined,
    badgeAr: row.badge_ar || undefined,
    descriptionEn: row.description_en || undefined,
    descriptionAr: row.description_ar || undefined,
    featuresEn: row.features_en || [],
    featuresAr: row.features_ar || [],
    priceSar: row.price_sar ? Number(row.price_sar) : undefined,
    whatsappPrefillEn: row.whatsapp_prefill_en || undefined,
    whatsappPrefillAr: row.whatsapp_prefill_ar || undefined,
  };
}

// -----------------------------------------------------------------------------
// Real Supabase Operations
// -----------------------------------------------------------------------------

export async function fetchBookingsFromSupabase(): Promise<BookingRecord[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('aman_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch bookings error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map(mapBookingFromDb);
    }
    return [];
  } catch (err) {
    console.warn('Supabase fetch bookings exception:', err);
    return null;
  }
}

export async function insertBookingToSupabase(booking: BookingRecord): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = mapBookingToDb(booking);
    const { error } = await supabase.from('aman_bookings').insert([payload]);
    if (error) {
      console.warn('Supabase insert booking error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert booking exception:', err);
    return false;
  }
}

export async function updateBookingInSupabase(ref: string, updates: Partial<BookingRecord>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.assignedNurse !== undefined) payload.assigned_nurse = updates.assignedNurse;
    if (updates.vitals !== undefined) payload.vitals = updates.vitals;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.urgentDispatch !== undefined) payload.urgent_dispatch = updates.urgentDispatch;
    if (updates.district !== undefined) payload.district = updates.district;

    const { error } = await supabase
      .from('aman_bookings')
      .update(payload)
      .eq('ref', ref);

    if (error) {
      console.warn('Supabase update booking error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update booking exception:', err);
    return false;
  }
}

export async function deleteBookingFromSupabase(ref: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('aman_bookings')
      .delete()
      .eq('ref', ref);

    if (error) {
      console.warn('Supabase delete booking error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete booking exception:', err);
    return false;
  }
}

export async function fetchServicesFromSupabase(): Promise<ServiceItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('aman_services')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch services error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map(mapServiceFromDb);
    }
    return [];
  } catch (err) {
    console.warn('Supabase fetch services exception:', err);
    return null;
  }
}

export async function upsertServiceInSupabase(service: ServiceItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = mapServiceToDb(service);
    const { error } = await supabase
      .from('aman_services')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert service error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsert service exception:', err);
    return false;
  }
}

export async function deleteServiceFromSupabase(serviceId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('aman_services')
      .delete()
      .eq('id', serviceId);

    if (error) {
      console.warn('Supabase delete service error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete service exception:', err);
    return false;
  }
}

export async function fetchPackagesFromSupabase(): Promise<PricingPackage[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('aman_packages')
      .select('*')
      .order('price_sar', { ascending: true });

    if (error) {
      console.warn('Supabase fetch packages error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map(mapPackageFromDb);
    }
    return [];
  } catch (err) {
    console.warn('Supabase fetch packages exception:', err);
    return null;
  }
}

export async function upsertPackageInSupabase(pkg: PricingPackage): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = mapPackageToDb(pkg);
    const { error } = await supabase
      .from('aman_packages')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase upsert package error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsert package exception:', err);
    return false;
  }
}

export async function deletePackageFromSupabase(pkgId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('aman_packages')
      .delete()
      .eq('id', pkgId);

    if (error) {
      console.warn('Supabase delete package error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete package exception:', err);
    return false;
  }
}

export async function fetchSeasonalEventsFromSupabase(): Promise<SeasonalEvent[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('aman_seasonal_events')
      .select('*');

    if (error) {
      console.warn('Supabase fetch seasonal events error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      return data.map(mapEventFromDb);
    }
    return [];
  } catch (err) {
    console.warn('Supabase fetch seasonal events exception:', err);
    return null;
  }
}

export async function updateSeasonalEventInSupabase(
  eventId: string,
  updates: Partial<{ status: 'active' | 'scheduled' | 'draft'; priceSar: number }>
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: any = {};
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priceSar !== undefined) payload.price_sar = updates.priceSar;

    const { error } = await supabase
      .from('aman_seasonal_events')
      .update(payload)
      .eq('id', eventId);

    if (error) {
      console.warn('Supabase update event error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase update event exception:', err);
    return false;
  }
}

export async function fetchAdminProfilesFromSupabase(): Promise<AdminUser[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('aman_admin_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch admins error:', error.message);
      return null;
    }
    if (data && data.length > 0) {
      const roleLabels: Record<string, { en: string; ar: string }> = {
        super_admin: { en: 'Super Admin', ar: 'مدير نظام كامل الصلاحيات' },
        dispatcher: { en: 'Logistics Dispatcher', ar: 'منسق عمليات وجدولة تمريض' },
        support: { en: 'Client Concierge', ar: 'خدمة عملاء وواتساب' },
      };

      return data.map((row: any) => ({
        id: row.id,
        name: row.full_name,
        email: row.email,
        phone: row.phone || '+966 59 500 2539',
        role: row.role as 'super_admin' | 'dispatcher' | 'support',
        roleNameEn: roleLabels[row.role]?.en || 'Administrator',
        roleNameAr: roleLabels[row.role]?.ar || 'مسؤول عمليات',
        status: row.is_active ? 'active' : 'invited',
        addedAt: row.created_at ? row.created_at.split('T')[0] : '2026-03-01',
        lastActive: 'Connected',
        accessPin: 'AUTH',
      }));
    }
    return [];
  } catch (err) {
    console.warn('Supabase fetch admins exception:', err);
    return null;
  }
}

export async function insertAdminProfileToSupabase(profile: {
  email: string;
  fullName: string;
  phone: string;
  role: 'super_admin' | 'dispatcher' | 'support';
}): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('aman_admin_profiles').insert([
      {
        email: profile.email,
        full_name: profile.fullName,
        phone: profile.phone,
        role: profile.role,
        is_active: true,
      },
    ]);
    if (error) {
      console.warn('Supabase insert admin profile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert admin profile exception:', err);
    return false;
  }
}

export async function deleteAdminProfileFromSupabase(adminId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('aman_admin_profiles')
      .delete()
      .eq('id', adminId);

    if (error) {
      console.warn('Supabase delete admin profile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete admin profile exception:', err);
    return false;
  }
}
