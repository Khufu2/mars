import { NextResponse } from "next/server";
import { apiError,requireEditor } from "@/lib/studioServer";

type TriageResult={
  relevance_score:number;
  desk:string;
  region:string;
  commodity:string|null;
  summary:string;
  angle:string;
  suggested_headline:string;
  verification_questions:string[];
  recommendation:"shortlist"|"dismiss";
};

async function triageCandidate(candidate:any,apiKey:string,model:string):Promise<TriageResult>{
  const prompt=`You are the triage editor for MARS, an Africa-first publication covering agriculture, commodities, climate, trade, logistics, policy and finance.

Evaluate this news lead only from the material provided. Do not invent facts. Score commercial/editorial relevance for African food systems and markets.

TITLE: ${candidate.title}
SOURCE: ${candidate.source_name || "Unknown"}
PUBLISHED: ${candidate.published_at || "Unknown"}
PIPELINE: ${candidate.pipeline}
EXCERPT:
${candidate.body_excerpt || "No excerpt available."}

Return JSON with:
- relevance_score: integer 0-100
- desk: one of Markets, Climate, Trade, Logistics, Policy, Finance, Companies, Technology
- region: concise geographic scope
- commodity: main crop/commodity if any, otherwise null
- summary: max 2 factual sentences
- angle: one sentence explaining why it matters to MARS readers
- suggested_headline: factual headline, no hype
- verification_questions: up to 4 specific things an editor must verify from primary sources
- recommendation: shortlist if score >= 60, otherwise dismiss.`;

  const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({
      contents:[{role:"user",parts:[{text:prompt}]}],
      generationConfig:{
        temperature:0.15,
        responseMimeType:"application/json",
        responseSchema:{
          type:"OBJECT",
          properties:{
            relevance_score:{type:"INTEGER"},
            desk:{type:"STRING"},
            region:{type:"STRING"},
            commodity:{type:["STRING","NULL"]},
            summary:{type:"STRING"},
            angle:{type:"STRING"},
            suggested_headline:{type:"STRING"},
            verification_questions:{type:"ARRAY",items:{type:"STRING"}},
            recommendation:{type:"STRING",enum:["shortlist","dismiss"]},
          },
          required:["relevance_score","desk","region","summary","angle","suggested_headline","verification_questions","recommendation"]
        }
      }
    }),
    cache:"no-store",
  });
  if(!response.ok) throw new Error("Gemini returned "+response.status);
  const payload=await response.json();
  const text=payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if(!text) throw new Error("Gemini returned no triage result.");
  return JSON.parse(text) as TriageResult;
}

export async function POST(request:Request){
  try{
    const session=await requireEditor(request);
    if(session.mode==="pre-supabase") return NextResponse.json({error:"Supabase is not connected."},{status:503});
    if(!["admin","editor"].includes(session.profile?.role || "")) return NextResponse.json({error:"Only editors can run AI triage."},{status:403});

    const apiKey=process.env.GEMINI_API_KEY;
    if(!apiKey) return NextResponse.json({error:"GEMINI_API_KEY is missing in Vercel."},{status:503});
    const model=process.env.MARS_TRIAGE_MODEL || "gemini-3.5-flash-lite";

    const body=await request.json().catch(()=>({}));
    const ids=Array.isArray(body.ids) ? body.ids.map(String).slice(0,20) : [];
    const limit=Math.min(20,Math.max(1,Number(body.limit || 10)));

    let query=session.client!.from("news_candidates")
      .select("id,title,source_name,published_at,pipeline,body_excerpt,status")
      .in("status",["new","shortlisted"])
      .order("published_at",{ascending:false,nullsFirst:false})
      .limit(limit);
    if(ids.length) query=session.client!.from("news_candidates")
      .select("id,title,source_name,published_at,pipeline,body_excerpt,status")
      .in("id",ids).limit(20);
    const {data,error}=await query;
    if(error) throw error;

    const results=[];
    for(const candidate of data || []){
      try{
        const triage=await triageCandidate(candidate,apiKey,model);
        const score=Math.max(0,Math.min(100,Math.round(Number(triage.relevance_score) || 0)));
        const status=triage.recommendation==="shortlist" || score>=60 ? "shortlisted" : "dismissed";
        const {error:updateError}=await session.client!.from("news_candidates").update({
          relevance_score:score,
          desk:triage.desk,
          region:triage.region,
          commodity:triage.commodity || null,
          ai_summary:triage.summary,
          ai_angle:triage.angle,
          ai_headline:triage.suggested_headline,
          ai_verification_notes:triage.verification_questions || [],
          status,
          updated_at:new Date().toISOString(),
        }).eq("id",candidate.id);
        if(updateError) throw updateError;
        results.push({id:candidate.id,status,score});
      }catch(error){
        results.push({id:candidate.id,error:error instanceof Error?error.message:"Triage failed"});
      }
    }
    return NextResponse.json({ok:true,model,processed:results.length,results});
  }catch(error){
    const out=apiError(error);
    if(out.status===500 && error instanceof Error) return NextResponse.json({error:error.message},{status:502});
    return NextResponse.json(out.body,{status:out.status});
  }
}
