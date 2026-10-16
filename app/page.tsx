import Link from "next/link";
import { getPublishedArticles, type PublishedArticle } from "@/lib/content";
import { NewsletterForm } from "@/components/NewsletterForm";

export const revalidate=60;

function href(story:PublishedArticle){ return "/article/"+story.slug; }

function frontPageEligible(story:PublishedArticle){
  const text=story.title.toLowerCase();
  return !/(sports news|football|soccer|premier league|champions league|manchester united|arsenal|chelsea|liverpool|celebrity|actor|actress|movie|film review|reality show|wedding)/i.test(text);
}

function score(story:PublishedArticle,index:number){
  let s=Math.max(0,40-index*.2);
  const weights:Record<string,number>={Africa:38,Business:34,Markets:33,Finance:31,Agriculture:30,Trade:28,Technology:26,Energy:24,Climate:24,Logistics:22,Policy:20,Commodities:18,Companies:18,World:12};
  s+=weights[story.section]||8;
  const text=[story.title,story.region,story.country].join(" ").toLowerCase();
  if(/africa|tanzania|kenya|uganda|rwanda|ethiopia|nigeria|south africa|zambia|ghana/.test(text)) s+=22;
  if(/market|econom|bank|currency|inflation|trade|export|import|company|investment|agricultur|food|energy|technology|climate|port|shipping|logistics/.test(text)) s+=10;
  if(story.image && !story.image.includes("/api/social/card")) s+=8;
  if(/logo|icon|avatar|sprite|placeholder|structure\/.*logo/i.test(story.image||"")) s-=45;
  if(story.dek && story.dek.length>80) s+=4;
  if(/celebrity|actor|actress|movie|film|wedding|funeral|football|soccer|murder|execution|immoral acts|mosque/.test(story.title.toLowerCase())) s-=100;
  return s;
}

function Meta({story}:{story:PublishedArticle}){
  return <div className="mars3Meta"><span>{story.section}</span><span>{story.region}</span><span>{story.publishedAt}</span></div>;
}

function RailStory({story,withImage=false}:{story:PublishedArticle;withImage?:boolean}){
  return <article className="mars3RailStory">
    {withImage && <Link href={href(story)} className="mars3RailImage"><img src={story.image} alt=""/></Link>}
    <Meta story={story}/>
    <Link href={href(story)}><h3>{story.title}</h3></Link>
    {withImage && story.dek && <p>{story.dek}</p>}
  </article>;
}

function Desk({title,stories}:{title:string;stories:PublishedArticle[]}){
  if(stories.length<3) return null;
  const lead=stories[0];
  return <section className="mars3Desk">
    <div className="mars3DeskHead">
      <Link href={"/section/"+title.toLowerCase()}>{title}</Link>
      <span>Latest from the desk</span>
    </div>

    <div className="mars3DeskTop">
      <article className="mars3DeskLead">
        <Link href={href(lead)} className="mars3DeskLeadImage"><img src={lead.image} alt=""/></Link>
        <Meta story={lead}/>
        <Link href={href(lead)}><h2>{lead.title}</h2></Link>
        {lead.dek && <p>{lead.dek}</p>}
      </article>

      <div className="mars3DeskRail">
        {stories.slice(1,4).map((story,index)=><RailStory key={story.slug} story={story} withImage={index===0}/>)}
      </div>
    </div>

    <div className="mars3DeskBottom">
      {stories.slice(4,8).map(story=><article key={story.slug} className="mars3DeskCard">
        <Link href={href(story)} className="mars3DeskCardImage"><img src={story.image} alt=""/></Link>
        <Meta story={story}/>
        <Link href={href(story)}><h3>{story.title}</h3></Link>
      </article>)}
    </div>
  </section>;
}

