import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/roof-insulation-dammam/Hero";
import Services from "@/components/roof-insulation-dammam/Services";
import FAQ from "@/components/roof-insulation-dammam/FAQ";
import CTA from "@/components/roof-insulation-dammam/CTA";
import { getServiceSeoPageBySlug } from "@/lib/api";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const pagePath = "/iron-works-shades-screens-dammam";
const pageSlug = "iron-works-shades-screens-dammam";
const legacyServiceSlug = "metal-works";

type IronWorksPageModel = {
  pageTitle: string;
  pageDescription: string;
  heroTitle: string;
  heroLead: string;
  heroPoints: string[];
  heroImage: string;
  trustItems: Array<{ title: string; description: string }>;
  serviceHeading: string;
  serviceIntro: string;
  serviceItems: Array<{ title: string; description: string; imageAlt: string }>;
  serviceImage: string;
  serviceImages: string[];
  areas: string[];
  relatedLinks: Array<{ title: string; href: string }>;
  ctaTopTitle: string;
  ctaTopDescription: string;
  ctaBottomTitle: string;
  ctaBottomDescription: string;
  faqItems: Array<{ question: string; answer: string }>;
  metaTitle: string;
  metaDescription: string;
};

const defaultModel: IronWorksPageModel = {
  pageTitle: "أعمال الحديد والمظلات والسواتر",
  pageDescription:
    "تنفيذ وتركيب مظلات سيارات حديثة، سواتر حديد، وسلالم حديدية داخلية وخارجية في الدمام والخبر بأعلى معايير الجودة والمتانة.",
  heroTitle: "أعمال الحديد والمظلات والسواتر",
  heroLead:
    "نقدم خدمات متكاملة في أعمال الحديد المتخصصة لتلبية احتياجات المنازل والمنشآت في المنطقة الشرقية، مع استخدام أفضل أنواع الحديد والدهانات المقاومة للصدأ لضمان عمر افتراضي طويل.",
  heroPoints: [
    "مظلات سيارات حديثة مقاومة للحرارة والرطوبة.",
    "سواتر حديد مشغول ومودرن للخصوصية والأمان.",
    "تفصيل سلالم طوارئ وسلالم داخلية بتصاميم عصرية."
  ],
  heroImage: "/images/placeholder-before.svg",
  trustItems: [
    {
      title: "حديد عالي الجودة",
      description: "نعتمد على خامات حديد قوية مع دهانات مقاومة للصدأ والعوامل الجوية."
    },
    {
      title: "تصميم وتنفيذ حسب الطلب",
      description: "ننفذ المظلات والسواتر والسلالم بمقاسات دقيقة وتفاصيل متناسقة مع واجهة المبنى."
    },
    {
      title: "متانة وعمر افتراضي طويل",
      description: "نركز على قوة التثبيت وجودة التشطيب لضمان استمرار الأداء والجمال لسنوات."
    }
  ],
  serviceHeading: "تفاصيل أعمال الحديد والمظلات والسواتر",
  serviceIntro:
    "تشمل خدماتنا: مظلات سيارات، سواتر حديد، وسلالم حديد داخلية وخارجية، مع تنفيذ احترافي يناسب المنازل والمنشآت في الدمام والخبر وكامل المنطقة الشرقية.",
  serviceItems: [
    {
      title: "الصورة 1 - مظلات سيارات PVC",
      description:
        "تنفيذ وتركيب مظلات سيارات قماشية (PVC) في الدمام بتصاميم متنوعة (هرمي، مقوس، كابولي). توفر حماية قصوى من أشعة الشمس والأشعة فوق البنفسجية، مع ضمان المتانة ومقاومة الرياح القوية في المنطقة الشرقية.",
      imageAlt: "مظلات سيارات قماشية PVC في الدمام"
    },
    {
      title: "الصورة 2 - مظلات مودرن مع قص ليزر",
      description:
        "تركيب مظلات سيارات مودرن تجمع بين الحديد وقص الليزر (CNC) والقماش الفاخر. تصميم عصري يضيف لمسة جمالية لواجهة الفلل في الخبر والدمام، مع توفير عزل حراري وحماية متميزة للمركبات.",
      imageAlt: "مظلات سيارات مودرن مع قص ليزر CNC"
    },
    {
      title: "الصورة 3 - مظلات خزانات المياه",
      description:
        "تنفيذ مظلات حماية لخزانات المياه العلوية لتقليل تأثير حرارة الشمس المباشرة على المياه. نستخدم هياكل حديدية متينة مع تغطية قماشية مقاومة للحرارة لضمان بقاء المياه بدرجة حرارة معتدلة خلال فصل الصيف.",
      imageAlt: "مظلات حماية لخزانات المياه العلوية"
    },
    {
      title: "الصورة 4 - مظلات سيارات مقاومة للشمس",
      description:
        "تنفيذ وتركيب مظلات سيارات قماشية (PVC) في الدمام بتصاميم متنوعة (هرمي، مقوس، كابولي). توفر حماية قصوى من أشعة الشمس والأشعة فوق البنفسجية، مع ضمان المتانة ومقاومة الرياح القوية في المنطقة الشرقية.",
      imageAlt: "مظلات سيارات مقاومة للأشعة فوق البنفسجية"
    },
    {
      title: "الصورة 5 - سواتر جدران وأسوار",
      description:
        "أفضل مقاول حدادة لتنفيذ سواتر الجدران والأسوار المعدنية التي تجمع بين المتانة والشكل الجمالي.",
      imageAlt: "سواتر جدران وأسوار حديد بالدمام"
    },
    {
      title: "الصورة 6 - أسوار حديد مودرن",
      description:
        "تصميم وتنفيذ أسوار حديد مودرن وقص ليزر في المنطقة الشرقية بمواصفات فنية دقيقة وألوان مقاومة للصدأ.",
      imageAlt: "أسوار حديد مودرن وقص ليزر"
    },
    {
      title: "الصورة 7 - سواتر شرائح ومجدول",
      description:
        "تركيب سواتر حديد شرائح ومجدول بالدمام لتوفير الخصوصية التامة والحماية لأسوار الفلل والقصور.",
      imageAlt: "تركيب سواتر حديد شرائح ومجدول"
    },
    {
      title: "الصورة 8 - سواتر معدنية متينة",
      description:
        "أفضل مقاول حدادة لتنفيذ سواتر الجدران والأسوار المعدنية التي تجمع بين المتانة والشكل الجمالي.",
      imageAlt: "سواتر معدنية تجمع بين المتانة والجمال"
    },
    {
      title: "الصورة 9 - سلالم طوارئ خارجية",
      description:
        "تنفيذ وتركيب سلالم طوارئ حديد خارجية للمباني السكنية والتجارية في الدمام لضمان أعلى مستويات الأمان.",
      imageAlt: "سلالم طوارئ حديد خارجية في الدمام"
    },
    {
      title: "الصورة 10 - سلالم ودرابزين حديد",
      description:
        "حداد في الدمام لتصنيع السلالم المعدنية والدرابزينات الحديدية بجودة عالية وتشطيب احترافي.",
      imageAlt: "تصنيع سلالم ودرابزينات حديدية"
    },
    {
      title: "الصورة 11 - سلالم حلزونية عصرية",
      description:
        "تصميم وتفصيل سلالم حديد حلزونية داخلية وخارجية بأشكال عصرية تناسب جميع المساحات في الخبر والقطيف.",
      imageAlt: "سلالم حديد حلزونية داخلية وخارجية"
    },
    {
      title: "الصورة 12 - تفصيل سلالم حسب المساحة",
      description:
        "تصميم وتفصيل سلالم حديد حلزونية داخلية وخارجية بأشكال عصرية تناسب جميع المساحات في الخبر والقطيف.",
      imageAlt: "تفصيل سلالم حديد عصرية حسب المساحة"
    }
  ],
  serviceImage: "/images/placeholder-after.svg",
  serviceImages: [],
  areas: ["الدمام", "الخبر", "الظهران", "القطيف", "الجبيل"],
  relatedLinks: [
    { title: "الهناجر والبرجولات الحديدية", href: "/metal-works-hangars-pergolas-dammam" },
    { title: "خدمات الدهانات الداخلية والخارجية", href: "/painting-services-dammam" },
    { title: "عزل الأسطح بالدمام", href: "/roof-insulation-dammam" }
  ],
  ctaTopTitle: "تبحث عن مقاول حدادة موثوق؟",
  ctaTopDescription: "تواصل معنا الآن وخذ استشارة سريعة لتصميم وتنفيذ المظلات أو السواتر أو السلالم.",
  ctaBottomTitle: "ابدأ مشروع الحديد اليوم",
  ctaBottomDescription: "اتصل أو راسلنا عبر واتساب لحجز معاينة سريعة في الدمام وكامل المنطقة الشرقية.",
  faqItems: [
    {
      question: "ما أفضل نوع مظلات سيارات للحرارة في الشرقية؟",
      answer: "نوصي غالبا بمظلات PVC أو المظلات الحديدية المعزولة حسب الموقع، لأنها تتحمل الشمس والرطوبة بشكل ممتاز."
    },
    {
      question: "هل يمكن تنفيذ سواتر حديد بتصاميم مودرن؟",
      answer: "نعم، نوفر سواتر شرائح ومجدول وتصاميم قص ليزر مع خيارات ألوان متعددة مقاومة للصدأ."
    },
    {
      question: "هل تقدمون سلالم طوارئ حديد للمباني التجارية؟",
      answer: "نعم، ننفذ سلالم طوارئ خارجية وسلالم داخلية مع مراعاة متطلبات السلامة والاستخدام."
    },
    {
      question: "هل توفرون معاينة قبل التنفيذ؟",
      answer: "نعم، نقوم بمعاينة الموقع وتقديم تصور فني واضح قبل بدء التصنيع والتركيب."
    },
    {
      question: "هل الخدمة متاحة في الخبر والقطيف؟",
      answer: "نعم، نخدم الدمام والخبر والظهران والقطيف والجبيل وكافة مدن المنطقة الشرقية."
    }
  ],
  metaTitle: "أعمال الحديد والمظلات والسواتر بالدمام | جودة ومتانة عالية",
  metaDescription:
    "تنفيذ مظلات سيارات، سواتر حديد، وسلالم داخلية وخارجية في الدمام والخبر. تصميم احترافي وخامات مقاومة للصدأ بعمر افتراضي طويل."
};

