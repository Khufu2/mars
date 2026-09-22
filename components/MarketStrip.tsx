import { marketRows } from "@/lib/data";

export function MarketStrip() {
  return (
    <div className="marketStrip" aria-label="Demo market ticker">
      <span className="tickerLabel">DEMO MARKET BOARD</span>
      <div className="tickerTrack">
        {marketRows.map(row => (
          <div className="tickerItem" key={row.name}>
            <strong>{row.name}</strong>
            <span>{row.value}</span>
            <em className={row.direction === "up" ? "positive" : "negative"}>{row.move}</em>
          </div>
        ))}
      </div>
    </div>
  );
}
