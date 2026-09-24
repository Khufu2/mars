import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { articles } from "@/lib/data";

export const runtime = "edge";

const colors = ["#f5ee37", "#ff5b2e", "#4264ff", "#c7b8ff", "#c9ff72", "#ff9ebe"];

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") || articles[0].slug;
  const slide = Math.max(1, Math.min(6, Number(request.nextUrl.searchParams.get("slide") || 1)));
  const article = articles.find(item => item.slug === slug) || articles[0];

  const blocks = article.sections;
  let kicker = article.section.toUpperCase();
  let headline = article.title;
  let copy = article.dek;

  if (slide >= 2 && slide <= 5) {
    const section = blocks[(slide - 2) % Math.max(blocks.length, 1)];
    if (section) {
      kicker = section.eyebrow;
      headline = section.title;
      copy = section.body[0] || article.dek;
    }
  }

  if (slide === 6) {
    kicker = "MARS / INTELLIGENCE";
    headline = "Africa's food economy, decoded.";
    copy = "Read the full analysis on MARS. When intelligence reveals commercial intent, move into Grain X.";
  }

  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: colors[(slide - 1) % colors.length], color: "#0a0a0a",
        padding: "72px", fontFamily: "Arial, sans-serif",
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:24, fontWeight:800, letterSpacing:1.5}}>
          <span>{kicker}</span><span>{slide}/6</span>
        </div>
        <div style={{height:2, background:"#0a0a0a", width:"100%", marginTop:26}} />
        <div style={{display:"flex", flex:1, flexDirection:"column", justifyContent:"center"}}>
          <div style={{fontSize: slide === 1 ? 88 : 72, lineHeight: .96, fontWeight: 800, letterSpacing: -4, maxWidth: "920px"}}>
            {headline}
          </div>
          <div style={{fontSize:34, lineHeight:1.25, marginTop:38, maxWidth:"860px"}}>{copy}</div>
        </div>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", borderTop:"2px solid #0a0a0a", paddingTop:26}}>
          <div style={{fontSize:48, fontWeight:900, letterSpacing:-3}}>MARS</div>
          <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", fontSize:20}}>
            <span>{article.country} · {article.region}</span>
            <span style={{fontWeight:700}}>Africa&apos;s food economy, decoded.</span>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}
