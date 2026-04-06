/** @type {import('next').NextConfig} */
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
      }
    ]
  },
  poweredByHeader: false,
  compress: true
};

export default nextConfig;
