import Link from "next/link";

export function Footer(){
  return (
    <footer className="footer">
      <div>
        <div className="brand footerBrand">MARS<span className="brandDot">.</span></div>
        <p>Africa, markets and the forces reshaping the world.</p>
        <a className="rssLink" href="/rss.xml">RSS ↗</a>
      </div>
      <div className="footerLinks">
        <Link href="/section/africa">Africa</Link>
        <Link href="/section/business">Business</Link>
        <Link href="/markets">Markets</Link>
        <Link href="/section/agriculture">Agriculture</Link>
        <Link href="/section/technology">Technology</Link>
        <Link href="/section/climate">Climate</Link>
        <Link href="/briefings">Briefings</Link>
        <Link href="/sources">Sources</Link>
        <Link href="/standards">Standards</Link>
        <Link href="/advertise">Advertise</Link>
        <Link href="/about">About</Link>
        <Link href="/studio">Newsroom</Link>
      </div>
      <div className="footerNote">MARS is an independent African publication. Source-linked wire briefs preserve original publisher attribution; MARS reporting, analysis, sponsored work and corrections are labeled distinctly.</div>
    </footer>
  );
}
