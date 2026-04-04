export type AdminLead = {
  id: string;
  fullName: string;
  phone: string;
  whatsapp?: string | null;
  city: string;
  serviceType: string;
  message?: string | null;
  locationUrl?: string | null;
  imageUrl?: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED";
  crmNotes?: string | null;
  createdAt: string;
};

export type LeadsApiResponse = {
  items: AdminLead[];
  total: number;
  totalLeads: number;
  todayLeads: number;
  page: number;
  pageSize: number;
  totalPages: number;
  serviceOptions: string[];
};
