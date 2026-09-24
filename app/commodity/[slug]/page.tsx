import { notFound } from "next/navigation";
import { articles } from "@/lib/data";
import { commodities, commodityBySlug } from "@/lib/taxonomy";
import { StoryCard } from "@/components/StoryCard";

export function generateStaticParams() { return commodities.map(item => ({ slug: item.slug })); }

export default function CommodityPage({ params }: { params: { slug: string } }) {
  const commodity = commodityBySlug(params.slug);
  if (!commodity) notFound();
  const matches = articles.filter(article => article.commodity?.toLowerCase() === commodity.name.toLowerCase() || article.title.toLowerCase().includes(commodity.name.toLowerCase()));

  return (
    <main className="directoryPage">
      <header className="directoryHero"><span className="miniLabel">{commodity.family.toUpperCase()} / COMMODITY</span><h1>{commodity.name}</h1><p>{commodity.note}</p></header>
      <section className="commoditySignal"><div><span className="miniLabel">MARS MARKET LAYER</span><h2>Price + weather + logistics + policy.</h2></div><p>Live observations will populate here once market feeds and Supabase are connected. The page structure is already production-ready for those signals.</p></section>
      <section className="directorySection"><div className="directoryTitle"><h2>Latest intelligence</h2><span>{matches.length ? matches.length + " prototype story" + (matches.length > 1 ? "ies" : "") : "Desk ready for ingestion"}</span></div>
      {matches.length ? <div className="storyGrid">{matches.map(story => <StoryCard story={story} key={story.slug} />)}</div> : <div className="emptyState"><h2>No published MARS story yet.</h2><p>The newsroom discovery engine can already find leads for this commodity before Supabase is connected.</p></div>}</section>
    </main>
  );
}
