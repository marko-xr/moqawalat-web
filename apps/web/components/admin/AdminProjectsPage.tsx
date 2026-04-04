"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { Project } from "@/lib/types";

const PAGE_SIZE = 8;

type ProjectFormState = {
  id?: string;
  titleAr: string;
  slug: string;
  locationAr: string;
  categoryAr: string;
  descriptionAr: string;
  seoTitleAr: string;
  seoDescriptionAr: string;
  videoUrl: string;
  isPublished: boolean;
  coverImage: string;
  beforeImage: string;
  afterImage: string;
  gallery: string[];
};

const emptyForm: ProjectFormState = {
  titleAr: "",
  slug: "",
  locationAr: "",
  categoryAr: "",
  descriptionAr: "",
  seoTitleAr: "",
  seoDescriptionAr: "",
  videoUrl: "",
  isPublished: true,
  coverImage: "",
  beforeImage: "",
  afterImage: "",
  gallery: []
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

export default function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [published, setPublished] = useState("all");
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  const coverPreview = useMemo(() => {
    if (coverFile) {
      return URL.createObjectURL(coverFile);
    }
    return form.coverImage || "";
  }, [coverFile, form.coverImage]);

  const beforePreview = useMemo(() => {
    if (beforeFile) {
      return URL.createObjectURL(beforeFile);
    }
    return form.beforeImage || "";
  }, [beforeFile, form.beforeImage]);

  const afterPreview = useMemo(() => {
    if (afterFile) {
      return URL.createObjectURL(afterFile);
    }
    return form.afterImage || "";
  }, [afterFile, form.afterImage]);

  const galleryPreviews = useMemo(() => {
    const fileUrls = galleryFiles.map((file) => URL.createObjectURL(file));
    return [...form.gallery, ...fileUrls];
  }, [galleryFiles, form.gallery]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q,
      published,
      page: String(page),
      pageSize: String(PAGE_SIZE)
    });

    const response = await fetch(`/api/projects?${params.toString()}`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("تعذر تحميل المشاريع");
    }

    const payload = (await response.json()) as {
      items: Project[];
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
    loadProjects().catch((err: Error) => {
      setError(err.message || "حدث خطأ غير متوقع");
      setLoading(false);
    });
  }, [loadProjects]);

  useEffect(() => {
    return () => {
      if (coverFile) {
        URL.revokeObjectURL(coverPreview);
      }
      if (beforeFile) {
        URL.revokeObjectURL(beforePreview);
      }
      if (afterFile) {
        URL.revokeObjectURL(afterPreview);
      }
      galleryFiles.forEach((file, index) => {
        URL.revokeObjectURL(galleryPreviews[index]);
      });
    };
  }, [afterFile, afterPreview, beforeFile, beforePreview, coverFile, coverPreview, galleryFiles, galleryPreviews]);

  function resetForm() {
    setForm(emptyForm);
    setCoverFile(null);
    setGalleryFiles([]);
    setVideoFile(null);
    setBeforeFile(null);
    setAfterFile(null);
  }

  function handleEdit(item: Project) {
    setForm({
      id: item.id,
      titleAr: item.titleAr || "",
      slug: item.slug || "",
      locationAr: item.locationAr || "",
      categoryAr: item.categoryAr || "",
      descriptionAr: item.descriptionAr || "",
      seoTitleAr: item.seoTitleAr || "",
      seoDescriptionAr: item.seoDescriptionAr || "",
      videoUrl: item.videoUrl || "",
      isPublished: item.isPublished ?? true,
      coverImage: item.coverImage || "",
      beforeImage: item.beforeImage || "",
      afterImage: item.afterImage || "",
      gallery: item.gallery ? [...item.gallery] : []
    });
    setCoverFile(null);
    setGalleryFiles([]);
    setVideoFile(null);
    setBeforeFile(null);
    setAfterFile(null);
    setNotice("");
  }

  function handleRemoveGallery(index: number) {
    if (index < form.gallery.length) {
      setForm((current) => ({
        ...current,
        gallery: current.gallery.filter((_, i) => i !== index)
      }));
      return;
    }

    const fileIndex = index - form.gallery.length;
    setGalleryFiles((current) => current.filter((_, i) => i !== fileIndex));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    const payload = new FormData();
    payload.append("titleAr", form.titleAr);
    payload.append("slug", form.slug || toSlug(form.titleAr));
    payload.append("locationAr", form.locationAr);
    payload.append("categoryAr", form.categoryAr);
    payload.append("descriptionAr", form.descriptionAr);
    payload.append("seoTitleAr", form.seoTitleAr);
    payload.append("seoDescriptionAr", form.seoDescriptionAr);
    payload.append("videoUrl", form.videoUrl);
    payload.append("isPublished", String(form.isPublished));
    payload.append("gallery", JSON.stringify(form.gallery));

    if (form.coverImage && !coverFile) {
      payload.append("coverImage", form.coverImage);
    }
    if (form.beforeImage && !beforeFile) {
      payload.append("beforeImage", form.beforeImage);
    }
    if (form.afterImage && !afterFile) {
      payload.append("afterImage", form.afterImage);
    }

    if (coverFile) {
      payload.append("coverImage", coverFile);
    }
    if (beforeFile) {
      payload.append("beforeImage", beforeFile);
    }
    if (afterFile) {
      payload.append("afterImage", afterFile);
    }

    if (videoFile) {
      payload.append("video", videoFile);
    }

    galleryFiles.forEach((file) => payload.append("gallery", file));

    const endpoint = form.id ? `/api/projects/${form.id}` : "/api/projects";
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
      const message = firstError?.msg || payload?.message || "تعذر حفظ المشروع";

      setError(fieldName ? `${message} (${fieldName})` : message);
      return;
    }

    setNotice("تم حفظ المشروع");
    resetForm();
    loadProjects();
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    const response = await fetch(`/api/projects/${deleteTarget.id}`, { method: "DELETE" });

    if (!response.ok) {
      setError("تعذر حذف المشروع");
      return;
    }

    setDeleteTarget(null);
    setNotice("تم حذف المشروع");
    loadProjects();
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>إدارة المشاريع</h1>
        <p>تنظيم مشاريع المعرض مع صور قبل/بعد والمعرض الكامل.</p>
      </header>

      {notice ? <section className="card admin-notice-box">{notice}</section> : null}
      {error ? <section className="card admin-error-box">{error}</section> : null}

      <section className="card admin-form">
        <div className="admin-form-header">
          <h3>{form.id ? "تحديث مشروع" : "إضافة مشروع جديد"}</h3>
          <button className="btn btn-outline" type="button" onClick={resetForm}>
            نموذج جديد
          </button>
        </div>

        <form className="grid" onSubmit={handleSubmit}>
          <div className="field-stack">
            <label htmlFor="project-title">عنوان المشروع</label>
            <input
              id="project-title"
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
            <label htmlFor="project-slug">الرابط (slug)</label>
            <input
              id="project-slug"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="auto-generated"
            />
            <small className="admin-hint">يفضل كتابة الرابط بحروف لاتينية.</small>
          </div>

          <div className="field-stack">
            <label htmlFor="project-location">الموقع</label>
            <input
              id="project-location"
              value={form.locationAr}
              onChange={(event) => setForm((current) => ({ ...current, locationAr: event.target.value }))}
              required
            />
          </div>

          <div className="field-stack">
            <label htmlFor="project-category">التصنيف</label>
            <input
              id="project-category"
              value={form.categoryAr}
              onChange={(event) => setForm((current) => ({ ...current, categoryAr: event.target.value }))}
              required
            />
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="project-desc">الوصف</label>
            <textarea
              id="project-desc"
              rows={4}
              value={form.descriptionAr}
              onChange={(event) => setForm((current) => ({ ...current, descriptionAr: event.target.value }))}
              required
            />
          </div>

          <div className="field-stack">
            <label htmlFor="project-seo-title">SEO Title</label>
            <input
              id="project-seo-title"
              value={form.seoTitleAr}
              onChange={(event) => setForm((current) => ({ ...current, seoTitleAr: event.target.value }))}
            />
          </div>

          <div className="field-stack">
            <label htmlFor="project-seo-desc">SEO Description</label>
            <input
              id="project-seo-desc"
              value={form.seoDescriptionAr}
              onChange={(event) => setForm((current) => ({ ...current, seoDescriptionAr: event.target.value }))}
            />
          </div>

          <div className="field-stack">
            <label htmlFor="project-video">رابط فيديو (يوتيوب)</label>
            <input
              id="project-video"
              value={form.videoUrl}
              onChange={(event) => setForm((current) => ({ ...current, videoUrl: event.target.value }))}
              placeholder="https://"
            />
          </div>

          <div className="field-stack">
            <label htmlFor="project-published">حالة النشر</label>
            <select
              id="project-published"
              value={form.isPublished ? "true" : "false"}
              onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.value === "true" }))}
            >
              <option value="true">منشور</option>
              <option value="false">غير منشور</option>
            </select>
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="project-cover">صورة الغلاف</label>
            <input
              id="project-cover"
              type="file"
              accept="image/*"
              onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
            />
            {coverPreview ? (
              <div className="admin-media-preview">
                <img src={coverPreview} alt="معاينة الغلاف" />
              </div>
            ) : null}
          </div>

          <div className="admin-before-after">
            <div className="field-stack">
              <label htmlFor="project-before">صورة قبل</label>
              <input
                id="project-before"
                type="file"
                accept="image/*"
                onChange={(event) => setBeforeFile(event.target.files?.[0] || null)}
              />
              {beforePreview ? (
                <div className="admin-media-preview">
                  <img src={beforePreview} alt="معاينة قبل" />
                </div>
              ) : null}
            </div>
            <div className="field-stack">
              <label htmlFor="project-after">صورة بعد</label>
              <input
                id="project-after"
                type="file"
                accept="image/*"
                onChange={(event) => setAfterFile(event.target.files?.[0] || null)}
              />
              {afterPreview ? (
                <div className="admin-media-preview">
                  <img src={afterPreview} alt="معاينة بعد" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="project-gallery">معرض الصور</label>
            <input
              id="project-gallery"
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))}
            />
            {galleryPreviews.length ? (
              <div className="admin-media-grid">
                {galleryPreviews.map((src, index) => (
                  <button
                    className="admin-media-item"
                    key={`${src}-${index}`}
                    type="button"
                    onClick={() => handleRemoveGallery(index)}
                    aria-label="إزالة"
                  >
                    <img src={src} alt="معاينة" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="project-video-file">رفع فيديو (اختياري)</label>
            <input
              id="project-video-file"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
            />
            {videoFile ? <small className="admin-hint">تم اختيار ملف فيديو: {videoFile.name}</small> : null}
          </div>

          <button className="btn btn-primary" type="submit">
            {form.id ? "تحديث المشروع" : "حفظ المشروع"}
          </button>
        </form>
      </section>

      <section className="card admin-filters">
        <div className="admin-filters-grid">
          <div>
            <label htmlFor="project-search">بحث</label>
            <input
              id="project-search"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث بالعنوان أو التصنيف"
            />
          </div>
          <div>
            <label htmlFor="project-publish-filter">الحالة</label>
            <select
              id="project-publish-filter"
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

      {loading ? <section className="card admin-empty">جاري تحميل المشاريع...</section> : null}
      {!loading && items.length === 0 ? <section className="card admin-empty">لا توجد مشاريع بعد.</section> : null}

      {!loading && items.length > 0 ? (
        <section className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المشروع</th>
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
                    <div className="admin-meta">{item.locationAr} - {item.categoryAr}</div>
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
        title="حذف المشروع"
        description={deleteTarget ? `هل تريد حذف مشروع ${deleteTarget.titleAr}؟` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
