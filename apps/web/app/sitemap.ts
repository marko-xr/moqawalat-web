import type { MetadataRoute } from "next";
import { getBlogPosts, getProjects, getServices } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = ["", "/about", "/services", "/projects", "/blog", "/contact"];

  const [services, projects, posts] = await Promise.all([getServices(), getProjects(), getBlogPosts()]);

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...projects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
