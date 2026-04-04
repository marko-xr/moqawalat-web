import Link from "next/link";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "المدونة",
  description: "مقالات ونصائح حول الدهانات والعزل والديكور في المنطقة الشرقية.",
  alternates: { canonical: "/blog" }
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section className="section">
      <div className="container">
        <h1>المدونة</h1>
        <div className="grid">
          {posts.map((post) => (
            <article key={post.id} className="card">
              <h3>{post.titleAr}</h3>
              <p>{post.excerptAr}</p>
              <Link className="btn btn-outline" href={`/blog/${post.slug}`}>
                قراءة المقال
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
