"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Service,
  ServiceSeoAdminPayload,
  ServiceSeoContentSections,
  ServiceSeoFaqItem,
  ServiceSeoRelatedLink,
  ServiceSeoServiceItem,
  ServiceSeoTrustItem
} from "@/lib/types";

type SeoFormState = {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroLead: string;
  heroPointsText: string;
  trustItems: ServiceSeoTrustItem[];
  serviceItems: Array<ServiceSeoServiceItem & { imageAlt: string }>;
  areasText: string;
  relatedLinks: ServiceSeoRelatedLink[];
  ctaTopTitle: string;
  ctaTopDescription: string;
  ctaBottomTitle: string;
  ctaBottomDescription: string;
  heroImage: string;
  beforeImage: string;
  afterImage: string;
  images: string[];
  faq: ServiceSeoFaqItem[];
};

const emptyForm: SeoFormState = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  heroTitle: "",
  heroLead: "",
  heroPointsText: "",
  trustItems: [],
  serviceItems: [],
  areasText: "",
  relatedLinks: [],
  ctaTopTitle: "",
  ctaTopDescription: "",
  ctaBottomTitle: "",
  ctaBottomDescription: "",
  heroImage: "",
  beforeImage: "",
  afterImage: "",
  images: [],
  faq: []
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function normalizeMediaList(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  const flatten = (input: unknown): string[] => {
    if (input === undefined || input === null) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.flatMap((item) => flatten(item));
    }

    const trimmed = String(input).trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed.flatMap((item) => flatten(item));
      }

      if (typeof parsed === "string") {
        const normalized = parsed.trim();
        return normalized ? [normalized] : [];
      }
    } catch {
      // Not JSON, keep value.
    }

    return [trimmed];
  };

  return Array.from(new Set(flatten(value).filter(Boolean)));
}

function normalizeTrustItems(value: unknown): ServiceSeoTrustItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = asString((item as { title?: unknown }).title).trim();
      const description = asString((item as { description?: unknown }).description).trim();

      if (!title && !description) {
        return null;
      }

      return {
        title,
        description
      };
    })
    .filter((item): item is ServiceSeoTrustItem => Boolean(item));
}

function normalizeServiceItems(value: unknown): Array<ServiceSeoServiceItem & { imageAlt: string }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = asString((item as { title?: unknown }).title).trim();
      const description = asString((item as { description?: unknown }).description).trim();
      const imageAlt = asString((item as { imageAlt?: unknown }).imageAlt).trim();

      if (!title && !description && !imageAlt) {
        return null;
      }

      return {
        title,
        description,
        imageAlt
      };
    })
    .filter((item): item is ServiceSeoServiceItem & { imageAlt: string } => Boolean(item));
}

function normalizeRelatedLinks(value: unknown): ServiceSeoRelatedLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = asString((item as { title?: unknown }).title).trim();
      const href = asString((item as { href?: unknown }).href).trim();

      if (!title && !href) {
        return null;
      }

      return {
        title,
        href
      };
    })
    .filter((item): item is ServiceSeoRelatedLink => Boolean(item));
}

function normalizeFaq(value: unknown): ServiceSeoFaqItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const question = asString((item as { question?: unknown }).question).trim();
      const answer = asString((item as { answer?: unknown }).answer).trim();

      if (!question && !answer) {
        return null;
      }

      return {
        question,
        answer
      };
    })
    .filter((item): item is ServiceSeoFaqItem => Boolean(item));
}

function linesToText(value: string[]) {
  return value.join("\n");
}

function textToLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildForm(payload: ServiceSeoAdminPayload): SeoFormState {
  const sections: ServiceSeoContentSections = payload.seoPage.contentSections || {};

  return {
    title: asString(payload.seoPage.title) || asString(payload.service.titleAr),
    slug: asString(payload.seoPage.slug) || asString(payload.service.slug),
    metaTitle: asString(payload.seoPage.metaTitle),
    metaDescription: asString(payload.seoPage.metaDescription),
    heroTitle: asString(sections.heroTitle),
    heroLead: asString(sections.heroLead),
    heroPointsText: linesToText(asStringArray(sections.heroPoints)),
    trustItems: normalizeTrustItems(sections.trustItems),
    serviceItems: normalizeServiceItems(sections.serviceItems),
    areasText: linesToText(asStringArray(sections.areas)),
    relatedLinks: normalizeRelatedLinks(sections.relatedLinks),
    ctaTopTitle: asString(sections.ctaTopTitle),
    ctaTopDescription: asString(sections.ctaTopDescription),
    ctaBottomTitle: asString(sections.ctaBottomTitle),
    ctaBottomDescription: asString(sections.ctaBottomDescription),
    heroImage: asString(sections.heroImage),
    beforeImage: asString(sections.beforeImage),
    afterImage: asString(sections.afterImage),
    images: normalizeMediaList(payload.seoPage.images),
    faq: normalizeFaq(payload.seoPage.faq)
  };
}

