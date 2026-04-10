import type { Metadata } from "next";
import Image from "next/image";
import { getBlogBySlug, getBlogPosts } from "@/lib/api";
import { notFound } from "next/navigation";
import { SEO_KEYWORDS } from "@/lib/seo";

export const revalidate = 300;

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

  return {
    title: post.seoTitleAr || post.titleAr,
    description: post.seoDescriptionAr || post.excerptAr,
    keywords: SEO_KEYWORDS.blog,
    openGraph: {
      type: "article",
      title: post.seoTitleAr || post.titleAr,
      description: post.seoDescriptionAr || post.excerptAr,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitleAr || post.titleAr,
      description: post.seoDescriptionAr || post.excerptAr,
      images: post.coverImage ? [post.coverImage] : undefined
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

  return (
    <section className="section">
      <div className="container card">
        <div className="blog-article-cover">
          <Image
            src={post.coverImage || "/images/main-image.webp"}
            alt={post.titleAr}
            width={1400}
            height={900}
            className="img-full"
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority
          />
        </div>
        <h1>{post.titleAr}</h1>
        <p>{post.contentAr}</p>
      </div>
    </section>
  );
}
