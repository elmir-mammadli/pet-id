import type { MetadataRoute } from "next";

function getSiteUrl() {
  const fallback = "https://pawport.tigonfc.com";
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured) return fallback;
  try {
    return new URL(configured).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/activate/",
          "/reset-password/",
          "/auth/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