function toString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function toTrustItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ title: string; description: string }>;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = toString((item as { title?: unknown }).title);
      const description = toString((item as { description?: unknown }).description);

      if (!title || !description) {
        return null;
      }

      return { title, description };
    })
    .filter((item): item is { title: string; description: string } => Boolean(item));
}

function toServiceItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ title: string; description: string; imageAlt: string }>;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = toString((item as { title?: unknown }).title);
      const description = toString((item as { description?: unknown }).description);
      const imageAlt = toString((item as { imageAlt?: unknown }).imageAlt);

      if (!title || !description) {
        return null;
      }

      return {
        title,
        description,
        imageAlt: imageAlt || `${title} في الدمام`
      };
    })
    .filter((item): item is { title: string; description: string; imageAlt: string } => Boolean(item));
}

function toFaqItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ question: string; answer: string }>;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const question = toString((item as { question?: unknown }).question);
      const answer = toString((item as { answer?: unknown }).answer);

      if (!question || !answer) {
        return null;
      }

      return { question, answer };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
}

function toRelatedLinks(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ title: string; href: string }>;
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const title = toString((item as { title?: unknown }).title);
      const href = toString((item as { href?: unknown }).href);

      if (!title || !href) {
        return null;
      }

      return { title, href };
    })
    .filter((item): item is { title: string; href: string } => Boolean(item));
}

