import Link from "next/link";
import { marketRows } from "@/lib/data";
import { commodities } from "@/lib/taxonomy";

export default function MarketsPage() {
  return (
    <main className="directoryPage">
      <header className="directoryHero">
        <span className="miniLabel">MARS / MARKETS</span>
        <h1>Markets are stories with numbers.</h1>
        <p>Commodity prices will eventually sit beside freight, weather, policy and trade signals. Until live feeds are connected, every number below is explicitly prototype data.</p>
      </header>

      <section className="fullMarketBoard">
        <div className="marketBoardHead"><span>Instrument</span><span>Last</span><span>Move</span></div>
        {marketRows.map(row => <div className="marketBoardRow" key={row.name}><strong>{row.name}</strong><span>{row.value}</span><em className={row.direction === "up" ? "positive" : "negative"}>{row.move}</em></div>)}
      </section>

      <section className="directorySection">
        <div className="directoryTitle"><h2>Commodity watchlist</h2><span>Built for Africa-first coverage</span></div>
        <div className="directoryGrid">
          {commodities.map(item => <Link className="directoryCard" href={"/commodity/" + item.slug} key={item.slug}><span>{item.family}</span><h3>{item.name}</h3><p>{item.note}</p><strong>Open market →</strong></Link>)}
        </div>
      </section>
    </main>
  );
}
