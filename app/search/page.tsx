import { searchPublishedArticles } from "@/lib/content";
import { StoryCard } from "@/components/StoryCard";

export const revalidate = 60;

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const query = (searchParams?.q || "").trim();
  const results = await searchPublishedArticles(query);

  return (
    <main className="searchPage">
      <header><span className="miniLabel">MARS SEARCH</span><h1>Find the signal.</h1></header>
      <form className="searchForm" action="/search">
        <input name="q" defaultValue={searchParams?.q || ""} placeholder="Search commodity, country, port, policy…" />
        <button>Search</button>
      </form>
      <p className="resultCount">{query ? results.length + " result(s) for “" + query + "”" : "Showing recent MARS intelligence"}</p>
      <div className="storyGrid">{results.map(story => <StoryCard story={story} key={story.slug} />)}</div>
    </main>
  );
}
