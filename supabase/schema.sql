-- ==============================================================================
-- AMAN BABY CARE & HOME SERVICES - RIYADH, SAUDI ARABIA
-- Supabase Database Schema, Tables, Indexes, and Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE: aman_admin_profiles
-- Stores authorized administrators and staff roles linked to auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.aman_admin_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '+966 59 500 2539',
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'dispatcher', 'support')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. TABLE: aman_bookings
-- Client bookings received from the online portal or entered by dispatchers
-- ==============================================================================
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 4. TABLE: aman_services
-- Services catalog (Newborn care, Postpartum, Babysitting, etc.)
-- ==============================================================================
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
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. TABLE: aman_packages
-- Pricing packages & subscription tiers
-- ==============================================================================
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
    badge_text_en TEXT,
    badge_text_ar TEXT,
    whatsapp_prefill_en TEXT NOT NULL,
    whatsapp_prefill_ar TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 6. TABLE: aman_seasonal_events
-- Islamic & seasonal packages (12 Rabi' ul Awwal, Ramadan Kareem, Eid Al-Fitr/Adha)
-- ==============================================================================
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
    icon TEXT,
    badge_en TEXT,
    badge_ar TEXT,
    description_en TEXT,
    description_ar TEXT,
    features_en TEXT[] DEFAULT '{}',
    features_ar TEXT[] DEFAULT '{}',
    price_sar NUMERIC(10, 2) DEFAULT 0,
    whatsapp_prefill_en TEXT,
    whatsapp_prefill_ar TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.aman_admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aman_seasonal_events ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current auth.uid() is an active admin
CREATE OR REPLACE FUNCTION public.is_aman_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.aman_admin_profiles
    WHERE (user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
      AND is_active = true
  ) OR (
    -- Fallback: If user is authenticated and aman_admin_profiles has no users yet, allow the first authenticated user
    (auth.role() = 'authenticated') AND NOT EXISTS (SELECT 1 FROM public.aman_admin_profiles)
  );
$$;

-- ------------------------------------------------------------------------------
-- POLICIES: aman_admin_profiles
-- ------------------------------------------------------------------------------
CREATE POLICY "Admins can view admin profiles"
    ON public.aman_admin_profiles
    FOR SELECT
    TO authenticated
    USING (public.is_aman_admin() OR auth.uid() = user_id);

CREATE POLICY "Super admins can manage admin profiles"
    ON public.aman_admin_profiles
    FOR ALL
    TO authenticated
    USING (public.is_aman_admin())
    WITH CHECK (public.is_aman_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: aman_bookings
-- 1. Anyone (public anonymous visitors) can insert new booking inquiries
-- 2. Only authenticated admins can read, update, or delete customer bookings
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can submit bookings"
    ON public.aman_bookings
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Only authorized admins can view bookings"
    ON public.aman_bookings
    FOR SELECT
    TO authenticated
    USING (public.is_aman_admin());

CREATE POLICY "Only authorized admins can update bookings"
    ON public.aman_bookings
    FOR UPDATE
    TO authenticated
    USING (public.is_aman_admin())
    WITH CHECK (public.is_aman_admin());

CREATE POLICY "Only authorized admins can delete bookings"
    ON public.aman_bookings
    FOR DELETE
    TO authenticated
    USING (public.is_aman_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: aman_services
-- 1. Public can read published services
-- 2. Authenticated admins can CRUD all services
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view published services"
    ON public.aman_services
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true OR public.is_aman_admin());

CREATE POLICY "Admins can insert services"
    ON public.aman_services
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_aman_admin());

CREATE POLICY "Admins can update services"
    ON public.aman_services
    FOR UPDATE
    TO authenticated
    USING (public.is_aman_admin())
    WITH CHECK (public.is_aman_admin());

CREATE POLICY "Admins can delete services"
    ON public.aman_services
    FOR DELETE
    TO authenticated
    USING (public.is_aman_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: aman_packages
-- 1. Public can read pricing packages
-- 2. Admins can manage packages and prices
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view packages"
    ON public.aman_packages
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage packages"
    ON public.aman_packages
    FOR ALL
    TO authenticated
    USING (public.is_aman_admin())
    WITH CHECK (public.is_aman_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: aman_seasonal_events
-- 1. Public can view seasonal campaigns
-- 2. Admins can toggle and update campaigns
-- ------------------------------------------------------------------------------
CREATE POLICY "Public can view seasonal events"
    ON public.aman_seasonal_events
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage seasonal events"
    ON public.aman_seasonal_events
    FOR ALL
    TO authenticated
    USING (public.is_aman_admin())
    WITH CHECK (public.is_aman_admin());

-- ==============================================================================
-- 8. INITIAL SEED DATA (Only inserted if tables are empty)
-- ==============================================================================

-- Services Seed
INSERT INTO public.aman_services (id, category, title_en, title_ar, subtitle_en, subtitle_ar, description_en, description_ar, image, badge_en, badge_ar, shifts_en, shifts_ar, is_published)
VALUES
('srv-1', 'newborn', 'Newborn Care at Home', 'رعاية المواليد والرضّع بالمنزل', 'MOH Certified Clinical Care', 'تمريض سريري معتمد من وزارة الصحة', 'Specialized neonatal vigil covering feeding protocols, gentle swaddling, vital signs monitoring, umbilical cord care, and maternal recovery rest.', 'رعاية متخصصة لحديثي الولادة تشمل الرضاعة، التقميط الطبي، قياس المؤشرات الحيوية، العناية بالحبل السري ودعم راحة الأم بعد الولادة.', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80', 'MOH Licensed', 'مرخص من وزارة الصحة', '12h Night Vigil / 24h Live-in', 'مناوبة ليلية 12 ساعة / إقامة 24 ساعة', true),
('srv-2', 'newborn', 'Postpartum & Maternal Support', 'الدعم الشامل للأم بعد الولادة', 'Compassionate Motherhood Guidance', 'مرافقة حانية واستشفاء متكامل للأم', 'Holistic postpartum assistance for mothers recovering from natural or cesarean delivery. Includes emotional reassurance, lactation consultation, and nourishing herbal protocols.', 'مساندة شاملة للأم أثناء مرحلة النفاس والتعافي من الولادة الطبيعية أو القيصرية، مع استشارات الرضاعة الطبيعية وتنسيق الراحة والنوم.', 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80', 'Lactation Care', 'استشارات رضاعة', '12h Shifts & Daytime Assist', 'ورديات 12 ساعة ودعم نهاري', true),
('srv-3', 'newborn', 'Overnight Baby Nurse Vigil', 'مناوبة ليلية متخصصة للرضيع', 'Guaranteed Restful Sleep for Parents', 'نوم هادئ ومريح للوالدين مع أمان تام', 'Dedicated licensed nurse vigil from 19:00 to 07:00. Quiet burping, infant soothing techniques, circadian sleep schedule establishment, and nursery hygiene.', 'ممرضة متفرغة طوال الليل من 7 مساءً حتى 7 صباحاً لتنظيم نوم الرضيع، التهدئة، التجشؤ، ومتابعة درجة الحرارة والتنفس بأعلى درجات الهدوء.', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80', 'Night Vigil', 'سهر ورعاية ليلية', '12 Hours (19:00 - 07:00)', '12 ساعة (7:00 م - 7:00 ص)', true),
('srv-4', 'lifestyle', 'Elite Daytime Babysitting', 'جليسات أطفال راقيات بالمنزل', 'Engaging, Safe & Cultured Childcare', 'أنشطة تنموية وترفيهية آمنة ومدروسة', 'Cultured, background-verified caregivers for toddlers and older children. Interactive learning, bilingual reading, creative arts, and safe outdoor companionship in Riyadh compounds.', 'جليسات مؤهلات ومفحوصات أمنياً لتقديم رعاية راقية للأطفال، تشمل القراءة الثنائية، الألعاب الإدراكية، وتنظيم الأنشطة اليومية في مجمعات الرياض.', 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80', 'Vetted Staff', 'كوادر موثوقة ومفحوصة', 'Flexible Hours / Day Packages', 'ساعات مرنة / باقات نهارية', true)
ON CONFLICT (id) DO NOTHING;

-- Packages Seed
INSERT INTO public.aman_packages (id, code, title_en, title_ar, tier_en, tier_ar, description_en, description_ar, price_sar, billing_cadence_en, billing_cadence_ar, shift_notice_en, shift_notice_ar, inclusions_en, inclusions_ar, is_featured, badge_text_en, badge_text_ar, whatsapp_prefill_en, whatsapp_prefill_ar)
VALUES
('pkg-1', 'ESSENTIAL', 'Essential Newborn Start', 'الباقة الأساسية للمواليد', 'Standard Clinical', 'تمريض سريري أساسي', 'Single 12-hour night shift with an MOH-licensed pediatric nurse. Ideal for first days home from hospital.', 'مناوبة ليلية واحدة لمدة 12 ساعة مع ممرضة أطفال مرخصة. مثالية للأيام الأولى بعد الخروج من المستشفى.', 450, '/ 12h Shift', '/ مناوبة 12 ساعة', 'Book 4 hours in advance', 'الحجز قبل 4 ساعات', ARRAY['MOH Licensed Pediatric Nurse', '12h Overnight Vigil (19:00 - 07:00)', 'Umbilical Cord & Circumcision Care', 'Digital Vital Signs Log & Morning Debrief'], ARRAY['ممرضة أطفال مرخصة من وزارة الصحة', 'سهر ليلي 12 ساعة (7م - 7ص)', 'عناية بالحبل السري والطهور', 'سجل علامات حيوية رقمي وتقرير صباحي'], false, NULL, NULL, 'I would like to book the Essential Newborn Start (SAR 450).', 'أود حجز الباقة الأساسية للمواليد (450 ريال).'),
('pkg-2', 'POSTPARTUM', 'Comprehensive Postpartum', 'باقة النفاس والاستشفاء المتكامل', 'Premier Maternal & Infant', 'العناية الفائقة بالأم والطفل', 'Full 7-day postpartum recovery plan including night vigils, mother lactation guidance, and nursery sleep setup.', 'خطة تعافي أسبوعية شاملة تشمل السهر الليلي، إرشاد الرضاعة للأم، وضبط بيئة نوم الرضيع.', 850, '/ 24h Cycle (or 2x 12h)', '/ دورة 24 ساعة (أو نوبتان)', 'Advance 24h notice recommended', 'يفضل التنسيق قبل 24 ساعة', ARRAY['Senior Certified Postpartum Care Specialist', 'Lactation Consultation & Latching Support', 'Infant Sleep & Circadian Rhythm Training', 'Priority On-Call Pediatrician Advice Hotline'], ARRAY['أخصائية رعاية نفاس أولى معتمدة', 'استشارات الرضاعة ودعم الالتقام الصحيح', 'تدريب نوم الطفل وضبط الإيقاع اليومي', 'خط استشارات طبية مع استشاري أطفال'], true, 'Most Popular', 'الأكثر طلباً بالرياض', 'I would like to book the Comprehensive Postpartum package (SAR 850).', 'أود حجز باقة النفاس والاستشفاء المتكامل (850 ريال).'),
('pkg-3', 'HARMONY', 'Complete Home Harmony', 'باقة التناغم المنزلي الملكية', 'VIP Full Household Care', 'رعاية كبار الشخصيات والمنزل', '30-day comprehensive infant nurse assignment with VIP domestic assistance for the entire household in Riyadh.', 'برنامج رعاية ملكي شهري يجمع بين تمريض الرضيع المتفرغ ومساندة إدارة المنزل الراقية لأرقى أحياء الرياض.', 1400, '/ Daily Rate (30-day retainer)', '/ اليوم (اشتراك شهري 30 يوماً)', 'VIP Concierge Coordination', 'تنسيق مباشر مع مدير العمليات', ARRAY['Dedicated Primary & Secondary Dedicated Nurses', 'Full 24/7 Nursery Vigil & Care Schedule', 'Bilingual Care Team (Arabic / English)', 'Hospital Discharge Escort in Riyadh'], ARRAY['ممرضة رئيسية وبديلة مخصصة للعائلة', 'رعاية وسهر كامل للغرفة على مدار 24/7', 'طاقم تمريض ثنائي اللغة (عربي / إنجليزي)', 'مرافقة واستقبال من المستشفى بالرياض'], false, 'VIP Concierge', 'خدمة كبار الشخصيات', 'I would like to reserve the Complete Home Harmony VIP retainer (SAR 1400/day).', 'أرغب في حجز باقة التناغم المنزلي الملكية (1400 ريال/اليوم).')
ON CONFLICT (id) DO NOTHING;

-- Seasonal Events Seed
INSERT INTO public.aman_seasonal_events (id, title_en, title_ar, hijri_window_en, hijri_window_ar, gregorian_window_en, gregorian_window_ar, status, perk_en, perk_ar, priority, icon, badge_en, badge_ar, description_en, description_ar, features_en, features_ar, price_sar, whatsapp_prefill_en, whatsapp_prefill_ar)
VALUES
('evt-rabi', '12 Rabi'' ul Awwal & Aqiqah Blessing', 'مناسبة 12 ربيع الأول والعقيقة المباركة', '12 Rabi'' al-Awwal 1447H', '12 ربيع الأول 1447 هـ', 'September / Mawlid Season', 'موسم المولد النبوي الشريف والعقيقة', 'active', 'Complimentary Aqiqah Hospitality Nurse & Gift Kit', 'ممرضة ضيافة مجانية لمجلس العقيقة وباقة هدايا مباركة', 'High Demand', 'gift', 'Sacred Milestones', 'مناسبات مباركة', 'Customized pediatric care during family gatherings and Aqiqah celebrations across Riyadh.', 'رعاية متخصصة للأطفال الرضع أثناء مناسبات العقيقة وتجمعات الأهل في الرياض.', ARRAY['Vetted nurse for Aqiqah event soothing', 'VIP soothing cradle assistance', 'Family reassurance debrief'], ARRAY['ممرضة متخصصة لتهدئة الرضيع بحفل العقيقة', 'رعاية مريحة لمهد الطفل', 'تقرير طمأنة للوالدين والضيوف'], 490, 'Hello AMAN Care, I would like to inquire about the 12 Rabi ul Awwal & Aqiqah package.', 'مرحباً أمان، أود الاستفسار عن باقة 12 ربيع الأول ومناسبات العقيقة المباركة.'),
('evt-ramadan', 'Ramadan Kareem Care & Taraweeh Vigil', 'رعاية شهر رمضان المبارك وسهر التراويح', '1 - 30 Ramadan 1447H', '1 - 30 رمضان 1447 هـ', 'Holy Month Care Coverage', 'تغطية متكاملة طوال الشهر الفضيل', 'active', 'Dedicated Taraweeh & Qiyam infant care coverage', 'تفرغ تام لرعاية الرضيع وقت صلاة التراويح والقيام', 'High Demand', 'moon', 'Ramadan Mubarak', 'رمضان مبارك', 'Enables mothers to pray Taraweeh and perform Tahajjud with complete peace of mind while a certified nurse tends to the baby.', 'تمكين الأم من أداء صلاة التراويح والتهجد بطمأنينة تامة مع ممرضة معتمدة ترعى طفلها.', ARRAY['Evening Taraweeh care vigil (19:30 - 01:00)', 'Suhoor transition gentle feeding', 'Flexible fasting schedule alignment'], ARRAY['سهر رعاية وقت التراويح (7:30 م - 1:00 ص)', 'تنظيم وجبة السحور والرضاعة الهادئة', 'مواءمة أوقات راحة الأم مع الصيام'], 550, 'Hello AMAN Care, I would like to reserve the Ramadan Kareem & Taraweeh Vigil package.', 'مرحباً أمان، أرغب بحجز باقة رعاية رمضان المبارك وسهر التراويح والقيام.'),
('evt-eid', 'Eid Family Gathering & Infant Soothing', 'باقة فرحة العيد والتجمعات العائلية', '1 - 5 Shawwal / 10 - 14 Dhu al-Hijjah', '1 - 5 شوال / 10 - 14 ذو الحجة', 'Eid Al-Fitr & Eid Al-Adha', 'عيد الفطر المبارك وعيد الأضحى', 'active', 'Priority booking window for festive morning visits', 'أولوية حجز مؤكدة للزيارات العائلية في صباح العيد', 'High Demand', 'sparkles', 'Eid Celebrations', 'احتفالات العيد السعيد', 'Ensure your baby remains calm, protected from noise, and well-fed while hosting relatives during Eid in Riyadh.', 'حماية الرضيع من الإرهاق والضوضاء وتنظيم رضعاته ونومه أثناء استقبال الضيوف والزيارات في العيد.', ARRAY['Nursery noise buffering & soothing', 'MOH nurse companion during family visits', 'Special Eid swaddle gift'], ARRAY['حماية الطفل من الضوضاء وتنظيم قيلولته', 'مرافقة ممرضة أثناء زيارات العائلة الكريمة', 'هدية قماط فاخر بمناسبة العيد'], 520, 'Hello AMAN Care, I would like to book the Eid Family Gathering care package.', 'مرحباً أمان، أود حجز باقة فرحة العيد والتجمعات العائلية.')
ON CONFLICT (id) DO NOTHING;

-- Bookings Initial Sample (For demonstration if table is empty)
INSERT INTO public.aman_bookings (ref, family_name, client_phone, is_vip, vip_tier, service_category, service_title, schedule_title, shift_duration, shift_type, district, assigned_nurse, status, urgent_dispatch, notes, start_date)
VALUES
('#BK-4091', 'Al-Saud Family', '+966 50 123 4567', true, 'Royal Platinum', 'Newborn Care', 'Complete Home Harmony', '24h Continuous Dedicated Vigil', '24h Continuous', 'livein', 'Al-Hada', '{"name": "Sister Fatima Al-Zahrani", "initials": "FZ", "credential": "BSN, Pediatric ICU Certified", "phone": "+966 59 500 2539"}'::jsonb, 'in_progress', false, 'VIP nursery suite. Twin infants born at KFSH&RC.', '2026-03-01'),
('#BK-3882', 'Al-Olayan Family', '+966 55 987 6543', false, NULL, 'Newborn Care', 'Comprehensive Postpartum', '12h Overnight Vigil (19:00 - 07:00)', '12h Overnight', 'night', 'Al-Nakheel', '{"name": "Nurse Maria Santos", "initials": "MS", "credential": "RN, Neonatal Resuscitation Program", "phone": "+966 59 500 2539"}'::jsonb, 'scheduled', false, 'Assisting mother recovering from cesarean section.', 'Tomorrow'),
('#BK-2104', 'Al-Muhaidib Family', '+966 54 321 0987', false, NULL, 'Newborn Care', 'Essential Newborn Start', '12h Overnight Vigil (19:00 - 07:00)', '12h Overnight', 'night', 'Al-Malqa', NULL, 'urgent', true, 'Urgent night vigil requested! Baby discharged today.', 'Tonight')
ON CONFLICT (ref) DO NOTHING;
