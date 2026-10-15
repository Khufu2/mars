import Link from "next/link";

export function Footer(){
  return <footer className="mars3Footer">
    <div className="mars3FooterTop">
      <div>
        <div className="mars3FooterLogo">MARS</div>
        <p>Independent African newsroom covering business, markets, agriculture, technology, climate, trade and the world.</p>
      </div>

      <div className="mars3FooterLinks">
        <div>
          <strong>Sections</strong>
          <Link href="/section/africa">Africa</Link>
          <Link href="/section/business">Business</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/section/agriculture">Agriculture</Link>
          <Link href="/section/technology">Technology</Link>
          <Link href="/section/climate">Climate</Link>
        </div>
        <div>
          <strong>MARS</strong>
          <Link href="/briefings">Briefings</Link>
          <Link href="/sources">Sources</Link>
          <Link href="/standards">Standards</Link>
          <Link href="/advertise">Advertise</Link>
          <Link href="/about">About</Link>
          <Link href="/studio">Newsroom</Link>
        </div>
      </div>
    </div>
    <div className="mars3FooterBottom">
      <span>© 2026 MARS</span>
      <span>Dar es Salaam · East Africa</span>
      <a href="/rss.xml">RSS ↗</a>
    </div>
  </footer>;
}
