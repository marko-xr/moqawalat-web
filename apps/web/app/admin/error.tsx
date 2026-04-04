"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container section admin-page">
      <section className="card admin-error-box">
        <h2>حدث خطأ أثناء تحميل لوحة التحكم</h2>
        <p>{error.message}</p>
        <button className="btn btn-primary" onClick={reset}>
          إعادة المحاولة
        </button>
      </section>
    </div>
  );
}
