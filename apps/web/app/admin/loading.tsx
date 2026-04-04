import LeadsSkeleton from "@/components/admin/LeadsSkeleton";

export default function AdminLoading() {
  return (
    <div className="container section admin-page">
      <header className="admin-page-header">
        <h1>لوحة إدارة العملاء المحتملين</h1>
        <p>جاري تحميل البيانات...</p>
      </header>
      <LeadsSkeleton />
    </div>
  );
}
