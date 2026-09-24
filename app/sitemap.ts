import type { MetadataRoute } from "next";
import { sections } from "@/lib/data";
import { getPublishedArticles } from "@/lib/content";
import { commodities, regions } from "@/lib/taxonomy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mars-rust.vercel.app";
  const articles = await getPublishedArticles(500);
  return [
    { url: base, lastModified: new Date() },
    { url: base + "/markets", lastModified: new Date() },
    { url: base + "/commodities", lastModified: new Date() },
    { url: base + "/sources", lastModified: new Date() },
    ...articles.map(a => ({ url: base + "/article/" + a.slug, lastModified: new Date() })),
    ...sections.map(s => ({ url: base + "/section/" + s.toLowerCase(), lastModified: new Date() })),
    ...commodities.map(c => ({ url: base + "/commodity/" + c.slug, lastModified: new Date() })),
    ...regions.map(r => ({ url: base + "/region/" + r.slug, lastModified: new Date() })),
  ];
}
