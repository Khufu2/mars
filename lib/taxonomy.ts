export const commodities = [
  { slug: "maize", name: "Maize", family: "Grains", note: "Food security, feed and regional trade." },
  { slug: "rice", name: "Rice", family: "Grains", note: "Production, imports and milling economics." },
  { slug: "beans", name: "Beans", family: "Pulses", note: "Regional demand and cross-border flows." },
  { slug: "sesame", name: "Sesame", family: "Oilseeds", note: "Export demand, quality and corridor economics." },
  { slug: "sunflower", name: "Sunflower", family: "Oilseeds", note: "Edible oil, crushing and input markets." },
  { slug: "soybeans", name: "Soybeans", family: "Oilseeds", note: "Feed demand, processing and trade." },
  { slug: "coffee", name: "Coffee", family: "Softs", note: "Farm-gate pricing, exports and global benchmarks." },
  { slug: "cashew", name: "Cashew", family: "Tree crops", note: "Auctions, processing and export demand." },
  { slug: "avocado", name: "Avocado", family: "Horticulture", note: "Cold chain, standards and export access." },
  { slug: "cocoa", name: "Cocoa", family: "Softs", note: "African supply and global price transmission." },
];

export const regions = [
  { slug: "tanzania", name: "Tanzania", code: "DAR", note: "Agriculture, ports, corridors and policy." },
  { slug: "east-africa", name: "East Africa", code: "EA", note: "Tanzania, Kenya, Uganda, Rwanda, Burundi and regional trade." },
  { slug: "kenya", name: "Kenya", code: "NBO", note: "Demand, imports, horticulture, logistics and finance." },
  { slug: "uganda", name: "Uganda", code: "KLA", note: "Coffee, grains, cross-border trade and logistics." },
  { slug: "west-africa", name: "West Africa", code: "WAF", note: "Cocoa, cashew, grains and food trade." },
  { slug: "southern-africa", name: "Southern Africa", code: "SAF", note: "Maize, logistics, weather and regional balances." },
  { slug: "africa", name: "Africa", code: "AFR", note: "Continental food, climate, trade and capital flows." },
];

export function commodityBySlug(slug: string) {
  return commodities.find(item => item.slug === slug);
}

export function regionBySlug(slug: string) {
  return regions.find(item => item.slug === slug);
}