async function getSeoSource() {
  const primary = await getServiceSeoPageBySlug(pageSlug);
  if (primary) {
    return primary;
  }

  return getServiceSeoPageBySlug(legacyServiceSlug);
}

function buildModel(source: Awaited<ReturnType<typeof getSeoSource>>): IronWorksPageModel {
  if (!source) {
    return defaultModel;
  }

  const sections = source.contentSections && typeof source.contentSections === "object" ? source.contentSections : {};

  const trustItems = toTrustItems((sections as { trustItems?: unknown }).trustItems);
  const serviceItems = toServiceItems((sections as { serviceItems?: unknown }).serviceItems);
  const areas = toStringArray((sections as { areas?: unknown }).areas);
  const relatedLinks = toRelatedLinks((sections as { relatedLinks?: unknown }).relatedLinks);
  const faqItems = toFaqItems(source.faq);

  const heroImage =
    toString((sections as { heroImage?: unknown }).heroImage) ||
    source.images?.[0] ||
    defaultModel.heroImage;
  const beforeImage = toString((sections as { beforeImage?: unknown }).beforeImage);
  const afterImage = toString((sections as { afterImage?: unknown }).afterImage);

  return {
    pageTitle: toString(source.title) || defaultModel.pageTitle,
    pageDescription: toString(source.metaDescription) || defaultModel.pageDescription,
    heroTitle: toString((sections as { heroTitle?: unknown }).heroTitle) || defaultModel.heroTitle,
    heroLead: toString((sections as { heroLead?: unknown }).heroLead) || defaultModel.heroLead,
    heroPoints: toStringArray((sections as { heroPoints?: unknown }).heroPoints).length
      ? toStringArray((sections as { heroPoints?: unknown }).heroPoints)
      : defaultModel.heroPoints,
    heroImage,
    trustItems: trustItems.length ? trustItems : defaultModel.trustItems,
    serviceHeading: defaultModel.serviceHeading,
    serviceIntro: toString((sections as { serviceIntro?: unknown }).serviceIntro) || defaultModel.serviceIntro,
    serviceItems: serviceItems.length ? serviceItems : defaultModel.serviceItems,
    serviceImage: afterImage || beforeImage || heroImage || defaultModel.serviceImage,
    serviceImages: Array.isArray(source.images) ? source.images.filter(Boolean) : defaultModel.serviceImages,
    areas: areas.length ? areas : defaultModel.areas,
    relatedLinks: relatedLinks.length ? relatedLinks : defaultModel.relatedLinks,
    ctaTopTitle: toString((sections as { ctaTopTitle?: unknown }).ctaTopTitle) || defaultModel.ctaTopTitle,
    ctaTopDescription:
      toString((sections as { ctaTopDescription?: unknown }).ctaTopDescription) || defaultModel.ctaTopDescription,
    ctaBottomTitle: toString((sections as { ctaBottomTitle?: unknown }).ctaBottomTitle) || defaultModel.ctaBottomTitle,
    ctaBottomDescription:
      toString((sections as { ctaBottomDescription?: unknown }).ctaBottomDescription) || defaultModel.ctaBottomDescription,
    faqItems: faqItems.length ? faqItems : defaultModel.faqItems,
    metaTitle: toString(source.metaTitle) || defaultModel.metaTitle,
    metaDescription: toString(source.metaDescription) || defaultModel.metaDescription
  };
}

