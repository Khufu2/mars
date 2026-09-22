import Link from "next/link";

const nav = ["Markets", "Climate", "Trade", "Logistics", "Policy", "Finance"];

export function Header() {
  return (
    <>
      <div className="utilityBar">
        <span>AFRICA</span><span>TANZANIA</span><span>EAST AFRICA</span>
        <span className="utilityPush">Intelligence for Africa's food economy</span>
      </div>
      <header className="siteHeader">
        <Link className="brand" href="/" aria-label="MARS home">MARS<span className="brandDot">.</span></Link>
        <nav className="desktopNav" aria-label="Primary">
          {nav.map(item => <Link href={"/section/" + item.toLowerCase()} key={item}>{item}</Link>)}
        </nav>
        <div className="headerActions">
          <Link className="searchLink" href="/search">Search</Link>
          <Link className="briefButton" href="#brief">Get the brief</Link>
        </div>
        <details className="mobileMenu">
          <summary aria-label="Open menu">Menu</summary>
          <div className="mobilePanel">
            {nav.map(item => <Link href={"/section/" + item.toLowerCase()} key={item}>{item}</Link>)}
            <Link href="/search">Search</Link>
            <Link href="/studio">Newsroom</Link>
          </div>
        </details>
      </header>
    </>
  );
}
