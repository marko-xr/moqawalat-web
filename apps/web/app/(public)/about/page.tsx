import type { Metadata } from "next";
import { LOCAL_AREAS, SEO_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "من نحن",
  description: "تعرف على شركة مقاولات عامة الدمام وخبرتنا في تنفيذ المشاريع بالمنطقة الشرقية.",
  keywords: [...SEO_KEYWORDS.global, ...LOCAL_AREAS.map((area) => `مقاول معتمد ${area}`)],
  alternates: { canonical: "/about" }
};

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container card">
        <h1>من نحن</h1>
        <p>
          نحن فريق مقاولات عامة متخصص في تنفيذ أعمال الدهانات، عزل الأسطح، الحديد، والجبس والديكور في الدمام
          والخبر والظهران. نركز على الجودة، الالتزام، وتجربة عميل سهلة من أول تواصل حتى التسليم النهائي.
        </p>
        <p>
          رسالتنا هي تقديم حلول عملية ومضمونة تناسب احتياجات المنازل والمنشآت التجارية مع سرعة في المعاينة
          والرد عبر الهاتف والواتساب.
        </p>
      </div>
    </section>
  );
}
