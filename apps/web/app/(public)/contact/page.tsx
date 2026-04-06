import type { Metadata } from "next";
import QuoteForm from "@/components/QuoteForm";
import { LOCAL_AREAS, SEO_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "تواصل معنا الآن للحصول على عرض سعر فوري لخدمات المقاولات بالدمام.",
  keywords: [...SEO_KEYWORDS.global, ...SEO_KEYWORDS.services.slice(0, 10)],
  alternates: { canonical: "/contact" }
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966556741880";

  return (
    <section className="section">
      <div className="container hero-wrap">
        <div className="card">
          <h1>تواصل معنا</h1>
          <p>اتصل الآن أو ارسل طلبك عبر النموذج وسيتم الرد عليك بسرعة.</p>
          <p>
            الهاتف: <span className="phone-ltr" dir="ltr">+{phone}</span>
          </p>
          <p>
            واتساب: <span className="phone-ltr" dir="ltr">+{whatsapp}</span>
          </p>
          <p>نخدم: {LOCAL_AREAS.join("، ")}</p>
        </div>
        <QuoteForm />
      </div>
    </section>
  );
}
