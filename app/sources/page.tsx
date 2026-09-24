import { sourceRegistry } from "@/lib/sourceRegistry";

export default function SourcesPage() {
  return (
    <main className="directoryPage">
      <header className="directoryHero"><span className="miniLabel">MARS / SOURCES</span><h1>Source-first journalism.</h1><p>MARS is being built to discover broadly, verify narrowly and show readers where important claims came from.</p></header>
      <div className="sourceGrid">
        {sourceRegistry.map(source => <a className="sourceCard" href={source.url} target="_blank" rel="noreferrer" key={source.name}><span>{source.type}</span><h2>{source.name}</h2><p>{source.coverage}</p><strong>Open official source ↗</strong></a>)}
      </div>
      <section className="sourceStandard"><span className="miniLabel">EDITORIAL STANDARD</span><h2>Discovery is not verification.</h2><p>The live discovery tool can surface headlines from across the web. A MARS article should still trace material claims to primary documents, official datasets, company filings or clearly attributed reporting before publication.</p></section>
    </main>
  );
}
