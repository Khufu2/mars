import { createClient } from "@supabase/supabase-js";
import { articles as prototypeArticles, type Article, type StorySection } from "@/lib/data";

type DbAuthor = { name?: string | null };
type DbCorrection = { note?: string | null; published_at?: string | null };
type DbSource = {
  source_url?: string | null;
  note?: string | null;
  verified?: boolean | null;
  source?: { name?: string | null; url?: string | null; source_type?: string | null } | null;
};

type DbArticle = {
  id: string;
  slug: string;
  title: string;
  dek?: string | null;
  kicker?: string | null;
  body?: unknown;
  section: string;
  region?: string | null;
  country?: string | null;
  commodity?: string | null;
  story_type?: string | null;
  featured_image_url?: string | null;
  image_credit?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  sponsor_name?: string | null;
  sponsor_disclosure?: string | null;
  canonical_url?: string | null;
  author?: DbAuthor | null;
  article_sources?: DbSource[] | null;
  corrections?: DbCorrection[] | null;
};

function publicAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_SUPABASE_ANON_KEY || "";
}

export function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && publicAnonKey());
}

function publicClient() {
  if (!hasSupabase()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publicAnonKey(),
    { auth: { persistSession: false } }
  );
}

function normalizeBody(body: unknown): StorySection[] {
  if (!Array.isArray(body)) return [];
  return body
    .map((block: any) => {
      if (block && typeof block === "object" && Array.isArray(block.body)) {
        return {
          eyebrow: String(block.eyebrow || block.label || "THE STORY"),
          title: String(block.title || ""),
          body: block.body.map((p: unknown) => String(p)).filter(Boolean),
        };
      }
      return null;
    })
    .filter(Boolean) as StorySection[];
}

export type PublishedArticle = Article & {
  id?: string;
  storyType?: string;
  metaTitle?: string;
  metaDescription?: string;
  sponsorName?: string;
  sponsorDisclosure?: string;
  canonicalUrl?: string;
  sources?: Array<{ name: string; url: string; note?: string; verified?: boolean }>;
  corrections?: Array<{ note: string; publishedAt?: string }>;
  isPrototype?: boolean;
};

function mapDbArticle(row: DbArticle): PublishedArticle {
  const sections = normalizeBody(row.body);
  const publishedAt = row.published_at
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(row.published_at))
    : "Published";
  const wordCount = sections.flatMap(section => section.body).join(" ").split(/\s+/).filter(Boolean).length;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    dek: row.dek || "",
    section: row.section,
    region: row.region || "Africa",
    country: row.country || "Regional",
    commodity: row.commodity || undefined,
    author: row.author?.name || "MARS Intelligence Desk",
    publishedAt,
    readTime: Math.max(2, Math.ceil(wordCount / 220)) + " min",
    image: row.featured_image_url || prototypeArticles[0].image,
    imageCredit: row.image_credit || "MARS",
    accent: "orange",
    sections: sections.length ? sections : [{ eyebrow: row.kicker || "THE STORY", title: row.title, body: [row.dek || ""] }],
    storyType: row.story_type || undefined,
    metaTitle: row.meta_title || undefined,
    metaDescription: row.meta_description || undefined,
    sponsorName: row.sponsor_name || undefined,
    sponsorDisclosure: row.sponsor_disclosure || undefined,
    canonicalUrl: row.canonical_url || undefined,
    corrections: (row.corrections || [])
      .map(item => ({
        note: item.note || "",
        publishedAt: item.published_at
          ? new Intl.DateTimeFormat("en", { month:"short", day:"numeric", year:"numeric" }).format(new Date(item.published_at))
          : undefined,
      }))
      .filter(item => item.note),
    sources: (row.article_sources || [])
      .map(item => ({
        name: item.source?.name || "Source",
        url: item.source_url || item.source?.url || "",
        note: item.note || undefined,
        verified: Boolean(item.verified),
      }))
      .filter(item => item.url),
    isPrototype: false,
  };
}

const select = [
  "id","slug","title","dek","kicker","body","section","region","country","commodity","story_type",
  "featured_image_url","image_credit","published_at","updated_at","meta_title","meta_description",
  "sponsor_name","sponsor_disclosure","canonical_url","author:authors(name)",
  "article_sources(source_url,note,verified,source:sources(name,url,source_type))",
  "corrections(note,published_at)"
].join(",");

export async function getPublishedArticles(limit = 30): Promise<PublishedArticle[]> {
  const client = publicClient();
  if (!client) return prototypeArticles.map(article => ({ ...article, isPrototype: true }));

  const { data, error } = await client
    .from("articles")
    .select(select)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) return prototypeArticles.map(article => ({ ...article, isPrototype: true }));
  return (data as unknown as DbArticle[]).map(mapDbArticle);
}

export async function getHomepageArticles(minimum = 6): Promise<PublishedArticle[]> {
  const live = await getPublishedArticles(24);
  if (live.some(article => !article.isPrototype) && live.length < minimum) {
    return [...live, ...prototypeArticles.slice(0, minimum - live.length).map(article => ({ ...article, isPrototype: true }))];
  }
  return live;
}

export async function getArticleBySlug(slug: string): Promise<PublishedArticle | null> {
  const client = publicClient();
  if (client) {
    const { data } = await client
      .from("articles")
      .select(select)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (data) return mapDbArticle(data as unknown as DbArticle);
  }

  const prototype = prototypeArticles.find(article => article.slug === slug);
  return prototype ? { ...prototype, isPrototype: true } : null;
}

export async function searchPublishedArticles(query: string): Promise<PublishedArticle[]> {
  const normalized = query.trim().toLowerCase();
  const all = await getPublishedArticles(80);
  if (!normalized) return all;

  return all.filter(article =>
    [article.title, article.dek, article.section, article.region, article.country, article.commodity || "", article.author]
      .join(" ")
      .toLowerCase()
      .includes(normalized)
  );
}
