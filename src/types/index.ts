export type Locale = 'en' | 'ar';
export type ScreenMode = 'public' | 'ops';
export type OpsTab = 'bookings' | 'services' | 'pricing' | 'events' | 'location' | 'admins' | 'security';

export interface AssignedNurse {
  name: string;
  initials: string;
  credential: string;
  phone?: string;
}

export interface InfantVitals {
  lastFeedingTime?: string;
  lastFeedingAmount?: string;
  sleepDuration?: string;
  temperature?: string;
  cordCareStatus?: string;
  notes?: string;
}

export interface BookingRecord {
  id: string;
  ref: string;
  familyName: string;
  clientPhone: string;
  isVip?: boolean;
  vipTier?: string;
  serviceCategory: string;
  serviceTitle: string;
  scheduleTitle: string;
  shiftDuration: string;
  shiftType: 'night' | 'day' | 'livein';
  district: string;
  assignedNurse: AssignedNurse | null;
  status: 'in_progress' | 'scheduled' | 'urgent' | 'contract_active' | 'completed';
  vitals?: InfantVitals;
  urgentDispatch?: boolean;
  notes?: string;
  startDate?: string;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  category: 'newborn' | 'lifestyle';
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  image: string;
  badgeEn?: string;
  badgeAr?: string;
  shiftsEn: string;
  shiftsAr: string;
  isPublished: boolean;
}

export interface PricingPackage {
  id: string;
  code: string;
  titleEn: string;
  titleAr: string;
  tierEn: string;
  tierAr: string;
  descriptionEn: string;
  descriptionAr: string;
  priceSar: number;
  billingCadenceEn: string;
  billingCadenceAr: string;
  shiftNoticeEn: string;
  shiftNoticeAr: string;
  inclusionsEn: string[];
  inclusionsAr: string[];
  isFeatured?: boolean;
  badgeTextEn?: string;
  badgeTextAr?: string;
  whatsappPrefillEn: string;
  whatsappPrefillAr: string;
}

export interface FaqItem {
  id: string;
  qEn: string;
  qAr: string;
  aEn: string;
  aAr: string;
}

export interface SeasonalEvent {
  id: string;
  titleEn: string;
  titleAr: string;
  hijriWindowEn: string;
  hijriWindowAr: string;
  gregorianWindowEn: string;
  gregorianWindowAr: string;
  status: 'active' | 'scheduled' | 'draft';
  perkEn: string;
  perkAr: string;
  priority: string;
  icon?: string;
  badgeEn?: string;
  badgeAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  featuresEn?: string[];
  featuresAr?: string[];
  priceSar?: number;
  whatsappPrefillEn?: string;
  whatsappPrefillAr?: string;
}

export interface TestimonialItem {
  id: string;
  authorEn: string;
  authorAr: string;
  initials: string;
  districtEn: string;
  districtAr: string;
  reviewEn: string;
  reviewAr: string;
  rating: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'dispatcher' | 'support';
  roleNameEn: string;
  roleNameAr: string;
  status: 'active' | 'invited';
  addedAt: string;
  lastActive: string;
  accessPin: string;
}
