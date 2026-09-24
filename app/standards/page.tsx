export default function StandardsPage(){
  return <main className="institutionPage">
    <header className="institutionHero"><span className="miniLabel">EDITORIAL STANDARDS</span><h1>Fast is useful. Correct is non-negotiable.</h1><p>MARS uses automation for discovery and production assistance, but publication is gated by evidence, attribution and editorial checks.</p></header>
    <section className="standardsList">
      <article><span>Discovery</span><h2>A lead is not a fact.</h2><p>Aggregators, social posts and secondary reporting can surface a story. They do not replace the underlying source.</p></article>
      <article><span>Verification</span><h2>Open the document.</h2><p>Official releases, datasets, filings, regulations and first-party statements should be reviewed directly whenever available.</p></article>
      <article><span>Numbers</span><h2>Dates, units and denominators matter.</h2><p>Price changes, trade values, percentages and forecasts must retain their time period, unit and relevant comparison base.</p></article>
      <article><span>Attribution</span><h2>Tell readers who says what.</h2><p>Contested claims, forecasts and opinions are attributed rather than presented as settled fact.</p></article>
      <article><span>Corrections</span><h2>Correct visibly.</h2><p>Material changes should be logged and disclosed on the affected story rather than silently rewritten.</p></article>
      <article><span>Commercial</span><h2>Advertising stays identifiable.</h2><p>Sponsored work carries a clear disclosure. Advertisers do not receive authority over independent editorial conclusions.</p></article>
    </section>
  </main>
}
