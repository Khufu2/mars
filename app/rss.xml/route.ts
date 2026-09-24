import { getPublishedArticles } from "@/lib/content";

export const revalidate = 300;

function esc(value:string){return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}

export async function GET(){
  const base=process.env.NEXT_PUBLIC_SITE_URL || "https://mars-rust.vercel.app";
  const items=await getPublishedArticles(50);
  const xml=`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0"><channel>
<title>MARS — Africa's food economy, decoded</title>
<link>${base}</link>
<description>Agriculture, commodities, climate, trade and logistics intelligence for Africa.</description>
<language>en</language>
${items.map(item=>`<item><title>${esc(item.title)}</title><link>${base}/article/${item.slug}</link><guid>${base}/article/${item.slug}</guid><description>${esc(item.dek)}</description><category>${esc(item.section)}</category></item>`).join("\n")}
</channel></rss>`;
  return new Response(xml,{headers:{"content-type":"application/rss+xml; charset=utf-8","cache-control":"public, s-maxage=300, stale-while-revalidate=600"}});
}
