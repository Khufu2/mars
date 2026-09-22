import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <div className="brand footerBrand">MARS<span className="brandDot">.</span></div>
        <p>Africa's food economy, decoded.</p>
      </div>
      <div className="footerLinks">
        <Link href="/section/markets">Markets</Link>
        <Link href="/section/climate">Climate</Link>
        <Link href="/section/trade">Trade</Link>
        <Link href="/section/logistics">Logistics</Link>
        <Link href="/studio">Newsroom</Link>
      </div>
      <div className="footerNote">Prototype · demo data is explicitly labelled until live feeds are connected.</div>
    </footer>
  );
}
