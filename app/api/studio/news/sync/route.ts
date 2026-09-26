import { NextRequest,NextResponse } from "next/server";
import { newsApiQuery,newsPipelines,pipelineByKey,type NewsPipeline } from "@/lib/newsPipelines";
import { apiError,requireEditor } from "@/lib/studioServer";

export const dynamic="force-dynamic";

function compactList(value:any){
  if(!Array.isArray(value)) return [];
  return value.slice(0,20).map((item:any)=>({
    uri:item?.uri || null,
    label:item?.label?.eng || item?.label || item?.title || null,
    type:item?.type || null,
    score:item?.score ?? item?.wgt ?? null,
  }));
}

async function syncPipeline(client:any,pipeline:NewsPipeline,apiKey:string){
  const query=newsApiQuery(pipeline);
  const startedAt=new Date().toISOString();
  const {data:recent}=await client.from("ingestion_runs")
    .select("id,started_at").eq("provider","newsapi.ai").eq("pipeline",pipeline.key)
    .gte("started_at",new Date(Date.now()-2*60*1000).toISOString())
    .order("started_at",{ascending:false}).limit(1);
  if(recent?.length) return {pipeline:pipeline.key,skipped:true,reason:"Synced less than two minutes ago."};

  const {data:run,error:runError}=await client.from("ingestion_runs").insert({
    provider:"newsapi.ai",pipeline:pipeline.key,query,status:"running",estimated_searches:1,started_at:startedAt
  }).select("id").single();
  if(runError) throw runError;

  try{
    const response=await fetch("https://eventregistry.org/api/v1/article/getArticles",{
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify({
        action:"getArticles",
        query,
        resultType:"articles",
        articlesPage:1,
        articlesCount:100,
        articlesSortBy:"date",
        articlesSortByAsc:false,
        articlesArticleBodyLen:2500,
        includeArticleCategories:true,
        includeArticleConcepts:true,
        includeArticleLocation:true,
        dataType:["news","pr"],
        lang:["eng"],
        forceMaxDataTimeWindow:31,
        apiKey,
      }),
      cache:"no-store",
    });
    if(!response.ok) throw new Error("NewsAPI.ai returned "+response.status);
    const payload=await response.json();
    const results=Array.isArray(payload?.articles?.results) ? payload.articles.results : [];

    const rows=results.filter((item:any)=>item?.url && item?.title).map((item:any)=>({
      provider:"newsapi.ai",
      external_id:String(item.uri || item.url),
      pipeline:pipeline.key,
      title:String(item.title).slice(0,1000),
      url:String(item.url),
      source_name:String(item?.source?.title || item?.source?.uri || "Unknown source").slice(0,300),
      source_uri:item?.source?.uri ? String(item.source.uri) : null,
      published_at:item.dateTimePub || item.dateTime || item.date || null,
      image_url:item.image ? String(item.image) : null,
      language:item.lang ? String(item.lang) : null,
      body_excerpt:item.body ? String(item.body).slice(0,2500) : null,
      categories:compactList(item.categories),
      concepts:compactList(item.concepts),
      locations:compactList(item.location ? [item.location] : item.locations),
      provider_payload:{
        eventUri:item.eventUri || null,
        sentiment:item.sentiment ?? null,
        shares:item.shares || null,
        sourceRank:item?.source?.ranking?.importanceRank ?? null,
      },
      desk:pipeline.desk,
      updated_at:new Date().toISOString(),
    }));

    let upserted=0;
    if(rows.length){
      const {data,error}=await client.from("news_candidates")
        .upsert(rows,{onConflict:"provider,external_id",ignoreDuplicates:false})
        .select("id");
      if(error) throw error;
      upserted=data?.length || rows.length;
    }

    await client.from("ingestion_runs").update({
      status:"completed",items_fetched:results.length,items_upserted:upserted,finished_at:new Date().toISOString()
    }).eq("id",run.id);

    return {pipeline:pipeline.key,fetched:results.length,upserted,searches:1};
  }catch(error){
    await client.from("ingestion_runs").update({
      status:"failed",error:error instanceof Error?error.message:"Sync failed",finished_at:new Date().toISOString()
    }).eq("id",run.id);
    throw error;
  }
}

export async function POST(request:NextRequest){
  try{
    const session=await requireEditor(request);
    if(session.mode==="pre-supabase") return NextResponse.json({error:"Supabase is not connected."},{status:503});
    if(!["admin","editor"].includes(session.profile?.role || "")) return NextResponse.json({error:"Only editors can spend news-provider quota."},{status:403});

    const apiKey=process.env.NEWSAPI_AI_KEY;
    if(!apiKey) return NextResponse.json({error:"NEWSAPI_AI_KEY is missing in Vercel."},{status:503});

    const body=await request.json().catch(()=>({}));
    const key=String(body.pipeline || "all");
    const pipelines=key==="all" ? newsPipelines : [pipelineByKey(key)].filter(Boolean) as NewsPipeline[];
    if(!pipelines.length) return NextResponse.json({error:"Unknown news pipeline."},{status:400});

    const results=[];
    for(const pipeline of pipelines) results.push(await syncPipeline(session.client!,pipeline,apiKey));
    return NextResponse.json({
      ok:true,
      provider:"newsapi.ai",
      searchesUsed:results.reduce((sum,item:any)=>sum+(item.searches || 0),0),
      results
    });
  }catch(error){
    const out=apiError(error);
    if(out.status===500 && error instanceof Error) return NextResponse.json({error:error.message},{status:502});
    return NextResponse.json(out.body,{status:out.status});
  }
}
