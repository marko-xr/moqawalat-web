"use client";

import { useMemo, useState } from "react";

const API_URL = "/api";
const REQUEST_TIMEOUT_MS = 10000;

export default function QuoteForm() {
  const [status, setStatus] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [locationUrl, setLocationUrl] = useState<string>("");
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [locationStatusType, setLocationStatusType] = useState<"success" | "error" | "loading" | "idle">("idle");
  const startedAt = useMemo(() => new Date().toISOString(), []);

  async function handleDetectLocation() {
    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (!window.isSecureContext && !isLocalHost) {
      setLocationStatusType("error");
      setLocationStatus("تحديد الموقع يحتاج اتصالا آمنا HTTPS. افتح الموقع عبر رابط آمن ثم حاول مرة أخرى.");
      return;
    }

    if (!("geolocation" in navigator)) {
      setLocationStatusType("error");
      setLocationStatus("المتصفح لا يدعم تحديد الموقع على هذا الجهاز.");
      return;
    }

    if ("permissions" in navigator && typeof navigator.permissions.query === "function") {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });

        if (permission.state === "denied") {
          setLocationStatusType("error");
          setLocationStatus("تم منع صلاحية الموقع مسبقا. فعّل إذن الموقع من إعدادات المتصفح ثم أعد المحاولة.");
          return;
        }
      } catch {
        // Some browsers do not support geolocation permission query.
      }
    }

    setLocationStatusType("loading");
    setLocationStatus("جاري تحديد الموقع...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        setLocationUrl(mapsUrl);
        setLocationStatusType("success");
        setLocationStatus("تم تحديد الموقع بنجاح ✅");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatusType("error");
          setLocationStatus("يرجى السماح بالوصول للموقع. إذا لم تظهر النافذة، فعّل إذن الموقع من إعدادات المتصفح.");
          return;
        }

        setLocationStatusType("error");
        setLocationStatus("تعذر تحديد الموقع الآن، حاول مرة أخرى.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusType("info");
    setStatus("جاري إرسال الطلب...");

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("locationUrl", locationUrl.trim());
    data.append("formStartedAt", startedAt);
    data.append("source", "website");
    data.append("pageUrl", window.location.pathname);

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      abortController.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
      console.log("QuoteForm submit payload prepared", {
        endpoint: `${API_URL}/leads`,
        page: window.location.pathname
      });

      const response = await fetch(`${API_URL}/leads`, {
        method: "POST",
        body: data,
        signal: abortController.signal
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const backendMessage =
          typeof payload?.message === "string" && payload.message.length > 0
            ? payload.message
            : "تعذر إرسال الطلب، حاول مرة أخرى.";

        setStatusType("error");
        setStatus(backendMessage);
        return;
      }

        form.reset();
        setLocationUrl("");
        setLocationStatus("");
        setLocationStatusType("idle");
      setStatusType("success");
      setStatus("تم استلام طلبك بنجاح، سنتواصل معك قريبًا.");

      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "quote", pageUrl: window.location.pathname })
      });
    } catch (error) {
      console.error("QuoteForm submit error", error);

      if (error instanceof DOMException && error.name === "AbortError") {
        setStatusType("error");
        setStatus("انتهت مهلة الإرسال. يرجى المحاولة مرة أخرى.");
      } else {
        setStatusType("error");
        setStatus("فشل الاتصال بالخادم. تحقق من الشبكة ثم أعد المحاولة.");
      }
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="card quote-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <h3>طلب عرض سعر سريع</h3>
        <p className="quote-form-caption">املأ البيانات الأساسية وسنعاود الاتصال بك في أسرع وقت.</p>
      </div>

      <div className="quote-grid">
        <div className="field-stack">
          <label htmlFor="fullName">الاسم الكامل</label>
          <input id="fullName" type="text" name="fullName" placeholder="مثال: محمد العتيبي" autoComplete="name" required />
        </div>

        <div className="field-stack">
          <label htmlFor="phone">رقم الجوال للتواصل</label>
          <input
            id="phone"
            type="tel"
            name="phone"
            placeholder="05xxxxxxxx"
            inputMode="tel"
            autoComplete="tel"
            required
          />
        </div>

        <div className="field-stack">
          <label htmlFor="whatsapp">رقم الواتساب (اختياري)</label>
          <input
            id="whatsapp"
            type="tel"
            name="whatsapp"
            placeholder="إذا مختلف عن رقم الجوال"
            inputMode="tel"
            autoComplete="tel"
          />
        </div>

        <div className="field-stack">
          <label htmlFor="city">المدينة</label>
          <select id="city" name="city" title="المدينة" required>
            <option value="">اختر المدينة</option>
            <option value="الدمام">الدمام</option>
            <option value="الخبر">الخبر</option>
            <option value="الظهران">الظهران</option>
          </select>
        </div>

        <div className="field-stack quote-grid-full">
          <label htmlFor="locationUrl">رابط أو وصف الموقع (اختياري)</label>
          <input
            id="locationUrl"
            type="text"
            name="locationUrl"
            value={locationUrl}
            onChange={(event) => setLocationUrl(event.target.value)}
            placeholder="يمكنك كتابة وصف المكان أو لصق رابط خرائط"
            autoComplete="off"
          />
          <div className="location-tools">
            <button
              type="button"
              className="btn btn-outline location-detect-btn"
              onClick={() => {
                void handleDetectLocation();
              }}
              disabled={isSubmitting || locationStatusType === "loading"}
            >
              {locationStatusType === "loading" ? "جاري تحديد الموقع..." : "📍 تحديد موقعي الحالي"}
            </button>
            {locationStatus ? (
              <small
                className={
                  locationStatusType === "success"
                    ? "location-status-success"
                    : locationStatusType === "error"
                      ? "location-status-error"
                      : "location-status-loading"
                }
              >
                {locationStatus}
              </small>
            ) : null}
          </div>
        </div>

        <div className="field-stack quote-grid-full">
          <label htmlFor="serviceType">نوع الخدمة المطلوبة</label>
          <select id="serviceType" name="serviceType" title="نوع الخدمة" required>
            <option value="">اختر الخدمة</option>
            <option value="دهانات">دهانات</option>
            <option value="عزل أسطح">عزل أسطح</option>
            <option value="أعمال حديد">أعمال حديد</option>
            <option value="جبس وديكور">جبس وديكور</option>
          </select>
        </div>

        <div className="field-stack quote-grid-full">
          <label htmlFor="message">تفاصيل سريعة عن المشروع</label>
          <textarea id="message" name="message" rows={3} placeholder="المساحة، نوع العمل، الوقت المتوقع..." />
        </div>

        <div className="field-stack quote-grid-full">
          <label htmlFor="image">صورة لشكل الجزء المراد العمل عليه (اختياري)</label>
          <input id="image" type="file" name="image" accept="image/*,video/*" />
          <small className="admin-hint">يمكنك رفع صورة أو فيديو قصير لتوضيح الحالة بشكل أفضل.</small>
        </div>
      </div>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        title="website"
        placeholder="website"
        autoComplete="off"
        className="hidden-field"
        aria-hidden
      />

      <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
      </button>
      {status ? (
        <small className={statusType === "success" ? "form-status-success" : statusType === "error" ? "form-status-error" : ""}>
          {status}
        </small>
      ) : null}
    </form>
  );
}
