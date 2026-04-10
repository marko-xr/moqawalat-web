"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/admin",
    label: "العملاء المحتملون",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 19a5 5 0 0 1 10 0" />
        <circle cx="12" cy="9" r="3.5" />
      </svg>
    )
  },
  {
    href: "/admin/services",
    label: "الخدمات",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 10h16" />
      </svg>
    )
  },
  {
    href: "/admin/projects",
    label: "المشاريع",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12z" />
        <path d="M8 14l2.5-2.5L14 15l2-2 4 6" />
      </svg>
    )
  },
  {
    href: "/admin/blog",
    label: "المدونة",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5h14v14H5z" />
        <path d="M8 9h8" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    )
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActiveRoute(href: string) {
    if (href === "/admin") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function logout() {
    localStorage.removeItem("admin_token");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="card admin-topbar">
      <div className="admin-topbar-head">
        <h2>لوحة التحكم</h2>
        <p>إدارة المحتوى والعملاء من مكان واحد</p>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav-link${isActiveRoute(item.href) ? " is-active" : ""}`}
          >
            <span className="admin-nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <button className="btn btn-outline" type="button" onClick={logout}>
        تسجيل خروج
      </button>
    </aside>
  );
}
