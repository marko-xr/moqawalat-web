"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { Service } from "@/lib/types";

const PAGE_SIZE = 8;

type ServiceFormState = {
  id?: string;
  titleAr: string;
  slug: string;
  shortDescAr: string;
  contentAr: string;
  seoTitleAr: string;
  seoDescriptionAr: string;
  videoUrl: string;
  isPublished: boolean;
  coverImage: string;
  gallery: string[];
  galleryDescriptions: string[];
};

const emptyForm: ServiceFormState = {
  titleAr: "",
  slug: "",
  shortDescAr: "",
  contentAr: "",
  seoTitleAr: "",
  seoDescriptionAr: "",
  videoUrl: "",
  isPublished: true,
  coverImage: "",
  gallery: [],
  galleryDescriptions: []
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleDateString("ar-SA");
}

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [published, setPublished] = useState("all");
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [newGalleryDescriptions, setNewGalleryDescriptions] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [removeVideoUrl, setRemoveVideoUrl] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }

    if (removeCoverImage) {
      return "";
    }

    return form.coverImage || "";
  }, [coverFile, form.coverImage, removeCoverImage]);

  const newGalleryPreviews = useMemo(() => galleryFiles.map((file) => URL.createObjectURL(file)), [galleryFiles]);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q,
      published,
      page: String(page),
      pageSize: String(PAGE_SIZE)
    });

    const response = await fetch(`/api/services?${params.toString()}`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("تعذر تحميل الخدمات");
    }

    const payload = (await response.json()) as {
      items: Service[];
      total: number;
      page: number;
      totalPages: number;
    };

    setItems(payload.items);
    setTotal(payload.total);
    setPage(payload.page);
    setLoading(false);
  }, [page, published, q]);

  useEffect(() => {
    loadServices().catch((err: Error) => {
      setError(err.message || "حدث خطأ غير متوقع");
      setLoading(false);
    });
  }, [loadServices]);

  useEffect(() => {
    return () => {
      if (coverFile && coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }

      newGalleryPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [coverFile, coverPreview, newGalleryPreviews]);

  function resetForm() {
    setForm(emptyForm);
    setCoverFile(null);
    setGalleryFiles([]);
    setNewGalleryDescriptions([]);
    setVideoFile(null);
    setRemoveCoverImage(false);
    setRemoveVideoUrl(false);
  }

  function handleEdit(item: Service) {
    setForm({
      id: item.id,
      titleAr: item.titleAr || "",
      slug: item.slug || "",
      shortDescAr: item.shortDescAr || "",
      contentAr: item.contentAr || "",
      seoTitleAr: item.seoTitleAr || "",
      seoDescriptionAr: item.seoDescriptionAr || "",
      videoUrl: item.videoUrl || "",
      isPublished: item.isPublished ?? true,
      coverImage: item.coverImage || item.imageUrl || "",
      gallery: item.gallery ? [...item.gallery] : [],
      galleryDescriptions: item.galleryDescriptions
        ? [...item.galleryDescriptions, ...Array(Math.max((item.gallery?.length || 0) - item.galleryDescriptions.length, 0)).fill("")]
        : Array(item.gallery?.length || 0).fill("")
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setNewGalleryDescriptions([]);
    setVideoFile(null);
    setRemoveCoverImage(false);
    setRemoveVideoUrl(false);
    setNotice("");
  }

  function handleRemoveGallery(index: number) {
    if (index < form.gallery.length) {
      setForm((current) => ({
        ...current,
        gallery: current.gallery.filter((_, i) => i !== index),
        galleryDescriptions: current.galleryDescriptions.filter((_, i) => i !== index)
      }));
      return;
    }

    const fileIndex = index - form.gallery.length;
    setGalleryFiles((current) => current.filter((_, i) => i !== fileIndex));
    setNewGalleryDescriptions((current) => current.filter((_, i) => i !== fileIndex));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    const payload = new FormData();
    payload.append("titleAr", form.titleAr);
    payload.append("slug", form.slug || toSlug(form.titleAr));
    payload.append("shortDescAr", form.shortDescAr);
    payload.append("contentAr", form.contentAr);
    payload.append("seoTitleAr", form.seoTitleAr);
    payload.append("seoDescriptionAr", form.seoDescriptionAr);
    payload.append("videoUrl", form.videoUrl);
    payload.append("isPublished", String(form.isPublished));
    payload.append("gallery", JSON.stringify(form.gallery));
    payload.append("galleryDescriptions", JSON.stringify(form.galleryDescriptions));
    payload.append("newGalleryDescriptions", JSON.stringify(newGalleryDescriptions));

    if (removeCoverImage) {
      payload.append("removeCoverImage", "true");
    } else if (form.coverImage && !coverFile) {
      payload.append("coverImage", form.coverImage);
    }

    if (coverFile) {
      payload.append("coverImage", coverFile);
    }

    if (removeVideoUrl) {
      payload.append("removeVideoUrl", "true");
    }

    if (videoFile) {
      payload.append("video", videoFile);
    }

    galleryFiles.forEach((file) => payload.append("gallery", file));

    const endpoint = form.id ? `/api/services/${form.id}` : "/api/services";
    const method = form.id ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      body: payload
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as {
        message?: string;
        errors?: Array<{ msg?: string; path?: string; param?: string }>;
      };

      const firstError = payload?.errors?.[0];
      const fieldName = firstError?.path || firstError?.param;
      const message = firstError?.msg || payload?.message || "تعذر حفظ الخدمة";

      setError(fieldName ? `${message} (${fieldName})` : message);
      return;
    }

    setNotice("تم حفظ الخدمة");
    resetForm();
    loadServices();
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    const response = await fetch(`/api/services/${deleteTarget.id}`, { method: "DELETE" });

    if (!response.ok) {
      setError("تعذر حذف الخدمة");
      return;
    }

    setDeleteTarget(null);
    setNotice("تم حذف الخدمة");
    loadServices();
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>إدارة الخدمات</h1>
        <p>إنشاء وتحديث خدمات الموقع مع إدارة الوسائط وSEO.</p>
      </header>

      {notice ? <section className="card admin-notice-box">{notice}</section> : null}
      {error ? <section className="card admin-error-box">{error}</section> : null}

      <section className="card admin-form">
        <div className="admin-form-header">
          <h3>{form.id ? "تحديث خدمة" : "إضافة خدمة جديدة"}</h3>
          <button className="btn btn-outline" type="button" onClick={resetForm}>
            نموذج جديد
          </button>
        </div>

        <form className="grid" onSubmit={handleSubmit}>
          <div className="field-stack">
            <label htmlFor="service-title">عنوان الخدمة</label>
            <input
              id="service-title"
              value={form.titleAr}
              onChange={(event) => setForm((current) => ({ ...current, titleAr: event.target.value }))}
              onBlur={() =>
                setForm((current) => ({
                  ...current,
                  slug: current.slug || toSlug(current.titleAr)
                }))
              }
              required
            />
          </div>

          <div className="field-stack">
            <label htmlFor="service-slug">الرابط (slug)</label>
            <input
              id="service-slug"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="auto-generated"
            />
            <small className="admin-hint">يفضل كتابة الرابط بحروف لاتينية.</small>
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="service-short">وصف مختصر</label>
            <textarea
              id="service-short"
              rows={2}
              value={form.shortDescAr}
              onChange={(event) => setForm((current) => ({ ...current, shortDescAr: event.target.value }))}
              required
            />
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="service-content">الوصف الكامل</label>
            <textarea
              id="service-content"
              rows={4}
              value={form.contentAr}
              onChange={(event) => setForm((current) => ({ ...current, contentAr: event.target.value }))}
              required
            />
          </div>

          <div className="field-stack">
            <label htmlFor="service-seo-title">SEO Title</label>
            <input
              id="service-seo-title"
              value={form.seoTitleAr}
              onChange={(event) => setForm((current) => ({ ...current, seoTitleAr: event.target.value }))}
            />
          </div>

          <div className="field-stack">
            <label htmlFor="service-seo-desc">SEO Description</label>
            <input
              id="service-seo-desc"
              value={form.seoDescriptionAr}
              onChange={(event) => setForm((current) => ({ ...current, seoDescriptionAr: event.target.value }))}
            />
          </div>

          <div className="field-stack">
            <label htmlFor="service-video">رابط فيديو (يوتيوب)</label>
            <input
              id="service-video"
              value={form.videoUrl}
              onChange={(event) => {
                setRemoveVideoUrl(false);
                setForm((current) => ({ ...current, videoUrl: event.target.value }));
              }}
              placeholder="https://"
            />
          </div>

          <div className="field-stack">
            <label htmlFor="service-published">حالة النشر</label>
            <select
              id="service-published"
              value={form.isPublished ? "true" : "false"}
              onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.value === "true" }))}
            >
              <option value="true">منشور</option>
              <option value="false">غير منشور</option>
            </select>
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="service-cover">صورة الغلاف</label>
            <input
              id="service-cover"
              type="file"
              accept="image/*"
              onChange={(event) => {
                setRemoveCoverImage(false);
                setCoverFile(event.target.files?.[0] || null);
              }}
            />
            <div className="admin-actions">
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setCoverFile(null);
                  setRemoveCoverImage(true);
                  setForm((current) => ({ ...current, coverImage: "" }));
                }}
              >
                إزالة صورة الغلاف
              </button>
            </div>
            {coverPreview ? (
              <div className="admin-media-preview">
                <img src={coverPreview} alt="معاينة الغلاف" />
              </div>
            ) : null}
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="service-gallery">معرض الصور</label>
            <input
              id="service-gallery"
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => {
                const files = Array.from(event.target.files || []);
                setGalleryFiles(files);
                setNewGalleryDescriptions((current) => files.map((_, index) => current[index] || ""));
              }}
            />
            {form.gallery.length || newGalleryPreviews.length ? (
              <div className="admin-gallery-editor">
                {form.gallery.map((src, index) => (
                  <div className="admin-gallery-item" key={`${src}-${index}`}>
                    <img src={src} alt="معاينة" />
                    <input
                      type="text"
                      value={form.galleryDescriptions[index] || ""}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          galleryDescriptions: current.galleryDescriptions.map((item, i) =>
                            i === index ? event.target.value : item
                          )
                        }))
                      }
                      placeholder="وصف الصورة"
                    />
                    <button className="btn btn-outline" type="button" onClick={() => handleRemoveGallery(index)}>
                      إزالة
                    </button>
                  </div>
                ))}

                {newGalleryPreviews.map((src, fileIndex) => {
                  const absoluteIndex = form.gallery.length + fileIndex;
                  return (
                    <div className="admin-gallery-item" key={`${src}-${absoluteIndex}`}>
                      <img src={src} alt="معاينة" />
                      <input
                        type="text"
                        value={newGalleryDescriptions[fileIndex] || ""}
                        onChange={(event) =>
                          setNewGalleryDescriptions((current) => current.map((item, i) => (i === fileIndex ? event.target.value : item)))
                        }
                        placeholder="وصف الصورة"
                      />
                      <button className="btn btn-outline" type="button" onClick={() => handleRemoveGallery(absoluteIndex)}>
                        إزالة
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="service-video-file">رفع فيديو (اختياري)</label>
            <input
              id="service-video-file"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(event) => {
                setRemoveVideoUrl(false);
                setVideoFile(event.target.files?.[0] || null);
              }}
            />
            <div className="admin-actions">
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setRemoveVideoUrl(true);
                  setForm((current) => ({ ...current, videoUrl: "" }));
                }}
              >
                إزالة الفيديو الحالي
              </button>
            </div>
            {videoFile ? <small className="admin-hint">تم اختيار ملف فيديو: {videoFile.name}</small> : null}
          </div>

          <button className="btn btn-primary" type="submit">
            {form.id ? "تحديث الخدمة" : "حفظ الخدمة"}
          </button>
        </form>
      </section>

      <section className="card admin-filters">
        <div className="admin-filters-grid">
          <div>
            <label htmlFor="service-search">بحث</label>
            <input
              id="service-search"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث بالعنوان أو الرابط"
            />
          </div>
          <div>
            <label htmlFor="service-publish-filter">الحالة</label>
            <select
              id="service-publish-filter"
              value={published}
              onChange={(event) => {
                setPublished(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">الكل</option>
              <option value="true">منشور</option>
              <option value="false">غير منشور</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? <section className="card admin-empty">جاري تحميل الخدمات...</section> : null}
      {!loading && items.length === 0 ? <section className="card admin-empty">لا توجد خدمات بعد.</section> : null}

      {!loading && items.length > 0 ? (
        <section className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>الخدمة</th>
                <th>الحالة</th>
                <th>آخر تحديث</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.titleAr}</strong>
                    <div className="admin-meta">{item.slug}</div>
                  </td>
                  <td>{item.isPublished ? "منشور" : "غير منشور"}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-outline" type="button" onClick={() => handleEdit(item)}>
                        تعديل
                      </button>
                      <button className="btn btn-outline" type="button" onClick={() => setDeleteTarget(item)}>
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="admin-pagination">
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
              السابق
            </button>
            <span>
              صفحة {page} من {totalPages}
            </span>
            <button
              className="btn btn-outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            >
              التالي
            </button>
          </div>
        </section>
      ) : null}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="حذف الخدمة"
        description={deleteTarget ? `هل تريد حذف خدمة ${deleteTarget.titleAr}؟` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
