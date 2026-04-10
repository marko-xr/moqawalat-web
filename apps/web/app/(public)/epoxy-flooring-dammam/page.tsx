import type { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/roof-insulation-dammam/Hero";
import Services from "@/components/roof-insulation-dammam/Services";
import FAQ from "@/components/roof-insulation-dammam/FAQ";
import CTA from "@/components/roof-insulation-dammam/CTA";
import { getServiceSeoPageBySlug } from "@/lib/api";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const pagePath = "/epoxy-flooring-dammam";
const pageSlug = "epoxy-flooring-dammam";
const legacyServiceSlug = "epoxy-flooring";

type EpoxyPageModel = {
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

const defaultModel: EpoxyPageModel = {
  pageTitle: "دهانات أرضيات إيبوكسي للمواقف والمغاسل والخزانات",
  pageDescription:
    "حلول احترافية لطلاء الأرضيات وعزل الخزانات باستخدام مادة الإيبوكسي عالية الجودة. مقاومة للمواد الكيميائية، المياه، والاحتكاك، ومناسبة للمواقف، المصانع، ومغاسل السيارات في الدمام والخبر.",
  heroTitle: "دهانات أرضيات إيبوكسي للمواقف والمغاسل والخزانات",
  heroLead:
    "نقدم خدمات متكاملة في توريد وتنفيذ دهانات الإيبوكسي (Epoxy) بأعلى المعايير الهندسية في المنطقة الشرقية، مع دقة في التنفيذ وسرعة في التسليم واستخدام أفضل الخامات العالمية.",
  heroPoints: [
    "إيبوكسي مواقف السيارات مع تخطيط المسارات وعلامات السلامة.",
    "عزل خزانات المياه بإيبوكسي Food Grade المعتمد لمياه الشرب.",
    "أرضيات مقاومة للمواد الكيميائية والمياه والزيوت للمصانع والمغاسل."
  ],
  heroImage: "/images/placeholder-before.svg",
  trustItems: [
    {
      title: "خامات إيبوكسي عالمية",
      description: "نستخدم أنظمة إيبوكسي عالية الجودة تتحمل الظروف المناخية القاسية في المنطقة الشرقية."
    },
    {
      title: "دقة تنفيذ هندسية",
      description: "نلتزم بخطوات التحضير والتطبيق وفق المواصفات لضمان التصاق قوي وعمر تشغيلي أطول."
    },
    {
      title: "حلول متخصصة لكل استخدام",
      description: "نوفر أنظمة مختلفة للمواقف والمغاسل والخزانات والمصانع والمناطق الديكورية حسب طبيعة التشغيل."
    }
  ],
  serviceHeading: "تفاصيل خدمة دهانات أرضيات الإيبوكسي",
  serviceIntro:
    "نقدم خدمات متكاملة في توريد وتنفيذ دهانات الإيبوكسي (Epoxy) بأعلى المعايير الهندسية في المنطقة الشرقية. تشمل خدماتنا: إيبوكسي مواقف السيارات، عزل خزانات المياه بإيبوكسي (Food Grade)، أرضيات مغاسل السيارات والمصانع، وإيبوكسي ديكوري (ميتاليك) للمكاتب والصالات والمعارض التجارية.",
  serviceItems: [
    {
      title: "الصورة 1 - إيبوكسي مغاسل السيارات",
      description:
        "تنفيذ أرضيات إيبوكسي عالية التحمل لمغاسل السيارات في الدمام والخبر. تتميز بمقاومة عالية للمنظفات الكيميائية والمياه، مع نظام تصريف متكامل وشكل جمالي لامع يسهل عملية التنظيف ويتحمل ضغط العمل المستمر.",
      imageAlt: "أرضيات إيبوكسي لمغاسل السيارات في الدمام"
    },
    {
      title: "الصورة 2 - تخطيط ساحات وممرات أمنية",
      description:
        "خدمات تخطيط الساحات الخارجية والممرات الأمنية للمصانع والشركات. نستخدم دهانات حرارية ومقاومة للعوامل الجوية لتنظيم حركة المرور وتحديد ممرات المشاة في المناطق الصناعية بالدمام لضمان أعلى مستويات الأمان.",
      imageAlt: "تخطيط ساحات خارجية وممرات صناعية"
    },
    {
      title: "الصورة 3 - دهانات تنظيم الحركة الصناعية",
      description:
        "خدمات تخطيط الساحات الخارجية والممرات الأمنية للمصانع والشركات. نستخدم دهانات حرارية ومقاومة للعوامل الجوية لتنظيم حركة المرور وتحديد ممرات المشاة في المناطق الصناعية بالدمام لضمان أعلى مستويات الأمان.",
      imageAlt: "دهانات ممرات المشاة في المصانع"
    },
    {
      title: "الصورة 4 - إيبوكسي مانع للأتربة",
      description:
        "تطبيق دهانات إيبوكسي مانعة للأتربة (Dust-proof) لغرف الكهرباء والميكانيكا والمستودعات. توفر سطحا ناعما وسهل التنظيف يحمي المعدات الحساسة من الغبار والزيوت، مع توفير عزل كهربائي ممتاز للمنشآت الصناعية.",
      imageAlt: "إيبوكسي Dust-proof لغرف الكهرباء والمستودعات"
    },
    {
      title: "الصورة 5 - عزل كهربائي وحماية معدات",
      description:
        "تطبيق دهانات إيبوكسي مانعة للأتربة (Dust-proof) لغرف الكهرباء والميكانيكا والمستودعات. توفر سطحا ناعما وسهل التنظيف يحمي المعدات الحساسة من الغبار والزيوت، مع توفير عزل كهربائي ممتاز للمنشآت الصناعية.",
      imageAlt: "دهانات إيبوكسي لغرف الميكانيكا والكهرباء"
    },
    {
      title: "الصورة 6 - عزل خزانات Food Grade",
      description:
        "أفضل نظام عزل خزانات المياه الخرسانية باستخدام الإيبوكسي الأزرق (Food Grade) المعتمد والمخصص لمياه الشرب. يحمي الخزان من التسربات ويمنع نمو الطحالب والبكتيريا، مما يضمن مياه نظيفة وصحية لسنوات طويلة.",
      imageAlt: "عزل خزانات مياه بإيبوكسي Food Grade"
    },
    {
      title: "الصورة 7 - إيبوكسي مواقف السيارات",
      description:
        "طلاء أرضيات مواقف السيارات (القبو) بمادة الإيبوكسي المقاومة للاحتكاك. تشمل الخدمة تخطيط المسارات، تحديد مواقف السيارات، ودهان الأعمدة التحذيرية بأعلى معايير السلامة لضمان رؤية واضحة وحماية الخرسانة من زيوت السيارات.",
      imageAlt: "طلاء مواقف سيارات بإيبوكسي مقاوم للاحتكاك"
    },
    {
      title: "الصورة 8 - ممرات مشاة آمنة",
      description:
        "خدمات تخطيط الساحات الخارجية والممرات الأمنية للمصانع والشركات. نستخدم دهانات حرارية ومقاومة للعوامل الجوية لتنظيم حركة المرور وتحديد ممرات المشاة في المناطق الصناعية بالدمام لضمان أعلى مستويات الأمان.",
      imageAlt: "تخطيط ممرات مشاة وساحات خارجية"
    },
    {
      title: "الصورة 9 - أرضيات مغاسل عالية التحمل",
      description:
        "تنفيذ أرضيات إيبوكسي عالية التحمل لمغاسل السيارات في الدمام والخبر. تتميز بمقاومة عالية للمنظفات الكيميائية والمياه، مع نظام تصريف متكامل وشكل جمالي لامع يسهل عملية التنظيف ويتحمل ضغط العمل المستمر.",
      imageAlt: "إيبوكسي مغاسل سيارات مقاوم للمواد الكيميائية"
    },
    {
      title: "الصورة 10 - نظام حماية خزانات متقدم",
      description:
        "أفضل نظام عزل خزانات المياه الخرسانية باستخدام الإيبوكسي الأزرق (Food Grade) المعتمد والمخصص لمياه الشرب. يحمي الخزان من التسربات ويمنع نمو الطحالب والبكتيريا، مما يضمن مياه نظيفة وصحية لسنوات طويلة.",
      imageAlt: "حماية خزانات المياه بالإيبوكسي الأزرق"
    },
    {
      title: "الصورة 11 - عزل مياه الشرب بالإيبوكسي",
      description:
        "أفضل نظام عزل خزانات المياه الخرسانية باستخدام الإيبوكسي الأزرق (Food Grade) المعتمد والمخصص لمياه الشرب. يحمي الخزان من التسربات ويمنع نمو الطحالب والبكتيريا، مما يضمن مياه نظيفة وصحية لسنوات طويلة.",
      imageAlt: "عزل خزانات مياه شرب إيبوكسي معتمد"
    },
    {
      title: "الصورة 12 - منع التسربات والبكتيريا",
      description:
        "أفضل نظام عزل خزانات المياه الخرسانية باستخدام الإيبوكسي الأزرق (Food Grade) المعتمد والمخصص لمياه الشرب. يحمي الخزان من التسربات ويمنع نمو الطحالب والبكتيريا، مما يضمن مياه نظيفة وصحية لسنوات طويلة.",
      imageAlt: "إيبوكسي Food Grade لمنع التسربات والطحالب"
    }
  ],
  serviceImage: "/images/placeholder-after.svg",
  areas: ["الدمام", "الخبر", "الظهران", "القطيف", "الجبيل"],
  relatedLinks: [
    { title: "خدمات الدهانات الداخلية والخارجية", href: "/painting-services-dammam" },
    { title: "عزل الأسطح بالدمام", href: "/roof-insulation-dammam" },
    { title: "الحدادة والهناجر والبرجولات", href: "/metal-works-hangars-pergolas-dammam" }
  ],
  ctaTopTitle: "تحتاج أرضية إيبوكسي عالية التحمل؟",
  ctaTopDescription: "تواصل معنا الآن واحصل على معاينة سريعة وحل هندسي مناسب لطبيعة موقعك.",
  ctaBottomTitle: "ابدأ مشروع الإيبوكسي الآن",
  ctaBottomDescription: "اتصل أو راسلنا عبر واتساب لحجز زيارة فنية وتنفيذ سريع في الدمام والمنطقة الشرقية.",
  faqItems: [
    {
      question: "هل الإيبوكسي مناسب لمغاسل السيارات والمصانع؟",
      answer: "نعم، لأنه مقاوم للمياه والمنظفات والزيوت والاحتكاك، ومناسب للبيئات التشغيلية العالية."
    },
    {
      question: "ما المقصود بإيبوكسي Food Grade للخزانات؟",
      answer: "هو نظام إيبوكسي معتمد لمياه الشرب، يساعد في حماية الخزان من التسربات ومنع نمو البكتيريا والطحالب."
    },
    {
      question: "هل توفرون تخطيط مواقف ومسارات السلامة؟",
      answer: "نعم، ننفذ تخطيط المسارات ومواقف السيارات والعلامات التحذيرية وفق متطلبات السلامة بالموقع."
    },
    {
      question: "كم مدة تنفيذ دهانات الإيبوكسي؟",
      answer: "تعتمد المدة على المساحة وحالة السطح، وبعد المعاينة نقدم جدول تنفيذ واضح ومراحل تطبيق دقيقة."
    },
    {
      question: "هل الخدمة متاحة في الخبر والظهران؟",
      answer: "نعم، نخدم الدمام والخبر والظهران والقطيف والجبيل وكامل المنطقة الشرقية."
    }
  ],
  metaTitle: "دهانات إيبوكسي أرضيات وخزانات بالدمام | مواقف ومغاسل ومصانع",
  metaDescription:
    "تنفيذ دهانات إيبوكسي احترافية في الدمام والخبر: مواقف سيارات، مغاسل، مصانع، وعزل خزانات Food Grade. مقاومة للمياه والمواد الكيميائية والاحتكاك."
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

function buildModel(source: Awaited<ReturnType<typeof getSeoSource>>): EpoxyPageModel {
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
  const ogImage = model.heroImage.startsWith("http") ? model.heroImage : `${siteUrl}${model.heroImage}`;

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

export default async function EpoxyFlooringDammamPage() {
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
    serviceType: "Epoxy Floor Coatings and Tank Lining",
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

        <section className="roof-trust" aria-labelledby="epoxy-trust-heading">
          <h2 id="epoxy-trust-heading">لماذا يختارنا العملاء في الدمام؟</h2>
          <div className="roof-trust-grid">
            {model.trustItems.map((item, index) => (
              <article className="card" key={`${item.title}-${index}`}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <Services heading={model.serviceHeading} intro={model.serviceIntro} items={model.serviceItems} imageSrc={model.serviceImage} />

        <section className="roof-areas card" aria-labelledby="epoxy-areas-heading">
          <h2 id="epoxy-areas-heading">مناطق الخدمة</h2>
          <p>نغطي خدمات دهانات الإيبوكسي في:</p>
          <div className="roof-areas-list">
            {model.areas.map((area) => (
              <span key={area}>{area}</span>
            ))}
          </div>
        </section>

        <FAQ heading="الأسئلة الشائعة عن دهانات الإيبوكسي" items={model.faqItems} />

        <section className="card roof-links" aria-labelledby="epoxy-links-heading">
          <h2 id="epoxy-links-heading">خدمات مرتبطة قد تهمك</h2>
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