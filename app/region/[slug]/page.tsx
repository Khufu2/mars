import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@/lib/data";
import { regions, regionBySlug } from "@/lib/taxonomy";
import { StoryCard } from "@/components/StoryCard";

export function generateStaticParams() { return regions.map(item => ({ slug: item.slug })); }

export default function RegionPage({ params }: { params: { slug: string } }) {
  const region = regionBySlug(params.slug);
  if (!region) notFound();
  const needle = region.name.toLowerCase();
  const matches = articles.filter(article => [article.country, article.region, article.title, article.dek].join(" ").toLowerCase().includes(needle) || (params.slug === "africa" && article.region.toLowerCase().includes("africa")));

  return (
    <main className="directoryPage">
      <header className="directoryHero"><span className="miniLabel">{region.code} / REGION</span><h1>{region.name}</h1><p>{region.note}</p></header>
      <div className="regionActions"><Link href={"/studio/discover?q=" + encodeURIComponent(region.name + " agriculture")}>Discover newsroom leads →</Link><Link href="/markets">Open markets →</Link></div>
      {matches.length ? <div className="storyGrid">{matches.map(story => <StoryCard story={story} key={story.slug} />)}</div> : <div className="emptyState"><h2>The desk is ready.</h2><p>Live ingestion will populate this region once editorial sources are connected.</p></div>}
    </main>
  );
}
