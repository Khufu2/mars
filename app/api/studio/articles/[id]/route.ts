import { NextResponse } from "next/server";
import { apiError, parseSourceLines, requireEditor, slugify } from "@/lib/studioServer";

function canEdit(profileRole:string | undefined, userId:string, createdBy:string | null) {
  return ["admin","editor"].includes(profileRole || "") || createdBy === userId;
}

export async function GET(request:Request,{params}:{params:{id:string}}) {
  try {
    const session=await requireEditor(request);
    if (session.mode==="pre-supabase") return NextResponse.json({error:"Supabase is not connected."},{status:503});
    const {data,error}=await session.client!.from("articles")
      .select("*,article_sources(source_url,note,verified,source:sources(name,url))")
      .eq("id",params.id).single();
    if (error || !data) return NextResponse.json({error:"Story not found."},{status:404});
    if (!canEdit(session.profile?.role,session.user!.id,data.created_by) && data.status !== "published") {
      return NextResponse.json({error:"You do not have access to this draft."},{status:403});
    }
    return NextResponse.json({article:data});
  } catch (error) { const out=apiError(error); return NextResponse.json(out.body,{status:out.status}); }
}

export async function PATCH(request:Request,{params}:{params:{id:string}}) {
  try {
    const session=await requireEditor(request);
    if (session.mode==="pre-supabase") return NextResponse.json({error:"Supabase is not connected."},{status:503});
    const body=await request.json();

    const {data:current,error:currentError}=await session.client!.from("articles")
      .select("id,status,created_by,title").eq("id",params.id).single();
    if (currentError || !current) return NextResponse.json({error:"Story not found."},{status:404});
    if (!canEdit(session.profile?.role,session.user!.id,current.created_by)) {
      return NextResponse.json({error:"You cannot edit this story."},{status:403});
    }
    if (current.status === "published" && !["admin","editor"].includes(session.profile?.role || "")) {
      return NextResponse.json({error:"Only editors can change a published story."},{status:403});
    }

    const correctionNote=String(body.correctionNote || "").trim();
    if (current.status==="published" && correctionNote.length < 8) {
      return NextResponse.json({error:"Published stories require a visible correction/update note before changes can be saved."},{status:409});
    }

    const payload={
      title:String(body.title || "").trim(),
      slug:slugify(String(body.slug || body.title || "")),
      dek:String(body.dek || "").trim(),
      kicker:String(body.kicker || "").trim(),
      body:Array.isArray(body.blocks) ? body.blocks : [],
      section:String(body.section || "Markets"),
      region:String(body.region || "Africa"),
      country:String(body.country || "Regional"),
      commodity:String(body.commodity || "").trim() || null,
      story_type:String(body.storyType || "News"),
      featured_image_url:String(body.featuredImageUrl || "").trim() || null,
      image_credit:String(body.imageCredit || "").trim() || null,
      meta_title:String(body.metaTitle || "").trim() || String(body.title || "").trim(),
      meta_description:String(body.metaDescription || "").trim() || String(body.dek || "").trim(),
      social_copy:{caption:String(body.socialCopy || "").trim()},
      editorial_checks:body.checks || {},
      include_in_brief:Boolean(body.includeInBrief),
      sponsor_name:String(body.sponsorName || "").trim() || null,
      sponsor_disclosure:String(body.sponsorDisclosure || "").trim() || null,
      scheduled_at:body.scheduledAt ? new Date(body.scheduledAt).toISOString() : null,
      correction_note:current.status==="published" ? correctionNote : null,
      updated_at:new Date().toISOString(),
    };

    const {error}=await session.client!.from("articles").update(payload).eq("id",params.id);
    if (error) return NextResponse.json({error:error.message},{status:400});

    const sources=parseSourceLines(body.sources);
    await session.client!.from("article_sources").delete().eq("article_id",params.id);
    for (const item of sources) {
      let hostname="Source"; try { hostname=new URL(item.url).hostname.replace(/^www\./,""); } catch {}
      const {data:source}=await session.client!.from("sources").insert({name:hostname,url:item.url,source_type:"web"}).select("id").single();
      if (source?.id) await session.client!.from("article_sources").insert({
        article_id:params.id,source_id:source.id,source_url:item.url,note:item.note,verified:true
      });
    }

    await session.client!.from("article_revisions").insert({article_id:params.id,snapshot:payload,created_by:session.user!.id});
    if (current.status==="published") {
      await session.client!.from("corrections").insert({article_id:params.id,note:correctionNote,created_by:session.user!.id});
      await session.client!.from("publication_events").insert({article_id:params.id,actor_id:session.user!.id,event_type:"published_story_updated",payload:{note:correctionNote}});
    } else {
      await session.client!.from("publication_events").insert({article_id:params.id,actor_id:session.user!.id,event_type:"draft_updated"});
    }
    return NextResponse.json({ok:true,status:current.status});
  } catch (error) { const out=apiError(error); return NextResponse.json(out.body,{status:out.status}); }
}
