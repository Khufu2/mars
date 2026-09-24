import { NextResponse } from "next/server";
import { apiError, requireEditor } from "@/lib/studioServer";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireEditor(request);
    if (session.mode === "pre-supabase") return NextResponse.json({ error: "Supabase is not connected." }, { status: 503 });

    const { data: article, error } = await session.client!.from("articles")
      .select("*,article_sources(id,verified)")
      .eq("id", params.id).single();
    if (error || !article) return NextResponse.json({ error: "Story not found." }, { status: 404 });

    const checks = article.editorial_checks || {};
    const readyChecks = ["primarySource","figuresChecked","imageRights","headlineSupported"].every(key => checks[key] === true);
    const hasBody = Array.isArray(article.body) && article.body.some((block:any) => block?.title && Array.isArray(block?.body) && block.body.some((p:any) => String(p).trim()));
    const hasSource = Array.isArray(article.article_sources) && article.article_sources.some((s:any) => s.verified);
    const missing = [
      !article.title && "headline",
      !article.dek && "standfirst",
      !hasBody && "body",
      !article.featured_image_url && "featured image",
      !article.image_credit && "image credit",
      !article.meta_description && "SEO description",
      !hasSource && "verified source",
      !readyChecks && "editorial checklist",
    ].filter(Boolean);

    if (missing.length) return NextResponse.json({ error: "Story is not publication-ready.", missing }, { status: 409 });

    const body = await request.json().catch(() => ({}));
    const scheduleAt = body.scheduledAt || article.scheduled_at;
    const scheduled = scheduleAt && new Date(scheduleAt).getTime() > Date.now() + 60000;
    const status = scheduled ? "scheduled" : "published";
    const publishedAt = scheduled ? article.published_at : new Date().toISOString();

    await session.client!.from("articles").update({
      status,
      scheduled_at: scheduled ? new Date(scheduleAt).toISOString() : null,
      published_at: publishedAt,
      reviewed_by: session.user!.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", params.id);

    if (!scheduled) {
      for (const platform of ["instagram","linkedin","x"]) {
        await session.client!.from("social_queue").insert({
          article_id: params.id, platform, status: "draft",
          payload: { slug: article.slug, title: article.title, caption: article.social_copy?.caption || article.dek },
        });
      }
      if (article.include_in_brief) {
        await session.client!.from("newsletter_queue").insert({
          article_id: params.id,
          briefing: "flagship",
          subject: article.title,
          preview_text: article.dek,
          status: "draft",
        });
      }
    }

    await session.client!.from("publication_events").insert({
      article_id: params.id, actor_id: session.user!.id,
      event_type: scheduled ? "scheduled" : "published",
      payload: scheduled ? { scheduled_at: scheduleAt } : {},
    });

    return NextResponse.json({ ok: true, status, slug: article.slug, publishedAt });
  } catch (error) { const out = apiError(error); return NextResponse.json(out.body, { status: out.status }); }
}
