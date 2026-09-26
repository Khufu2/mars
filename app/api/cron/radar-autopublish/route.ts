import { createHash } from "crypto";
import { NextRequest,NextResponse } from "next/server";
import { serviceClient,slugify } from "@/lib/studioServer";

export const dynamic="force-dynamic";
export const maxDuration=60;

const EXPECTED_HASH="a64a0f88aef74d217a83da17bc5a1018fd67988655f8e5006abaf46d8e255d0b";

const eastAfrica=["Africa","Tanzania","Kenya","Uganda","Rwanda","Burundi","Ethiopia","South Sudan","Zanzibar"];
const widerAfrica=[...eastAfrica,"Zambia","Malawi","Mozambique","Ghana","Nigeria","South Africa","Zimbabwe","Botswana","Namibia","Angola","Côte d'Ivoire","Senegal","Cameroon"];

const slots={
  morning:{
    label:"Agriculture & commodities",
    desk:"Markets",
    topics:["agriculture","farming","crop","grain","maize","rice","wheat","coffee","tea","cocoa","sesame","cashew","sunflower","soybean","beans","avocado","fertilizer","irrigation","food security","harvest"],
    geos:eastAfrica,
  },
  evening:{
    label:"Trade, logistics, climate & policy",
    desk:"Trade",
    topics:["port","shipping","freight","corridor","customs","export","import","trade","logistics","container","rail","truck","drought","rainfall","flood","climate","weather","agriculture policy","food policy","tariff","agribusiness","agritech","farm finance"],
    geos:widerAfrica,
  },
} as const;

function authorized(request:NextRequest){
  const token=request.headers.get("x-mars-cron") || "";
  const digest=createHash("sha256").update(token).digest("hex");
  return token.length>20 && digest===EXPECTED_HASH;
}

function ors(terms:string[]){return {"$or":terms.map(keyword=>({keyword}))};}

function classify(title:string,slot:"morning"|"evening"){
  const text=title.toLowerCase();
  const has=(terms:string[])=>terms.some(term=>text.includes(term));
  let section:string=slots[slot].desk;
  if(has(["drought","rain","flood","climate","weather","heat","el niño","la niña"])) section="Climate";
  else if(has(["port","shipping","freight","corridor","container","rail","truck","logistics"])) section="Logistics";
  else if(has(["export","import","trade","customs","tariff","border"])) section="Trade";
  else if(has(["policy","regulation","ban","ministry","government","law","duty"])) section="Policy";
  else if(has(["finance","bank","funding","investment","credit","loan"])) section="Finance";
  else if(has(["agritech","technology","satellite","drone","digital"])) section="Technology";
  else if(has(["company","acquisition","factory","processor","processing"])) section="Companies";

  const commodities=["maize","corn","rice","wheat","coffee","tea","cocoa","sesame","cashew","sunflower","soybean","soy","beans","avocado","fertilizer","sugar","cotton","tobacco"];
  const commodity=commodities.find(item=>text.includes(item)) || null;
  return {section,commodity};
}

function sourceBrief(source:string,section:string,region:string,commodity:string|null,publishedAt:string|null){
  const when=publishedAt ? new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(new Date(publishedAt)) : "recently";
  const subject=commodity ? commodity+" markets" : section.toLowerCase();
  return {
    dek:"MARS Radar surfaced this "+subject+" development from "+source+" "+when+". Open the original report for full context.",
    body:[
      {eyebrow:"MARS RADAR",title:"Source brief",body:["This item was automatically surfaced by MARS from "+source+". It matched our monitoring for "+section.toLowerCase()+" developments affecting "+region+"."]},
      {eyebrow:"WHY IT'S HERE",title:"Signal, not a rewrite",body:["MARS Radar publishes source-linked signals quickly without copying the underlying report. The original publisher remains the source of record for the reporting and details."]},
      {eyebrow:"SOURCE",title:"Read the original",body:["Use the source link below for the full report, attribution, figures and context."]},
      {eyebrow:"WATCH",title:"What MARS tracks next",body:["MARS will continue monitoring follow-on market, climate, trade, logistics and policy developments around this signal."]},
    ]
  };
}

async function ensureRadarAuthor(client:any){
  const {data:existing}=await client.from("authors").select("id").eq("slug","mars-radar").maybeSingle();
  if(existing?.id) return existing.id;
  const {data,error}=await client.from("authors").insert({name:"MARS Radar",slug:"mars-radar",bio:"Automated source-linked news radar for Africa's food economy."}).select("id").single();
  if(error) throw error;
  return data.id;
}

async function sourceId(client:any,name:string,url:string){
  const {data:existing}=await client.from("sources").select("id").eq("url",url).limit(1).maybeSingle();
  if(existing?.id) return existing.id;
  const {data,error}=await client.from("sources").insert({name,url,source_type:"news"}).select("id").single();
  if(error) throw error;
  return data.id;
}

