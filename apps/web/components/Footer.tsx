import Link from "next/link";

export default function Footer() {
  const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880";
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966556741880";

  return (
    <footer>
      <div className="container">
        <div className="grid grid-3">
          <div>
            <h3>مقاولات عامة الدمام</h3>
            <p>نقدم خدمات مقاولات متكاملة في الدمام والخبر والظهران بجودة عالية واستجابة سريعة.</p>
          </div>
          <div>
            <h4>روابط سريعة</h4>
            <p>
              <Link href="/services">الخدمات</Link>
            </p>
            <p>
              <Link href="/projects">المشاريع</Link>
            </p>
            <p>
              <Link href="/blog">المدونة</Link>
            </p>
          </div>
          <div>
            <h4>تواصل مباشر</h4>
            <p>
              الهاتف: <span className="phone-ltr" dir="ltr">+{phone}</span>
            </p>
            <p>
              واتساب: <span className="phone-ltr" dir="ltr">+{whatsapp}</span>
            </p>
            <p>المنطقة الشرقية - المملكة العربية السعودية</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
