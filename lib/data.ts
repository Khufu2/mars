export type StorySection = {
  eyebrow: string;
  title: string;
  body: string[];
};

export type Article = {
  slug: string;
  title: string;
  dek: string;
  section: string;
  region: string;
  country: string;
  commodity?: string;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
  imageCredit: string;
  accent: "lime" | "orange" | "blue" | "rose" | "gold";
  sections: StorySection[];
};

export const articles: Article[] = [
  {
    slug: "east-africa-sesame-corridor",
    title: "The sesame story is becoming a logistics story",
    dek: "A demo analysis of how ports, warehousing and buyer concentration can matter as much as farm-gate output in East Africa's oilseed trade.",
    section: "Trade",
    region: "East Africa",
    country: "Tanzania",
    commodity: "Sesame",
    author: "MARS Intelligence Desk",
    publishedAt: "Sep 22, 2026",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1600&q=85",
    imageCredit: "Demo image · Unsplash",
    accent: "lime",
    sections: [
      { eyebrow: "THE MOVE", title: "Trade is won after harvest", body: ["For exporters, the decisive bottleneck is often not whether a crop exists, but whether quality can be aggregated, financed, inspected and moved on time.", "That makes storage, inland transport, documentation and port reliability part of the commodity thesis rather than back-office details."] },
      { eyebrow: "WHY IT MATTERS", title: "Margins hide in coordination", body: ["A buyer comparing East African origins is also comparing lead times, rejection risk, moisture consistency, traceability and the credibility of counterparties.", "A market that makes those variables visible can improve price discovery for both suppliers and buyers."] },
      { eyebrow: "THE NUMBERS", title: "What MARS will track", body: ["This prototype is wired for commodity prices, freight observations, border events, weather signals and verified trade notices.", "The figures shown in this build are demo data until live feeds are connected."] },
      { eyebrow: "WATCH", title: "The signal to follow", body: ["Watch the gap between farm-gate and export-parity pricing. A widening gap can point to transport friction, financing constraints or temporary oversupply.", "That is exactly the kind of signal this publication is being built to surface."] }
    ]
  },
  {
    slug: "rainfall-is-a-market-signal",
    title: "Rainfall is a market signal before it becomes a headline",
    dek: "The case for combining weather anomalies, planting calendars and crop-market reporting in one African intelligence product.",
    section: "Climate",
    region: "Africa",
    country: "Regional",
    author: "MARS Climate Desk",
    publishedAt: "Sep 22, 2026",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1600&q=85",
    imageCredit: "Demo image · Unsplash",
    accent: "blue",
    sections: [
      { eyebrow: "THE SIGNAL", title: "Weather moves markets early", body: ["Rainfall deficits and excesses can change expectations weeks before official production estimates catch up.", "The useful question is not only whether rainfall is above or below normal, but which crops are exposed at that stage of the season."] },
      { eyebrow: "THE EDGE", title: "Local context beats generic alerts", body: ["A weather map becomes commercially useful when it is tied to district-level crop calendars, roads, storage and procurement activity.", "MARS is designed to connect those layers instead of publishing weather as a separate vertical."] }
    ]
  },
  {
    slug: "dar-port-food-trade",
    title: "Why Dar es Salaam port belongs on an agriculture homepage",
    dek: "Food systems do not stop at the farm. Ports, corridors and border queues determine which market opportunities are actually reachable.",
    section: "Logistics",
    region: "East Africa",
    country: "Tanzania",
    author: "MARS Logistics Desk",
    publishedAt: "Sep 21, 2026",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=85",
    imageCredit: "Demo image · Unsplash",
    accent: "orange",
    sections: [
      { eyebrow: "THE ROUTE", title: "The farm-to-port chain is one market", body: ["A container delay, truck shortage or border disruption can erase an apparently attractive commodity spread.", "That is why MARS treats logistics as market intelligence, not transport news."] },
      { eyebrow: "WATCH", title: "Build a corridor dashboard", body: ["The production version can track port notices, freight quotes, border updates and corridor disruptions beside commodity prices.", "A trader should be able to understand price and movement risk from one screen."] }
    ]
  },
  {
    slug: "africa-fertilizer-finance",
    title: "The next fertilizer story may be about finance, not supply",
    dek: "When input is available but working capital is expensive, access becomes a balance-sheet problem.",
    section: "Finance",
    region: "Africa",
    country: "Regional",
    author: "MARS Markets Desk",
    publishedAt: "Sep 21, 2026",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=85",
    imageCredit: "Demo image · Unsplash",
    accent: "rose",
    sections: [
      { eyebrow: "THE IDEA", title: "Availability is not affordability", body: ["Input-market reporting is incomplete if it ignores credit terms, currency pressure and dealer working capital.", "Those variables often decide whether supply actually reaches farms at the right time."] }
    ]
  },
  {
    slug: "food-policy-market-shocks",
    title: "A policy notice can move a food market overnight",
    dek: "Export rules, standards and procurement decisions deserve the same treatment as price charts.",
    section: "Policy",
    region: "East Africa",
    country: "Regional",
    author: "MARS Policy Desk",
    publishedAt: "Sep 20, 2026",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=85",
    imageCredit: "Demo image · Unsplash",
    accent: "gold",
    sections: [
      { eyebrow: "THE RULE", title: "Policy is part of price discovery", body: ["Trade restrictions, tender rules and quality standards can change the addressable market immediately.", "MARS will prioritize primary-source notices and show the commercial implication beside the announcement."] }
    ]
  },
  {
    slug: "grainx-demand-layer",
    title: "What happens when intelligence can turn directly into demand?",
    dek: "The strategic link between a trusted agriculture publication and a marketplace where readers can act.",
    section: "Markets",
    region: "Africa",
    country: "Regional",
    author: "MARS Strategy Desk",
    publishedAt: "Sep 20, 2026",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85",
    imageCredit: "Demo image · Unsplash",
    accent: "lime",
    sections: [
      { eyebrow: "THE FLYWHEEL", title: "Read, understand, act", body: ["A buyer reading about a supply pocket should be able to move from intelligence to an RFQ. A supplier reading about demand should be able to list inventory.", "The editorial product remains independently useful; Grain X becomes the action layer when commercial intent appears."] }
    ]
  }
];

export const marketRows = [
  { name: "Maize · TZ", value: "720 TZS/kg", move: "+1.4%", direction: "up" },
  { name: "Beans · TZ", value: "2,080 TZS/kg", move: "-0.7%", direction: "down" },
  { name: "Sesame · TZ", value: "2,860 TZS/kg", move: "+2.9%", direction: "up" },
  { name: "Coffee · EA", value: "4.18 USD/kg", move: "+0.8%", direction: "up" },
  { name: "Freight · DAR", value: "Demo index 104", move: "+3", direction: "up" }
];

export const sections = ["Markets", "Climate", "Trade", "Logistics", "Policy", "Finance"];
