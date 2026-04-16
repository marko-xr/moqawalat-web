import { notFound } from "next/navigation";
import { isValidImageUrl } from "@/lib/media";
import ClientImage from "@/components/ClientImage";

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

function hasValidImage(imageSrc: string | undefined): imageSrc is string {
  return typeof imageSrc === "string" && isValidImageUrl(imageSrc, { allowPlaceholders: false });
}

export default function Hero({
  title = "عزل أسطح بالدمام يحمي المبنى من التسربات والحرارة",
  lead =
    "إذا كنت تعاني من تسرب المياه أو ارتفاع حرارة السطح، نقدم لك حلول عزل مائي وحراري احترافية بضمان واضح ومعاينة سريعة داخل الدمام والخبر والظهران والقطيف.",
  points = defaultPoints,
  imageSrc,
  imageAlt = "عزل اسطح فوم في الدمام"
}: HeroProps) {
  if (!hasValidImage(imageSrc)) {
    console.warn("Invalid roof hero image:", imageSrc ?? "(empty)");
    return notFound();
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
        <ClientImage
          src={imageSrc}
          alt={imageAlt}
          width={1200}
          height={800}
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
          errorContext="roof-hero"
        />
      </div>
    </section>
  );
}
