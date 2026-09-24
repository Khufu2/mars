import Link from "next/link";

export default function AboutPage(){
  return <main className="institutionPage">
    <header className="institutionHero"><span className="miniLabel">ABOUT MARS</span><h1>Africa&apos;s food economy deserves sharper coverage.</h1><p>MARS is an agriculture, commodities, climate, trade and logistics publication built around the decisions that move food across the continent.</p></header>
    <section className="institutionGrid">
      <div><span>01</span><h2>Africa first</h2><p>Global developments matter when they change African prices, production, market access, logistics or investment.</p></div>
      <div><span>02</span><h2>Commercially useful</h2><p>Every important story should help a reader understand what changed, why it matters and what to watch next.</p></div>
      <div><span>03</span><h2>Source first</h2><p>Material claims should trace back to primary documents, official data or clearly attributed reporting.</p></div>
      <div><span>04</span><h2>Actionable</h2><p>Where genuine trading intent appears, Grain X can become the action layer without compromising editorial clarity.</p></div>
    </section>
    <div className="institutionCta"><Link href="/standards">Read our editorial standards →</Link><Link href="/sources">Explore source registry →</Link></div>
  </main>
}
