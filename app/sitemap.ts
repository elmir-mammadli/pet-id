import type { MetadataRoute } from "next";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

function getBaseUrl() {
  const fallback = "https://pawport.tigonfc.com";
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured) return fallback;
  try {
    return new URL(configured).toString().replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/legal`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("pets")
      .select("public_id, updated_at")
      .eq("is_active", true);

    if (error || !data) {
      return staticRoutes;
    }

    const petRoutes: MetadataRoute.Sitemap = data
      .filter((pet) => Boolean(pet.public_id))
      .map((pet) => ({
        url: `${baseUrl}/p/${encodeURIComponent(pet.public_id)}`,
        lastModified: pet.updated_at ? new Date(pet.updated_at) : now,
        changeFrequency: "daily",
        priority: 0.8,
      }));

    return [...staticRoutes, ...petRoutes];
  } catch {
    return staticRoutes;
  }
}
