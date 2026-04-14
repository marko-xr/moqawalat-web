"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageProps } from "next/image";

type ClientImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  fallbackSrc?: string;
  errorContext?: string;
};

export default function ClientImage({
  src,
  fallbackSrc = "/images/services/default-01.svg",
  errorContext,
  alt,
  ...props
}: ClientImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setFailed(false);
  }, [src]);

  function handleError(_evt: React.SyntheticEvent<HTMLImageElement>) {
    if (failed || imgSrc === fallbackSrc) {
      return;
    }

    setFailed(true);
    setImgSrc(fallbackSrc);

    if (process.env.NODE_ENV === "production") {
      fetch("/api/log-image-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: src,
          context: errorContext ?? "image",
          page: window.location.pathname
        }),
        keepalive: true
      }).catch(() => {});
    }
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
