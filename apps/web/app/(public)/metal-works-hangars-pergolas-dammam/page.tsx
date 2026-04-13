import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/roof-insulation-dammam/Hero";
import Services from "@/components/roof-insulation-dammam/Services";
import FAQ from "@/components/roof-insulation-dammam/FAQ";
import CTA from "@/components/roof-insulation-dammam/CTA";
import ServiceImageDebugPanel from "@/components/dev/ServiceImageDebugPanel";
import { getServiceSeoPageByServiceSlug, getServiceSeoPageBySlug } from "@/lib/api";
import { pickFirstImage, sanitizeImageList } from "@/lib/media";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const pagePath = "/metal-works-hangars-pergolas-dammam";
const pageSlug = "metal-works-hangars-pergolas-dammam";
const legacyServiceSlug = "blacksmith-works-hangars-pergolas-dammam";

type MetalWorksPageModel = {
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

const defaultModel: MetalWorksPageModel = {
  pageTitle: "أعمال الحدادة والهناجر والبرجولات",
  pageDescription:
    "متخصصون في حدادة وإنشاء الهناجر والمستودعات التجارية والصناعية، وتركيب برجولات حديد ديكورية للحدائق والأسطح بالشرقية.",
  heroTitle: "أعمال الحدادة والهناجر والبرجولات",
  heroLead:
    "نوفر حلولاً احترافية في أعمال الحدادة الإنشائية والديكورية في الدمام: تصميم وبناء الهناجر والمستودعات، تركيب برجولات حديد مودرن، وتنفيذ حدادة عامة للأبواب والأسوار والأسقف المعدنية.",
  heroPoints: [
    "هناجر ومستودعات تجارية وصناعية بهياكل حديدية عالية التحمل.",
    "برجولات حديد مودرن للأسطح والحدائق بتصاميم جذابة.",
    "ورشة حدادة متكاملة لتفصيل الأبواب والأسوار والأسقف المعدنية."
  ],
  heroImage: "/images/placeholder-before.svg",
  trustItems: [
    {
      title: "تنفيذ هندسي دقيق",
      description: "نلتزم بحسابات دقيقة وتثبيت احترافي للقواعد والأعمدة لضمان السلامة على المدى الطويل."
    },
    {
      title: "خامات قوية ضد المناخ",
      description: "نستخدم خامات ودهانات مقاومة للشمس والرطوبة والصدأ لتناسب أجواء المنطقة الشرقية."
    },
    {
      title: "التزام بالمواعيد",
      description: "جدول تنفيذ واضح مع متابعة مستمرة حتى التسليم النهائي بالجودة المتفق عليها."
    }
  ],
  serviceHeading: "تفاصيل أعمال الحدادة والهناجر والبرجولات",
  serviceIntro:
    "نقدم حلولاً احترافية في أعمال الحدادة الإنشائية والديكورية: هناجر ومستودعات، برجولات حديد، وحدادة عامة للمنازل والمشاريع التجارية والصناعية.",
  serviceItems: [
    {
      title: "الصورة 1 - أسقف هناجر ساندوتش بانل",
      description:
        "خدمات تركيب أسقف الهناجر باستخدام ألواح الساندوتش بانل المعزولة والشينكو. نوفر حلول عزل حراري ومائي متكاملة للمصانع والمستودعات بالخبر والدمام، مما يساعد في الحفاظ على درجة الحرارة الداخلية وحماية البضائع من الرطوبة والحرارة العالية.",
      imageAlt: "تركيب أسقف هناجر ساندوتش بانل في الدمام"
    },
    {
      title: "الصورة 2 - عزل متكامل لأسقف المستودعات",
      description:
        "خدمات تركيب أسقف الهناجر باستخدام ألواح الساندوتش بانل المعزولة والشينكو. نوفر حلول عزل حراري ومائي متكاملة للمصانع والمستودعات بالخبر والدمام، مما يساعد في الحفاظ على درجة الحرارة الداخلية وحماية البضائع من الرطوبة والحرارة العالية.",
      imageAlt: "عزل حراري ومائي لأسقف الهناجر بالشرقية"
    },
    {
      title: "الصورة 3 - هياكل حديدية للهناجر",
      description:
        "متخصصون في توريد وتركيب الهياكل الحديدية للهناجر والمستودعات في الدمام والمنطقة الشرقية. نقوم بتنفيذ القواعد وتثبيت الأعمدة الحديدية بدقة هندسية عالية لضمان أقصى درجات الأمان والتحمل للمنشآت الصناعية والتجارية.",
      imageAlt: "تنفيذ هياكل حديدية للهناجر في الدمام"
    },
    {
      title: "الصورة 4 - تثبيت أعمدة وقواعد حديد",
      description:
        "متخصصون في توريد وتركيب الهياكل الحديدية للهناجر والمستودعات في الدمام والمنطقة الشرقية. نقوم بتنفيذ القواعد وتثبيت الأعمدة الحديدية بدقة هندسية عالية لضمان أقصى درجات الأمان والتحمل للمنشآت الصناعية والتجارية.",
      imageAlt: "تثبيت أعمدة حديد للهناجر والمستودعات"
    },
    {
      title: "الصورة 5 - منشآت صناعية وتجارية",
      description:
        "متخصصون في توريد وتركيب الهياكل الحديدية للهناجر والمستودعات في الدمام والمنطقة الشرقية. نقوم بتنفيذ القواعد وتثبيت الأعمدة الحديدية بدقة هندسية عالية لضمان أقصى درجات الأمان والتحمل للمنشآت الصناعية والتجارية.",
      imageAlt: "منشآت حديدية صناعية وتجارية بالمنطقة الشرقية"
    },
    {
      title: "الصورة 6 - برجولات حديد بدهانات حرارية",
      description:
        "تركيب برجولات حديد بدهانات حرارية تشبه الخشب الطبيعي، مع تغطية من قماش الـ PVC أو اللكسان. توفر هذه البرجولات مظهراً جمالياً دافئاً ومقاومة تامة للشمس والأمطار، مما يجعلها الخيار الأمثل لجلسات الأسطح والحدائق بالمنطقة الشرقية.",
      imageAlt: "برجولات حديد بدهانات حرارية للحدائق"
    },
    {
      title: "الصورة 7 - برجولات للأسطح والحدائق",
      description:
        "تركيب برجولات حديد بدهانات حرارية تشبه الخشب الطبيعي، مع تغطية من قماش الـ PVC أو اللكسان. توفر هذه البرجولات مظهراً جمالياً دافئاً ومقاومة تامة للشمس والأمطار، مما يجعلها الخيار الأمثل لجلسات الأسطح والحدائق بالمنطقة الشرقية.",
      imageAlt: "برجولات حديد للأسطح والحدائق في الدمام"
    },
    {
      title: "الصورة 8 - برجولات مودرن قص ليزر",
      description:
        "تنفيذ وتصميم برجولات حديد مودرن مع قص ليزر (CNC) لإضافة لمسة فنية فريدة لحديقة منزلك. نجمع بين قوة الحديد وجمال التصميم العصري لتوفير مساحات ظل مريحة وراقية للمجالس الخارجية في الدمام والخبر.",
      imageAlt: "برجولات حديد مودرن مع قص ليزر CNC"
    },
    {
      title: "الصورة 9 - سواتر حديد عصرية",
      description:
        "تركيب سواتر حديد شرائح ومجدول بتصاميم عصرية لتوفير الخصوصية التامة لفيلاك. تتميز سواترنا بالمتانة ومقاومة الصدأ، وهي مصممة لتسمح بمرور الهواء مع حجب الرؤية بشكل أنيق يتناسب مع التصاميم المعمارية الحديثة في السعودية.",
      imageAlt: "تركيب سواتر حديد شرائح ومجدول"
    },
    {
      title: "الصورة 10 - مظلات سيارات حديثة",
      description:
        "تنفيذ مظلات سيارات حديثة بتصاميم مبتكرة ومواد عالية الجودة تتحمل حرارة الصيف العالية. نوفر أيضاً حلولاً لمظلات المداخل والممرات (شينكو أو قماش) لضمان حماية سيارتك ومنزلك بأفضل الأسعار وبسرعة في التنفيذ.",
      imageAlt: "تنفيذ مظلات سيارات حديثة في الدمام"
    },
    {
      title: "الصورة 11 - مظلات مداخل وممرات",
      description:
        "تنفيذ مظلات سيارات حديثة بتصاميم مبتكرة ومواد عالية الجودة تتحمل حرارة الصيف العالية. نوفر أيضاً حلولاً لمظلات المداخل والممرات (شينكو أو قماش) لضمان حماية سيارتك ومنزلك بأفضل الأسعار وبسرعة في التنفيذ.",
      imageAlt: "مظلات مداخل وممرات شينكو أو قماش"
    },
    {
      title: "الصورة 12 - تصميم برجولات فنية",
      description:
        "تنفيذ وتصميم برجولات حديد مودرن مع قص ليزر (CNC) لإضافة لمسة فنية فريدة لحديقة منزلك. نجمع بين قوة الحديد وجمال التصميم العصري لتوفير مساحات ظل مريحة وراقية للمجالس الخارجية في الدمام والخبر.",
      imageAlt: "تصميم برجولات حديد فنية للمجالس الخارجية"
    }
  ],
  serviceImage: "",
  serviceImages: [],
  areas: ["الدمام", "الخبر", "الظهران", "القطيف", "الجبيل"],
  relatedLinks: [
    { title: "عزل الأسطح بالدمام", href: "/roof-insulation-dammam" },
    { title: "الجبس والديكورات بالدمام", href: "/gypsum-decorations-dammam" },
    { title: "خدمات الدهانات الداخلية والخارجية", href: "/services/painting-services" }
  ],
  ctaTopTitle: "تحتاج تنفيذ هنجر أو برجولة حديد؟",
  ctaTopDescription: "تواصل معنا الآن وخذ استشارة فنية سريعة لمشروعك في الدمام والمنطقة الشرقية.",
  ctaBottomTitle: "ابدأ مشروع الحدادة اليوم",
  ctaBottomDescription: "اتصل أو راسلنا عبر واتساب لحجز معاينة وتنفيذ احترافي بسرعة وجودة عالية.",
  faqItems: [
    {
      question: "هل توفرون تصميم وتنفيذ هناجر ومستودعات كاملة؟",
      answer: "نعم، نقدم تصميم وتنفيذ متكامل للهناجر والمستودعات من القواعد وحتى تركيب الهيكل والأسقف."
    },
    {
      question: "ما أفضل تغطية للبرجولات الحديد في الشرقية؟",
      answer: "يعتمد على الاستخدام، وغالبا نوصي بـ PVC أو اللكسان مع دهانات حرارية مقاومة للشمس والأمطار."
    },
    {
      question: "هل تقدمون سواتر ومظلات سيارات حسب المقاس؟",
      answer: "نعم، جميع الأعمال تنفذ حسب المقاسات المطلوبة مع خيارات متعددة في الشكل والخامة واللون."
    },
    {
      question: "كم مدة تنفيذ مشروع هنجر أو برجولة؟",
      answer: "تختلف حسب المساحة والتصميم، وبعد المعاينة نقدم لك مدة تنفيذ واضحة وجدول عمل مفصل."
    },
    {
      question: "هل الخدمة متاحة في الدمام والخبر والظهران؟",
      answer: "نعم، نخدم الدمام والخبر والظهران والقطيف والجبيل وكافة مدن المنطقة الشرقية."
    }
  ],
  metaTitle: "أعمال الحدادة والهناجر والبرجولات بالدمام | تصميم وتنفيذ احترافي",
  metaDescription:
    "متخصصون في تنفيذ الهناجر والمستودعات والبرجولات والسواتر والمظلات بالدمام والخبر. جودة عالية، دقة هندسية، والتزام بالمواعيد."
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

function buildModel(source: Awaited<ReturnType<typeof getSeoSource>>): MetalWorksPageModel {
  if (!source) {
    return defaultModel;
  }

  const sections = source.contentSections && typeof source.contentSections === "object" ? source.contentSections : {};

  const trustItems = toTrustItems((sections as { trustItems?: unknown }).trustItems);
  const serviceItems = toServiceItems((sections as { serviceItems?: unknown }).serviceItems);
  const areas = toStringArray((sections as { areas?: unknown }).areas);
  const relatedLinks = toRelatedLinks((sections as { relatedLinks?: unknown }).relatedLinks);
  const faqItems = toFaqItems(source.faq);

  const beforeImage = toString((sections as { beforeImage?: unknown }).beforeImage);
  const afterImage = toString((sections as { afterImage?: unknown }).afterImage);
  const sectionImages = sanitizeImageList(
    [
      ...(Array.isArray(source.images) ? source.images : []),
      beforeImage,
      afterImage
    ],
    { allowPlaceholders: false }
  );
  const heroImage =
    pickFirstImage(
      [
        toString((sections as { heroImage?: unknown }).heroImage),
        ...(Array.isArray(source.images) ? source.images : []),
        beforeImage,
        afterImage
      ],
      { allowPlaceholders: false }
    ) || defaultModel.heroImage;

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
    serviceImage: sectionImages[0] || "",
    serviceImages: sectionImages,
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

export default async function MetalWorksHangarsPergolasDammamPage() {
  const seoSource = await getSeoSource();
  const model = buildModel(seoSource);
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
    serviceType: "Metal Works, Hangars and Pergolas",
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

        <section className="roof-trust" aria-labelledby="metal-works-trust-heading">
          <h2 id="metal-works-trust-heading">لماذا يختارنا العملاء في الدمام؟</h2>
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

        <section className="roof-areas card" aria-labelledby="metal-works-areas-heading">
          <h2 id="metal-works-areas-heading">مناطق الخدمة</h2>
          <p>نغطي خدمات الحدادة والهناجر والبرجولات في:</p>
          <div className="roof-areas-list">
            {model.areas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </section>

        <FAQ heading="الأسئلة الشائعة عن أعمال الحدادة والهناجر والبرجولات" items={model.faqItems} />

        <section className="card roof-links" aria-labelledby="metal-works-links-heading">
          <h2 id="metal-works-links-heading">خدمات مرتبطة قد تهمك</h2>
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

        {process.env.NODE_ENV !== "production" ? (
          <ServiceImageDebugPanel
            pageSlug={pageSlug}
            coverImage={seoSource?.contentSections?.heroImage || null}
            gallery={seoSource?.images}
            sourceLabel="metal-works-hangars-pergolas-dammam"
          />
        ) : null}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </section>
  );
}