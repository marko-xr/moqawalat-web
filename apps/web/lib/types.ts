export type Service = {
  id: string;
  titleAr: string;
  slug: string;
  sortOrder?: number | null;
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

export type ServiceSeoFaqItem = {
  question: string;
  answer: string;
};

export type ServiceSeoTrustItem = {
  title: string;
  description: string;
};

export type ServiceSeoServiceItem = {
  title: string;
  description: string;
  imageAlt?: string;
};

export type ServiceSeoRelatedLink = {
  title: string;
  href: string;
};

export type ServiceSeoContentSections = {
  heroTitle?: string;
  heroLead?: string;
  heroPoints?: string[];
  trustItems?: ServiceSeoTrustItem[];
  serviceItems?: ServiceSeoServiceItem[];
  areas?: string[];
  relatedLinks?: ServiceSeoRelatedLink[];
  ctaTopTitle?: string;
  ctaTopDescription?: string;
  ctaBottomTitle?: string;
  ctaBottomDescription?: string;
  heroImage?: string | null;
  beforeImage?: string | null;
  afterImage?: string | null;
};

export type ServiceSeoPage = {
  id?: string | null;
  serviceId: string;
  title: string;
  slug: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentSections?: ServiceSeoContentSections | null;
  images?: string[];
  faq?: ServiceSeoFaqItem[];
  updatedAt?: string;
};

export type ServiceSeoAdminPayload = {
  service: Service;
  seoPage: ServiceSeoPage;
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
