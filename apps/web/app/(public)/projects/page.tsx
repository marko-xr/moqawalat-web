import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "المشاريع",
  description: "مشاريع قبل وبعد في الدهانات والعزل والأعمال الحديدية والديكور بالمنطقة الشرقية.",
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
              <Link href={`/projects/${project.slug}`} className="project-card-link">
                <div className="project-card-media">
                  <img
                    src={project.coverImage || project.afterImage || project.beforeImage || "/images/placeholder-after.svg"}
                    alt={project.titleAr}
                    className="img-full"
                    loading="lazy"
                    decoding="async"
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
