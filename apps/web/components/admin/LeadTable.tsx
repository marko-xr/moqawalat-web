import type { AdminLead } from "./types";

type LeadTableProps = {
  leads: AdminLead[];
  updatingLeadIds: string[];
  onSaveStatus: (lead: AdminLead, status: AdminLead["status"]) => Promise<void>;
  onSaveNotes: (lead: AdminLead, crmNotes: string) => Promise<void>;
};

const STATUS_LABELS: Record<AdminLead["status"], string> = {
  NEW: "جديد",
  CONTACTED: "تم التواصل",
  QUALIFIED: "مؤهل",
  CLOSED: "مغلق"
};

function toWaPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function isVideoUrl(value: string) {
  return /\.(mp4|webm|mov|m4v|avi|mkv|3gp)$/i.test(value);
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const absSeconds = Math.abs(Math.round(diffMs / 1000));
  const rtf = new Intl.RelativeTimeFormat("ar-SA", { numeric: "auto" });

  if (absSeconds < 60) {
    return rtf.format(Math.round(diffMs / 1000), "second");
  }

  const absMinutes = Math.abs(Math.round(diffMs / (1000 * 60)));
  if (absMinutes < 60) {
    return rtf.format(Math.round(diffMs / (1000 * 60)), "minute");
  }

  const absHours = Math.abs(Math.round(diffMs / (1000 * 60 * 60)));
  if (absHours < 24) {
    return rtf.format(Math.round(diffMs / (1000 * 60 * 60)), "hour");
  }

  const absDays = Math.abs(Math.round(diffMs / (1000 * 60 * 60 * 24)));
  return rtf.format(Math.round(diffMs / (1000 * 60 * 60 * 24)), "day");
}

export default function LeadTable({ leads, updatingLeadIds, onSaveStatus, onSaveNotes }: LeadTableProps) {
  return (
    <section className="card">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الجوال</th>
              <th>الواتساب</th>
              <th>الخدمة</th>
              <th>الموقع</th>
              <th>المرفق</th>
              <th>الحالة</th>
              <th>الرسالة</th>
              <th>ملاحظات CRM</th>
              <th>تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <strong>{lead.fullName}</strong>
                  <div className="admin-lead-city">{lead.city}</div>
                </td>
                <td>
                  <a href={`tel:${lead.phone}`} className="admin-quick-link admin-call-link" aria-label={`اتصال ${lead.fullName}`}>
                    اتصال
                  </a>
                </td>
                <td>
                  <a
                    href={`https://wa.me/${toWaPhone(lead.whatsapp || lead.phone)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-quick-link admin-wa-link"
                    aria-label={`واتساب ${lead.fullName}`}
                  >
                    واتساب
                  </a>
                </td>
                <td>{lead.serviceType}</td>
                <td>
                  {lead.locationUrl ? (
                    isHttpUrl(lead.locationUrl) ? (
                      <a href={lead.locationUrl} target="_blank" rel="noreferrer" className="admin-location-link">
                        فتح الموقع
                      </a>
                    ) : (
                      lead.locationUrl
                    )
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {lead.imageUrl ? (
                    <div className="admin-lead-media-wrap">
                      {isVideoUrl(lead.imageUrl) ? (
                        <video className="admin-lead-media" src={lead.imageUrl} controls preload="metadata" />
                      ) : (
                        <a href={lead.imageUrl} target="_blank" rel="noreferrer" className="admin-lead-media-link">
                          <img src={lead.imageUrl} alt={`مرفق ${lead.fullName}`} className="admin-lead-media" loading="lazy" />
                        </a>
                      )}
                      <a href={lead.imageUrl} target="_blank" rel="noreferrer" className="admin-location-link">
                        فتح المرفق
                      </a>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <div className={`lead-status-badge lead-status-${lead.status.toLowerCase()}`}>{STATUS_LABELS[lead.status]}</div>
                  <select
                    value={lead.status}
                    disabled={updatingLeadIds.includes(lead.id)}
                    onChange={(event) => onSaveStatus(lead, event.target.value as AdminLead["status"])}
                    title="تحديث حالة العميل"
                    className="lead-status-select"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="admin-message-cell">{lead.message || "-"}</td>
                <td className="admin-notes-cell">
                  <textarea
                    className="admin-notes-textarea"
                    rows={2}
                    defaultValue={lead.crmNotes || ""}
                    placeholder="أضف ملاحظات المتابعة"
                    onBlur={(event) => onSaveNotes(lead, event.target.value)}
                    disabled={updatingLeadIds.includes(lead.id)}
                  />
                </td>
                <td title={new Date(lead.createdAt).toLocaleString("ar-SA")}>{formatRelativeDate(lead.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
