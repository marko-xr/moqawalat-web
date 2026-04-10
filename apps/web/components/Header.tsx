import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/projects", label: "المشاريع" },
  { href: "/blog", label: "المدونة" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "اتصل بنا" }
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          <Image
            src="/images/logo-full.png"
            alt="مقاولات عامة الدمام"
            width={190}
            height={82}
            className="brand-logo"
            sizes="190px"
          />
          <span className="brand-name">مقاولات عامة الدمام</span>
        </Link>

        <nav className="nav-links" aria-label="التنقل الرئيسي">
          {links.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false}>
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact" className="btn btn-primary nav-quote-btn">
          اطلب عرض سعر
        </Link>
      </div>
    </header>
  );
}
