type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="admin-pagination">
      <button className="btn btn-outline" onClick={() => onPageChange(page - 1)} disabled={!canPrev}>
        السابق
      </button>
      <span>
        صفحة {page} من {totalPages}
      </span>
      <button className="btn btn-outline" onClick={() => onPageChange(page + 1)} disabled={!canNext}>
        التالي
      </button>
    </div>
  );
}