function isExternalUrl(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export async function generateMetadata(): Promise<Metadata> {
  const model = buildModel(await getSeoSource());
  const siteUrl = getSiteUrl();
  const rawOgImage = model.heroImage.startsWith("http") ? model.heroImage : `${siteUrl}${model.heroImage}`;
  const ogImage = /\.(svg|webp)(\?|#|$)/i.test(rawOgImage) ? `${siteUrl}/images/logo-full.png` : rawOgImage;

  return {
    title: model.metaTitle,
    description: model.metaDescription,
    alternates: {
      canonical: pagePath
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      title: model.metaTitle,
      description: model.metaDescription,
      url: `${siteUrl}${pagePath}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 800,
          alt: model.heroTitle
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: model.metaTitle,
      description: model.metaDescription,
      images: [ogImage]
    }
  };
}

export default async function IronWorksShadesScreensDammamPage() {
  const model = buildModel(await getSeoSource());
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${pagePath}`;
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "مقاولات عامة الدمام",
    url: siteUrl,
    telephone: `+${phone}`,
    areaServed: ["Dammam", "Khobar", "Dhahran", "Qatif", "Jubail"]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: model.pageTitle,
    description: model.pageDescription,
    serviceType: "Iron Works, Shades and Screens",
    provider: {
      "@type": "LocalBusiness",
      name: "مقاولات عامة الدمام",
      areaServed: ["Dammam", "Khobar", "Dhahran", "Qatif", "Jubail"]
    },
    areaServed: ["Dammam", "Khobar", "Dhahran", "Qatif", "Jubail"],
    url: pageUrl
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: model.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <section className="section">
      <div className="container roof-page">
        <Hero title={model.heroTitle} lead={model.heroLead} points={model.heroPoints} imageSrc={model.heroImage} imageAlt={model.heroTitle} />

        <CTA title={model.ctaTopTitle} description={model.ctaTopDescription} eventSource="hero-cta" />

        <section className="roof-trust" aria-labelledby="iron-works-trust-heading">
          <h2 id="iron-works-trust-heading">لماذا يختارنا العملاء في الدمام؟</h2>
          <div className="roof-trust-grid">
            {model.trustItems.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <Services
          heading={model.serviceHeading}
          intro={model.serviceIntro}
          items={model.serviceItems}
          imageSrc={model.serviceImage}
          imageSources={model.serviceImages}
        />

        <section className="roof-areas card" aria-labelledby="iron-works-areas-heading">
          <h2 id="iron-works-areas-heading">مناطق الخدمة</h2>
          <p>نغطي خدمات الحديد والمظلات والسواتر في:</p>
          <div className="roof-areas-list">
            {model.areas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </section>

        <FAQ heading="الأسئلة الشائعة عن أعمال الحديد والمظلات والسواتر" items={model.faqItems} />

        <section className="card roof-links" aria-labelledby="iron-works-links-heading">
          <h2 id="iron-works-links-heading">خدمات مرتبطة قد تهمك</h2>
          <div className="roof-links-grid">
            {model.relatedLinks.map((item) =>
              isExternalUrl(item.href) ? (
                <a key={`${item.title}-${item.href}`} href={item.href} target="_blank" rel="noreferrer">
                  {item.title}
                </a>
              ) : (
                <Link key={`${item.title}-${item.href}`} href={item.href}>
                  {item.title}
                </Link>
              )
            )}
          </div>
        </section>

        <CTA title={model.ctaBottomTitle} description={model.ctaBottomDescription} eventSource="footer-cta" />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}