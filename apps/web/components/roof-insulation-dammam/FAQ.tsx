export type FAQItem = {
  question: string;
  answer: string;
};

export const roofFaqItems: FAQItem[] = [
  {
    question: "ما أفضل نوع عزل أسطح في الدمام؟",
    answer:
      "يعتمد على حالة السطح، لكن غالبا العزل المائي مع العزل الحراري أو عزل الفوم هو الأنسب لأجواء الدمام الحارة والرطبة."
  },
  {
    question: "كم تستغرق مدة تنفيذ عزل السطح؟",
    answer:
      "في أغلب المشاريع السكنية من يوم إلى 3 أيام حسب مساحة السطح وتجهيزاته وحالة الطبقات القديمة."
  },
  {
    question: "هل العزل يقلل فاتورة الكهرباء؟",
    answer:
      "نعم، العزل الحراري الجيد يقلل انتقال الحرارة للدور العلوي، وهذا يساعد في تقليل تشغيل المكيف لفترات طويلة."
  },
  {
    question: "هل تقدمون ضمان على عزل الأسطح؟",
    answer:
      "نعم، نقدم ضمان مكتوب حسب نوع المادة ونطاق العمل المتفق عليه بعد المعاينة."
  },
  {
    question: "هل تخدمون الخبر والظهران والقطيف؟",
    answer:
      "نعم، فريقنا يخدم الدمام والخبر والظهران والقطيف وكامل المنطقة الشرقية مع مواعيد معاينة مرنة."
  }
];

type FAQProps = {
  items?: FAQItem[];
};

export default function FAQ({ items = roofFaqItems }: FAQProps) {
  return (
    <section className="roof-faq" aria-labelledby="roof-faq-heading">
      <h2 id="roof-faq-heading">الأسئلة الشائعة عن عزل الأسطح</h2>
      <div className="roof-faq-list">
        {items.map((item, index) => (
          <details key={`${item.question}-${index}`} className="card roof-faq-item">
            <summary>
              <h3>{item.question}</h3>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
