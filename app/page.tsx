import Link from "next/link";
import { getPublishedArticles, type PublishedArticle } from "@/lib/content";
import { NewsletterForm } from "@/components/NewsletterForm";

export const revalidate = 60;

function storyHref(story:PublishedArticle){ return "/article/"+story.slug; }

function Meta({story}:{story:PublishedArticle}){
  return <div className="satinMeta">{story.section} · {story.region} · {story.publishedAt}</div>;
}

function TextCard({story}:{story:PublishedArticle}){
  return <article className="satinTextCard">
    <Meta story={story}/>
    <Link href={storyHref(story)}><h3>{story.title}</h3></Link>
    {story.dek && <p>{story.dek}</p>}
  </article>;
}

function ImageCard({story,large=false}:{story:PublishedArticle;large?:boolean}){
  return <article className={large?"satinImageCard large":"satinImageCard"}>
    <Link href={storyHref(story)} className="satinImageWrap"><img src={story.image} alt=""/></Link>
    <Meta story={story}/>
    <Link href={storyHref(story)}><h3>{story.title}</h3></Link>
    {large && story.dek && <p>{story.dek}</p>}
  </article>;
}

function SectionBand({title,stories}:{title:string;stories:PublishedArticle[]}){
  if(stories.length<3) return null;
  return <section className="satinSection">
    <div className="satinSectionHead">
      <Link href={"/section/"+title.toLowerCase()}>{title}</Link>
      <span>Latest from the MARS desk</span>
    </div>
    <div className="satinSectionGrid">
      <div className="satinSectionLead"><ImageCard story={stories[0]} large/></div>
      <div className="satinSectionMiddle">
        {stories.slice(1,4).map(story=><TextCard story={story} key={story.slug}/>)}
      </div>
      <div className="satinSectionRail">
        {stories.slice(4,6).map(story=><ImageCard story={story} key={story.slug}/>)}
      </div>
    </div>
  </section>;
}

export default async function Home(){
  const fetched=await getPublishedArticles(180);
  const live=fetched.filter(story=>!story.isPrototype);
  const stories=live.length?live:fetched;
  const bySection=new Map<string,PublishedArticle[]>();

  for(const story of stories){
    const key=story.section || "World";
    if(!bySection.has(key)) bySection.set(key,[]);
    bySection.get(key)!.push(story);
  }

  const lead=stories.find(story=>story.image && !/celebrity|football|soccer|movie|murder/i.test(story.title)) || stories[0];
  const remaining=stories.filter(story=>story.slug!==lead.slug);

  const topLeft=remaining.slice(0,3);
  const topRight=remaining.slice(3,6);
  const latest=remaining.slice(6,10);

  const merge=(...names:string[])=>{
    const pool=names.flatMap(name=>bySection.get(name)||[]);
    return pool.filter(story=>story.slug!==lead.slug).slice(0,6);
  };

  const sections=[
    {title:"Africa",stories:merge("Africa")},
    {title:"Business",stories:merge("Business","Companies")},
    {title:"Markets",stories:merge("Markets","Finance")},
    {title:"Agriculture",stories:merge("Agriculture","Commodities")},
    {title:"Trade",stories:merge("Trade","Logistics")},
    {title:"Technology",stories:merge("Technology","Energy")},
    {title:"Climate",stories:merge("Climate","Policy")},
    {title:"World",stories:merge("World")},
  ];

  return <main className="satinHome">
    <section className="satinEditionLine">
      <span>THE MARS DAILY</span>
      <strong>Africa, markets and the world</strong>
      <small>Independent · Source-linked · Updated continuously</small>
    </section>

    <section className="satinFront">
      <div className="satinFrontLeft">
        {topLeft.map((story,index)=><article className="satinFrontText" key={story.slug}>
          <Meta story={story}/>
          <Link href={storyHref(story)}><h2>{story.title}</h2></Link>
          {index===0 && story.dek && <p>{story.dek}</p>}
        </article>)}
      </div>

      <article className="satinLead">
        <Meta story={lead}/>
        <Link href={storyHref(lead)}><h1>{lead.title}</h1></Link>
        {lead.dek && <p>{lead.dek}</p>}
        <Link href={storyHref(lead)} className="satinLeadImage"><img src={lead.image} alt=""/></Link>
        <div className="satinCaption">{lead.author}</div>
      </article>

      <div className="satinFrontRight">
        {topRight.map((story,index)=><article className="satinFrontSide" key={story.slug}>
          {index===0 && <Link href={storyHref(story)} className="satinSideImage"><img src={story.image} alt=""/></Link>}
          <Meta story={story}/>
          <Link href={storyHref(story)}><h2>{story.title}</h2></Link>
          {index===0 && story.dek && <p>{story.dek}</p>}
        </article>)}
      </div>
    </section>

    <section className="satinLatest">
      <div className="satinLabel">Latest</div>
      <div className="satinLatestGrid">
        {latest.map(story=><TextCard story={story} key={story.slug}/>)}
      </div>
    </section>

    <section className="satinBrief" id="brief">
      <div>
        <span>MARS BRIEFING</span>
        <h2>One sharp read before the noise begins.</h2>
        <p>Africa, business, markets, agriculture, technology, climate and trade — in one daily briefing.</p>
      </div>
      <NewsletterForm/>
    </section>

    {sections.map((section,index)=><div key={section.title}>
      <SectionBand title={section.title} stories={section.stories}/>
      {index===1 && <div className="satinAd"><span>ADVERTISEMENT</span><strong>Brand partnership space</strong></div>}
      {index===3 && <section className="satinGrainX">
        <div><span>MARS × GRAIN X</span><h2>From market intelligence to trade.</h2></div>
        <p>When the story becomes an opportunity, Grain X connects the commercial layer.</p>
        <a href="https://grainx.xyz" target="_blank" rel="noreferrer">Open Grain X ↗</a>
      </section>}
    </div>)}

    <section className="satinWire">
      <div className="satinSectionHead"><span>More from MARS</span><small>Latest published stories</small></div>
      <div className="satinWireGrid">
        {stories.slice(30,50).map(story=><TextCard story={story} key={story.slug}/>)}
      </div>
    </section>
  </main>;
}
