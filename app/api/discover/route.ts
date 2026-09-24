import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function tag(block: string, name: string) {
  const match = block.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + ">", "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "Africa agriculture";
  const region = request.nextUrl.searchParams.get("region")?.trim() || "";
  const topic = request.nextUrl.searchParams.get("topic")?.trim() || "";
  const finalQuery = [query, region, topic].filter(Boolean).join(" ");

  const url = "https://news.google.com/rss/search?q=" + encodeURIComponent(finalQuery) + "&hl=en&gl=US&ceid=US:en";

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { "user-agent": "MARS-Newsroom/1.0 (+https://github.com/Khufu2/mars)" },
    });
    if (!response.ok) throw new Error("Discovery feed returned " + response.status);
    const xml = await response.text();
    const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
    const items = blocks.slice(0, 18).map((block, index) => {
      const title = tag(block, "title");
      const link = tag(block, "link");
      const pubDate = tag(block, "pubDate");
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
      const source = sourceMatch ? decodeXml(sourceMatch[1].trim()) : "News discovery";
      return { id: index + 1, title, link, pubDate, source };
    }).filter(item => item.title && item.link);

    return NextResponse.json({
      query: finalQuery,
      generatedAt: new Date().toISOString(),
      notice: "Discovery results are leads, not MARS-verified reporting. Editors should open primary sources before publication.",
      items,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Discovery unavailable",
      items: [],
    }, { status: 502 });
  }
}
