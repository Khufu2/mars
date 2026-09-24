import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/studioServer";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== "Bearer " + secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = serviceClient();
  if (!client) return NextResponse.json({ mode: "pre-supabase", published: 0 });

  const now = new Date().toISOString();
  const { data: due, error } = await client.from("articles")
    .select("id,slug,title,dek,social_copy,include_in_brief")
    .eq("status","scheduled")
    .lte("scheduled_at", now)
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  for (const article of due || []) {
    await client.from("articles").update({ status:"published", published_at:now, updated_at:now }).eq("id",article.id);
    for (const platform of ["instagram","linkedin","x"]) {
      await client.from("social_queue").insert({ article_id:article.id, platform, status:"draft", payload:{ slug:article.slug, title:article.title, caption:article.social_copy?.caption || article.dek } });
    }
    if (article.include_in_brief) await client.from("newsletter_queue").insert({ article_id:article.id, briefing:"flagship", subject:article.title, preview_text:article.dek, status:"draft" });
    await client.from("publication_events").insert({ article_id:article.id, event_type:"scheduled_publish" });
  }
  return NextResponse.json({ ok:true, published:(due || []).length });
}
