"use client";

import { useEffect, useMemo, useState } from "react";
import type { BlogPost, DashboardAnalytics, Lead, Project, Service } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Section = "analytics" | "services" | "projects" | "blog" | "leads";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "");
}

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>("analytics");
  const [token, setToken] = useState<string>("");
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [message, setMessage] = useState<string>("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  async function loadAll() {
    const [a, s, p, b, l] = await Promise.all([
      fetch(`${API_URL}/analytics/dashboard`, { headers }).then((r) => r.json()),
      fetch(`${API_URL}/services`).then((r) => r.json()),
      fetch(`${API_URL}/projects`).then((r) => r.json()),
      fetch(`${API_URL}/blog?all=true`).then((r) => r.json()),
      fetch(`${API_URL}/leads`, { headers }).then((r) => r.json())
    ]);

    setAnalytics(a);
    setServices(s);
    setProjects(p);
    setPosts(b);
    setLeads(l.items || []);
  }

  useEffect(() => {
    const saved = localStorage.getItem("admin_token");

    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadAll().catch(() => setMessage("تعذر تحميل بيانات لوحة التحكم"));
    }
  }, [token]);

  async function saveService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") || "");
    const titleAr = String(form.get("titleAr") || "");
    const payload = {
      titleAr,
      slug: String(form.get("slug") || toSlug(titleAr)),
      shortDescAr: String(form.get("shortDescAr") || ""),
      contentAr: String(form.get("contentAr") || ""),
      seoTitleAr: String(form.get("seoTitleAr") || ""),
      seoDescriptionAr: String(form.get("seoDescriptionAr") || "")
    };

    const endpoint = id ? `${API_URL}/services/${id}` : `${API_URL}/services`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
    if (res.ok) {
      setMessage("تم حفظ الخدمة");
      event.currentTarget.reset();
      loadAll();
    }
  }

  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") || "");
    const titleAr = String(form.get("titleAr") || "");
    const payload = {
      titleAr,
      slug: String(form.get("slug") || toSlug(titleAr)),
      locationAr: String(form.get("locationAr") || ""),
      categoryAr: String(form.get("categoryAr") || ""),
      descriptionAr: String(form.get("descriptionAr") || ""),
      beforeImage: String(form.get("beforeImage") || ""),
      afterImage: String(form.get("afterImage") || "")
    };

    const endpoint = id ? `${API_URL}/projects/${id}` : `${API_URL}/projects`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
    if (res.ok) {
      setMessage("تم حفظ المشروع");
      event.currentTarget.reset();
      loadAll();
    }
  }

  async function savePost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("id") || "");
    const titleAr = String(form.get("titleAr") || "");
    const payload = {
      titleAr,
      slug: String(form.get("slug") || toSlug(titleAr)),
      excerptAr: String(form.get("excerptAr") || ""),
      contentAr: String(form.get("contentAr") || ""),
      seoTitleAr: String(form.get("seoTitleAr") || ""),
      seoDescriptionAr: String(form.get("seoDescriptionAr") || ""),
      published: String(form.get("published") || "true") === "true"
    };

    const endpoint = id ? `${API_URL}/blog/${id}` : `${API_URL}/blog`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
    if (res.ok) {
      setMessage("تم حفظ المقال");
      event.currentTarget.reset();
      loadAll();
    }
  }

  async function changeLeadStatus(id: string, status: Lead["status"]) {
    await fetch(`${API_URL}/leads/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status })
    });
    loadAll();
  }

  async function updateLeadNotes(id: string, crmNotes: string) {
    await fetch(`${API_URL}/leads/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ crmNotes })
    });
    setMessage("تم تحديث الملاحظة");
    loadAll();
  }

  async function logout() {
    localStorage.removeItem("admin_token");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="admin-grid">
      <aside className="card sidebar">
        <h3>لوحة التحكم</h3>
        <div className="grid">
          <button className="btn btn-outline" onClick={() => setSection("analytics")}>التحليلات</button>
          <button className="btn btn-outline" onClick={() => setSection("services")}>الخدمات</button>
          <button className="btn btn-outline" onClick={() => setSection("projects")}>المشاريع</button>
          <button className="btn btn-outline" onClick={() => setSection("blog")}>المدونة</button>
          <button className="btn btn-outline" onClick={() => setSection("leads")}>العملاء المحتملون</button>
          <button className="btn" onClick={logout}>تسجيل خروج</button>
        </div>
      </aside>

      <section className="grid">
        {message ? <div className="card">{message}</div> : null}

        {section === "analytics" && analytics ? (
          <div className="grid grid-3">
            <div className="card"><strong>{analytics.leadCount}</strong><div>إجمالي العملاء المحتملين</div></div>
            <div className="card"><strong>{analytics.todayLeads}</strong><div>عملاء اليوم</div></div>
            <div className="card"><strong>{analytics.callClicks}</strong><div>نقرات الاتصال</div></div>
            <div className="card"><strong>{analytics.whatsappClicks}</strong><div>نقرات الواتساب</div></div>
          </div>
        ) : null}

        {section === "services" ? (
          <>
            <form className="card grid" onSubmit={saveService}>
              <h3>إضافة / تحديث خدمة</h3>
              <input name="id" placeholder="ID للتحديث (اختياري)" />
              <input name="titleAr" placeholder="اسم الخدمة" required />
              <input name="slug" placeholder="slug (اختياري)" />
              <input name="shortDescAr" placeholder="وصف مختصر" required />
              <textarea name="contentAr" rows={4} placeholder="وصف كامل" required />
              <input name="seoTitleAr" placeholder="SEO Title" />
              <input name="seoDescriptionAr" placeholder="SEO Description" />
              <button className="btn btn-primary" type="submit">حفظ</button>
            </form>
            <div className="grid">
              {services.map((item) => (
                <article key={item.id} className="card">
                  <strong>{item.titleAr}</strong>
                  <small>{item.slug}</small>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {section === "projects" ? (
          <>
            <form className="card grid" onSubmit={saveProject}>
              <h3>إضافة / تحديث مشروع</h3>
              <input name="id" placeholder="ID للتحديث (اختياري)" />
              <input name="titleAr" placeholder="عنوان المشروع" required />
              <input name="slug" placeholder="slug (اختياري)" />
              <input name="locationAr" placeholder="المدينة" required />
              <input name="categoryAr" placeholder="التصنيف" required />
              <textarea name="descriptionAr" rows={4} placeholder="الوصف" required />
              <input name="beforeImage" placeholder="رابط صورة قبل" />
              <input name="afterImage" placeholder="رابط صورة بعد" />
              <button className="btn btn-primary" type="submit">حفظ</button>
            </form>
            <div className="grid">
              {projects.map((item) => (
                <article key={item.id} className="card">
                  <strong>{item.titleAr}</strong>
                  <small>{item.locationAr}</small>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {section === "blog" ? (
          <>
            <form className="card grid" onSubmit={savePost}>
              <h3>إضافة / تحديث مقال</h3>
              <input name="id" placeholder="ID للتحديث (اختياري)" />
              <input name="titleAr" placeholder="العنوان" required />
              <input name="slug" placeholder="slug (اختياري)" />
              <input name="excerptAr" placeholder="مقتطف" required />
              <textarea name="contentAr" rows={5} placeholder="المحتوى" required />
              <input name="seoTitleAr" placeholder="SEO Title" />
              <input name="seoDescriptionAr" placeholder="SEO Description" />
              <select name="published" title="حالة النشر">
                <option value="true">منشور</option>
                <option value="false">غير منشور</option>
              </select>
              <button className="btn btn-primary" type="submit">حفظ</button>
            </form>
            <div className="grid">
              {posts.map((item) => (
                <article key={item.id} className="card">
                  <strong>{item.titleAr}</strong>
                  <small>{item.slug}</small>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {section === "leads" ? (
          <div className="grid">
            {leads.map((lead) => (
              <article key={lead.id} className="card grid">
                <strong>{lead.fullName}</strong>
                <div>{lead.phone}</div>
                <div>{lead.city} - {lead.serviceType}</div>
                <small>{new Date(lead.createdAt).toLocaleString("ar-SA")}</small>
                <select
                  title="حالة العميل"
                  defaultValue={lead.status}
                  onChange={(e) => changeLeadStatus(lead.id, e.target.value as Lead["status"])}
                >
                  <option value="NEW">جديد</option>
                  <option value="CONTACTED">تم التواصل</option>
                  <option value="QUALIFIED">مؤهل</option>
                  <option value="CLOSED">مغلق</option>
                </select>
                <textarea
                  defaultValue={lead.crmNotes || ""}
                  rows={3}
                  placeholder="ملاحظات CRM"
                  onBlur={(e) => updateLeadNotes(lead.id, e.target.value)}
                />
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
