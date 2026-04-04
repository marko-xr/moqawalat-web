type LeadStatsProps = {
  totalLeads: number;
  todayLeads: number;
};

export default function LeadStats({ totalLeads, todayLeads }: LeadStatsProps) {
  return (
    <section className="admin-stats-grid">
      <article className="card admin-stat-card">
        <span>إجمالي العملاء</span>
        <strong>{totalLeads}</strong>
      </article>
      <article className="card admin-stat-card">
        <span>عملاء اليوم</span>
        <strong>{todayLeads}</strong>
      </article>
    </section>
  );
}
