import { notFound } from "next/navigation";
import { getPublishedArticles } from "@/lib/content";
import { commodities, commodityBySlug } from "@/lib/taxonomy";
import { StoryCard } from "@/components/StoryCard";

export const revalidate = 60;
export function generateStaticParams() { return commodities.map(item => ({ slug: item.slug })); }

export default async function CommodityPage({ params }: { params: { slug: string } }) {
  const commodity = commodityBySlug(params.slug);
  if (!commodity) notFound();
  const articles = await getPublishedArticles(100);
  const matches = articles.filter(article => article.commodity?.toLowerCase() === commodity.name.toLowerCase() || article.title.toLowerCase().includes(commodity.name.toLowerCase()));

  return (
    <main className="directoryPage">
      <header className="directoryHero"><span className="miniLabel">{commodity.family.toUpperCase()} / COMMODITY</span><h1>{commodity.name}</h1><p>{commodity.note}</p></header>
      <section className="commoditySignal"><div><span className="miniLabel">MARS MARKET LAYER</span><h2>Price + weather + logistics + policy.</h2></div><p>Live market observations can populate here independently of the editorial feed. Published MARS reporting appears below automatically.</p></section>
      <section className="directorySection"><div className="directoryTitle"><h2>Latest intelligence</h2><span>{matches.length ? matches.length + " stor" + (matches.length > 1 ? "ies" : "y") : "Desk ready for publishing"}</span></div>
      {matches.length ? <div className="storyGrid">{matches.map(story => <StoryCard story={story} key={story.slug} />)}</div> : <div className="emptyState"><h2>No published MARS story yet.</h2><p>The newsroom discovery engine can already find leads for this commodity.</p></div>}</section>
    </main>
  );
}
