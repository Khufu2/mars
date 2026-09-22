import { articles } from "@/lib/data";
import { StoryCard } from "@/components/StoryCard";

export default function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = (searchParams?.q || "").trim().toLowerCase();
  const results = query ? articles.filter(article =>
    [article.title, article.dek, article.section, article.region, article.country, article.commodity || ""].join(" ").toLowerCase().includes(query)
  ) : articles;

  return (
    <main className="searchPage">
      <header><span className="miniLabel">MARS SEARCH</span><h1>Find the signal.</h1></header>
      <form className="searchForm" action="/search">
        <input name="q" defaultValue={searchParams?.q || ""} placeholder="Search commodity, country, port, policy…" />
        <button>Search</button>
      </form>
      <p className="resultCount">{query ? results.length + " result(s) for “" + searchParams?.q + "”" : "Showing prototype stories"}</p>
      <div className="storyGrid">{results.map(story => <StoryCard story={story} key={story.slug} />)}</div>
    </main>
  );
}
