import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProjects } from "@/lib/api";
import { LOCAL_AREAS, SEO_KEYWORDS } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "المشاريع",
  description: "مشاريع قبل وبعد في الدهانات والعزل والأعمال الحديدية والديكور بالمنطقة الشرقية.",
  keywords: [...SEO_KEYWORDS.global, ...LOCAL_AREAS.map((area) => `مشاريع مقاولات ${area}`)],
  alternates: { canonical: "/projects" }
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="section">
      <div className="container">
        <h1>معرض المشاريع (قبل / بعد)</h1>
        <div className="grid grid-3">
          {projects.map((project) => (
            <article key={project.id} className="card">
              <Link href={`/projects/${project.slug}`} className="project-card-link" prefetch={false}>
                <div className="project-card-media">
                  <Image
                    src={project.coverImage || project.afterImage || project.beforeImage || "/images/placeholder-after.svg"}
                    alt={project.titleAr}
                    className="img-full"
                    width={900}
                    height={600}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <h3>{project.titleAr}</h3>
                <p>{project.descriptionAr}</p>
                <small>
                  {project.locationAr} - {project.categoryAr}
                </small>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
