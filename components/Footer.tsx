import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="brand footerBrand">MARS<span className="brandDot">.</span></div>
        <p>Africa&apos;s food economy, decoded.</p>
        <a className="rssLink" href="/rss.xml">RSS ↗</a>
      </div>
      <div className="footerLinks">
        <Link href="/markets">Markets</Link>
        <Link href="/commodities">Commodities</Link>
        <Link href="/briefings">Briefings</Link>
        <Link href="/sources">Sources</Link>
        <Link href="/about">About</Link>
        <Link href="/standards">Standards</Link>
        <Link href="/advertise">Advertise</Link>
        <Link href="/studio">Newsroom</Link>
      </div>
      <div className="footerNote">Independent African agriculture and commodities intelligence. Sponsored work is clearly disclosed; source links and evidence are surfaced on published stories.</div>
    </footer>
  );
}
