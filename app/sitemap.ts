import type { MetadataRoute } from "next";
import { articles, sections } from "@/lib/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return [
    { url: base, lastModified: new Date() },
    ...articles.map(a => ({ url: base + "/article/" + a.slug, lastModified: new Date() })),
    ...sections.map(s => ({ url: base + "/section/" + s.toLowerCase(), lastModified: new Date() }))
  ];
}
