import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles as prototypeArticles } from "@/lib/data";
import { getArticleBySlug } from "@/lib/content";

export const revalidate = 60;

export function generateStaticParams() {
  return prototypeArticles.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: "Story" };
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.dek,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.dek,
      type: "article",
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  return (
    <main className="articlePage">
      <div className="articleTopline">
        <Link href={"/section/" + article.section.toLowerCase()}>{article.section}</Link>
        <span>{article.region}</span>
        {article.storyType && <span>{article.storyType}</span>}
      </div>
      {article.sponsorName && <div className="sponsorDisclosure">{article.sponsorDisclosure || "Sponsored"} · {article.sponsorName}</div>}
      <header className={"articleHero accent-" + article.accent}>
        <h1>{article.title}</h1>
        <p>{article.dek}</p>
        <div className="articleByline">
          <strong>{article.author}</strong>
          <span>{article.publishedAt} · {article.readTime}</span>
          {article.isPrototype && <span className="demoBadge">PROTOTYPE STORY</span>}
        </div>
      </header>
      <figure className="articleFigure">
        <img src={article.image} alt="" />
        <figcaption>{article.imageCredit}</figcaption>
      </figure>
      <div className="articleBodyGrid">
        <div className="shareRail">
          <span>SHARE</span>
          <a href={"mailto:?subject=" + encodeURIComponent(article.title)}>Email</a>
          <a href={"https://wa.me/?text=" + encodeURIComponent(article.title)} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        <article className="articleBody">
          {article.sections.map(section => (
            <section className="articleBlock" key={section.eyebrow + section.title}>
              <div className="blockEyebrow">{section.eyebrow}</div>
              <h2>{section.title}</h2>
              {section.body.map(p => <p key={p}>{p}</p>)}
            </section>
          ))}
          <div className="sourceBox">
            <strong>{article.sources?.length ? "Sources & evidence" : "Evidence standard"}</strong>
            {article.sources?.length ? (
              <div className="articleSources">
                {article.sources.map((source,index)=><a key={source.url+index} href={source.url} target="_blank" rel="noreferrer">
                  <span>{source.verified ? "Verified" : "Source"}</span>
                  <strong>{source.name}</strong>
                  {source.note && <small>{source.note}</small>}
                </a>)}
              </div>
            ) : <p>{article.isPrototype ? "This is prototype content. Production stories expose source links and verification notes here." : "MARS exposes material sources and corrections when available."}</p>}
          </div>
        </article>
        <aside className="articleAside">
          <div className="asideCard">
            <span className="miniLabel">GRAIN X</span>
            <h3>See a commercial opportunity?</h3>
            <p>Move from intelligence to buyers, suppliers and trade workflows.</p>
            <a href="https://grainx.xyz" target="_blank" rel="noreferrer">Open Grain X ↗</a>
          </div>
        </aside>
      </div>
    </main>
  );
}
