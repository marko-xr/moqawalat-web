import type { Metadata } from "next";
import { getBlogBySlug, getBlogPosts } from "@/lib/api";
import { notFound } from "next/navigation";

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
        <h1>{post.titleAr}</h1>
        <p>{post.contentAr}</p>
      </div>
    </section>
  );
}
