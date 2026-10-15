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

  const articles=await getPublishedArticles(180);
  const stories=articles.filter(article=>article.section.toLowerCase()===params.slug && !article.isPrototype);
  const list=stories.length?stories:articles.filter(article=>article.section.toLowerCase()===params.slug);
  const lead=list[0];
  const side=list.slice(1,4);
  const rest=list.slice(4,32);

  return <main className="mars3SectionPage">
    <header className="mars3SectionHeader">
      <span>MARS DESK</span>
      <h1>{title}</h1>
      <p>Latest reporting, analysis and source-linked news from the {title.toLowerCase()} desk.</p>
    </header>

    {lead ? <>
      <section className="mars3SectionTop">
        <article className="mars3SectionLead">
          <Link href={"/article/"+lead.slug}><img src={lead.image} alt=""/></Link>
          <div className="mars3Meta"><span>{lead.region}</span><span>{lead.publishedAt}</span></div>
          <Link href={"/article/"+lead.slug}><h2>{lead.title}</h2></Link>
          {lead.dek && <p>{lead.dek}</p>}
        </article>

        <aside className="mars3SectionSide">
          {side.map((story,index)=><article key={story.slug}>
            {index===0 && <Link href={"/article/"+story.slug}><img src={story.image} alt=""/></Link>}
            <div className="mars3Meta"><span>{story.region}</span><span>{story.publishedAt}</span></div>
            <Link href={"/article/"+story.slug}><h3>{story.title}</h3></Link>
            {story.dek && <p>{story.dek}</p>}
          </article>)}
        </aside>
      </section>

      <section className="mars3SectionGrid">
        {rest.map(story=><article key={story.slug}>
          <Link href={"/article/"+story.slug} className="mars3SectionImage"><img src={story.image} alt=""/></Link>
          <div className="mars3Meta"><span>{story.region}</span><span>{story.publishedAt}</span></div>
          <Link href={"/article/"+story.slug}><h3>{story.title}</h3></Link>
          {story.dek && <p>{story.dek}</p>}
        </article>)}
      </section>
    </>:<div className="emptyState"><h2>No stories yet.</h2></div>}
  </main>;
}
