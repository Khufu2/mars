import { NextRequest,NextResponse } from "next/server";
import { apiError,requireEditor } from "@/lib/studioServer";

export async function GET(request:NextRequest){
  try{
    const session=await requireEditor(request);
    if(session.mode==="pre-supabase") return NextResponse.json({items:[],mode:"pre-supabase"});
    const status=request.nextUrl.searchParams.get("status") || "all";
    const pipeline=request.nextUrl.searchParams.get("pipeline") || "all";
    const limit=Math.min(100,Math.max(1,Number(request.nextUrl.searchParams.get("limit") || 60)));

    let query=session.client!.from("news_candidates")
      .select("id,provider,external_id,pipeline,title,url,source_name,published_at,image_url,language,region,desk,commodity,relevance_score,ai_summary,ai_angle,ai_headline,ai_verification_notes,status,article_id,fetched_at")
      .order("relevance_score",{ascending:false,nullsFirst:false})
      .order("published_at",{ascending:false,nullsFirst:false})
      .limit(limit);
    if(status!=="all") query=query.eq("status",status);
    if(pipeline!=="all") query=query.eq("pipeline",pipeline);
    const {data,error}=await query;
    if(error) throw error;
    return NextResponse.json({mode:"live",items:data || [],role:session.profile?.role});
  }catch(error){
    const out=apiError(error);return NextResponse.json(out.body,{status:out.status});
  }
}
