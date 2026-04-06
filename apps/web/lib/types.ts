export type Service = {
  id: string;
  titleAr: string;
  slug: string;
  shortDescAr: string;
  contentAr: string;
  seoTitleAr?: string | null;
  seoDescriptionAr?: string | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  gallery?: string[] | null;
  galleryDescriptions?: string[] | null;
  videoUrl?: string | null;
  isPublished?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Project = {
  id: string;
  titleAr: string;
  slug: string;
  locationAr: string;
  categoryAr: string;
  descriptionAr: string;
  beforeImage?: string | null;
  afterImage?: string | null;
  coverImage?: string | null;
  gallery?: string[] | null;
  videoUrl?: string | null;
  seoTitleAr?: string | null;
  seoDescriptionAr?: string | null;
  isPublished?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogPost = {
  id: string;
  titleAr: string;
  slug: string;
  excerptAr: string;
  contentAr: string;
  seoTitleAr?: string | null;
  seoDescriptionAr?: string | null;
  coverImage?: string | null;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type Lead = {
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

export type DashboardAnalytics = {
  leadCount: number;
  todayLeads: number;
  callClicks: number;
  whatsappClicks: number;
};
