import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/roof-insulation-dammam/Hero";
import Services from "@/components/roof-insulation-dammam/Services";
import FAQ from "@/components/roof-insulation-dammam/FAQ";
import CTA from "@/components/roof-insulation-dammam/CTA";
import { getServiceSeoPageByServiceSlug, getServiceSeoPageBySlug } from "@/lib/api";
import { pickFirstImage, sanitizeImageList } from "@/lib/media";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const pagePath = "/painting-services-dammam";
const pageSlug = "painting-services-dammam";
const legacyServiceSlug = "painting-services";

type PaintingPageModel = {
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

const defaultModel: PaintingPageModel = {
  pageTitle: "خدمات الدهانات الداخلية والخارجية",
  pageDescription: "تنفيذ دهانات احترافية للمنازل والفلل والمباني التجارية.",
  heroTitle: "خدمات الدهانات الداخلية والخارجية",
  heroLead:
    "نقدم حلول دهان متكاملة باستخدام أفضل المواد المقاومة للرطوبة والحرارة مع تشطيبات عالية الجودة تناسب المناخ في المنطقة الشرقية.",
  heroPoints: [
    "دهانات داخلية وخارجية بتشطيب احترافي يدوم طويلا.",
    "مواد مقاومة للرطوبة والحرارة مناسبة لمناخ الشرقية.",
    "تنفيذ سريع ونظيف للمنازل والفلل والمنشآت التجارية."
  ],
  heroImage: "/images/placeholder-before.svg",
  trustItems: [
    {
      title: "مواد أصلية عالية الجودة",
      description: "نستخدم دهانات معتمدة ومناسبة للواجهات والداخل لضمان لون ثابت ومظهر فاخر."
    },
    {
      title: "تشطيب دقيق ونظيف",
      description: "نلتزم بتجهيز الأسطح ومعالجة العيوب قبل الدهان للوصول إلى نتيجة نهائية متقنة."
    },
    {
      title: "خبرة محلية في الشرقية",
      description: "نعرف تحديات الرطوبة والحرارة في الدمام والخبر ونطبق النظام المناسب لكل مشروع."
    }
  ],
  serviceHeading: "تفاصيل خدمات الدهانات الداخلية والخارجية",
  serviceIntro:
    "نقدم حلول دهان متكاملة باستخدام أفضل المواد المقاومة للرطوبة والحرارة مع تشطيبات عالية الجودة تناسب المناخ في المنطقة الشرقية.",
  serviceItems: [
    {
      title: "الصورة 1 - مجالس تراثية بلمسة عصرية",
      description:
        "تنفيذ ديكورات ودهانات المجالس التراثية بلمسة عصرية في الدمام. محاكاة أشكال الطين والزخارف التراثية القديمة (السدو) بدقة عالية، مع دمج الإضاءة الحديثة لخلق أجواء تجمع بين أصالة الماضي وفخامة الحاضر، مثالية للملاحق والمجالس الخارجية.",
      imageAlt: "دهانات وديكورات مجالس تراثية في الدمام"
    },
    {
      title: "الصورة 2 - زخارف تراثية وإضاءة حديثة",
      description:
        "تنفيذ ديكورات ودهانات المجالس التراثية بلمسة عصرية في الدمام. محاكاة أشكال الطين والزخارف التراثية القديمة (السدو) بدقة عالية، مع دمج الإضاءة الحديثة لخلق أجواء تجمع بين أصالة الماضي وفخامة الحاضر، مثالية للملاحق والمجالس الخارجية.",
      imageAlt: "زخارف تراثية سدو مع دهان حديث"
    },
    {
      title: "الصورة 3 - دهانات واجهات خارجية",
      description:
        "تنفيذ دهانات الواجهات الخارجية للفلل والقصور في الدمام والخبر باستخدام أفضل المواد المقاومة للعوامل الجوية والرطوبة. تشطيبات احترافية تشمل دهانات البروفايل، الرشات الأمريكية، واللمسات الديكورية الحديثة التي تمنح منزلك فخامة تدوم طويلا.",
      imageAlt: "تنفيذ دهانات واجهات خارجية للفلل"
    },
    {
      title: "الصورة 4 - تشطيب بروفايل ورشات أمريكية",
      description:
        "تنفيذ دهانات الواجهات الخارجية للفلل والقصور في الدمام والخبر باستخدام أفضل المواد المقاومة للعوامل الجوية والرطوبة. تشطيبات احترافية تشمل دهانات البروفايل، الرشات الأمريكية، واللمسات الديكورية الحديثة التي تمنح منزلك فخامة تدوم طويلا.",
      imageAlt: "بروفايل ورشات أمريكية للواجهات"
    },
    {
      title: "الصورة 5 - براويز فوم للجدران",
      description:
        "متخصصون في تركيب براويز الفوم (Wainscoting) للجدران بتصاميم كلاسيكية ومودرن في الشرقية. نعدك بدقة التنفيذ في الزوايا واللحامات مع دهانات داخلية فاخرة تحول المجالس والممرات إلى لوحات فنية راقية تتناسب مع أحدث صيحات الديكور.",
      imageAlt: "تركيب براويز فوم وديكورات جدران"
    },
    {
      title: "الصورة 6 - دهانات مقاومة للعوامل الجوية",
      description:
        "تنفيذ دهانات الواجهات الخارجية للفلل والقصور في الدمام والخبر باستخدام أفضل المواد المقاومة للعوامل الجوية والرطوبة. تشطيبات احترافية تشمل دهانات البروفايل، الرشات الأمريكية، واللمسات الديكورية الحديثة التي تمنح منزلك فخامة تدوم طويلا.",
      imageAlt: "دهانات خارجية مقاومة للرطوبة والحرارة"
    },
    {
      title: "الصورة 7 - واجهات فلل وقصور",
      description:
        "تنفيذ دهانات الواجهات الخارجية للفلل والقصور في الدمام والخبر باستخدام أفضل المواد المقاومة للعوامل الجوية والرطوبة. تشطيبات احترافية تشمل دهانات البروفايل، الرشات الأمريكية، واللمسات الديكورية الحديثة التي تمنح منزلك فخامة تدوم طويلا.",
      imageAlt: "دهان واجهات فلل وقصور في الشرقية"
    },
    {
      title: "الصورة 8 - مجالس خارجية بطابع تراثي",
      description:
        "تنفيذ ديكورات ودهانات المجالس التراثية بلمسة عصرية في الدمام. محاكاة أشكال الطين والزخارف التراثية القديمة (السدو) بدقة عالية، مع دمج الإضاءة الحديثة لخلق أجواء تجمع بين أصالة الماضي وفخامة الحاضر، مثالية للملاحق والمجالس الخارجية.",
      imageAlt: "دهانات مجالس خارجية بطابع تراثي"
    },
    {
      title: "الصورة 9 - نعلات فوم وديكورات داخلية",
      description:
        "متخصصون في تركيب براويز الفوم (Wainscoting) للجدران بتصاميم كلاسيكية ومودرن في الشرقية. نعدك بدقة التنفيذ في الزوايا واللحامات مع دهانات داخلية فاخرة تحول المجالس والممرات إلى لوحات فنية راقية تتناسب مع أحدث صيحات الديكور.",
      imageAlt: "نعلات فوم وديكورات داخلية في الخبر"
    },
    {
      title: "الصورة 10 - تفاصيل فوم كلاسيك ومودرن",
      description:
        "متخصصون في تركيب براويز الفوم (Wainscoting) للجدران بتصاميم كلاسيكية ومودرن في الشرقية. نعدك بدقة التنفيذ في الزوايا واللحامات مع دهانات داخلية فاخرة تحول المجالس والممرات إلى لوحات فنية راقية تتناسب مع أحدث صيحات الديكور.",
      imageAlt: "براويز فوم كلاسيك ومودرن للجدران"
    },
    {
      title: "الصورة 11 - دهانات داخلية مع براويز",
      description:
        "متخصصون في تركيب براويز الفوم (Wainscoting) للجدران بتصاميم كلاسيكية ومودرن في الشرقية. نعدك بدقة التنفيذ في الزوايا واللحامات مع دهانات داخلية فاخرة تحول المجالس والممرات إلى لوحات فنية راقية تتناسب مع أحدث صيحات الديكور.",
      imageAlt: "دهانات داخلية فاخرة مع براويز فوم"
    }
  ],
  serviceImage: "",
  serviceImages: [],
  areas: ["الدمام", "الخبر", "الظهران", "القطيف", "الجبيل"],
  relatedLinks: [
    { title: "عزل الأسطح بالدمام", href: "/roof-insulation-dammam" },
    { title: "الجبس والديكورات بالدمام", href: "/gypsum-decorations-dammam" },
    { title: "الحدادة والهناجر والبرجولات", href: "/metal-works-hangars-pergolas-dammam" }
  ],
  ctaTopTitle: "تبحث عن تشطيب دهان احترافي؟",
  ctaTopDescription: "تواصل معنا الآن وخذ استشارة سريعة لاختيار نظام الدهان الأنسب لمشروعك.",
  ctaBottomTitle: "ابدأ مشروع الدهانات اليوم",
  ctaBottomDescription: "اتصل أو راسلنا عبر واتساب لحجز معاينة سريعة في الدمام وكامل المنطقة الشرقية.",
  faqItems: [
    {
      question: "ما الفرق بين الدهانات الداخلية والخارجية؟",
      answer: "الدهانات الخارجية مصممة لتحمل الشمس والرطوبة والعوامل الجوية، بينما الداخلية تركيزها على الجمال وسهولة التنظيف."
    },
    {
      question: "هل تقدمون معالجة للجدران قبل الدهان؟",
      answer: "نعم، نقوم بمعالجة التشققات وتسوية الأسطح ووضع البرايمر المناسب قبل بدء الدهان لضمان أفضل نتيجة."
    },
    {
      question: "هل يمكن تنفيذ بروفايل ورشات أمريكية للواجهات؟",
      answer: "نعم، نوفر دهانات البروفايل والرشات الأمريكية واللمسات الديكورية الحديثة حسب نوع الواجهة."
    },
    {
      question: "هل توفرون تركيب براويز ونعلات فوم؟",
      answer: "نعم، ننفذ براويز الفوم بتصاميم كلاسيكية ومودرن مع دمجها مع نظام الدهان الداخلي بشكل متناسق."
    },
    {
      question: "هل الخدمة متاحة في الخبر والظهران؟",
      answer: "نعم، نخدم الدمام والخبر والظهران والقطيف والجبيل وكافة مدن المنطقة الشرقية."
    }
  ],
  metaTitle: "دهانات داخلية وخارجية بالدمام | تشطيبات احترافية تدوم",
  metaDescription:
    "خدمات دهانات داخلية وخارجية في الدمام والخبر والظهران: واجهات فلل، مجالس تراثية، براويز فوم، وتشطيبات فاخرة بمواد مقاومة للرطوبة والحرارة."
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

function buildModel(source: Awaited<ReturnType<typeof getSeoSource>>): PaintingPageModel {
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

export default async function PaintingServicesDammamPage() {
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
    serviceType: "Interior and Exterior Painting Services",
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

        <section className="roof-trust" aria-labelledby="painting-trust-heading">
          <h2 id="painting-trust-heading">لماذا يختارنا العملاء في الدمام؟</h2>
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

        <section className="roof-areas card" aria-labelledby="painting-areas-heading">
          <h2 id="painting-areas-heading">مناطق الخدمة</h2>
          <p>نغطي خدمات الدهانات الداخلية والخارجية في:</p>
          <div className="roof-areas-list">
            {model.areas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </section>

        <FAQ heading="الأسئلة الشائعة عن خدمات الدهانات" items={model.faqItems} />

        <section className="card roof-links" aria-labelledby="painting-links-heading">
          <h2 id="painting-links-heading">خدمات مرتبطة قد تهمك</h2>
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