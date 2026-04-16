"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageProps } from "next/image";

const CLOUDINARY_SECURE_PREFIX = "https://res.cloudinary.com/";

type ClientImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
  errorContext?: string;
};

export default function ClientImage({
  src,
  errorContext,
  alt,
  ...props
}: ClientImageProps) {
  const [failed, setFailed] = useState(false);
  const shouldOptimize = src.startsWith(CLOUDINARY_SECURE_PREFIX);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  function handleError(_evt: React.SyntheticEvent<HTMLImageElement>) {
    if (failed) {
      return;
    }

    setFailed(true);

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
      src={src}
      alt={alt}
      unoptimized={!shouldOptimize}
      onError={handleError}
    />
  );
}
