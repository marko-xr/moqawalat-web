const DEFAULT_PUBLIC_SITE_URL = "https://mogawildammam.com";
const LOCALHOST_URL_PATTERN = /^https?:\/\/(localhost|127(?:\.\d{1,3}){3})(?::\d+)?(?:\/|$)/i;

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function isLocalhostUrl(url: string) {
  return LOCALHOST_URL_PATTERN.test(url);
}

export function getSiteUrl() {
  const isProduction = process.env.NODE_ENV === "production";
  const fromBaseUrlEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const fromSiteUrlEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (fromBaseUrlEnv && !(isProduction && isLocalhostUrl(fromBaseUrlEnv))) {
    return normalizeSiteUrl(fromBaseUrlEnv);
  }

  if (fromSiteUrlEnv && !(isProduction && isLocalhostUrl(fromSiteUrlEnv))) {
    return normalizeSiteUrl(fromSiteUrlEnv);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();

  if (vercelUrl) {
    return normalizeSiteUrl(`https://${vercelUrl}`);
  }

  return DEFAULT_PUBLIC_SITE_URL;
}
