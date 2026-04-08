"use client";

import { useMemo, useState } from "react";
import LeadFilters from "./LeadFilters";
import LeadStats from "./LeadStats";
import LeadTable from "./LeadTable";
import LeadsSkeleton from "./LeadsSkeleton";
import Pagination from "./Pagination";
import { useAdminLeads } from "./useAdminLeads";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import type { AdminLead } from "./types";

const PAGE_SIZE = 10;

export default function AdminLeadsDashboard() {
  const [q, setQ] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [notice, setNotice] = useState<string>("");
  const [deleteTarget, setDeleteTarget] = useState<AdminLead | null>(null);

  const params = useMemo(
    () => ({
      q,
      service,
      page,
      pageSize: PAGE_SIZE
    }),
    [q, service, page]
  );

  const { data, loading, error, refetch, updateLead, deleteLead, updatingLeadIds, deletingLeadIds } = useAdminLeads(params);

  function onSearch(value: string) {
    setQ(value);
    setPage(1);
  }

  function onServiceFilter(value: string) {
    setService(value);
    setPage(1);
  }

  async function onSaveStatus(leadId: string, status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED") {
    try {
      await updateLead(leadId, { status });
      setNotice("تم تحديث حالة العميل");
    } catch {
      setNotice("تعذر تحديث الحالة، حاول مرة أخرى");
    }
  }

  async function onSaveNotes(leadId: string, crmNotes: string) {
    try {
      await updateLead(leadId, { crmNotes });
      setNotice("تم حفظ الملاحظات");
    } catch {
      setNotice("تعذر حفظ الملاحظات، حاول مرة أخرى");
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteLead(deleteTarget.id);
      setNotice("تم حذف العميل المحتمل");
      setDeleteTarget(null);
      refetch();
    } catch {
      setNotice("تعذر حذف العميل المحتمل، حاول مرة أخرى");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>لوحة إدارة العملاء المحتملين</h1>
        <p>إدارة ومتابعة جميع الطلبات الواردة من الموقع.</p>
      </header>

      {notice ? <section className="card admin-notice-box">{notice}</section> : null}

      <LeadStats totalLeads={data.totalLeads} todayLeads={data.todayLeads} />

      <LeadFilters
        q={q}
        service={service}
        serviceOptions={data.serviceOptions}
        onChangeQuery={onSearch}
        onChangeService={onServiceFilter}
      />

      {loading ? <LeadsSkeleton /> : null}

      {!loading && error ? (
        <section className="card admin-error-box">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => refetch()}>
            إعادة المحاولة
          </button>
        </section>
      ) : null}

      {!loading && !error && data.items.length === 0 ? (
        <section className="card admin-empty">لا توجد نتائج مطابقة للبحث الحالي.</section>
      ) : null}

      {!loading && !error && data.items.length > 0 ? (
        <>
          <LeadTable
            leads={data.items}
            updatingLeadIds={updatingLeadIds}
            deletingLeadIds={deletingLeadIds}
            onSaveStatus={(lead, status) => onSaveStatus(lead.id, status)}
            onSaveNotes={(lead, crmNotes) => onSaveNotes(lead.id, crmNotes)}
            onRequestDelete={(lead) => setDeleteTarget(lead)}
          />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      ) : null}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="حذف عميل محتمل"
        description={deleteTarget ? `هل تريد حذف العميل ${deleteTarget.fullName}؟` : ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void onConfirmDelete();
        }}
      />
    </div>
  );
}
