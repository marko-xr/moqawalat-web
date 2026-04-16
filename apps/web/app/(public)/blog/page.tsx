import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/api";
import { isValidImageUrl } from "@/lib/media";
import { SEO_KEYWORDS } from "@/lib/seo";
import ClientImage from "@/components/ClientImage";

export const revalidate = 300;

function hasValidCoverImage(coverImage: string | null | undefined): coverImage is string {
  return typeof coverImage === "string" && isValidImageUrl(coverImage, { allowPlaceholders: false });
}

export const metadata: Metadata = {
  title: "مدونة المقاولات بالدمام",
  description: "مقالات عملية عن الدهانات والعزل والمظلات والسواتر والجبس والديكور في الدمام والخبر والظهران والقطيف.",
  keywords: SEO_KEYWORDS.blog,
  alternates: { canonical: "/blog" }
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const validPosts = posts.filter((post) => {
    if (hasValidCoverImage(post.coverImage)) {
      return true;
    }

    console.warn("Invalid blog image for slug:", post.slug);
    return false;
  });

  return (
    <section className="section">
      <div className="container">
        <h1>المدونة</h1>
        {validPosts.length === 0 ? (
          <div className="card seo-empty-state">
            <h2>قريبا: مقالات ونصائح محدثة</h2>
            <p>
              قسم المدونة فعال تقنيا، لكنه يحتاج إضافة مقالات منشورة من لوحة الإدارة ليظهر المحتوى. حاليا يمكنك التصفح عبر
              صفحات الخدمات والمشاريع أو طلب معاينة مباشرة.
            </p>
            <div className="action-row">
              <Link className="btn btn-primary" href="/services">
                تصفح الخدمات
              </Link>
              <Link className="btn btn-outline" href="/contact">
                اطلب معاينة الآن
              </Link>
            </div>
            <h3>مواضيع نقترح نشرها لزيادة الظهور في جوجل</h3>
            <ul className="seo-topic-list">
              {SEO_KEYWORDS.blog.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid grid-3">
            {validPosts.map((post) => (
              <article key={post.id} className="card blog-post-card">
                <div className="blog-card-media">
                  <ClientImage
                    src={post.coverImage}
                    alt={post.titleAr}
                    width={1200}
                    height={720}
                    className="img-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    errorContext={`blog-card:${post.slug}`}
                  />
                </div>
                <h3>{post.titleAr}</h3>
                <p>{post.excerptAr}</p>
                <Link className="btn btn-outline" href={`/blog/${post.slug}`} prefetch={false}>
                  قراءة المقال
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
