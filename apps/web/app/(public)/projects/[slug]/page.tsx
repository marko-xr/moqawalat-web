import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/lib/api";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "المشروع غير موجود",
      description: "المشروع المطلوب غير متاح حاليا"
    };
  }

  return {
    title: project.seoTitleAr || project.titleAr,
    description: project.seoDescriptionAr || project.descriptionAr,
    alternates: { canonical: `/projects/${project.slug}` }
  };
}

export default async function ProjectDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const cover = project.coverImage || project.afterImage || project.beforeImage || "/images/placeholder-after.svg";
  const gallery: string[] = project.gallery || [];
  const videoUrl = project.videoUrl || "";

  let embedUrl = "";
  let isVideoFile = false;
  if (videoUrl) {
    const lower = videoUrl.toLowerCase();
    isVideoFile = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");
    if (!isVideoFile) {
      try {
        const parsed = new URL(videoUrl);
        if (parsed.hostname.includes("youtu.be")) {
          embedUrl = `https://www.youtube.com/embed/${parsed.pathname.replace("/", "")}`;
        } else if (parsed.hostname.includes("youtube.com")) {
          embedUrl = `https://www.youtube.com/embed/${parsed.searchParams.get("v") || ""}`;
        }
      } catch {
        embedUrl = "";
      }
    }
  }

  return (
    <section className="section">
      <div className="container project-details">
        <div className="project-hero">
          <div>
            <h1>{project.titleAr}</h1>
            <p className="lead">{project.descriptionAr}</p>
            <div className="project-meta">
              <span>{project.locationAr}</span>
              <span>{project.categoryAr}</span>
            </div>
          </div>
          <div className="project-hero-media">
            <img src={cover} alt={project.titleAr} loading="eager" fetchPriority="high" decoding="async" />
          </div>
        </div>

        {(project.beforeImage || project.afterImage) && (
          <div className="project-before-after">
            {project.beforeImage ? (
              <div className="project-before">
                <span>قبل</span>
                <img src={project.beforeImage} alt={`قبل - ${project.titleAr}`} loading="lazy" decoding="async" />
              </div>
            ) : null}
            {project.afterImage ? (
              <div className="project-after">
                <span>بعد</span>
                <img src={project.afterImage} alt={`بعد - ${project.titleAr}`} loading="lazy" decoding="async" />
              </div>
            ) : null}
          </div>
        )}

        {gallery.length ? (
          <div className="project-gallery">
            {gallery.map((src, index) => (
              <div className="project-gallery-item" key={`${src}-${index}`}>
                <img src={src} alt={`${project.titleAr} ${index + 1}`} loading="lazy" decoding="async" />
              </div>
            ))}
          </div>
        ) : null}

        {videoUrl ? (
          <div className="card project-video">
            {isVideoFile ? (
              <video controls src={videoUrl} />
            ) : embedUrl ? (
              <iframe
                title="project video"
                src={embedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a className="btn btn-outline" href={videoUrl} target="_blank" rel="noreferrer">
                مشاهدة الفيديو
              </a>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
