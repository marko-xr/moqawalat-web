type LeadFiltersProps = {
  q: string;
  service: string;
  serviceOptions: string[];
  onChangeQuery: (value: string) => void;
  onChangeService: (value: string) => void;
};

export default function LeadFilters({
  q,
  service,
  serviceOptions,
  onChangeQuery,
  onChangeService
}: LeadFiltersProps) {
  return (
    <section className="card admin-filters-grid">
      <div>
        <label htmlFor="leadQuery">بحث بالاسم أو الجوال</label>
        <input
          id="leadQuery"
          value={q}
          onChange={(event) => onChangeQuery(event.target.value)}
          placeholder="مثال: محمد أو 9665..."
        />
      </div>
      <div>
        <label htmlFor="serviceFilter">تصفية حسب الخدمة</label>
        <select
          id="serviceFilter"
          value={service}
          onChange={(event) => onChangeService(event.target.value)}
          title="تصفية الخدمات"
        >
          <option value="">كل الخدمات</option>
          {serviceOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
