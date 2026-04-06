"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { BlogPost } from "@/lib/types";

const PAGE_SIZE = 8;

type BlogFormState = {
  id?: string;
  titleAr: string;
  slug: string;
  excerptAr: string;
  contentAr: string;
  seoTitleAr: string;
  seoDescriptionAr: string;
  coverImage: string;
  published: boolean;
};

const emptyForm: BlogFormState = {
  titleAr: "",
  slug: "",
  excerptAr: "",
  contentAr: "",
  seoTitleAr: "",
  seoDescriptionAr: "",
  coverImage: "",
  published: true
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

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [q, setQ] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

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

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      q,
      published: publishedFilter,
      page: String(page),
      pageSize: String(PAGE_SIZE)
    });

    const response = await fetch(`/api/blog?${params.toString()}`, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("تعذر تحميل مقالات المدونة");
    }

    const payload = (await response.json()) as {
      items: BlogPost[];
      total: number;
      page: number;
      totalPages: number;
    };

    setItems(payload.items);
    setTotal(payload.total);
    setPage(payload.page);
    setLoading(false);
  }, [page, publishedFilter, q]);

  useEffect(() => {
    loadPosts().catch((err: Error) => {
      setError(err.message || "حدث خطأ غير متوقع");
      setLoading(false);
    });
  }, [loadPosts]);

  useEffect(() => {
    return () => {
      if (coverFile && coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverFile, coverPreview]);

  function resetForm() {
    setForm(emptyForm);
    setCoverFile(null);
    setRemoveCoverImage(false);
  }

  function handleEdit(item: BlogPost) {
    setForm({
      id: item.id,
      titleAr: item.titleAr || "",
      slug: item.slug || "",
      excerptAr: item.excerptAr || "",
      contentAr: item.contentAr || "",
      seoTitleAr: item.seoTitleAr || "",
      seoDescriptionAr: item.seoDescriptionAr || "",
      coverImage: item.coverImage || "",
      published: item.published ?? true
    });

    setCoverFile(null);
    setRemoveCoverImage(false);
    setNotice("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    const payload = new FormData();
    payload.append("titleAr", form.titleAr);
    payload.append("slug", form.slug || toSlug(form.titleAr));
    payload.append("excerptAr", form.excerptAr);
    payload.append("contentAr", form.contentAr);
    payload.append("seoTitleAr", form.seoTitleAr);
    payload.append("seoDescriptionAr", form.seoDescriptionAr);
    payload.append("published", String(form.published));

    if (removeCoverImage) {
      payload.append("removeCoverImage", "true");
    } else if (form.coverImage && !coverFile) {
      payload.append("coverImage", form.coverImage);
    }

    if (coverFile) {
      payload.append("coverImage", coverFile);
    }

    const endpoint = form.id ? `/api/blog/${form.id}` : "/api/blog";
    const method = form.id ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      body: payload
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        errors?: Array<{ msg?: string; path?: string; param?: string }>;
      };

      const firstError = data?.errors?.[0];
      const fieldName = firstError?.path || firstError?.param;
      const message = firstError?.msg || data?.message || "تعذر حفظ المقال";

      setError(fieldName ? `${message} (${fieldName})` : message);
      return;
    }

    setNotice("تم حفظ المقال");
    resetForm();
    loadPosts();
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    const response = await fetch(`/api/blog/${deleteTarget.id}`, { method: "DELETE" });

    if (!response.ok) {
      setError("تعذر حذف المقال");
      return;
    }

    setDeleteTarget(null);
    setNotice("تم حذف المقال");
    loadPosts();
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>إدارة المدونة</h1>
        <p>إدارة المقالات وصور الأغلفة والتحسينات الخاصة بSEO.</p>
      </header>

      {notice ? <section className="card admin-notice-box">{notice}</section> : null}
      {error ? <section className="card admin-error-box">{error}</section> : null}

      <section className="card admin-form">
        <div className="admin-form-header">
          <h3>{form.id ? "تحديث مقال" : "إضافة مقال جديد"}</h3>
          <button className="btn btn-outline" type="button" onClick={resetForm}>
            نموذج جديد
          </button>
        </div>

        <form className="grid" onSubmit={handleSubmit}>
          <div className="field-stack">
            <label htmlFor="blog-title">عنوان المقال</label>
            <input
              id="blog-title"
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
            <label htmlFor="blog-slug">الرابط (slug)</label>
            <input
              id="blog-slug"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="auto-generated"
            />
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="blog-excerpt">ملخص المقال</label>
            <textarea
              id="blog-excerpt"
              rows={2}
              value={form.excerptAr}
              onChange={(event) => setForm((current) => ({ ...current, excerptAr: event.target.value }))}
              required
            />
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="blog-content">المحتوى الكامل</label>
            <textarea
              id="blog-content"
              rows={6}
              value={form.contentAr}
              onChange={(event) => setForm((current) => ({ ...current, contentAr: event.target.value }))}
              required
            />
          </div>

          <div className="field-stack">
            <label htmlFor="blog-seo-title">SEO Title</label>
            <input
              id="blog-seo-title"
              value={form.seoTitleAr}
              onChange={(event) => setForm((current) => ({ ...current, seoTitleAr: event.target.value }))}
            />
          </div>

          <div className="field-stack">
            <label htmlFor="blog-seo-description">SEO Description</label>
            <input
              id="blog-seo-description"
              value={form.seoDescriptionAr}
              onChange={(event) => setForm((current) => ({ ...current, seoDescriptionAr: event.target.value }))}
            />
          </div>

          <div className="field-stack">
            <label htmlFor="blog-published">حالة النشر</label>
            <select
              id="blog-published"
              value={form.published ? "true" : "false"}
              onChange={(event) => setForm((current) => ({ ...current, published: event.target.value === "true" }))}
            >
              <option value="true">منشور</option>
              <option value="false">غير منشور</option>
            </select>
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="blog-cover-url">رابط صورة الغلاف (اختياري)</label>
            <input
              id="blog-cover-url"
              value={form.coverImage}
              onChange={(event) => {
                setRemoveCoverImage(false);
                setForm((current) => ({ ...current, coverImage: event.target.value }));
              }}
              placeholder="https:// أو /uploads/..."
            />
          </div>

          <div className="field-stack quote-grid-full">
            <label htmlFor="blog-cover-file">رفع صورة غلاف</label>
            <input
              id="blog-cover-file"
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
                إزالة الغلاف الحالي
              </button>
            </div>

            {coverPreview ? (
              <div className="admin-media-preview">
                <img src={coverPreview} alt="معاينة الغلاف" />
              </div>
            ) : null}
          </div>

          <button className="btn btn-primary" type="submit">
            {form.id ? "تحديث المقال" : "حفظ المقال"}
          </button>
        </form>
      </section>

      <section className="card admin-filters">
        <div className="admin-filters-grid">
          <div>
            <label htmlFor="blog-search">بحث</label>
            <input
              id="blog-search"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(1);
              }}
              placeholder="ابحث بالعنوان أو الرابط"
            />
          </div>
          <div>
            <label htmlFor="blog-published-filter">الحالة</label>
            <select
              id="blog-published-filter"
              value={publishedFilter}
              onChange={(event) => {
                setPublishedFilter(event.target.value);
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

      {loading ? <section className="card admin-empty">جاري تحميل المقالات...</section> : null}
      {!loading && items.length === 0 ? <section className="card admin-empty">لا توجد مقالات بعد.</section> : null}

      {!loading && items.length > 0 ? (
        <section className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المقال</th>
                <th>الحالة</th>
                <th>صورة الغلاف</th>
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
                  <td>{item.published ? "منشور" : "غير منشور"}</td>
                  <td>
                    {item.coverImage ? (
                      <div className="admin-lead-media-wrap">
                        <img src={item.coverImage} alt={item.titleAr} className="admin-lead-media" loading="lazy" />
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
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
        title="حذف المقال"
        description={deleteTarget ? `هل تريد حذف مقال ${deleteTarget.titleAr}؟` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
