export default function LeadsSkeleton() {
  return (
    <section className="card admin-skeleton-grid" aria-live="polite">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="admin-skeleton-item" />
      ))}
    </section>
  );
}
