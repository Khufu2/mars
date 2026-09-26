import { NextResponse } from "next/server";
import { apiError,ensureAuthor,requireEditor,slugify } from "@/lib/studioServer";

export async function POST(request:Request,{params}:{params:{id:string}}){
  try{
    const session=await requireEditor(request);
    if(session.mode==="pre-supabase") return NextResponse.json({error:"Supabase is not connected."},{status:503});

    const {data:candidate,error}=await session.client!.from("news_candidates").select("*").eq("id",params.id).single();
    if(error || !candidate) return NextResponse.json({error:"Candidate not found."},{status:404});
    if(candidate.article_id) return NextResponse.json({ok:true,articleId:candidate.article_id,alreadyDrafted:true});

    const authorId=await ensureAuthor(session.client!,session.user!,session.profile);
    const headline=candidate.ai_headline || candidate.title;
    const sourceSummary=candidate.ai_summary || candidate.body_excerpt || candidate.title;
    const angle=candidate.ai_angle || "Assess why this development matters to African agriculture, trade or food markets.";
    const questions=Array.isArray(candidate.ai_verification_notes)?candidate.ai_verification_notes:[];

    const articlePayload={
      slug:slugify(headline)+"-"+String(candidate.id).slice(0,6),
      title:headline,
      dek:candidate.ai_summary || "",
      kicker:"THE MOVE",
      body:[
        {eyebrow:"THE MOVE",title:"What happened",body:[sourceSummary]},
        {eyebrow:"WHY IT MATTERS",title:"The MARS angle",body:[angle]},
        {eyebrow:"VERIFY",title:"Before publication",body:questions.length?questions:["Open the primary source and verify all material claims, dates and figures."]},
        {eyebrow:"WATCH",title:"What comes next",body:["Add the next concrete market, policy, climate or logistics signal to watch."]},
      ],
      section:candidate.desk || "Markets",
      region:candidate.region || "Africa",
      country:"Regional",
      commodity:candidate.commodity || null,
      story_type:"News",
      status:"draft",
      featured_image_url:null,
      image_credit:null,
      meta_title:headline,
      meta_description:candidate.ai_summary || "",
      social_copy:{caption:candidate.ai_summary || ""},
      editorial_checks:{primarySource:false,figuresChecked:false,imageRights:false,headlineSupported:false},
      include_in_brief:true,
      author_id:authorId,
      created_by:session.user!.id,
      updated_at:new Date().toISOString(),
    };

    const {data:article,error:articleError}=await session.client!.from("articles").insert(articlePayload).select("id,slug").single();
    if(articleError) return NextResponse.json({error:articleError.message},{status:400});

    const {data:source}=await session.client!.from("sources").insert({
      name:candidate.source_name || "News source",url:candidate.url,source_type:"news"
    }).select("id").single();
    if(source?.id) await session.client!.from("article_sources").insert({
      article_id:article.id,source_id:source.id,source_url:candidate.url,
      note:"News lead imported from "+candidate.provider+". Open and verify against primary sources before publication.",
      verified:false
    });

    await session.client!.from("article_revisions").insert({article_id:article.id,snapshot:articlePayload,created_by:session.user!.id});
    await session.client!.from("publication_events").insert({
      article_id:article.id,actor_id:session.user!.id,event_type:"draft_from_news_candidate",
      payload:{candidate_id:candidate.id,provider:candidate.provider}
    });
    await session.client!.from("news_candidates").update({
      status:"drafted",article_id:article.id,updated_at:new Date().toISOString()
    }).eq("id",candidate.id);

    return NextResponse.json({ok:true,articleId:article.id,slug:article.slug});
  }catch(error){
    const out=apiError(error);return NextResponse.json(out.body,{status:out.status});
  }
}
