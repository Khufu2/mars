import Link from "next/link";

const primary=[
  ["Africa","/section/africa"],
  ["Business","/section/business"],
  ["Markets","/markets"],
  ["Agriculture","/section/agriculture"],
  ["Technology","/section/technology"],
  ["Climate","/section/climate"],
  ["World","/section/world"],
];

const secondary=[
  ["Trade","/section/trade"],
  ["Logistics","/section/logistics"],
  ["Finance","/section/finance"],
  ["Energy","/section/energy"],
  ["Commodities","/commodities"],
  ["Policy","/section/policy"],
];

export function Header(){
  return <header className="mars3Header">
    <div className="mars3Utility">
      <div className="mars3UtilityLeft">DAR ES SALAAM · AFRICA / GLOBAL</div>
      <div className="mars3UtilityRight">
        <Link href="/briefings">Briefings</Link>
        <Link href="/sources">Sources</Link>
        <Link href="/standards">Standards</Link>
        <Link href="/advertise">Advertise</Link>
      </div>
    </div>

    <div className="mars3Mast">
      <Link href="/" className="mars3Logo" aria-label="MARS home">MARS</Link>
      <div className="mars3Identity">
        <strong>Independent African newsroom</strong>
        <span>Business · markets · power · progress</span>
      </div>
      <div className="mars3Actions">
        <Link href="/search">Search</Link>
        <Link href="/#brief" className="mars3BriefCta">Get the briefing</Link>
      </div>
    </div>

    <div className="mars3NavShell">
      <nav className="mars3PrimaryNav" aria-label="Primary">
        {primary.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}
      </nav>
      <nav className="mars3SecondaryNav" aria-label="More sections">
        {secondary.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}
      </nav>
    </div>
  </header>;
}
