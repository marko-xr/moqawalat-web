import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ownerPassword = await bcrypt.hash("Admin@12345", 12);

  await prisma.user.upsert({
    where: { email: "owner@moqawalat.sa" },
    update: {
      name: "مالك المنصة",
      password: ownerPassword,
      role: "OWNER"
    },
    create: {
      name: "مالك المنصة",
      email: "owner@moqawalat.sa",
      password: ownerPassword,
      role: "OWNER"
    }
  });

  await prisma.setting.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      siteNameAr: "مقاولات عامة الدمام",
      siteDescAr: "خدمات دهان، عزل أسطح، أعمال حديد، وجبس وديكور في الدمام والخبر والظهران",
      primaryPhone: "966500000000",
      whatsappNumber: "966500000000",
      addressAr: "الدمام - المنطقة الشرقية",
      lat: 26.4207,
      lng: 50.0888
    }
  });

  const services = [
    {
      titleAr: "خدمات الدهانات الداخلية والخارجية",
      slug: "painting-services",
      shortDescAr: "تنفيذ دهانات احترافية للمنازل والفلل والمباني التجارية.",
      contentAr:
        "نقدم حلول دهان متكاملة باستخدام أفضل المواد المقاومة للرطوبة والحرارة مع تشطيبات عالية الجودة تناسب المناخ في المنطقة الشرقية.",
      seoTitleAr: "خدمات دهان بالدمام | مقاول دهانات محترف",
      seoDescriptionAr: "أفضل خدمات الدهانات الداخلية والخارجية في الدمام والخبر والظهران بأسعار تنافسية."
    },
    {
      titleAr: "عزل الأسطح",
      slug: "roof-insulation",
      shortDescAr: "عزل مائي وحراري احترافي لحماية المباني من التسربات.",
      contentAr:
        "نوفر عزل اسطح باستخدام مواد معتمدة تمنع تسرب المياه وتقلل استهلاك الطاقة. حلول مناسبة للمنازل والمستودعات والمنشآت التجارية.",
      seoTitleAr: "عزل أسطح في الدمام | عزل مائي وحراري",
      seoDescriptionAr: "شركة عزل أسطح بالدمام تقدم حلول عزل مائي وحراري بضمان وجودة عالية."
    },
    {
      titleAr: "الأعمال الحديدية",
      slug: "metal-works",
      shortDescAr: "تصميم وتنفيذ مظلات وهناجر وسواتر وأسوار حديد.",
      contentAr:
        "فريقنا ينفذ جميع أعمال الحديد حسب الطلب، من المظلات والهناجر إلى البوابات والأسوار مع تشطيب مقاوم للعوامل الجوية.",
      seoTitleAr: "مظلات وهناجر وسواتر حديد بالدمام",
      seoDescriptionAr: "تنفيذ أعمال الحديد في المنطقة الشرقية: مظلات، هناجر، سواتر، أسوار بجودة عالية."
    },
    {
      titleAr: "الجبس والديكورات",
      slug: "gypsum-decorations",
      shortDescAr: "ديكورات جبسية عصرية وأسقف مستعارة وتشطيبات داخلية.",
      contentAr:
        "نصمم حلول جبس وديكور تعكس ذوقك، مع تنفيذ دقيق وتشطيبات فاخرة للمنازل والمكاتب والمعارض.",
      seoTitleAr: "ديكورات جبس بالدمام | تصميم وتنفيذ",
      seoDescriptionAr: "أعمال جبس وديكور داخلية بالدمام والخبر والظهران بتصاميم حديثة وأسعار مناسبة."
    }
  ];

  for (const item of services) {
    await prisma.service.upsert({
      where: { slug: item.slug },
      update: item,
      create: item
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
