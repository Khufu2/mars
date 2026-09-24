"use client";

import { FormEvent, useState } from "react";

type Item = { id: number; title: string; link: string; pubDate: string; source: string };

export default function DiscoverPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [query, setQuery] = useState("Tanzania agriculture exports");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("Search public news discovery feeds. Treat every result as a lead until primary-source verification.");

  async function search(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    const res = await fetch("/api/discover?q=" + encodeURIComponent(query), { cache: "no-store" });
    const data = await res.json();
    setItems(data.items || []);
    setNotice(data.notice || data.error || "Discovery complete.");
    setLoading(false);
  }

  return (
    <main className="studioPage">
      <header className="studioHeader">
        <div><span className="miniLabel">MARS NEWSROOM / DISCOVERY</span><h1>Find the signal.</h1></div>
        <span className="demoBadge">LIVE WEB DISCOVERY</span>
      </header>
      <form className="discoverySearch" onSubmit={search}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. sesame Tanzania exports" />
        <button disabled={loading}>{loading ? "Searching…" : "Search news"}</button>
      </form>
      <p className="editorNotice">{notice}</p>
      <div className="discoveryGrid">
        {items.length === 0 ? <div className="emptyState"><h2>Start with a market question.</h2><p>Try maize imports Kenya, Tanzania cashew auctions, East Africa fertilizer, Dar port agriculture or Africa drought crops.</p></div> :
          items.map(item => (
            <article className="discoveryCard" key={item.id}>
              <div className="discoveryMeta"><span>{item.source}</span><span>{item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "Undated"}</span></div>
              <h2>{item.title}</h2>
              <a href={item.link} target="_blank" rel="noreferrer">Open source lead ↗</a>
            </article>
          ))}
      </div>
    </main>
  );
}
