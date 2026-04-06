import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";
import ServiceCard from "@/components/ServiceCard";
import { getServices, getProjects } from "@/lib/api";
import { HOMEPAGE_SEO_DESCRIPTION, LOCAL_AREAS, SEO_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "مقاولات عامة بالدمام | دهانات، عزل أسطح، مظلات وسواتر، جبس وديكور",
  description: HOMEPAGE_SEO_DESCRIPTION,
  keywords: [...SEO_KEYWORDS.global, ...SEO_KEYWORDS.services],
  alternates: { canonical: "/" }
};

export default async function HomePage() {
  const services = await getServices();
  const settings = {
    name: "مقاولات عامة الدمام",
    phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880",
    wa: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966556741880"
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: settings.name,
    areaServed: LOCAL_AREAS,
    telephone: `+${settings.phone}`,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    sameAs: [`https://wa.me/${settings.wa}`],
    serviceType: ["دهانات", "عزل أسطح", "أعمال حديد", "جبس وديكورات"]
  };

  return (
    <>
      <section className="cta-strip">
        <div className="container cta-strip-inner">
          <p>ابدأ مشروعك اليوم واحصل على معاينة مجانية خلال وقت قصير</p>
          <div className="action-row">
            <a className="btn btn-primary" href={`tel:+${settings.phone}`}>
              اتصال فوري
            </a>
            <a className="btn btn-outline wa-direct-btn" href={`https://wa.me/${settings.wa}`} target="_blank" rel="noreferrer">
              واتساب مباشر
            </a>
          </div>
        </div>
      </section>

      <section className="hero">
        <div className="container hero-wrap">
          <div className="hero-content">
            <h1>مقاولات عامة الدمام لخدمات الدهانات والعزل والحديد والديكور</h1>
            <p>
              فريق متخصص لخدمة عملاء المنطقة الشرقية. تنفيذ احترافي، التزام بالمواعيد، وأسعار واضحة.
            </p>
            <div className="hero-main-image-wrap">
              <Image
                src="/images/main-image.webp"
                alt="صورة رئيسية لخدمات مقاولات عامة الدمام"
                className="hero-main-image"
                width={1400}
                height={900}
                quality={72}
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
            </div>
            <div className="action-row">
              <Link className="btn btn-primary" href="/contact">
                اطلب عرض سعر الآن
              </Link>
              <a className="btn btn-outline" href={`https://wa.me/${settings.wa}`} target="_blank" rel="noreferrer">
                تواصل واتساب
              </a>
            </div>
            <div className="metrics mt-1">
              <div className="card">
                <strong>+100</strong>
                <div>مشروع منفذ</div>
              </div>
              <div className="card">
                <strong>24 ساعة</strong>
                <div>زمن الاستجابة</div>
              </div>
              <div className="card">
                <strong>ضمان</strong>
                <div>على جودة التنفيذ</div>
              </div>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>

      <section className="section section-compact-top">
        <div className="container">
          <h2>لماذا يختارنا العملاء؟</h2>
          <div className="grid trust-grid">
            <article className="card trust-card">
              <strong>+100</strong>
              <h3>عدد مشاريع موثوق</h3>
              <p>تنفيذ متنوع للمنازل والفلل والمباني التجارية في الدمام والخبر والظهران.</p>
            </article>
            <article className="card trust-card">
              <strong>ضمان مكتوب</strong>
              <h3>ضمان جودة التنفيذ</h3>
              <p>نقدم ضمانًا واضحًا على جودة التشطيب والمواد حسب نوع الخدمة المتفق عليها.</p>
            </article>
            <article className="card trust-card">
              <strong>استجابة سريعة</strong>
              <h3>رد سريع على طلباتك</h3>
              <p>فريق المتابعة يتواصل بسرعة لتأكيد التفاصيل وتحديد أقرب موعد للمعاينة.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>خدماتنا</h2>
          <div className="grid grid-services">
            {services.slice(0, 6).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-compact-top">
        <div className="container">
          <h2>خدمات يبحث عنها العملاء في الدمام والمنطقة الشرقية</h2>
          <p className="seo-intro">
            نوفر أعمال دهان وعزل ومظلات وسواتر وجبس وديكور وترميم في الدمام والخبر والظهران والقطيف مع معاينة سريعة.
          </p>
          <div className="seo-keywords-grid" aria-label="الكلمات المفتاحية المحلية للخدمات">
            {SEO_KEYWORDS.services.slice(0, 16).map((keyword) => (
              <span key={keyword} className="seo-keyword-chip">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="section">
            <div className="container">
              <h2>أحدث المشاريع</h2>
              <div className="grid grid-3">
                {[1, 2, 3].map((item) => (
                  <article key={item} className="card">
                    <h3>جاري تحميل المشاريع...</h3>
                    <p>يتم جلب أحدث الأعمال الآن.</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        }
      >
        <HomeProjectsSection />
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    </>
  );
}

async function HomeProjectsSection() {
  const projects = await getProjects();

  return (
    <section className="section">
      <div className="container">
        <h2>أحدث المشاريع</h2>
        <div className="grid grid-3">
          {projects.slice(0, 3).map((project) => (
            <article key={project.id} className="card">
              <h3>{project.titleAr}</h3>
              <p>{project.descriptionAr}</p>
              <small>
                {project.locationAr} - {project.categoryAr}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
