import Link from "next/link";
import { getPublishedArticles, type PublishedArticle } from "@/lib/content";
import { NewsletterForm } from "@/components/NewsletterForm";

export const revalidate = 60;

const desks=["Africa","Business","Markets","Agriculture","Commodities","Trade","Logistics","Finance","Technology","Energy","Climate","Policy","World","Companies"];

function href(story:PublishedArticle){return "/article/"+story.slug}

function homeScore(story:PublishedArticle,index:number){
  let score=Math.max(0,24-index*.18);
  const sectionWeight:Record<string,number>={
    Africa:26,Business:23,Markets:22,Trade:21,Agriculture:21,Finance:19,
    Technology:17,Energy:17,Climate:17,Logistics:16,Policy:15,Commodities:15,World:11,Companies:10
  };
  score+=sectionWeight[story.section]||8;
  if(/east africa|tanzania|kenya|uganda|rwanda|ethiopia|nigeria|south africa|africa/i.test([story.title,story.region,story.country].join(" "))) score+=18;
  if(/econom|market|trade|export|import|bank|currency|inflation|agricultur|food|energy|technology|investment|company|climate|port|shipping|logistics/i.test(story.title)) score+=8;
  if(story.image && !story.image.includes("/api/social/card")) score+=5;
  if(story.dek && story.dek.length>70) score+=3;
  if(story.storyType!=="Radar") score+=10;
  if(/celebrity|movie|film|wedding|football|soccer|murder|reality show/i.test(story.title)) score-=80;
  return score;
}

function Meta({story}:{story:PublishedArticle}){
  return <div className="gazetteMeta">{story.section} · {story.region} · {story.publishedAt}</div>;
}

function TextStory({story,large=false}:{story:PublishedArticle;large?:boolean}){
  return <article className={large?"gazetteTextStory large":"gazetteTextStory"}>
    <Meta story={story}/>
    <Link href={href(story)}><h3>{story.title}</h3></Link>
    {large && story.dek && <p>{story.dek}</p>}
  </article>
}

function PictureStory({story,large=false}:{story:PublishedArticle;large?:boolean}){
  return <article className={large?"gazettePictureStory large":"gazettePictureStory"}>
    <Link href={href(story)} className="gazetteImage"><img src={story.image} alt=""/></Link>
    <Meta story={story}/>
    <Link href={href(story)}><h3>{story.title}</h3></Link>
    {large && story.dek && <p>{story.dek}</p>}
  </article>
}

function DeskSection({title,stories,variant="standard"}:{title:string;stories:PublishedArticle[];variant?:"standard"|"dark"|"cards"}){
  if(stories.length<2) return null;
  const lead=stories[0];
  const rest=stories.slice(1,7);
  if(variant==="cards"){
    return <section className="gazetteDesk">
      <div className="gazetteDeskHead"><Link href={"/section/"+title.toLowerCase()}>{title}</Link><span>Latest reporting and source-linked intelligence</span></div>
      <div className="gazetteCardGrid">{stories.slice(0,6).map((s,i)=><PictureStory story={s} large={i===0} key={s.slug}/>)}</div>
    </section>
  }
  if(variant==="dark"){
    return <section className="gazetteDesk gazetteDarkDesk">
      <div className="gazetteDeskHead"><Link href={"/section/"+title.toLowerCase()}>{title}</Link><span>Capital, companies and the numbers moving decisions</span></div>
      <div className="gazetteDarkGrid">
        <PictureStory story={lead} large/>
        <div className="gazetteDarkStack">{rest.slice(0,4).map(s=><TextStory story={s} key={s.slug}/>)}</div>
      </div>
    </section>
  }
  return <section className="gazetteDesk">
    <div className="gazetteDeskHead"><Link href={"/section/"+title.toLowerCase()}>{title}</Link><span>MARS desk</span></div>
    <div className="gazetteDeskGrid">
      <div className="gazetteDeskLead"><PictureStory story={lead} large/></div>
      <div className="gazetteDeskColumns">{rest.slice(0,4).map(s=><TextStory story={s} key={s.slug}/>)}</div>
      <div className="gazetteDeskLast">{rest.slice(4,6).map(s=><PictureStory story={s} key={s.slug}/>)}</div>
    </div>
  </section>
}

