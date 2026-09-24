import { sections } from "@/lib/data";
import { getPublishedArticles } from "@/lib/content";
import { StoryCard } from "@/components/StoryCard";
import { notFound } from "next/navigation";

export const revalidate = 60;

export function generateStaticParams() {
  return sections.map(section => ({ slug: section.toLowerCase() }));
}

export default async function SectionPage({ params }: { params: { slug: string } }) {
  const title = sections.find(section => section.toLowerCase() === params.slug);
  if (!title) notFound();
  const articles = await getPublishedArticles(80);
  const matches = articles.filter(article => article.section.toLowerCase() === params.slug);
  return (
    <main className="sectionPage">
      <header className="sectionHero">
        <span>MARS / {title.toUpperCase()}</span>
        <h1>{title}</h1>
        <p>Reporting and intelligence across Africa&apos;s food economy.</p>
      </header>
      {matches.length ? <div className="storyGrid">{matches.map(story => <StoryCard story={story} key={story.slug} />)}</div> :
        <div className="emptyState"><h2>This desk is ready.</h2><p>Publish the first story from the MARS newsroom and it will appear here automatically.</p></div>}
    </main>
  );
}