export async function POST(request:NextRequest){
  if(!authorized(request)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const client=serviceClient();
  if(!client) return NextResponse.json({error:"Supabase is not connected."},{status:503});
  const apiKey=process.env.NEWSAPI_AI_KEY;
  if(!apiKey) return NextResponse.json({error:"NEWSAPI_AI_KEY is missing in Vercel."},{status:503});

  const body=await request.json().catch(()=>({}));
  const slot=(body.slot==="morning"||body.slot==="evening"?body.slot:"morning") as "morning"|"evening";
  const config=slots[slot];
  const query={"$query":{"$and":[ors(config.topics),ors(config.geos)]}};
  const startedAt=new Date().toISOString();

  const {data:run,error:runError}=await client.from("ingestion_runs").insert({
    provider:"newsapi.ai",pipeline:"radar-"+slot,query,status:"running",estimated_searches:1,started_at:startedAt
  }).select("id").single();
  if(runError) return NextResponse.json({error:runError.message},{status:500});

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
        articlesArticleBodyLen:0,
        includeArticleCategories:true,
        includeArticleConcepts:true,
        includeArticleLocation:true,
        includeArticleImage:false,
        dataType:["news","pr"],
        lang:["eng"],
        forceMaxDataTimeWindow:7,
        apiKey,
      }),
      cache:"no-store",
    });
    if(!response.ok) throw new Error("NewsAPI.ai returned "+response.status);
    const payload=await response.json();
    const results=Array.isArray(payload?.articles?.results)?payload.articles.results:[];
    const authorId=await ensureRadarAuthor(client);
    const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || "https://mars-rust.vercel.app";
    let published=0,duplicates=0,failed=0;

    for(const item of results){
      if(!item?.url||!item?.title){failed++;continue;}
      const externalId=String(item.uri||item.url);
      const {data:known}=await client.from("news_candidates").select("id,article_id").eq("provider","newsapi.ai").eq("external_id",externalId).maybeSingle();
      if(known?.article_id){duplicates++;continue;}

      const source=String(item?.source?.title||item?.source?.uri||"News source").slice(0,300);
      const publishedAt=item.dateTimePub||item.dateTime||item.date||null;
      const {section,commodity}=classify(String(item.title),slot);
      const region=slot==="morning"?"East Africa":"Africa";
      const slug=slugify(String(item.title))+"-"+createHash("sha1").update(externalId).digest("hex").slice(0,8);
      const brief=sourceBrief(source,section,region,commodity,publishedAt);
      const hero=siteUrl+"/api/social/card?slug="+encodeURIComponent(slug)+"&slide=1";

      const candidatePayload={
        provider:"newsapi.ai",external_id:externalId,pipeline:"radar-"+slot,title:String(item.title).slice(0,1000),
        url:String(item.url),source_name:source,source_uri:item?.source?.uri?String(item.source.uri):null,
        published_at:publishedAt,language:item.lang?String(item.lang):null,body_excerpt:null,
        categories:Array.isArray(item.categories)?item.categories.slice(0,20):[],
        concepts:Array.isArray(item.concepts)?item.concepts.slice(0,20):[],
        locations:item.location?[item.location]:[],
        provider_payload:{eventUri:item.eventUri||null,sourceRank:item?.source?.ranking?.importanceRank??null},
        region,desk:section,commodity,status:"used",updated_at:new Date().toISOString(),
      };

      let candidateId=known?.id || null;
      if(!candidateId){
        const {data:candidate,error:candidateError}=await client.from("news_candidates").insert(candidatePayload).select("id").single();
        if(candidateError){failed++;continue;}
        candidateId=candidate.id;
      }

      const articlePayload={
        slug,title:String(item.title).slice(0,1000),dek:brief.dek,kicker:"MARS RADAR",body:brief.body,
        section,region,country:"Regional",commodity,story_type:"Radar",status:"published",
        featured_image_url:hero,image_credit:"MARS Radar",
        meta_title:String(item.title).slice(0,65),meta_description:brief.dek.slice(0,165),
        social_copy:{},editorial_checks:{automatedRadar:true},include_in_brief:false,
        canonical_url:String(item.url),author_id:authorId,published_at:new Date().toISOString(),
        updated_at:new Date().toISOString(),
      };
      const {data:article,error:articleError}=await client.from("articles").insert(articlePayload).select("id").single();
      if(articleError){failed++;continue;}

      const sid=await sourceId(client,source,String(item.url));
      await client.from("article_sources").insert({
        article_id:article.id,source_id:sid,source_url:String(item.url),
        note:"Original reporting surfaced by MARS Radar. This automated brief links to the publisher rather than reproducing the article.",
        verified:false,
      });
      await client.from("news_candidates").update({article_id:article.id,status:"used",updated_at:new Date().toISOString()}).eq("id",candidateId);
      await client.from("publication_events").insert({
        article_id:article.id,event_type:"radar_autopublished",
        payload:{candidate_id:candidateId,provider:"newsapi.ai",slot,source_url:String(item.url)}
      });
      published++;
    }

    await client.from("ingestion_runs").update({
      status:"completed",items_fetched:results.length,items_upserted:published,finished_at:new Date().toISOString()
    }).eq("id",run.id);

    return NextResponse.json({ok:true,slot,label:config.label,fetched:results.length,published,duplicates,failed,searchesUsed:1});
  }catch(error){
    const message=error instanceof Error?error.message:"Radar sync failed";
    await client.from("ingestion_runs").update({status:"failed",error:message,finished_at:new Date().toISOString()}).eq("id",run.id);
    return NextResponse.json({error:message},{status:502});
  }
}
