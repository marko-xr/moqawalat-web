"use client";

import { trackClick } from "@/lib/api";

type CTAProps = {
  title: string;
  description: string;
  eventSource: string;
};

const phone = process.env.NEXT_PUBLIC_PHONE_NUMBER || "966556741880";
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966556741880";

function reportCtaClick(type: "call" | "whatsapp", eventSource: string) {
  trackClick(type, `${window.location.pathname}#${eventSource}`).catch(() => undefined);

  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) {
    gtag("event", `${type}_click`, {
      event_category: "conversion",
      event_label: eventSource,
      value: 1
    });
  }
}

export default function CTA({ title, description, eventSource }: CTAProps) {
  return (
    <section className="card roof-cta-box" aria-label="إجراء سريع للتواصل">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="action-row">
        <a
          className="btn btn-primary"
          href={`tel:+${phone}`}
          onClick={() => reportCtaClick("call", `${eventSource}-call`)}
        >
          اتصال الآن
        </a>
        <a
          className="btn btn-outline"
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => reportCtaClick("whatsapp", `${eventSource}-whatsapp`)}
        >
          واتساب مباشر
        </a>
      </div>
    </section>
  );
}
