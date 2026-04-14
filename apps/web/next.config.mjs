/** @type {import('next').NextConfig} */
function buildApiUploadPattern(apiUrl) {
  if (!apiUrl) {
    return null;
  }

  try {
    const parsed = new URL(apiUrl);
    const protocol = parsed.protocol.replace(":", "");

    return {
      protocol,
      hostname: parsed.hostname,
      ...(parsed.port ? { port: parsed.port } : {}),
      pathname: "/uploads/**"
    };
  } catch {
    return null;
  }
}

const apiUploadPattern = buildApiUploadPattern(process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "");

const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "55000",
        pathname: "/uploads/**"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "55000",
        pathname: "/uploads/**"
      },
      {
        protocol: "https",
        hostname: "moqawalatapi-production.up.railway.app",
        pathname: "/uploads/**"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**"
      },
      ...(apiUploadPattern ? [apiUploadPattern] : [])
    ]
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          }
        ]
      }
    ];
  },
  poweredByHeader: false,
  compress: true
};

export default nextConfig;
