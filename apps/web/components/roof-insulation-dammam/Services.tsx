import Image from "next/image";

type ServiceItem = {
  title: string;
  description: string;
  imageAlt: string;
};

const defaultServiceItems: ServiceItem[] = [
  {
    title: "عزل مائي للأسطح",
    description: "معالجة كاملة لمنع تسربات مياه الأمطار وحماية الخرسانة من التآكل والرطوبة.",
    imageAlt: "تنفيذ عزل مائي للأسطح في الدمام"
  },
  {
    title: "عزل حراري للأسطح",
    description: "تقليل انتقال الحرارة للدور الأخير لخفض استهلاك التكييف وتحسين الراحة داخل المنزل.",
    imageAlt: "عزل حراري للأسطح في المنطقة الشرقية"
  },
  {
    title: "عزل فوم (PU Foam)",
    description: "حل متكامل يجمع بين العزل الحراري والمائي مع تغطية متجانسة للأسطح الصعبة.",
    imageAlt: "عزل اسطح فوم في الدمام"
  }
];

type ServicesProps = {
  heading?: string;
  intro?: string;
  items?: ServiceItem[];
  imageSrc?: string;
  imageSources?: string[];
};

export default function Services({
  heading = "تفاصيل خدمة عزل الأسطح",
  intro = "نختار نوع العزل بعد فحص السطح وحالته الحالية، لضمان أفضل نتيجة حسب طبيعة المبنى والميزانية.",
  items = defaultServiceItems,
  imageSrc = "/images/placeholder-after.svg",
  imageSources = []
}: ServicesProps) {
  return (
    <section className="roof-services" aria-labelledby="roof-services-heading">
      <h2 id="roof-services-heading">{heading}</h2>
      <p className="roof-section-intro">{intro}</p>

      <div className="roof-services-grid">
        {items.map((item, index) => (
          <article key={`${item.title}-${index}`} className="card roof-service-card">
            <div className="roof-service-image">
              <Image
                src={imageSources[index] || imageSrc}
                alt={item.imageAlt}
                width={1000}
                height={700}
                sizes="(max-width: 768px) 100vw, 33vw"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}