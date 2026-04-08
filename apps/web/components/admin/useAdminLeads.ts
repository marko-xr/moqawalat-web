"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminLead, LeadsApiResponse } from "./types";

type Params = {
  q: string;
  service: string;
  page: number;
  pageSize: number;
};

const defaultData: LeadsApiResponse = {
  items: [],
  total: 0,
  totalLeads: 0,
  todayLeads: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  serviceOptions: []
};

export function useAdminLeads(params: Params) {
  const [data, setData] = useState<LeadsApiResponse>(defaultData);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [updatingLeadIds, setUpdatingLeadIds] = useState<string[]>([]);
  const [deletingLeadIds, setDeletingLeadIds] = useState<string[]>([]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    const searchParams = new URLSearchParams({
      q: params.q,
      service: params.service,
      page: String(params.page),
      pageSize: String(params.pageSize)
    });

    const response = await fetch(`/api/leads?${searchParams.toString()}`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("تعذر تحميل بيانات العملاء المحتملين");
    }

    const payload = (await response.json()) as LeadsApiResponse;
    setData(payload);
    setLoading(false);
  }, [params.page, params.pageSize, params.q, params.service]);

  useEffect(() => {
    fetchLeads().catch((err: Error) => {
      setError(err.message || "حدث خطأ غير متوقع");
      setLoading(false);
    });
  }, [fetchLeads]);

  async function updateLead(leadId: string, patch: Partial<Pick<AdminLead, "status" | "crmNotes">>) {
    const previousItemsSnapshot = data.items;

    setData((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === leadId ? { ...item, ...patch } : item))
    }));

    setUpdatingLeadIds((current) => (current.includes(leadId) ? current : [...current, leadId]));

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patch)
      });

      if (!response.ok) {
        throw new Error("تعذر تحديث بيانات العميل");
      }

      const payload = (await response.json()) as Partial<AdminLead>;

      setData((current) => ({
        ...current,
        items: current.items.map((item) =>
          item.id === leadId ? { ...item, status: payload.status || item.status, crmNotes: payload.crmNotes ?? item.crmNotes } : item
        )
      }));
    } catch (updateError) {
      setData((current) => ({ ...current, items: previousItemsSnapshot }));
      throw updateError;
    } finally {
      setUpdatingLeadIds((current) => current.filter((id) => id !== leadId));
    }
  }

  async function deleteLead(leadId: string) {
    const previousData = data;
    const leadToDelete = data.items.find((item) => item.id === leadId);

    setDeletingLeadIds((current) => (current.includes(leadId) ? current : [...current, leadId]));

    setData((current) => {
      const nextItems = current.items.filter((item) => item.id !== leadId);
      const nextTotal = Math.max(current.total - 1, 0);
      const nextTotalLeads = Math.max(current.totalLeads - 1, 0);
      const isTodayLead = leadToDelete ? new Date(leadToDelete.createdAt) >= new Date(new Date().setHours(0, 0, 0, 0)) : false;
      const nextTodayLeads = Math.max(current.todayLeads - (isTodayLead ? 1 : 0), 0);
      const nextTotalPages = Math.max(Math.ceil(nextTotal / Math.max(current.pageSize, 1)), 1);
      const nextPage = Math.min(current.page, nextTotalPages);

      return {
        ...current,
        items: nextItems,
        total: nextTotal,
        totalLeads: nextTotalLeads,
        todayLeads: nextTodayLeads,
        totalPages: nextTotalPages,
        page: nextPage
      };
    });

    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("تعذر حذف العميل المحتمل");
      }
    } catch (deleteError) {
      setData(previousData);
      throw deleteError;
    } finally {
      setDeletingLeadIds((current) => current.filter((id) => id !== leadId));
    }
  }

  return {
    data,
    loading,
    error,
    refetch: fetchLeads,
    updateLead,
    deleteLead,
    updatingLeadIds,
    deletingLeadIds
  };
}
