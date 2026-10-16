import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles as prototypeArticles } from "@/lib/data";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content";

export const dynamic="force-dynamic";
export const revalidate=0;

export function generateStaticParams(){
  return prototypeArticles.map(article=>({slug:article.slug}));
}

export async function generateMetadata({params}:{params:{slug:string}}):Promise<Metadata>{
  const article=await getArticleBySlug(params.slug);
  if(!article) return {title:"Story"};
  return {
    title:article.metaTitle||article.title,
    description:article.metaDescription||article.dek,
    alternates:article.canonicalUrl?{canonical:article.canonicalUrl}:undefined,
    openGraph:{
      title:article.metaTitle||article.title,
      description:article.metaDescription||article.dek,
      type:"article",
      images:article.image?[{url:article.image}]:undefined,
    }
  };
}

export default async function ArticlePage({params}:{params:{slug:string}}){
  const article=await getArticleBySlug(params.slug);
  if(!article) notFound();

  const isRadar=article.storyType==="Radar";
  const sourceName=isRadar && article.sources?.[0]?.name ? article.sources[0].name : article.author;
  const bodyText=article.sections.flatMap(section=>section.body).join(" ").replace(/\s+/g," ").trim();
  const dekText=(article.dek||"").replace(/…$/,"").trim();
  const repeatsDek=Boolean(dekText && bodyText.toLowerCase().startsWith(dekText.toLowerCase().slice(0,Math.min(90,dekText.length))));
  const showDek=Boolean(article.dek && !repeatsDek);

  const all=await getPublishedArticles(36);
  const related=all
    .filter(story=>story.slug!==article.slug && story.section===article.section && !story.isPrototype)
    .slice(0,4);

  return <main className="mars3Article">
    <article>
      <header className="mars3ArticleHeader">
        <div className="mars3ArticleKicker">
          <Link href={"/section/"+article.section.toLowerCase()}>{article.section}</Link>
          <span>{article.region}</span>
          <span>{article.publishedAt}</span>
        </div>

        <h1>{article.title}</h1>
        {showDek && <p className="mars3ArticleDek">{article.dek}</p>}

        <div className="mars3ArticleByline">
          <strong>{sourceName}</strong>
          <span>{article.readTime}</span>
          {article.isPrototype && <span>DESIGN STORY</span>}
        </div>
      </header>

      <figure className="mars3ArticleHero">
        <img src={article.image} alt=""/>
        <figcaption>
          <span>{article.imageCredit}</span>
          {article.canonicalUrl && <a href={article.canonicalUrl} target="_blank" rel="noreferrer">Open publisher ↗</a>}
        </figcaption>
      </figure>

      <div className="mars3ArticleTools">
        <span>Share</span>
        <a href={"mailto:?subject="+encodeURIComponent(article.title)}>Email</a>
        <a href={"https://wa.me/?text="+encodeURIComponent(article.title)} target="_blank" rel="noreferrer">WhatsApp</a>
        <a href={"https://x.com/intent/post?text="+encodeURIComponent(article.title+" "+(process.env.NEXT_PUBLIC_SITE_URL||"https://mars-rust.vercel.app")+"/article/"+article.slug)} target="_blank" rel="noreferrer">X</a>
      </div>

      <div className="mars3ArticleLayout">
        <article className="mars3ArticleBody">
          {article.sections.map((section,index)=><section key={section.eyebrow+section.title+index}>
            {!isRadar && section.eyebrow && <div className="mars3ArticleEyebrow">{section.eyebrow}</div>}
            {!isRadar && section.title && <h2>{section.title}</h2>}
            {section.body.map((paragraph,pIndex)=><p key={pIndex}>{paragraph}</p>)}
          </section>)}

          {!isRadar && article.corrections?.length ? <section className="mars3Corrections">
            <strong>Corrections & updates</strong>
            {article.corrections.map((correction,index)=><div key={index}><span>{correction.publishedAt||"Update"}</span><p>{correction.note}</p></div>)}
          </section>:null}

          {!isRadar && article.sources?.length ? <section className="mars3Sources">
            <span>Sources</span>
            {article.sources.map((source,index)=><a key={source.url+index} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}
          </section>:null}
        </article>

        <aside className="mars3ArticleAside">
          <span>MARS</span>
          <strong>Independent African newsroom.</strong>
          <p>Business, markets, agriculture, technology, climate and the world.</p>
        </aside>
      </div>
    </article>

    {related.length>0 && <section className="mars3Related">
      <div className="mars3RelatedHead">More in {article.section}</div>
      <div className="mars3RelatedGrid">
        {related.map(story=><article key={story.slug}>
          <Link href={"/article/"+story.slug}><img src={story.image} alt=""/></Link>
          <Link href={"/article/"+story.slug}><h3>{story.title}</h3></Link>
          <span>{story.publishedAt}</span>
        </article>)}
      </div>
    </section>}
  </main>;
}
