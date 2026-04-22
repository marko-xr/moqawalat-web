import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/api";
import { SEO_KEYWORDS } from "@/lib/seo";

export const revalidate = 300;

function isCloudinaryUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.startsWith("https://res.cloudinary.com/");
}

export const metadata: Metadata = {
  title: "مدونة المقاولات بالدمام | نصائح ومقالات متخصصة",
  description:
    "مقالات عملية ومتخصصة عن الدهانات والعزل والمظلات والسواتر والبرجولات والديكورات وترميم المنازل في الدمام والخبر والظهران والقطيف والمنطقة الشرقية.",
  keywords: SEO_KEYWORDS.blog,
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "مدونة المقاولات بالدمام",
    description:
      "مقالات متخصصة عن الدهانات والعزل والمظلات والسواتر والبرجولات وترميم المنازل في الدمام والمنطقة الشرقية."
  }
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section className="section">
      <div className="container">
        <h1>مدونة المقاولات بالدمام</h1>
        <p className="section-lead">
          نصائح ومقالات متخصصة عن الدهانات والعزل والمظلات والسواتر والبرجولات وترميم المنازل في الدمام والمنطقة الشرقية.
        </p>
        {posts.length === 0 ? (
          <div className="card seo-empty-state">
            <h2>قريباً: مقالات ونصائح متخصصة</h2>
            <p>
              نعمل على نشر محتوى متخصص يساعدك في اتخاذ قرارات مدروسة في مجال الدهانات والعزل والمظلات والديكورات وترميم
              المنازل في الدمام والمنطقة الشرقية.
            </p>
            <div className="action-row">
              <Link className="btn btn-primary" href="/services">
                تصفح الخدمات
              </Link>
              <Link className="btn btn-outline" href="/contact">
                اطلب معاينة الآن
              </Link>
            </div>
            <h3>مواضيع قادمة</h3>
            <ul className="seo-topic-list">
              {SEO_KEYWORDS.blog.slice(0, 10).map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid grid-3">
            {posts.map((post) => (
              <article key={post.id} className="card blog-post-card">
                {isCloudinaryUrl(post.coverImage) ? (
                  <div className="blog-card-media">
                    <Image
                      src={post.coverImage}
                      alt={post.titleAr}
                      width={1200}
                      height={720}
                      className="img-full"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : null}
                <h2 className="blog-post-card-title">{post.titleAr}</h2>
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

