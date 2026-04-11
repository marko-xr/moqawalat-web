import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/roof-insulation-dammam/Hero";
import Services from "@/components/roof-insulation-dammam/Services";
import FAQ from "@/components/roof-insulation-dammam/FAQ";
import CTA from "@/components/roof-insulation-dammam/CTA";
import { getServiceSeoPageByServiceSlug, getServiceSeoPageBySlug } from "@/lib/api";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const pagePath = "/gypsum-decorations-dammam";
const pageSlug = "gypsum-decorations-dammam";
const legacyServiceSlug = "gypsum-decorations";

type GypsumPageModel = {
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

const defaultModel: GypsumPageModel = {
  pageTitle: "الجبس والديكورات",
  pageDescription: "ديكورات جبسية عصرية وأسقف مستعارة وتشطيبات داخلية في الدمام والخبر والظهران.",
  heroTitle: "الجبس والديكورات",
  heroLead: "نصمم حلول جبس وديكور تعكس ذوقك، مع تنفيذ دقيق وتشطيبات فاخرة للمنازل والمكاتب والمعارض.",
  heroPoints: [
    "تصاميم جبس بورد مودرن تناسب كل المساحات.",
    "تشطيبات داخلية فاخرة مع عناية بالتفاصيل.",
    "تنسيق احترافي للإضاءة والديكور النهائي."
  ],
  heroImage: "/images/placeholder-before.svg",
  trustItems: [
    {
      title: "دقة تشطيب عالية",
      description: "نلتزم باستواء الأسطح ونظافة الزوايا والتفاصيل النهائية لإخراج ديكور فخم ومتناسق."
    },
    {
      title: "خامات مناسبة للمناخ",
      description: "نستخدم خامات جبسية مناسبة للرطوبة مع تنفيذ احترافي يضمن ثبات الشكل والجودة."
    },
    {
      title: "تنفيذ منظم وسريع",
      description: "جدولة واضحة للعمل مع تسليم منظم يحافظ على نظافة الموقع وسرعة الإنجاز."
    }
  ],
  serviceHeading: "تفاصيل خدمة الجبس والديكورات",
  serviceIntro: "من الأسقف المستعارة إلى بديل الخشب وديكورات الشاشات، نقدم حلول ديكور متكاملة بلمسات عصرية.",
  serviceItems: [
    {
      title: "الصورة 1 - دهانات جوتن أصلية",
      description:
        "متخصصون في تطبيق دهانات جوتن (Jotun) الأصلية بألوانها الأكثر طلبا مثل (فانيلا لاتيه، بريز، لايمستون). نضمن لك ملمسا ناعما وتغطية مثالية للجدران، مع معالجة كاملة للعيوب قبل الصبغ لضمان نتيجة نهائية مبهرة تعكس ذوقك الرفيع.",
      imageAlt: "دهانات جوتن أصلية للديكورات الداخلية في الدمام"
    },
    {
      title: "الصورة 2 - تشطيب جدران فاخر",
      description:
        "متخصصون في تطبيق دهانات جوتن (Jotun) الأصلية بألوانها الأكثر طلبا مثل (فانيلا لاتيه، بريز، لايمستون). نضمن لك ملمسا ناعما وتغطية مثالية للجدران، مع معالجة كاملة للعيوب قبل الصبغ لضمان نتيجة نهائية مبهرة تعكس ذوقك الرفيع.",
      imageAlt: "تشطيب جدران داخلي فاخر بالدمام"
    },
    {
      title: "الصورة 3 - أسقف جبس بورد متعددة المستويات",
      description:
        "تصميم وتركيب أسقف الجبس بورد متعددة المستويات للغرف الواسعة والمجالس. نستخدم أجود أنواع الجبس المقاوم للرطوبة، مع مراعاة توزيع الإضاءة المركزية والجانبية لإضافة فخامة استثنائية على المكان بلمسات تشطيب احترافية.",
      imageAlt: "أسقف جبس بورد متعددة المستويات في الدمام"
    },
    {
      title: "الصورة 4 - جبس مودرن بإضاءة مخفية",
      description:
        "تنفيذ أرقى تصاميم الجبس بورد المودرن مع نظام الإضاءة المخفية (Indirect Lighting). نركز على الدقة في استواء السطح ونظافة الزوايا لتعطي مظهرا واسعا ومريحا للصالات والممرات، مع دمج فتحات التكييف والسبوت لايت بشكل هندسي أنيق.",
      imageAlt: "تصميم جبس مودرن مع إضاءة مخفية"
    },
    {
      title: "الصورة 5 - تشطيب مجالس وغرف",
      description:
        "تصميم وتركيب أسقف الجبس بورد متعددة المستويات للغرف الواسعة والمجالس. نستخدم أجود أنواع الجبس المقاوم للرطوبة، مع مراعاة توزيع الإضاءة المركزية والجانبية لإضافة فخامة استثنائية على المكان بلمسات تشطيب احترافية.",
      imageAlt: "تشطيب جبس للمجالس والغرف في الدمام"
    },
    {
      title: "الصورة 6 - ممرات وصالات جبس بورد",
      description:
        "تنفيذ أرقى تصاميم الجبس بورد المودرن مع نظام الإضاءة المخفية (Indirect Lighting). نركز على الدقة في استواء السطح ونظافة الزوايا لتعطي مظهرا واسعا ومريحا للصالات والممرات، مع دمج فتحات التكييف والسبوت لايت بشكل هندسي أنيق.",
      imageAlt: "تصاميم جبس بورد للممرات والصالونات"
    },
    {
      title: "الصورة 7 - تجهيز ودهان احترافي",
      description:
        "متخصصون في تطبيق دهانات جوتن (Jotun) الأصلية بألوانها الأكثر طلبا مثل (فانيلا لاتيه، بريز، لايمستون). نضمن لك ملمسا ناعما وتغطية مثالية للجدران، مع معالجة كاملة للعيوب قبل الصبغ لضمان نتيجة نهائية مبهرة تعكس ذوقك الرفيع.",
      imageAlt: "تجهيز ودهان جدران احترافي بالدمام"
    },
    {
      title: "الصورة 8 - بديل الخشب وديكورات الشاشات",
      description:
        "بديل الخشب، ديكورات شاشات، دهانات مودرن، تجديد شقق بالدمام. تركيب ديكورات بديل الخشب (WPC) ودهانات الجدران المودرن لتجديد الصالات وغرف النوم. نوفر حلولا مبتكرة لتنسيق الإضاءة مع الخلفيات الخشبية لتعطي مظهرا أنيقا وعصريا للمنازل والمكاتب في المنطقة الشرقية.",
      imageAlt: "بديل الخشب وديكورات الشاشات في الدمام"
    }
  ],
  serviceImage: "/images/placeholder-after.svg",
  serviceImages: [],
  areas: ["الدمام", "الخبر", "الظهران", "القطيف"],
  relatedLinks: [
    { title: "عزل الأسطح بالدمام", href: "/roof-insulation-dammam" },
    { title: "خدمات الدهانات الداخلية والخارجية", href: "/services/painting-services" },
    { title: "الأعمال الحديدية والمظلات", href: "/services/metal-works" }
  ],
  ctaTopTitle: "جاهز لتجديد الديكور الداخلي؟",
  ctaTopDescription: "تواصل معنا الآن وخذ استشارة سريعة لأفضل تصميم جبس وديكور مناسب لمساحتك.",
  ctaBottomTitle: "ابدأ مشروع الجبس والديكور اليوم",
  ctaBottomDescription: "اتصل أو راسلنا عبر واتساب لحجز معاينة سريعة في الدمام والمنطقة الشرقية.",
  faqItems: [
    {
      question: "ما أفضل نوع جبس بورد للصالات والمجالس؟",
      answer: "يتم تحديد النوع حسب المساحة ومستوى الرطوبة، ونوصي عادة بخامات مقاومة للرطوبة مع هيكل تثبيت احترافي."
    },
    {
      question: "هل يمكن دمج الإضاءة المخفية مع تصميم الجبس؟",
      answer: "نعم، يتم تصميم مسارات الإضاءة والسبوت لايت ضمن المخطط لضمان توزيع متوازن وشكل نهائي أنيق."
    },
    {
      question: "كم يستغرق تنفيذ أعمال الجبس والديكور؟",
      answer: "يعتمد على المساحة وتعقيد التصميم، وغالبا يبدأ من يومين إلى عدة أيام مع جدول واضح قبل التنفيذ."
    },
    {
      question: "هل تقدمون خدمة بديل الخشب وديكورات الشاشات؟",
      answer: "نعم، نوفر تصميم وتركيب بديل الخشب (WPC) وديكورات الشاشات مع تنسيق الألوان والإضاءة."
    },
    {
      question: "هل الخدمة متاحة في الخبر والظهران؟",
      answer: "نعم، نقدم الخدمة في الدمام والخبر والظهران والقطيف وكامل المنطقة الشرقية."
    }
  ],
  metaTitle: "ديكورات جبس بالدمام | تصميم وتنفيذ | مقاولات عامة الدمام",
  metaDescription: "الجبس والديكورات بالدمام: أسقف مستعارة، جبس بورد مودرن، بديل الخشب، وتشطيبات داخلية فاخرة للمنازل والمكاتب."
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

  const byServiceSlug = await getServiceSeoPageByServiceSlug(legacyServiceSlug);
  if (byServiceSlug) {
    return byServiceSlug;
  }

  return getServiceSeoPageBySlug(legacyServiceSlug);
}

function buildModel(source: Awaited<ReturnType<typeof getSeoSource>>): GypsumPageModel {
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

export default async function GypsumDecorationsDammamPage() {
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
    areaServed: ["Dammam", "Khobar", "Dhahran", "Qatif"]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: model.pageTitle,
    description: model.pageDescription,
    serviceType: "Gypsum and Interior Decorations",
    provider: {
      "@type": "LocalBusiness",
      name: "مقاولات عامة الدمام",
      areaServed: ["Dammam", "Khobar", "Dhahran", "Qatif"]
    },
    areaServed: ["Dammam", "Khobar", "Dhahran", "Qatif"],
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

        <section className="roof-trust" aria-labelledby="gypsum-trust-heading">
          <h2 id="gypsum-trust-heading">لماذا يختارنا العملاء في الدمام؟</h2>
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

        <section className="roof-areas card" aria-labelledby="gypsum-areas-heading">
          <h2 id="gypsum-areas-heading">مناطق الخدمة</h2>
          <p>نغطي خدمات الجبس والديكورات في:</p>
          <div className="roof-areas-list">
            {model.areas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </section>

        <FAQ heading="الأسئلة الشائعة عن الجبس والديكورات" items={model.faqItems} />

        <section className="card roof-links" aria-labelledby="gypsum-links-heading">
          <h2 id="gypsum-links-heading">خدمات مرتبطة قد تهمك</h2>
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
