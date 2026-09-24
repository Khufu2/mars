import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="brand footerBrand">MARS<span className="brandDot">.</span></div>
        <p>Africa&apos;s food economy, decoded.</p>
      </div>
      <div className="footerLinks">
        <Link href="/markets">Markets</Link>
        <Link href="/commodities">Commodities</Link>
        <Link href="/section/climate">Climate</Link>
        <Link href="/section/trade">Trade</Link>
        <Link href="/sources">Sources</Link>
        <Link href="/studio">Newsroom</Link>
      </div>
      <div className="footerNote">Pre-Supabase build · live discovery and social rendering work now; persistent editorial workflows switch on when the database is connected.</div>
    </footer>
  );
}
