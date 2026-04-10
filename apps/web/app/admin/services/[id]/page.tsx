import AdminServiceSeoPage from "@/components/admin/AdminServiceSeoPage";

export const dynamic = "force-dynamic";

export default async function ServiceSeoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminServiceSeoPage serviceId={id} />;
}
