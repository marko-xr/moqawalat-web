"use client";

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({ open, title, description, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <div className="card admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title">
        <h3 id="admin-modal-title">{title}</h3>
        <p>{description}</p>
        <div className="admin-modal-actions">
          <button className="btn btn-outline" type="button" onClick={onCancel}>
            إلغاء
          </button>
          <button className="btn btn-primary" type="button" onClick={onConfirm}>
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
