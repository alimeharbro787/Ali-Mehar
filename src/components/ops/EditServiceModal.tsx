import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export const EditServiceModal: React.FC = () => {
  const {
    serviceBeingEdited,
    closeEditServiceModal,
    updateService,
    addNewService,
    deleteService,
    locale,
  } = useApp();
  const isAr = locale === 'ar';

  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [category, setCategory] = useState<'newborn' | 'lifestyle'>('newborn');
  const [shiftsEn, setShiftsEn] = useState('');
  const [shiftsAr, setShiftsAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const isEditing = !!serviceBeingEdited;

  useEffect(() => {
    if (serviceBeingEdited) {
      setTitleEn(serviceBeingEdited.titleEn);
      setTitleAr(serviceBeingEdited.titleAr);
      setSubtitleEn(serviceBeingEdited.subtitleEn);
      setSubtitleAr(serviceBeingEdited.subtitleAr);
      setDescEn(serviceBeingEdited.descriptionEn);
      setDescAr(serviceBeingEdited.descriptionAr);
      setCategory(serviceBeingEdited.category);
      setShiftsEn(serviceBeingEdited.shiftsEn);
      setShiftsAr(serviceBeingEdited.shiftsAr);
      setImageUrl(serviceBeingEdited.image);
    } else {
      setTitleEn('');
      setTitleAr('');
      setSubtitleEn('Safe • Gentle • Loving');
      setSubtitleAr('آمنة • رقيقة • مفعمة بالحب');
      setDescEn('');
      setDescAr('');
      setCategory('newborn');
      setShiftsEn('Riyadh 24/7 Coverage');
      setShiftsAr('تغطية 24/7 في الرياض');
      setImageUrl(
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCTEAd02MjrNskCW-WXmiWKgfZmjOTeO3oJn7sYED2_6Jsg1eB8uttfq8HLDvTpp_aLVYYlLuqg0fE7C54yqsrHsWH4NJRILjpZkcUV7yRZnaEVmWpu80jHODyiXhhUl_se73OkUNKmKh27k3KcFEEqWiD0d0vuLMw7oIplbkh3453VCOqE52Katw2pqVzOq-2cjYikYILZjtUjA8OEIPYFWDgITjtzOx3JN_wpNVSHpLji6FUEC7WkVQ'
      );
    }
  }, [serviceBeingEdited]);

  // If serviceBeingEdited is not open (either editing or new), don't render
  // Note: we can use a separate flag or open with a null service for new
  // Let's check AppContext openEditServiceModal signature: `serviceBeingEdited !== undefined`
  // In AppContext: `const [serviceBeingEdited, setServiceBeingEdited] = useState<ServiceItem | null>(null);`
  // Wait, if it's null it means closed! Let's allow `isNewModalOpen` or pass a sentinel object.
  // Let's check how openEditServiceModal works. If serviceBeingEdited is null, it's closed.
  // Let's create an explicit check.

  if (!serviceBeingEdited) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serviceBeingEdited.id && serviceBeingEdited.id !== 'new') {
      updateService({
        ...serviceBeingEdited,
        titleEn,
        titleAr,
        subtitleEn,
        subtitleAr,
        descriptionEn: descEn,
        descriptionAr: descAr,
        category,
        shiftsEn,
        shiftsAr,
        image: imageUrl || serviceBeingEdited.image,
      });
    } else {
      addNewService({
        titleEn: titleEn || 'New Care Offering',
        titleAr: titleAr || 'خدمة رعاية جديدة',
        subtitleEn,
        subtitleAr,
        descriptionEn: descEn || 'Professional care in Riyadh',
        descriptionAr: descAr || 'رعاية متخصصة بالرياض',
        category,
        shiftsEn,
        shiftsAr,
        image: imageUrl,
        isPublished: true,
      });
    }
    closeEditServiceModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-[#064E3B] flex items-center justify-center font-bold">
              🛠️
            </span>
            <h3 className="font-serif-title text-xl font-bold text-[#064E3B]">
              {isEditing && serviceBeingEdited.id !== 'new'
                ? isAr
                  ? `تعديل خدمة: ${serviceBeingEdited.titleAr}`
                  : `Edit Service: ${serviceBeingEdited.titleEn}`
                : isAr
                ? 'إضافة خدمة جديدة إلى الكتالوج'
                : 'Create New Catalog Service'}
            </h3>
          </div>
          <button
            onClick={closeEditServiceModal}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isAr ? 'اسم الخدمة (بالإنجليزية) *' : 'Service Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isAr ? 'اسم الخدمة (بالعربية) *' : 'Service Name (Arabic) *'}
              </label>
              <input
                type="text"
                required
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'تصنيف الخدمة' : 'Category Classification'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
            >
              <option value="newborn">{isAr ? 'رعاية حديثي الولادة' : 'Newborn Care at Home'}</option>
              <option value="lifestyle">{isAr ? 'خدمات نمط الحياة والمنزل' : 'Home & Lifestyle Services'}</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isAr ? 'العبارة الترويجية (EN)' : 'Tagline / Badge (EN)'}
              </label>
              <input
                type="text"
                value={subtitleEn}
                onChange={(e) => setSubtitleEn(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                {isAr ? 'العبارة الترويجية (AR)' : 'Tagline / Badge (AR)'}
              </label>
              <input
                type="text"
                value={subtitleAr}
                onChange={(e) => setSubtitleAr(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'الوصف التحريري (بالإنجليزية)' : 'Description (English)'}
            </label>
            <textarea
              rows={2}
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'الوصف التحريري (بالعربية)' : 'Description (Arabic)'}
            </label>
            <textarea
              rows={2}
              value={descAr}
              onChange={(e) => setDescAr(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              {isAr ? 'المناوبات المتاحة بالرياض' : 'Riyadh Operational Shifts Available'}
            </label>
            <input
              type="text"
              value={shiftsEn}
              onChange={(e) => setShiftsEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
            {isEditing && serviceBeingEdited.id !== 'new' ? (
              <button
                type="button"
                onClick={async () => {
                  if (
                    window.confirm(
                      isAr
                        ? `هل أنت متأكد من حذف خدمة "${serviceBeingEdited.titleAr}" نهائياً من سوبابيز؟`
                        : `Are you sure you want to permanently delete "${serviceBeingEdited.titleEn}"?`
                    )
                  ) {
                    await deleteService(serviceBeingEdited.id);
                    closeEditServiceModal();
                  }
                }}
                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors"
              >
                {isAr ? '🗑️ حذف الخدمة' : '🗑️ Delete Service'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeEditServiceModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#064E3B] hover:bg-[#003527] text-white font-bold transition-all shadow-sm"
              >
                {isAr ? 'حفظ ونشر التعديلات' : 'Save & Publish to Web'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
