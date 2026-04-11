"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { Service } from "@/lib/types";

const PAGE_SIZE = 8;
const IMAGE_MAX_SIDE_PX = 1920;
const IMAGE_TARGET_MAX_BYTES = 900 * 1024;
const IMAGE_INITIAL_QUALITY = 0.82;
const IMAGE_MIN_QUALITY = 0.55;

type ServiceFormState = {
  id?: string;
  titleAr: string;
  slug: string;
  sortOrder: string;
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
  sortOrder: "",
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
      // Not JSON, keep the value as-is.
    }

    return [trimmed];
  };

  return Array.from(new Set(flatten(value).filter(Boolean)));
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }
  return new Date(value).toLocaleDateString("ar-SA");
}

type ApiValidationError = {
  msg?: string;
  path?: string;
  param?: string;
};

type ApiErrorPayload = {
  message?: string;
  code?: string;
  errors?: ApiValidationError[];
};

const FIELD_LABELS: Record<string, string> = {
  titleAr: "عنوان الخدمة",
  slug: "الرابط",
  sortOrder: "ترتيب العرض",
  shortDescAr: "الوصف المختصر",
  contentAr: "الوصف الكامل",
  seoTitleAr: "SEO Title",
  seoDescriptionAr: "SEO Description",
  videoUrl: "رابط الفيديو",
  isPublished: "حالة النشر",
  coverImage: "صورة الغلاف",
  gallery: "معرض الصور"
};

async function parseApiErrorResponse(response: Response): Promise<ApiErrorPayload> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as ApiErrorPayload;
  } catch {
    return { message: text.slice(0, 500) };
  }
}

function formatValidationErrors(errors: ApiValidationError[] | undefined) {
  if (!Array.isArray(errors) || errors.length === 0) {
    return [];
  }

  return errors
    .map((item) => {
      const fieldKey = item.path || item.param || "";
      const label = FIELD_LABELS[fieldKey] || fieldKey;
      const message = item.msg || "قيمة غير صحيحة";
      return label ? `${message} (${label})` : message;
    })
    .filter(Boolean);
}

function buildSaveErrorMessage(status: number, payload: ApiErrorPayload) {
  const validationMessages = formatValidationErrors(payload.errors);
  if (validationMessages.length > 0) {
    return `تحقق من الحقول التالية: ${validationMessages.join(" | ")}`;
  }

  if (payload.message) {
    if (payload.message.includes("FUNCTION_PAYLOAD_TOO_LARGE") || payload.message.includes("Request Entity Too Large")) {
      return "حجم الطلب كبير جدا على مزود الاستضافة. تم تفعيل الرفع المباشر للـ API مع ضغط الصور؛ أعد تسجيل الدخول ثم حاول مرة أخرى.";
    }

    return payload.message;
  }

  if (status === 401 || status === 403) {
    return "انتهت جلسة الدخول أو لا توجد صلاحية. أعد تسجيل الدخول ثم حاول مرة أخرى.";
  }

  if (status === 409) {
    return "لا يمكن الحفظ لأن الرابط (slug) مستخدم بالفعل. غيّر الرابط وحاول مرة أخرى.";
  }

  if (status === 413) {
    return "حجم الملف كبير جدا. الحد الأقصى 25MB لكل ملف.";
  }

  if (status === 415) {
    return "نوع الملف غير مدعوم. المسموح: صور + mp4/webm/mov.";
  }

  if (status >= 500) {
    return "تعذر حفظ الخدمة. الأسباب المحتملة: تعارض في الرابط، خطأ في قاعدة البيانات، أو مشكلة في رفع الملفات. راجع سجلات API لمعرفة السبب الدقيق.";
  }

  return "تعذر حفظ الخدمة. تحقق من البيانات المدخلة وحاول مرة أخرى.";
}

function getCookieValue(name: string) {
  if (typeof document === "undefined") {
    return "";
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matched = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));

  if (!matched) {
    return "";
  }

  try {
    return decodeURIComponent(matched[1]);
  } catch {
    return matched[1];
  }
}

function getDirectApiBaseUrl() {
  const value = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!/^https?:\/\//i.test(value)) {
    return "";
  }

  return value.replace(/\/+$/, "");
}

function toWebpFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") + ".webp";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("file-read-failed"));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image-load-failed"));
    image.src = source;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("blob-create-failed"));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality
    );
  });
}

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.size <= 350 * 1024) {
    return file;
  }

  try {
    const src = await readFileAsDataUrl(file);
    const image = await loadImage(src);

    const maxSide = Math.max(image.width, image.height);
    const scale = maxSide > IMAGE_MAX_SIDE_PX ? IMAGE_MAX_SIDE_PX / maxSide : 1;

    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, width, height);

    let quality = IMAGE_INITIAL_QUALITY;
    let blob = await canvasToBlob(canvas, quality);

    while (blob.size > IMAGE_TARGET_MAX_BYTES && quality > IMAGE_MIN_QUALITY) {
      quality = Math.max(IMAGE_MIN_QUALITY, quality - 0.08);
      blob = await canvasToBlob(canvas, quality);
    }

    return new File([blob], toWebpFileName(file.name), {
      type: "image/webp",
      lastModified: Date.now()
    });
  } catch {
    return file;
  }
}