export default async function Home(){
  const fetched=await getPublishedArticles(220);
  const live=fetched.filter(story=>!story.isPrototype);
  const chronological=live.length?live:fetched;
  const ranked=chronological
    .filter(frontPageEligible)
    .map((story,index)=>({story,score:score(story,index)}))
    .sort((a,b)=>b.score-a.score)
    .map(item=>item.story);

  const lead=ranked[0];
  if(!lead) return <main className="mars3Home"><div className="emptyState"><h1>MARS is loading.</h1></div></main>;

  const used=new Set<string>([lead.slug]);
  const pick=(source:PublishedArticle[],count:number)=>{
    const out=source.filter(story=>!used.has(story.slug)).slice(0,count);
    out.forEach(story=>used.add(story.slug));
    return out;
  };

  const frontRail=pick(ranked,4);
  const latest=chronological.filter(story=>story.slug!==lead.slug && !frontRail.some(x=>x.slug===story.slug)).slice(0,4);

  const bySection=new Map<string,PublishedArticle[]>();
  chronological.forEach(story=>{
    const key=story.section||"World";
    if(!bySection.has(key)) bySection.set(key,[]);
    bySection.get(key)!.push(story);
  });

  const collect=(...sections:string[])=>{
    const rows=sections.flatMap(section=>bySection.get(section)||[]);
    return rows.filter(story=>story.slug!==lead.slug && !frontRail.some(x=>x.slug===story.slug)).slice(0,8);
  };

  const desks=[
    ["Africa",collect("Africa")],
    ["Business",collect("Business","Companies")],
    ["Markets",collect("Markets","Finance")],
    ["Agriculture",collect("Agriculture","Commodities")],
    ["Trade",collect("Trade","Logistics")],
    ["Technology",collect("Technology","Energy")],
    ["Climate",collect("Climate","Policy")],
    ["World",collect("World")],
  ] as const;

  return <main className="mars3Home">
    <section className="mars3Edition">
      <span>THE DAILY EDITION</span>
      <strong>Africa first. Global where it matters.</strong>
      <small>Updated continuously</small>
    </section>

    <section className="mars3Front">
      <article className="mars3Lead">
        <Link href={href(lead)} className="mars3LeadImage"><img src={lead.image} alt=""/></Link>
        <Meta story={lead}/>
        <Link href={href(lead)}><h1>{lead.title}</h1></Link>
        {lead.dek && <p>{lead.dek}</p>}
        {lead.author && lead.author!=="MARS Radar" && <div className="mars3Byline">{lead.author}</div>}
      </article>

      <aside className="mars3FrontRail">
        {frontRail.map((story,index)=><RailStory key={story.slug} story={story} withImage={index<2}/>)}
      </aside>
    </section>

    <section className="mars3Latest">
      <div className="mars3LatestLabel">Latest</div>
      <div className="mars3LatestGrid">
        {latest.map(story=><article key={story.slug}>
          <Meta story={story}/>
          <Link href={href(story)}><h3>{story.title}</h3></Link>
        </article>)}
      </div>
    </section>

    <section className="mars3Briefing" id="brief">
      <div>
        <span>MARS BRIEFING</span>
        <h2>What matters before the day gets noisy.</h2>
        <p>A concise daily briefing across Africa, markets, business, technology, climate, trade and food systems.</p>
      </div>
      <NewsletterForm/>
    </section>

    {desks.map(([title,stories],index)=><div key={title}>
      <Desk title={title} stories={stories}/>
      {index===1 && <div className="mars3Ad"><span>ADVERTISEMENT</span><strong>Partner with MARS</strong><small>Premium placements for brands relevant to our readers.</small></div>}
      {index===3 && <section className="mars3GrainX">
        <div>
          <span>MARS × GRAIN X</span>
          <h2>Intelligence meets trade.</h2>
        </div>
        <p>When a market signal becomes a commercial opportunity, Grain X is the action layer.</p>
        <a href="https://grainx.xyz" target="_blank" rel="noreferrer">Open Grain X ↗</a>
      </section>}
    </div>)}

    <section className="mars3More">
      <div className="mars3DeskHead"><span>More from MARS</span><small>Latest published stories</small></div>
      <div className="mars3MoreGrid">
        {chronological.slice(32,48).map(story=><article key={story.slug}>
          <Meta story={story}/>
          <Link href={href(story)}><h3>{story.title}</h3></Link>
        </article>)}
      </div>
    </section>
  </main>;
}
