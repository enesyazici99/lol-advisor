import type { MetadataRoute } from "next";
import { getChampions } from "@/lib/riot/ddragon";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lol-advisor.vercel.app";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/advisor`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/live`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];

  try {
    const champions = await getChampions();
    const championPages: MetadataRoute.Sitemap = Object.keys(champions).map((key) => ({
      url: `${baseUrl}/champion/${key}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...championPages];
  } catch {
    return staticPages;
  }
}
