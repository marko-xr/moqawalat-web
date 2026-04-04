"use client";

import { trackClick } from "@/lib/api";

const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880";
const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966556741880";

export default function StickyActions() {
  return (
    <div className="sticky-actions">
      <a
        className="call-btn"
        href={`tel:+${phone}`}
        aria-label="اتصال مباشر الآن"
        onClick={() => trackClick("call", window.location.pathname)}
      >
        اتصال الآن
      </a>
      <a
        className="wa-btn"
        href={`https://wa.me/${wa}`}
        target="_blank"
        rel="noreferrer"
        aria-label="فتح واتساب للتواصل الفوري"
        onClick={() => trackClick("whatsapp", window.location.pathname)}
      >
        واتساب سريع
      </a>
    </div>
  );
}
