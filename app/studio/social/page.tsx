import Link from "next/link";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content";

export const revalidate = 60;

export default async function SocialStudio({ searchParams }: { searchParams?: { slug?: string } }) {
  const all = await getPublishedArticles(60);
  const article = searchParams?.slug ? (await getArticleBySlug(searchParams.slug)) || all[0] : all[0];
  const caption = article.title + "\n\n" + article.dek + "\n\nRead the full analysis on MARS.\n\n#Africa #Agriculture #Commodities #" + article.section.replace(/\s+/g, "");

  return (
    <main className="studioPage">
      <header className="studioHeader">
        <div><span className="miniLabel">MARS NEWSROOM / SOCIAL</span><h1>Carousel factory.</h1></div>
        <span className="demoBadge">1080 × 1350</span>
      </header>
      <div className="socialChooser">
        {all.slice(0,20).map(item => <Link className={item.slug === article.slug ? "active" : ""} href={"/studio/social?slug=" + item.slug} key={item.slug}>{item.section}: {item.title}</Link>)}
      </div>
      <div className="carouselGrid">
        {[1,2,3,4,5,6].map(slide => (
          <a className="carouselPreview" key={slide} href={"/api/social/card?slug=" + article.slug + "&slide=" + slide} target="_blank" rel="noreferrer">
            <img src={"/api/social/card?slug=" + article.slug + "&slide=" + slide} alt={"Carousel slide " + slide} />
            <span>Slide {slide} · open PNG ↗</span>
          </a>
        ))}
      </div>
      <section className="captionBox"><span className="miniLabel">CAPTION DRAFT</span><pre>{caption}</pre></section>
    </main>
  );
}
