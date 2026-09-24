import { NextResponse } from "next/server";
import { apiError, parseSourceLines, requireEditor, slugify } from "@/lib/studioServer";

async function attachSources(client: any, articleId: string, sources: Array<{url:string;note:string|null}>) {
  await client.from("article_sources").delete().eq("article_id", articleId);
  for (const item of sources) {
    let hostname = "Source";
    try { hostname = new URL(item.url).hostname.replace(/^www\./, ""); } catch {}
    const { data: source } = await client.from("sources").insert({
      name: hostname,
      url: item.url,
      source_type: "web",
    }).select("id").single();
    if (source?.id) {
      await client.from("article_sources").insert({
        article_id: articleId,
        source_id: source.id,
        source_url: item.url,
        note: item.note,
        verified: true,
      });
    }
  }
}

export async function GET(request: Request) {
  try {
    const session = await requireEditor(request);
    if (session.mode === "pre-supabase") return NextResponse.json({ mode: "pre-supabase", items: [] });
    const { data, error } = await session.client!
      .from("articles")
      .select("id,slug,title,dek,section,status,story_type,updated_at,published_at,scheduled_at")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ mode: "live", items: data || [] });
  } catch (error) {
    const out = apiError(error); return NextResponse.json(out.body, { status: out.status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireEditor(request);
    if (session.mode === "pre-supabase") return NextResponse.json({ error: "Connect Supabase before saving server drafts." }, { status: 503 });

    const body = await request.json();
    const title = String(body.title || "").trim();
    const slug = slugify(String(body.slug || title));
    if (!title || !slug) return NextResponse.json({ error: "Headline is required." }, { status: 400 });

    const payload = {
      slug, title,
      dek: String(body.dek || "").trim(),
      kicker: String(body.kicker || "").trim(),
      body: Array.isArray(body.blocks) ? body.blocks : [],
      section: String(body.section || "Markets"),
      region: String(body.region || "Africa"),
      country: String(body.country || "Regional"),
      commodity: String(body.commodity || "").trim() || null,
      story_type: String(body.storyType || "News"),
      status: "draft",
      featured_image_url: String(body.featuredImageUrl || "").trim() || null,
      image_credit: String(body.imageCredit || "").trim() || null,
      meta_title: String(body.metaTitle || "").trim() || title,
      meta_description: String(body.metaDescription || "").trim() || String(body.dek || "").trim(),
      social_copy: { caption: String(body.socialCopy || "").trim() },
      editorial_checks: body.checks || {},
      include_in_brief: Boolean(body.includeInBrief),
      sponsor_name: String(body.sponsorName || "").trim() || null,
      sponsor_disclosure: String(body.sponsorDisclosure || "").trim() || null,
      scheduled_at: body.scheduledAt ? new Date(body.scheduledAt).toISOString() : null,
      created_by: session.user!.id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await session.client!.from("articles").insert(payload).select("id,slug,status").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await attachSources(session.client!, data.id, parseSourceLines(body.sources));
    await session.client!.from("article_revisions").insert({ article_id: data.id, snapshot: payload, created_by: session.user!.id });
    await session.client!.from("publication_events").insert({ article_id: data.id, actor_id: session.user!.id, event_type: "draft_created" });

    return NextResponse.json({ ok: true, article: data }, { status: 201 });
  } catch (error) {
    const out = apiError(error); return NextResponse.json(out.body, { status: out.status });
  }
}
