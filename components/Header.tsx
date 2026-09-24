import Link from "next/link";

const nav = ["Markets", "Climate", "Trade", "Logistics", "Policy", "Finance"];

export function Header() {
  return (
    <header className="masthead">
      <div className="mastUtility">
        <div className="mastUtilityLinks">
          <Link href="#brief">Email Briefings</Link>
          <Link href="/studio">Newsroom</Link>
        </div>
        <div className="editionStrip" aria-label="Regional editions">
          <span>DAR</span><span>NBO</span><span>KLA</span><span>LAG</span><span>JNB</span><span>ACC</span>
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
          {nav.map(item => <Link href={"/section/" + item.toLowerCase()} key={item}>{item}</Link>)}
        </nav>
        <div className="mastActions">
          <Link href="/search">Search</Link>
          <Link className="briefCta" href="#brief">Get the brief</Link>
        </div>
        <details className="mobileMenu">
          <summary aria-label="Open navigation">Menu</summary>
          <div className="mobilePanel">
            <Link href="/">Home</Link>
            {nav.map(item => <Link href={"/section/" + item.toLowerCase()} key={item}>{item}</Link>)}
            <Link href="/search">Search</Link>
            <Link href="/studio">Newsroom</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
