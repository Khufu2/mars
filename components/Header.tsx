import Link from "next/link";

const nav = [
  { label: "Markets", href: "/markets" },
  { label: "Commodities", href: "/commodities" },
  { label: "Climate", href: "/section/climate" },
  { label: "Trade", href: "/section/trade" },
  { label: "Logistics", href: "/section/logistics" },
  { label: "Policy", href: "/section/policy" },
  { label: "Finance", href: "/section/finance" },
];

const editions = [
  { label: "DAR", href: "/region/tanzania" },
  { label: "EA", href: "/region/east-africa" },
  { label: "NBO", href: "/region/kenya" },
  { label: "KLA", href: "/region/uganda" },
  { label: "WAF", href: "/region/west-africa" },
  { label: "SAF", href: "/region/southern-africa" },
];

export function Header() {
  return (
    <header className="masthead">
      <div className="mastUtility">
        <div className="mastUtilityLinks">
          <Link href="/#brief">Email Briefings</Link>
          <Link href="/sources">Sources</Link>
          <Link href="/studio">Newsroom</Link>
        </div>
        <div className="editionStrip" aria-label="Regional editions">
          {editions.map(item => <Link href={item.href} key={item.label}>{item.label}</Link>)}
        </div>
        <div className="mastTagline">Intelligence for Africa&apos;s food economy</div>
      </div>

      <div className="mastBrandRow">
        <Link className="brandWordmark" href="/" aria-label="MARS home">MARS</Link>
        <div className="marsOrb" aria-hidden="true"><span /></div>
        <div className="brandDescriptor">Agriculture · Commodities · Climate · Trade</div>
      </div>

      <div className="mastNavRow">
        <nav className="mastNav" aria-label="Primary">
          <Link href="/">Home</Link>
          {nav.map(item => <Link href={item.href} key={item.label}>{item.label}</Link>)}
        </nav>
        <div className="mastActions">
          <Link href="/search">Search</Link>
          <Link className="briefCta" href="/#brief">Get the brief</Link>
        </div>
        <details className="mobileMenu">
          <summary aria-label="Open navigation">Menu</summary>
          <div className="mobilePanel">
            <Link href="/">Home</Link>
            {nav.map(item => <Link href={item.href} key={item.label}>{item.label}</Link>)}
            <Link href="/sources">Sources</Link>
            <Link href="/search">Search</Link>
            <Link href="/studio">Newsroom</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
