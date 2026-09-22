import { articles } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export function generateStaticParams() {
  return articles.map(article => ({ slug: article.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles.find(item => item.slug === params.slug);
  return article ? { title: article.title, description: article.dek } : { title: "Story" };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = articles.find(item => item.slug === params.slug);
  if (!article) notFound();

  return (
    <main className="articlePage">
      <div className="articleTopline"><Link href={"/section/" + article.section.toLowerCase()}>{article.section}</Link><span>{article.region}</span></div>
      <header className={"articleHero accent-" + article.accent}>
        <h1>{article.title}</h1>
        <p>{article.dek}</p>
        <div className="articleByline"><strong>{article.author}</strong><span>{article.publishedAt} · {article.readTime}</span><span className="demoBadge">PROTOTYPE STORY</span></div>
      </header>
      <figure className="articleFigure">
        <img src={article.image} alt="" />
        <figcaption>{article.imageCredit}</figcaption>
      </figure>
      <div className="articleBodyGrid">
        <div className="shareRail"><span>SHARE</span><a href={"mailto:?subject=" + encodeURIComponent(article.title)}>Email</a><a href={"https://wa.me/?text=" + encodeURIComponent(article.title)} target="_blank" rel="noreferrer">WhatsApp</a></div>
        <article className="articleBody">
          {article.sections.map(section => (
            <section className="articleBlock" key={section.eyebrow + section.title}>
              <div className="blockEyebrow">{section.eyebrow}</div>
              <h2>{section.title}</h2>
              {section.body.map(p => <p key={p}>{p}</p>)}
            </section>
          ))}
          <div className="sourceBox">
            <strong>Evidence standard</strong>
            <p>Production stories will expose primary sources, supporting reporting, data timestamps and corrections. Demo stories in this prototype are intentionally labelled.</p>
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
