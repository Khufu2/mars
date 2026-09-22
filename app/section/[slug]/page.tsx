import { articles, sections } from "@/lib/data";
import { StoryCard } from "@/components/StoryCard";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return sections.map(section => ({ slug: section.toLowerCase() }));
}

export default function SectionPage({ params }: { params: { slug: string } }) {
  const title = sections.find(section => section.toLowerCase() === params.slug);
  if (!title) notFound();
  const matches = articles.filter(article => article.section.toLowerCase() === params.slug);
  return (
    <main className="sectionPage">
      <header className="sectionHero">
        <span>MARS / {title.toUpperCase()}</span>
        <h1>{title}</h1>
        <p>Reporting and intelligence across Africa's food economy.</p>
      </header>
      {matches.length ? <div className="storyGrid">{matches.map(story => <StoryCard story={story} key={story.slug} />)}</div> :
        <div className="emptyState"><h2>This desk is ready for live feeds.</h2><p>The schema and navigation are in place; source ingestion comes next.</p></div>}
    </main>
  );
}