async function compressImageFiles(files: File[]) {
  return Promise.all(files.map((file) => compressImageFile(file)));
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
  const [isCompressingImages, setIsCompressingImages] = useState(false);
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
    const normalizedGallery = normalizeMediaList(item.gallery);
    const existingDescriptions = Array.isArray(item.galleryDescriptions)
      ? item.galleryDescriptions.map((entry) => String(entry || ""))
      : [];

    setForm({
      id: item.id,
      titleAr: item.titleAr || "",
      slug: item.slug || "",
      sortOrder: typeof item.sortOrder === "number" ? String(item.sortOrder) : "",
      shortDescAr: item.shortDescAr || "",
      contentAr: item.contentAr || "",
      seoTitleAr: item.seoTitleAr || "",
      seoDescriptionAr: item.seoDescriptionAr || "",
      videoUrl: item.videoUrl || "",
      isPublished: item.isPublished ?? true,
      coverImage: item.coverImage || item.imageUrl || "",
      gallery: normalizedGallery,
      galleryDescriptions: [
        ...existingDescriptions.slice(0, normalizedGallery.length),
        ...Array(Math.max(normalizedGallery.length - existingDescriptions.length, 0)).fill("")
      ]
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

  async function handleCoverSelection(file: File | null) {
    setRemoveCoverImage(false);

    if (!file) {
      setCoverFile(null);
      return;
    }

    setIsCompressingImages(true);
    try {
      const [compressed] = await compressImageFiles([file]);
      setCoverFile(compressed || file);
    } finally {
      setIsCompressingImages(false);
    }
  }

  async function handleGallerySelection(files: File[]) {
    setIsCompressingImages(true);
    try {
      const compressed = await compressImageFiles(files);
      setGalleryFiles((current) => [...current, ...compressed]);
      setNewGalleryDescriptions((current) => [...current, ...compressed.map(() => "")]);
    } finally {
      setIsCompressingImages(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");

    if (isCompressingImages) {
      setError("يرجى الانتظار حتى يكتمل ضغط الصور ثم أعد المحاولة.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titleAr", form.titleAr);
      formData.append("slug", form.slug || toSlug(form.titleAr));
      if (form.sortOrder.trim() !== "") {
        formData.append("sortOrder", form.sortOrder.trim());
      }
      formData.append("shortDescAr", form.shortDescAr);
      formData.append("contentAr", form.contentAr);
      formData.append("seoTitleAr", form.seoTitleAr);
      formData.append("seoDescriptionAr", form.seoDescriptionAr);
      formData.append("videoUrl", form.videoUrl);
      formData.append("isPublished", String(form.isPublished));
      formData.append("gallery", JSON.stringify(form.gallery));
      formData.append("galleryDescriptions", JSON.stringify(form.galleryDescriptions));
      formData.append("newGalleryDescriptions", JSON.stringify(newGalleryDescriptions));

      if (removeCoverImage) {
        formData.append("removeCoverImage", "true");
      } else if (form.coverImage && !coverFile) {
        formData.append("coverImage", form.coverImage);
      }

      if (coverFile) {
        formData.append("coverImage", coverFile);
      }

      if (removeVideoUrl) {
        formData.append("removeVideoUrl", "true");
      }

      if (videoFile) {
        formData.append("video", videoFile);
      }

      galleryFiles.forEach((file) => formData.append("gallery", file));

      const proxyEndpoint = form.id ? `/api/services/${form.id}` : "/api/services";
      const method = form.id ? "PUT" : "POST";
      const directApiBaseUrl = getDirectApiBaseUrl();
      const token = getCookieValue("admin_token");
      const canUseDirectApi = Boolean(directApiBaseUrl && token);
      const directEndpoint = form.id ? `${directApiBaseUrl}/services/${form.id}` : `${directApiBaseUrl}/services`;
      const endpoint = canUseDirectApi ? directEndpoint : proxyEndpoint;

      const response = await fetch(endpoint, {
        method,
        ...(canUseDirectApi ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        body: formData
      });

      if (!response.ok) {
        const errorPayload = await parseApiErrorResponse(response);
        setError(buildSaveErrorMessage(response.status, errorPayload));
        return;
      }

      setNotice("تم حفظ الخدمة");
      resetForm();
      loadServices();
    } catch {
      setError("تعذر الاتصال بالخادم أثناء حفظ الخدمة. تحقق من الشبكة وإعدادات API/CORS ثم حاول مرة أخرى.");
    }
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

          <div className="field-stack">
            <label htmlFor="service-sort-order">ترتيب العرض</label>
            <input
              id="service-sort-order"
              type="number"
              min={0}
              step={1}
              value={form.sortOrder}
              onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
              placeholder="يترك فارغا ليتم وضعها في آخر القائمة"
            />
            <small className="admin-hint">الرقم الأصغر يظهر أولا.</small>
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
                const selectedFile = event.target.files?.[0] || null;
                void handleCoverSelection(selectedFile);
              }}
            />
            {isCompressingImages ? <small className="admin-hint">جار ضغط الصور لتحسين السرعة...</small> : null}
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
                void handleGallerySelection(files);
              }}
            />
            <small className="admin-hint">سيتم ضغط صور المعرض تلقائيا قبل الرفع.</small>
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

          <button className="btn btn-primary" type="submit" disabled={isCompressingImages}>
            {isCompressingImages ? "جار تجهيز الصور..." : form.id ? "تحديث الخدمة" : "حفظ الخدمة"}
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
                <th>الترتيب</th>
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
                  <td>{typeof item.sortOrder === "number" ? item.sortOrder : "-"}</td>
                  <td>{item.isPublished ? "منشور" : "غير منشور"}</td>
                  <td>{formatDate(item.updatedAt)}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-outline" type="button" onClick={() => handleEdit(item)}>
                        تعديل
                      </button>
                      <Link className="btn btn-outline" href={`/admin/services/${item.id}`}>
                        صفحة SEO
                      </Link>
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
