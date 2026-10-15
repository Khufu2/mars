import { createClient } from "@supabase/supabase-js";
import { serviceClient } from "@/lib/studioServer";
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

function newsBodyParagraphs(value: unknown): string[] {
  const raw=String(value||"").replace(/\r/g,"").trim();
  if(!raw) return [];
  let paragraphs=raw.split(/\n\s*\n+/).map(p=>p.replace(/\s+/g," ").trim()).filter(Boolean);
  if(paragraphs.length===1 && paragraphs[0].length>900){
    const sentences=paragraphs[0].match(/[^.!?]+[.!?]+(?:["')\]]+)?|[^.!?]+$/g)?.map(s=>s.trim()).filter(Boolean)||[paragraphs[0]];
    paragraphs=[];
    for(let i=0;i<sentences.length;i+=3) paragraphs.push(sentences.slice(i,i+3).join(" "));
  }
  return paragraphs.filter(p=>p.length>20);
}

async function hydrateRadarRow(row: DbArticle): Promise<DbArticle> {
  if(row.story_type!=="Radar" || !process.env.NEWSAPI_AI_KEY) return row;
  const existingSections=normalizeBody(row.body);
  const currentWords=existingSections.flatMap(section=>section.body).join(" ").split(/\s+/).filter(Boolean).length;
  if(currentWords>=120) return row;

  const admin=serviceClient();
  if(!admin) return row;
  const {data:candidate}=await admin
    .from("news_candidates")
    .select("external_id")
    .eq("provider","newsapi.ai")
    .eq("article_id",row.id)
    .maybeSingle();
  const articleUri=candidate?.external_id;
  if(!articleUri) return row;

  try{
    const response=await fetch("https://eventregistry.org/api/v1/article/getArticle",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        action:"getArticle",
        articleUri,
        infoArticleBodyLen:-1,
        resultType:"info",
        apiKey:process.env.NEWSAPI_AI_KEY,
      }),
      cache:"no-store",
    });
    if(!response.ok) return row;
    const payload=await response.json();
    const entry=payload?.[articleUri]?.info || payload?.article?.info || payload?.info || payload?.[articleUri] || payload?.article || null;
    const fullBody=entry?.body || entry?.articleBody || null;
    const paragraphs=newsBodyParagraphs(fullBody);
    if(paragraphs.join(" ").split(/\s+/).length<120) return row;

    const body=[{eyebrow:"",title:"",body:paragraphs}];
    const dek=paragraphs[0].split(/\s+/).slice(0,36).join(" ")+(paragraphs[0].split(/\s+/).length>36?"…":"");
    await admin.from("articles").update({body,dek,meta_description:dek.slice(0,165),updated_at:new Date().toISOString()}).eq("id",row.id);
    return {...row,body,dek,meta_description:dek.slice(0,165)};
  }catch{
    return row;
  }
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
    if (data) {
      const hydrated=await hydrateRadarRow(data as unknown as DbArticle);
      return mapDbArticle(hydrated);
    }
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
