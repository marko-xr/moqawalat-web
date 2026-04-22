import type { Metadata } from "next";
import Image from "next/image";
import { getBlogBySlug, getBlogPosts } from "@/lib/api";
import { notFound } from "next/navigation";
import { SEO_KEYWORDS } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

function isCloudinaryUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.startsWith("https://res.cloudinary.com/");
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: "المقال غير موجود",
      description: "المقال المطلوب غير متاح حاليا"
    };
  }

  const title = post.seoTitleAr || post.titleAr;
  const description = post.seoDescriptionAr || post.excerptAr;
  const coverUrl = isCloudinaryUrl(post.coverImage) ? post.coverImage : undefined;

  return {
    title,
    description,
    keywords: SEO_KEYWORDS.blog,
    openGraph: {
      type: "article",
      title,
      description,
      images: coverUrl ? [{ url: coverUrl, width: 1400, height: 900, alt: title }] : undefined,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt || post.createdAt
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: coverUrl ? [coverUrl] : undefined
    },
    alternates: { canonical: `/blog/${post.slug}` }
  };
}

export default async function BlogDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const base = getSiteUrl();
  const coverUrl = isCloudinaryUrl(post.coverImage) ? post.coverImage : undefined;
  const title = post.seoTitleAr || post.titleAr;
  const description = post.seoDescriptionAr || post.excerptAr;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${base}/blog/${post.slug}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    inLanguage: "ar",
    author: {
      "@type": "Organization",
      name: "مقاول الدمام",
      url: base
    },
    publisher: {
      "@type": "Organization",
      name: "مقاول الدمام",
      url: base
    },
    ...(coverUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: coverUrl,
            width: 1400,
            height: 900
          }
        }
      : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="section">
        <div className="container card">
          {coverUrl ? (
            <div className="blog-article-cover">
              <Image
                src={coverUrl}
                alt={post.titleAr}
                width={1400}
                height={900}
                className="img-full"
                sizes="(max-width: 1024px) 100vw, 70vw"
                priority
              />
            </div>
          ) : null}
          <h1>{post.titleAr}</h1>
          <p>{post.contentAr}</p>
        </div>
      </section>
    </>
  );
}

