import Image from "next/image";

type HeroProps = {
  title?: string;
  lead?: string;
  points?: string[];
  imageSrc?: string;
  imageAlt?: string;
};

const defaultPoints = [
  "معاينة مجانية وتقييم فني قبل التنفيذ.",
  "مواد عزل معتمدة مناسبة لأجواء المنطقة الشرقية.",
  "تنفيذ سريع ونظيف مع التزام كامل بالجودة."
];

export default function Hero({
  title = "عزل أسطح بالدمام يحمي المبنى من التسربات والحرارة",
  lead =
    "إذا كنت تعاني من تسرب المياه أو ارتفاع حرارة السطح، نقدم لك حلول عزل مائي وحراري احترافية بضمان واضح ومعاينة سريعة داخل الدمام والخبر والظهران والقطيف.",
  points = defaultPoints,
  imageSrc,
  imageAlt = "عزل اسطح فوم في الدمام"
}: HeroProps) {
  if (!imageSrc) {
    throw new Error("MISSING_ROOF_HERO_IMAGE");
  }

  return (
    <section className="roof-hero" aria-labelledby="roof-insulation-title">
      <div className="roof-hero-content">
        <h1 id="roof-insulation-title">{title}</h1>
        <p className="roof-hero-lead">{lead}</p>
        <ul className="roof-hero-points">
          {points.map((point, index) => (
            <li key={`${point}-${index}`}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="roof-hero-media">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1200}
          height={800}
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
        />
      </div>
    </section>
  );
}