type Props = {
  serviceId: string;
};

export default function AdminServiceSeoPage({ serviceId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [service, setService] = useState<Service | null>(null);
  const [form, setForm] = useState<SeoFormState>(emptyForm);

  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [beforeImageFile, setBeforeImageFile] = useState<File | null>(null);
  const [afterImageFile, setAfterImageFile] = useState<File | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const [removeHeroImage, setRemoveHeroImage] = useState(false);
  const [removeBeforeImage, setRemoveBeforeImage] = useState(false);
  const [removeAfterImage, setRemoveAfterImage] = useState(false);

  const heroPreview = useMemo(() => {
    if (heroImageFile) {
      return URL.createObjectURL(heroImageFile);
    }

    if (removeHeroImage) {
      return "";
    }

    return form.heroImage;
  }, [form.heroImage, heroImageFile, removeHeroImage]);

  const beforePreview = useMemo(() => {
    if (beforeImageFile) {
      return URL.createObjectURL(beforeImageFile);
    }

    if (removeBeforeImage) {
      return "";
    }

    return form.beforeImage;
  }, [beforeImageFile, form.beforeImage, removeBeforeImage]);

  const afterPreview = useMemo(() => {
    if (afterImageFile) {
      return URL.createObjectURL(afterImageFile);
    }

    if (removeAfterImage) {
      return "";
    }

    return form.afterImage;
  }, [afterImageFile, form.afterImage, removeAfterImage]);

  const newImagePreviews = useMemo(() => newImageFiles.map((file) => URL.createObjectURL(file)), [newImageFiles]);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/service-seo/${serviceId}`, { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.message || "تعذر تحميل إعدادات صفحة SEO.");
    }

    const typedPayload = payload as ServiceSeoAdminPayload;
    setService(typedPayload.service);
    setForm(buildForm(typedPayload));
    setHeroImageFile(null);
    setBeforeImageFile(null);
    setAfterImageFile(null);
    setNewImageFiles([]);
    setRemoveHeroImage(false);
    setRemoveBeforeImage(false);
    setRemoveAfterImage(false);
    setLoading(false);
  }, [serviceId]);

  useEffect(() => {
    loadPage().catch((err: Error) => {
      setError(err.message || "حدث خطأ أثناء تحميل الصفحة.");
      setLoading(false);
    });
  }, [loadPage]);

  useEffect(() => {
    return () => {
      if (heroImageFile && heroPreview) {
        URL.revokeObjectURL(heroPreview);
      }

      if (beforeImageFile && beforePreview) {
        URL.revokeObjectURL(beforePreview);
      }

      if (afterImageFile && afterPreview) {
        URL.revokeObjectURL(afterPreview);
      }

      newImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [afterImageFile, afterPreview, beforeImageFile, beforePreview, heroImageFile, heroPreview, newImagePreviews]);

  function addTrustItem() {
    setForm((current) => ({
      ...current,
      trustItems: [...current.trustItems, { title: "", description: "" }]
    }));
  }

  function addServiceItem() {
    setForm((current) => ({
      ...current,
      serviceItems: [...current.serviceItems, { title: "", description: "", imageAlt: "" }]
    }));
  }

  function addRelatedLink() {
    setForm((current) => ({
      ...current,
      relatedLinks: [...current.relatedLinks, { title: "", href: "" }]
    }));
  }

  function addFaq() {
    setForm((current) => ({
      ...current,
      faq: [...current.faq, { question: "", answer: "" }]
    }));
  }

  function removeExistingImage(index: number) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index)
    }));
  }

  function removeNewImage(index: number) {
    setNewImageFiles((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();

      formData.append("title", form.title.trim());
      formData.append("slug", form.slug.trim());
      formData.append("metaTitle", form.metaTitle.trim());
      formData.append("metaDescription", form.metaDescription.trim());

      formData.append(
        "contentSections",
        JSON.stringify({
          heroTitle: form.heroTitle.trim(),
          heroLead: form.heroLead.trim(),
          heroPoints: textToLines(form.heroPointsText),
          trustItems: form.trustItems
            .map((item) => ({
              title: item.title.trim(),
              description: item.description.trim()
            }))
            .filter((item) => item.title || item.description),
          serviceItems: form.serviceItems
            .map((item) => ({
              title: item.title.trim(),
              description: item.description.trim(),
              imageAlt: item.imageAlt.trim()
            }))
            .filter((item) => item.title || item.description || item.imageAlt),
          areas: textToLines(form.areasText),
          relatedLinks: form.relatedLinks
            .map((item) => ({
              title: item.title.trim(),
              href: item.href.trim()
            }))
            .filter((item) => item.title || item.href),
          ctaTopTitle: form.ctaTopTitle.trim(),
          ctaTopDescription: form.ctaTopDescription.trim(),
          ctaBottomTitle: form.ctaBottomTitle.trim(),
          ctaBottomDescription: form.ctaBottomDescription.trim()
        })
      );

      formData.append(
        "faq",
        JSON.stringify(
          form.faq
            .map((item) => ({
              question: item.question.trim(),
              answer: item.answer.trim()
            }))
            .filter((item) => item.question && item.answer)
        )
      );

      formData.append("images", JSON.stringify(form.images));

      if (removeHeroImage) {
        formData.append("removeHeroImage", "true");
      }

      if (removeBeforeImage) {
        formData.append("removeBeforeImage", "true");
      }

      if (removeAfterImage) {
        formData.append("removeAfterImage", "true");
      }

      if (heroImageFile) {
        formData.append("heroImage", heroImageFile);
      }

      if (beforeImageFile) {
        formData.append("beforeImage", beforeImageFile);
      }

      if (afterImageFile) {
        formData.append("afterImage", afterImageFile);
      }

      newImageFiles.forEach((file) => formData.append("images", file));

      const response = await fetch(`/api/service-seo/${serviceId}`, {
        method: "PUT",
        body: formData
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.message || "تعذر حفظ الصفحة.");
        setSaving(false);
        return;
      }

      setNotice("تم حفظ صفحة SEO بنجاح.");
      await loadPage();
    } catch {
      setError("تعذر الاتصال بالخادم أثناء حفظ الصفحة.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>إدارة صفحة SEO للخدمة</h1>
        <p>{service ? `الخدمة: ${service.titleAr}` : "إعداد محتوى صفحة الهبوط الخاصة بالخدمة."}</p>
      </header>

      <section className="card admin-actions">
        <Link className="btn btn-outline" href="/admin/services">
          العودة إلى إدارة الخدمات
        </Link>
      </section>

      {notice ? <section className="card admin-notice-box">{notice}</section> : null}
      {error ? <section className="card admin-error-box">{error}</section> : null}
      {loading ? <section className="card admin-empty">جاري تحميل صفحة SEO...</section> : null}

      {!loading ? (
        <section className="card admin-form">
          <form className="grid" onSubmit={handleSubmit}>
            <div className="field-stack">
              <label htmlFor="seo-page-title">عنوان الصفحة</label>
              <input
                id="seo-page-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>

            <div className="field-stack">
              <label htmlFor="seo-page-slug">Slug</label>
              <input
                id="seo-page-slug"
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                placeholder="roof-insulation-dammam"
              />
              <small className="admin-hint">لصفحة عزل الأسطح الحالية استخدم: roof-insulation-dammam</small>
            </div>

            <div className="field-stack">
              <label htmlFor="seo-meta-title">Meta Title</label>
              <input
                id="seo-meta-title"
                value={form.metaTitle}
                onChange={(event) => setForm((current) => ({ ...current, metaTitle: event.target.value }))}
              />
            </div>

            <div className="field-stack">
              <label htmlFor="seo-meta-description">Meta Description</label>
              <input
                id="seo-meta-description"
                value={form.metaDescription}
                onChange={(event) => setForm((current) => ({ ...current, metaDescription: event.target.value }))}
              />
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-hero-title">عنوان البطل (Hero)</label>
              <input
                id="seo-hero-title"
                value={form.heroTitle}
                onChange={(event) => setForm((current) => ({ ...current, heroTitle: event.target.value }))}
              />
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-hero-lead">الوصف الرئيسي</label>
              <textarea
                id="seo-hero-lead"
                rows={3}
                value={form.heroLead}
                onChange={(event) => setForm((current) => ({ ...current, heroLead: event.target.value }))}
              />
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-hero-points">نقاط Hero (كل نقطة في سطر)</label>
              <textarea
                id="seo-hero-points"
                rows={4}
                value={form.heroPointsText}
                onChange={(event) => setForm((current) => ({ ...current, heroPointsText: event.target.value }))}
              />
            </div>

            <div className="field-stack quote-grid-full">
              <label>عناصر الثقة</label>
              <div className="admin-gallery-editor">
                {form.trustItems.map((item, index) => (
                  <div className="admin-gallery-item" key={`trust-${index}`}>
                    <input
                      type="text"
                      value={item.title}
                      placeholder="العنوان"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          trustItems: current.trustItems.map((trustItem, trustIndex) =>
                            trustIndex === index ? { ...trustItem, title: event.target.value } : trustItem
                          )
                        }))
                      }
                    />
                    <textarea
                      rows={2}
                      value={item.description}
                      placeholder="الوصف"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          trustItems: current.trustItems.map((trustItem, trustIndex) =>
                            trustIndex === index ? { ...trustItem, description: event.target.value } : trustItem
                          )
                        }))
                      }
                    />
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          trustItems: current.trustItems.filter((_, trustIndex) => trustIndex !== index)
                        }))
                      }
                    >
                      إزالة
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" type="button" onClick={addTrustItem}>
                إضافة عنصر ثقة
              </button>
            </div>

            <div className="field-stack quote-grid-full">
              <label>بطاقات تفاصيل الخدمة</label>
              <div className="admin-gallery-editor">
                {form.serviceItems.map((item, index) => (
                  <div className="admin-gallery-item" key={`service-item-${index}`}>
                    <input
                      type="text"
                      value={item.title}
                      placeholder="العنوان"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          serviceItems: current.serviceItems.map((serviceItem, itemIndex) =>
                            itemIndex === index ? { ...serviceItem, title: event.target.value } : serviceItem
                          )
                        }))
                      }
                    />
                    <textarea
                      rows={2}
                      value={item.description}
                      placeholder="الوصف"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          serviceItems: current.serviceItems.map((serviceItem, itemIndex) =>
                            itemIndex === index ? { ...serviceItem, description: event.target.value } : serviceItem
                          )
                        }))
                      }
                    />
                    <input
                      type="text"
                      value={item.imageAlt}
                      placeholder="وصف الصورة البديل (alt)"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          serviceItems: current.serviceItems.map((serviceItem, itemIndex) =>
                            itemIndex === index ? { ...serviceItem, imageAlt: event.target.value } : serviceItem
                          )
                        }))
                      }
                    />
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          serviceItems: current.serviceItems.filter((_, itemIndex) => itemIndex !== index)
                        }))
                      }
                    >
                      إزالة
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" type="button" onClick={addServiceItem}>
                إضافة بطاقة خدمة
              </button>
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-areas">مناطق الخدمة (كل منطقة في سطر)</label>
              <textarea
                id="seo-areas"
                rows={4}
                value={form.areasText}
                onChange={(event) => setForm((current) => ({ ...current, areasText: event.target.value }))}
              />
            </div>

            <div className="field-stack quote-grid-full">
              <label>روابط خدمات مرتبطة</label>
              <div className="admin-gallery-editor">
                {form.relatedLinks.map((item, index) => (
                  <div className="admin-gallery-item" key={`related-link-${index}`}>
                    <input
                      type="text"
                      value={item.title}
                      placeholder="عنوان الرابط"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          relatedLinks: current.relatedLinks.map((relatedItem, relatedIndex) =>
                            relatedIndex === index ? { ...relatedItem, title: event.target.value } : relatedItem
                          )
                        }))
                      }
                    />
                    <input
                      type="text"
                      value={item.href}
                      placeholder="/services/service-slug"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          relatedLinks: current.relatedLinks.map((relatedItem, relatedIndex) =>
                            relatedIndex === index ? { ...relatedItem, href: event.target.value } : relatedItem
                          )
                        }))
                      }
                    />
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          relatedLinks: current.relatedLinks.filter((_, relatedIndex) => relatedIndex !== index)
                        }))
                      }
                    >
                      إزالة
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" type="button" onClick={addRelatedLink}>
                إضافة رابط
              </button>
            </div>

            <div className="field-stack">
              <label htmlFor="seo-cta-top-title">عنوان CTA العلوي</label>
              <input
                id="seo-cta-top-title"
                value={form.ctaTopTitle}
                onChange={(event) => setForm((current) => ({ ...current, ctaTopTitle: event.target.value }))}
              />
            </div>

            <div className="field-stack">
              <label htmlFor="seo-cta-top-description">وصف CTA العلوي</label>
              <input
                id="seo-cta-top-description"
                value={form.ctaTopDescription}
                onChange={(event) => setForm((current) => ({ ...current, ctaTopDescription: event.target.value }))}
              />
            </div>

            <div className="field-stack">
              <label htmlFor="seo-cta-bottom-title">عنوان CTA السفلي</label>
              <input
                id="seo-cta-bottom-title"
                value={form.ctaBottomTitle}
                onChange={(event) => setForm((current) => ({ ...current, ctaBottomTitle: event.target.value }))}
              />
            </div>

            <div className="field-stack">
              <label htmlFor="seo-cta-bottom-description">وصف CTA السفلي</label>
              <input
                id="seo-cta-bottom-description"
                value={form.ctaBottomDescription}
                onChange={(event) => setForm((current) => ({ ...current, ctaBottomDescription: event.target.value }))}
              />
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-hero-image">صورة Hero</label>
              <input
                id="seo-hero-image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setRemoveHeroImage(false);
                  setHeroImageFile(event.target.files?.[0] || null);
                }}
              />
              <div className="admin-actions">
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => {
                    setHeroImageFile(null);
                    setRemoveHeroImage(true);
                    setForm((current) => ({ ...current, heroImage: "" }));
                  }}
                >
                  إزالة صورة Hero
                </button>
              </div>
              {heroPreview ? (
                <div className="admin-media-preview">
                  <img src={heroPreview} alt="hero preview" />
                </div>
              ) : null}
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-before-image">صورة قبل</label>
              <input
                id="seo-before-image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setRemoveBeforeImage(false);
                  setBeforeImageFile(event.target.files?.[0] || null);
                }}
              />
              <div className="admin-actions">
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => {
                    setBeforeImageFile(null);
                    setRemoveBeforeImage(true);
                    setForm((current) => ({ ...current, beforeImage: "" }));
                  }}
                >
                  إزالة صورة قبل
                </button>
              </div>
              {beforePreview ? (
                <div className="admin-media-preview">
                  <img src={beforePreview} alt="before preview" />
                </div>
              ) : null}
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-after-image">صورة بعد</label>
              <input
                id="seo-after-image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setRemoveAfterImage(false);
                  setAfterImageFile(event.target.files?.[0] || null);
                }}
              />
              <div className="admin-actions">
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => {
                    setAfterImageFile(null);
                    setRemoveAfterImage(true);
                    setForm((current) => ({ ...current, afterImage: "" }));
                  }}
                >
                  إزالة صورة بعد
                </button>
              </div>
              {afterPreview ? (
                <div className="admin-media-preview">
                  <img src={afterPreview} alt="after preview" />
                </div>
              ) : null}
            </div>

            <div className="field-stack quote-grid-full">
              <label htmlFor="seo-gallery-images">معرض الصور الإضافي</label>
              <input
                id="seo-gallery-images"
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  if (files.length === 0) {
                    return;
                  }

                  setNewImageFiles((current) => [...current, ...files]);
                }}
              />

              {form.images.length || newImagePreviews.length ? (
                <div className="admin-gallery-editor">
                  {form.images.map((src, index) => (
                    <div className="admin-gallery-item" key={`${src}-${index}`}>
                      <img src={src} alt={`seo image ${index + 1}`} />
                      <button className="btn btn-outline" type="button" onClick={() => removeExistingImage(index)}>
                        إزالة
                      </button>
                    </div>
                  ))}

                  {newImagePreviews.map((src, index) => (
                    <div className="admin-gallery-item" key={`new-image-${index}`}>
                      <img src={src} alt={`new seo image ${index + 1}`} />
                      <button className="btn btn-outline" type="button" onClick={() => removeNewImage(index)}>
                        إزالة
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="field-stack quote-grid-full">
              <label>الاسئلة الشائعة</label>
              <div className="admin-gallery-editor">
                {form.faq.map((item, index) => (
                  <div className="admin-gallery-item" key={`faq-${index}`}>
                    <input
                      type="text"
                      value={item.question}
                      placeholder="السؤال"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          faq: current.faq.map((faqItem, faqIndex) =>
                            faqIndex === index ? { ...faqItem, question: event.target.value } : faqItem
                          )
                        }))
                      }
                    />
                    <textarea
                      rows={3}
                      value={item.answer}
                      placeholder="الإجابة"
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          faq: current.faq.map((faqItem, faqIndex) =>
                            faqIndex === index ? { ...faqItem, answer: event.target.value } : faqItem
                          )
                        }))
                      }
                    />
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          faq: current.faq.filter((_, faqIndex) => faqIndex !== index)
                        }))
                      }
                    >
                      إزالة
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" type="button" onClick={addFaq}>
                إضافة سؤال
              </button>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "جار الحفظ..." : "حفظ صفحة SEO"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
