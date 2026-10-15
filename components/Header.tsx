import Link from "next/link";

const primary=[
  ["Africa","/section/africa"],["Business","/section/business"],["Markets","/markets"],
  ["World","/section/world"],["Technology","/section/technology"],["Climate","/section/climate"]
];

const secondary=[
  ["Agriculture","/section/agriculture"],["Commodities","/commodities"],["Trade","/section/trade"],
  ["Logistics","/section/logistics"],["Finance","/section/finance"],["Energy","/section/energy"],["Policy","/section/policy"]
];

export function Header(){
  return <header className="gazetteMasthead">
    <div className="gazetteUtility">
      <div className="gazetteUtilityLeft">
        <Link href="/briefings">Briefings</Link>
        <Link href="/sources">Sources</Link>
        <Link href="/standards">Standards</Link>
      </div>
      <div className="gazetteEdition">TODAY&apos;S EDITION · AFRICA / GLOBAL</div>
      <div className="gazetteUtilityRight">
        <Link href="/search">Search</Link>
        <Link href="/studio">Newsroom</Link>
        <Link href="/advertise">Advertise</Link>
      </div>
    </div>

    <div className="gazetteBrand">
      <div className="gazetteBrandSide"><span>EST. 2026</span><small>DAR ES SALAAM · EAST AFRICA</small></div>
      <Link href="/" className="gazetteWordmark" aria-label="MARS home">MARS</Link>
      <div className="gazetteBrandSide right"><span>INDEPENDENT</span><small>MARKETS · POWER · PROGRESS</small></div>
    </div>

    <div className="gazetteDescriptor">THE AFRICAN GAZETTE OF BUSINESS, MARKETS AND THE WORLD</div>

    <div className="gazettePrimaryNav">
      <nav>{primary.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}</nav>
      <Link href="/#brief" className="gazetteBriefButton">Get the briefing</Link>
      <details className="gazetteMenu">
        <summary>Menu</summary>
        <div>
          {[...primary,...secondary].map(([label,href])=><Link href={href} key={href}>{label}</Link>)}
          <Link href="/search">Search</Link>
          <Link href="/sources">Sources</Link>
        </div>
      </details>
    </div>

    <nav className="gazetteTopicNav" aria-label="Topics">
      {secondary.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}
    </nav>
  </header>
}
