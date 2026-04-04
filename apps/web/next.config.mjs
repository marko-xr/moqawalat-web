/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
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
        hostname: "res.cloudinary.com",
        pathname: "/**"
      }
    ]
  },
  poweredByHeader: false,
  compress: true
};

export default nextConfig;
