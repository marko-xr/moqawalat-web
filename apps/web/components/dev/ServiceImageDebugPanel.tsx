"use client";

import { useEffect, useMemo } from "react";
import { isValidImageUrl } from "@/lib/media";

type Props = {
  pageSlug: string;
  coverImage?: unknown;
  gallery?: unknown;
  sourceLabel?: string;
};

function normalizeGallery(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  const flatten = (input: unknown): string[] => {
    if (input === undefined || input === null) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.flatMap((item) => flatten(item));
    }

    const trimmed = String(input).trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed.flatMap((item) => flatten(item));
      }

      if (typeof parsed === "string") {
        const normalized = parsed.trim();
        return normalized ? [normalized] : [];
      }
    } catch {
      // Plain value, not JSON.
    }

    return [trimmed];
  };

  return flatten(value);
}

export default function ServiceImageDebugPanel({ pageSlug, coverImage, gallery, sourceLabel }: Props) {
  const galleryItems = useMemo(() => normalizeGallery(gallery), [gallery]);
  const firstThree = galleryItems.slice(0, 3);
  const coverValue = typeof coverImage === "string" ? coverImage.trim() : String(coverImage || "").trim();
  const coverValid = coverValue ? isValidImageUrl(coverValue, { allowPlaceholders: false }) : false;
  const galleryValidity = galleryItems.map((item) => ({
    value: item,
    valid: isValidImageUrl(item, { allowPlaceholders: false })
  }));

  const hasInvalidGallery = galleryValidity.some((entry) => !entry.valid);
  const hasEmptyGallery = galleryItems.length === 0;

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    const basePayload = {
      sourceLabel: sourceLabel || "service-page",
      pageSlug,
      galleryLength: galleryItems.length,
      galleryFirst3: firstThree,
      coverImage: coverValue || null,
      coverImageValid: coverValid,
      galleryValidity: galleryValidity.slice(0, 3)
    };

    console.log("[service-image-debug]", basePayload);

    if (hasEmptyGallery || hasInvalidGallery) {
      console.warn("[service-image-debug][attention] Empty or invalid gallery detected", {
        ...basePayload,
        hasEmptyGallery,
        hasInvalidGallery
      });
    }
  }, [coverValid, coverValue, firstThree, galleryItems.length, galleryValidity, hasEmptyGallery, hasInvalidGallery, pageSlug, sourceLabel]);

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <section className="service-image-debug" aria-label="Service image debug panel">
      <strong className="service-image-debug-title">DEV DEBUG: Service Image Data</strong>
      <div>slug: {pageSlug}</div>
      <div>source: {sourceLabel || "service-page"}</div>
      <div>gallery length: {galleryItems.length}</div>
      <div>coverImage: {coverValue || "(empty)"}</div>
      <div>coverImage valid: {String(coverValid)}</div>
      <div className="service-image-debug-label">gallery first 3:</div>
      <pre className="service-image-debug-pre">
{JSON.stringify(firstThree, null, 2)}
      </pre>
      <div className="service-image-debug-label">gallery first 3 validity:</div>
      <pre className="service-image-debug-pre">
{JSON.stringify(galleryValidity.slice(0, 3), null, 2)}
      </pre>
    </section>
  );
}
