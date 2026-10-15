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
    alternates: article.canonicalUrl ? { canonical: article.canonicalUrl } : undefined,
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

  const isRadar = article.storyType === "Radar";
  const bodySections = isRadar ? article.sections.slice(0,1) : article.sections;

  return (
    <main className="readerPage">
      <header className="readerHeader">
        <div className="readerTopline">
          <Link href={"/section/" + article.section.toLowerCase()}>{article.section}</Link>
          <span>{article.region}</span>
          <span>{article.publishedAt}</span>
        </div>

        <h1>{article.title}</h1>
        {article.dek && <p className="readerDek">{article.dek}</p>}

        <div className="readerByline">
          <strong>{article.author}</strong>
          <span>{article.readTime}</span>
          {article.isPrototype && <span className="demoBadge">DESIGN STORY</span>}
        </div>
      </header>

      <figure className="readerHero">
        <img src={article.image} alt="" />
        <figcaption>
          <span>{article.imageCredit}</span>
          {article.canonicalUrl && <a href={article.canonicalUrl} target="_blank" rel="noreferrer">Open publisher ↗</a>}
        </figcaption>
      </figure>

      <div className="readerLayout">
        <aside className="readerShare" aria-label="Share story">
          <span>SHARE</span>
          <a href={"mailto:?subject=" + encodeURIComponent(article.title)}>Email</a>
          <a href={"https://wa.me/?text=" + encodeURIComponent(article.title)} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href={"https://x.com/intent/post?text=" + encodeURIComponent(article.title + " " + (process.env.NEXT_PUBLIC_SITE_URL || "https://mars-rust.vercel.app") + "/article/" + article.slug)} target="_blank" rel="noreferrer">X</a>
        </aside>

        <article className="readerBody">
          {bodySections.map((section, sectionIndex) => (
            <section className="readerSection" key={section.eyebrow + section.title + sectionIndex}>
              {!isRadar && section.eyebrow && <div className="readerEyebrow">{section.eyebrow}</div>}
              {!isRadar && section.title && <h2>{section.title}</h2>}
              {section.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
          ))}

          {!isRadar && article.corrections?.length ? (
            <section className="readerCorrections">
              <strong>Corrections & updates</strong>
              {article.corrections.map((correction,index)=><div key={index}><span>{correction.publishedAt || "Update"}</span><p>{correction.note}</p></div>)}
            </section>
          ) : null}

          {!isRadar && article.sources?.length ? (
            <section className="readerSources">
              <span>Sources</span>
              {article.sources.map((source,index)=><a key={source.url+index} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}
            </section>
          ) : null}
        </article>

        <aside className="readerSide">
          <div>
            <span className="miniLabel">MARS</span>
            <strong>Africa, markets and the forces reshaping the world.</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
