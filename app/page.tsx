import Link from "next/link";
import { getPublishedArticles, type PublishedArticle } from "@/lib/content";
import { NewsletterForm } from "@/components/NewsletterForm";

export const revalidate = 60;

const sectionOrder = [
  "Africa","Business","Markets","Agriculture","Commodities","Trade","Logistics",
  "Finance","Technology","Energy","Climate","Policy","World","Companies"
];

function storyUrl(story:PublishedArticle){ return "/article/"+story.slug; }

function StoryText({story,compact=false}:{story:PublishedArticle;compact?:boolean}){
  return <article className={compact?"denseStory compact":"denseStory"}>
    <div className="denseKicker">{story.section}{story.region ? " · "+story.region : ""}</div>
    <Link href={storyUrl(story)}><h3>{story.title}</h3></Link>
    {!compact && story.dek && <p>{story.dek}</p>}
    <div className="denseMeta">{story.author} · {story.publishedAt}</div>
  </article>;
}

function SectionModule({title,stories}:{title:string;stories:PublishedArticle[]}){
  if(!stories.length) return null;
  const lead=stories[0];
  const left=stories.slice(1,4);
  const right=stories.slice(4,7);
  return <section className="editorialSection">
    <div className="editorialSectionTitle">
      <Link href={"/section/"+title.toLowerCase().replace(/\s+/g,"-")}>{title}</Link>
    </div>
    <div className="editorialSectionGrid">
      <div className="editorialSideList">
        {left.map(story=><StoryText key={story.slug} story={story} compact />)}
      </div>
      <article className="editorialLead">
        <Link href={storyUrl(lead)} className="editorialLeadImage"><img src={lead.image} alt="" /></Link>
        <div className="denseKicker">{lead.section}{lead.region ? " · "+lead.region : ""}</div>
        <Link href={storyUrl(lead)}><h2>{lead.title}</h2></Link>
        {lead.dek && <p>{lead.dek}</p>}
        <div className="denseMeta">{lead.author} · {lead.publishedAt}</div>
      </article>
      <div className="editorialSideList right">
        {right.map(story=><StoryText key={story.slug} story={story} compact />)}
      </div>
    </div>
  </section>;
}

export default async function Home(){
  const articles=await getPublishedArticles(140);
  const live=articles.filter(a=>!a.isPrototype);
  const stories=live.length?live:articles;
  const lead=stories[0];
  const glance=stories.slice(1,6);
  const rail=stories.slice(6,10);

  const bySection = new Map<string,PublishedArticle[]>();
  for(const article of stories){
    const key=article.section || "World";
    if(!bySection.has(key)) bySection.set(key,[]);
    bySection.get(key)!.push(article);
  }

  const used=new Set<string>([lead?.slug,...glance.map(x=>x.slug),...rail.map(x=>x.slug)].filter(Boolean) as string[]);
  const sectionBuckets=sectionOrder.map(section=>{
    const exact=(bySection.get(section)||[]).filter(s=>!used.has(s.slug));
    const fallback=stories.filter(s=>!used.has(s.slug) && !exact.some(e=>e.slug===s.slug));
    const bucket=[...exact,...fallback].slice(0,7);
    bucket.forEach(s=>used.add(s.slug));
    return {section,stories:bucket};
  }).filter(item=>item.stories.length>=2);

  if(!lead) return <main className="denseHome"><div className="emptyState"><h1>MARS is loading the wire.</h1></div></main>;

  return <main className="denseHome">
    <section className="frontGrid">
      <aside className="glanceRail">
        <div className="frontLabel">The world at a glance</div>
        <ol>
          {glance.map((story,index)=><li key={story.slug}>
            <span>{index+1}</span>
            <Link href={storyUrl(story)}>{story.title}</Link>
          </li>)}
        </ol>
      </aside>

      <article className="frontLead">
        <div className="denseKicker">{lead.section}{lead.region ? " · "+lead.region : ""}</div>
        <Link href={storyUrl(lead)}><h1>{lead.title}</h1></Link>
        {lead.dek && <p>{lead.dek}</p>}
        <Link href={storyUrl(lead)} className="frontLeadImage"><img src={lead.image} alt="" /></Link>
        <div className="denseMeta">{lead.author} · {lead.publishedAt}</div>
      </article>

      <aside className="frontRightRail">
        {rail.slice(0,2).map(story=><article className="frontRailStory" key={story.slug}>
          <div className="denseKicker">{story.section}</div>
          <Link href={storyUrl(story)}><h2>{story.title}</h2></Link>
          {story.image && <Link href={storyUrl(story)}><img src={story.image} alt="" /></Link>}
          <p>{story.dek}</p>
        </article>)}
      </aside>
    </section>

    <section className="latestBand">
      <div className="frontLabel">Latest</div>
      <div className="latestBandGrid">
        {stories.slice(10,14).map(story=><StoryText key={story.slug} story={story} compact />)}
      </div>
    </section>

    <section className="briefInline">
      <div>
        <div className="frontLabel">MARS Briefings</div>
        <h2>Intelligence for Africa&apos;s food economy — and the world around it.</h2>
        <p>A sharp daily read across markets, agriculture, companies, technology, climate, trade, policy and finance.</p>
      </div>
      <NewsletterForm />
    </section>

    {sectionBuckets.map(({section,stories},index)=><div key={section}>
      <SectionModule title={section} stories={stories} />
      {index===2 && <section className="grainxInline">
        <div className="frontLabel">From intelligence to action</div>
        <h2>When the story becomes a trade, Grain X is the next layer.</h2>
        <a href="https://grainx.xyz" target="_blank" rel="noreferrer">Open Grain X ↗</a>
      </section>}
    </div>)}
  </main>;
}