export default async function Home(){
  const fetched=await getPublishedArticles(180);
  const live=fetched.filter(a=>!a.isPrototype);
  const chronological=live.length?live:fetched;
  const ranked=chronological
    .map((story,index)=>({story,score:homeScore(story,index)}))
    .sort((a,b)=>b.score-a.score)
    .map(x=>x.story);

  const lead=ranked[0];
  if(!lead) return <main className="gazetteHome"><div className="emptyState"><h1>MARS is loading the edition.</h1></div></main>;

  const used=new Set<string>([lead.slug]);
  const pick=(source:PublishedArticle[],count:number)=>{
    const out=source.filter(s=>!used.has(s.slug)).slice(0,count);
    out.forEach(s=>used.add(s.slug));
    return out;
  };

  const latest=chronological.slice(0,7);
  const glance=pick(ranked,5);
  const rightRail=pick(ranked,3);
  const subLead=pick(ranked,4);

  const byDesk=new Map<string,PublishedArticle[]>();
  for(const story of chronological){
    const key=story.section||"World";
    if(!byDesk.has(key)) byDesk.set(key,[]);
    byDesk.get(key)!.push(story);
  }
  const deskStories=(name:string,count=7)=> (byDesk.get(name)||[]).filter(s=>!used.has(s.slug)).slice(0,count);

  const africa=deskStories("Africa");
  const business=[...(byDesk.get("Business")||[]),...(byDesk.get("Companies")||[])].filter(s=>!used.has(s.slug)).slice(0,7);
  const markets=[...(byDesk.get("Markets")||[]),...(byDesk.get("Finance")||[])].filter(s=>!used.has(s.slug)).slice(0,7);
  const agri=[...(byDesk.get("Agriculture")||[]),...(byDesk.get("Commodities")||[])].filter(s=>!used.has(s.slug)).slice(0,7);
  const trade=[...(byDesk.get("Trade")||[]),...(byDesk.get("Logistics")||[])].filter(s=>!used.has(s.slug)).slice(0,7);
  const tech=[...(byDesk.get("Technology")||[]),...(byDesk.get("Energy")||[])].filter(s=>!used.has(s.slug)).slice(0,7);
  const climate=[...(byDesk.get("Climate")||[]),...(byDesk.get("Policy")||[])].filter(s=>!used.has(s.slug)).slice(0,7);
  const world=deskStories("World");

  return <main className="gazetteHome">
    <section className="editionIntro">
      <div><strong>THE MARS EDITION</strong><span>Africa · Markets · Power · Progress</span></div>
      <div className="editionRule"/>
      <p>Independent source-linked intelligence with an African center of gravity and a global field of view.</p>
    </section>

    <section className="marsWire">
      <span className="marsWireLabel">MARS WIRE</span>
      <div className="marsWireItems">
        {latest.slice(0,4).map(story=><Link href={href(story)} key={story.slug}><b>{story.section}</b>{story.title}</Link>)}
      </div>
    </section>

    <section className="gazetteFront">
      <aside className="gazetteGlance">
        <div className="gazetteRailTitle">At a glance</div>
        {glance.map((story,index)=><article key={story.slug}>
          <span>{String(index+1).padStart(2,"0")}</span>
          <Link href={href(story)}>{story.title}</Link>
        </article>)}
      </aside>

      <article className="gazetteLead">
        <Meta story={lead}/>
        <Link href={href(lead)}><h1>{lead.title}</h1></Link>
        {lead.dek && <p className="gazetteStandfirst">{lead.dek}</p>}
        <Link href={href(lead)} className="gazetteLeadImage"><img src={lead.image} alt=""/></Link>
        <div className="gazetteLeadCredit">MARS · {lead.author}</div>
      </article>

      <aside className="gazetteFrontRail">
        {rightRail.map((story,index)=><div key={story.slug} className={index===0?"frontRailPrimary":""}>
          {index===0 && <Link href={href(story)}><img src={story.image} alt=""/></Link>}
          <Meta story={story}/>
          <Link href={href(story)}><h2>{story.title}</h2></Link>
          {index===0 && story.dek && <p>{story.dek}</p>}
        </div>)}
      </aside>
    </section>

    <section className="gazetteSubLead">
      {subLead.map((story,index)=><div key={story.slug} className="gazetteSubLeadItem">
        {index<2 && <Link href={href(story)}><img src={story.image} alt=""/></Link>}
        <Meta story={story}/>
        <Link href={href(story)}><h3>{story.title}</h3></Link>
      </div>)}
    </section>

    <section className="gazetteBriefing" id="brief">
      <div className="gazetteBriefingMark">M</div>
      <div>
        <span>MARS BRIEFINGS</span>
        <h2>The essential African business briefing, before the day gets noisy.</h2>
        <p>Markets, food, companies, climate, technology, trade and the decisions connecting them.</p>
      </div>
      <NewsletterForm/>
    </section>

    <DeskSection title="Africa" stories={africa} variant="standard"/>
    <div className="gazetteAdSlot"><span>ADVERTISEMENT</span><strong>Premium brand placement</strong><p>Reserved for partners relevant to MARS readers.</p></div>
    <DeskSection title="Business" stories={business} variant="cards"/>
    <DeskSection title="Markets & Finance" stories={markets} variant="dark"/>
    <DeskSection title="Agriculture & Commodities" stories={agri} variant="standard"/>
    <section className="grainxGazette">
      <div><span>MARS × GRAIN X</span><h2>Read the signal. Act on the opportunity.</h2></div>
      <p>MARS is the publication. Grain X is the commercial action layer for buyers, suppliers and trade workflows.</p>
      <a href="https://grainx.xyz" target="_blank" rel="noreferrer">Open Grain X ↗</a>
    </section>
    <DeskSection title="Trade & Logistics" stories={trade} variant="cards"/>
    <DeskSection title="Technology & Energy" stories={tech} variant="standard"/>
    <DeskSection title="Climate & Policy" stories={climate} variant="dark"/>
    <DeskSection title="World" stories={world} variant="cards"/>

    <section className="gazetteArchive">
      <div className="gazetteDeskHead"><span>Latest from the wire</span><small>Every published item remains searchable and organized by desk.</small></div>
      <div className="gazetteArchiveGrid">
        {chronological.slice(25,45).map(story=><TextStory story={story} key={story.slug}/>)}
      </div>
    </section>
  </main>
}
