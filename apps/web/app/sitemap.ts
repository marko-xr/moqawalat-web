import type { MetadataRoute } from "next";
import { getBlogPosts, getProjects, getServices } from "@/lib/api";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticRoutes = ["", "/about", "/services", "/projects", "/blog", "/contact", "/roof-insulation-dammam"];

  const [services, projects, posts] = await Promise.all([getServices(), getProjects(), getBlogPosts()]);
  const now = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8
    })),
    ...services.map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: new Date(service.updatedAt || service.createdAt || now),
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...projects.map((project) => ({
      url: `${base}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt || project.createdAt || now),
      changeFrequency: "monthly" as const,
      priority: 0.7
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt || now),
      changeFrequency: "monthly" as const,
      priority: 0.7
    }))
  ];
}
