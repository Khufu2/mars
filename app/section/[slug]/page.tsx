import Link from "next/link";
import { sections } from "@/lib/data";
import { getPublishedArticles } from "@/lib/content";
import { notFound } from "next/navigation";

export const revalidate=60;

export function generateStaticParams(){
  return sections.map(section=>({slug:section.toLowerCase()}));
}

export default async function SectionPage({params}:{params:{slug:string}}){
  const title=sections.find(section=>section.toLowerCase()===params.slug);
  if(!title) notFound();

  const articles=await getPublishedArticles(140);
  const matches=articles.filter(article=>article.section.toLowerCase()===params.slug && !article.isPrototype);
  const stories=matches.length?matches:articles.filter(article=>article.section.toLowerCase()===params.slug);
  const lead=stories[0];
  const side=stories.slice(1,4);
  const rest=stories.slice(4,28);

  return <main className="gazetteSectionPage">
    <header className="gazetteSectionHeader">
      <span>MARS DESK</span>
      <h1>{title}</h1>
      <p>Reporting, signals and source-linked intelligence from the {title.toLowerCase()} desk.</p>
    </header>

    {lead ? <>
      <section className="gazetteSectionFront">
        <article className="gazetteSectionLead">
          <Link href={"/article/"+lead.slug}><img src={lead.image} alt=""/></Link>
          <div className="gazetteMeta">{lead.region} · {lead.publishedAt}</div>
          <Link href={"/article/"+lead.slug}><h2>{lead.title}</h2></Link>
          <p>{lead.dek}</p>
        </article>
        <aside className="gazetteSectionRail">
          {side.map(story=><article key={story.slug}>
            <div className="gazetteMeta">{story.region} · {story.publishedAt}</div>
            <Link href={"/article/"+story.slug}><h3>{story.title}</h3></Link>
            <p>{story.dek}</p>
          </article>)}
        </aside>
      </section>

      <section className="gazetteSectionFeed">
        {rest.map((story,index)=><article className="gazetteSectionCard" key={story.slug}>
          {index<8 && <Link href={"/article/"+story.slug}><img src={story.image} alt=""/></Link>}
          <div className="gazetteMeta">{story.region} · {story.publishedAt}</div>
          <Link href={"/article/"+story.slug}><h3>{story.title}</h3></Link>
          <p>{story.dek}</p>
        </article>)}
      </section>
    </> : <div className="emptyState"><h2>This desk is ready.</h2><p>The next MARS wire cycle will populate it automatically.</p></div>}
  </main>
}
