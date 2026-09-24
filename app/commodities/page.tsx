import Link from "next/link";
import { commodities } from "@/lib/taxonomy";

export default function CommoditiesPage() {
  return (
    <main className="directoryPage">
      <header className="directoryHero"><span className="miniLabel">MARS / COMMODITIES</span><h1>The crops moving African trade.</h1><p>Follow prices, policy, weather, logistics and buyer demand by commodity.</p></header>
      <div className="directoryGrid">
        {commodities.map(item => <Link className="directoryCard" href={"/commodity/" + item.slug} key={item.slug}><span>{item.family}</span><h3>{item.name}</h3><p>{item.note}</p><strong>Follow {item.name} →</strong></Link>)}
      </div>
    </main>
  );
}
