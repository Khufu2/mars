import { createHash } from "crypto";
import { NextRequest,NextResponse } from "next/server";
import { serviceClient,slugify } from "@/lib/studioServer";

export const dynamic="force-dynamic";
export const maxDuration=60;

const EXPECTED_HASH="a64a0f88aef74d217a83da17bc5a1018fd67988655f8e5006abaf46d8e255d0b";

const africaTerms=[
  "africa","tanzania","kenya","uganda","rwanda","burundi","ethiopia","south sudan",
  "zambia","malawi","mozambique","ghana","nigeria","south africa","zimbabwe","botswana",
  "namibia","angola","senegal","cameroon","côte d'ivoire","ivory coast","djibouti"
];

function authorized(request:NextRequest){
  const token=request.headers.get("x-mars-cron") || "";
  const digest=createHash("sha256").update(token).digest("hex");
  return token.length>20 && digest===EXPECTED_HASH;
}

function keywordOr(terms:readonly string[]){return {keyword:{"$or":[...terms]}};}

function categoryText(item:any){
  return Array.isArray(item?.categories)
    ? item.categories.map((x:any)=>x?.label||x?.uri||"").join(" ").toLowerCase()
    : "";
}

function conceptText(item:any){
  return Array.isArray(item?.concepts)
    ? item.concepts.map((x:any)=>x?.label?.eng||x?.label||x?.uri||"").join(" ").toLowerCase()
    : "";
}

function metadataText(item:any){
  return (String(item?.title||"")+" "+conceptText(item)+" "+categoryText(item)).toLowerCase();
}

const strongBusinessTerms=[
  "business","market","markets","economy","economic","finance","financial","bank","banking","investment",
  "investor","funding","fund","company","corporate","startup","merger","acquisition","revenue","profit",
  "earnings","manufacturing","factory","industry","industrial","trade","export","import","tariff","tax",
  "budget","shipping","freight","port","logistics","supply chain","container","agriculture","agricultural",
  "farm","farmer","crop","grain","commodity","maize","rice","wheat","coffee","tea","cocoa","fertilizer",
  "food price","food security","agribusiness","agritech","energy","oil","gas","mining","currency",
  "inflation","interest rate","climate","drought","flood"
];

function isBusinessRelevant(item:any){
  const title=String(item?.title||"").toLowerCase();
  const categories=categoryText(item);
  const concepts=conceptText(item);
  const metadata=(title+" "+concepts+" "+categories).toLowerCase();

  const categoryBusiness=
    categories.includes("news/business") ||
    categories.includes("economy, business and finance") ||
    categories.includes("dmoz/business");

  const directTitle=strongBusinessTerms.some(term=>title.includes(term));
  const strategicMetadata=[
    "agriculture","agricultural","commodity","shipping","freight","logistics","supply chain",
    "port","export","import","trade","finance","investment","manufacturing","energy","mining"
  ].some(term=>metadata.includes(term));

  const excludedCategory=[
    "crime, law and justice","sports","arts and entertainment","travel and tourism",
    "religion and belief","conflict, war and peace","politics and government"
  ].some(term=>categories.includes(term));

  const promotional=[
    "presale","price prediction","airdrop","buy now","token sale","sponsored content",
    "best crypto to buy","next 100x","meme coin"
  ].some(term=>title.includes(term));

  const obviousNoise=[
    "funeral","shipwreck","cocaine","arrested with","wedding expenses"
  ].some(term=>title.includes(term));

  if(promotional) return false;
  if(obviousNoise && !directTitle) return false;
  if(excludedCategory && !directTitle) return false;
  return categoryBusiness || directTitle || strategicMetadata;
}

function inferRegion(item:any){
  const text=metadataText(item);
  return africaTerms.some(term=>text.includes(term)) ? "Africa" : "Global";
}

function classify(item:any){
  const title=String(item?.title||"").toLowerCase();
  const metadata=metadataText(item);
  const has=(text:string,terms:string[])=>terms.some(term=>text.includes(term));

  const finance=["finance","financial","bank","funding","investment","investor","stock","shares","equity","sensex","nifty","insolvency","credit","loan","bond","currency","inflation","interest rate","budget","tax"];
  const logistics=["port","shipping","freight","corridor","container","rail","truck","logistics","supply chain","maritime"];
  const trade=["export","import","trade","customs","tariff","border","afcfta"];
  const markets=["agriculture","farm","crop","grain","commodity","fertilizer","food price","harvest","maize","rice","wheat","coffee","cocoa"];
  const climate=["drought","rainfall","flood","climate","weather","heatwave","el niño","la niña","carbon"];
  const policy=["policy","regulation","ban","ministry","government","law","duty"];
  const technology=["agritech","technology","satellite","drone","digital","artificial intelligence"," ai "];

  let section="Companies";
  if(has(title,finance)) section="Finance";
  else if(has(title,logistics)) section="Logistics";
  else if(has(title,trade)) section="Trade";
  else if(has(title,markets)) section="Markets";
  else if(has(title,climate)) section="Climate";
  else if(has(title,technology)) section="Technology";
  else if(has(title,policy)) section="Policy";
  else if(has(metadata,finance)) section="Finance";
  else if(has(metadata,logistics)) section="Logistics";
  else if(has(metadata,trade)) section="Trade";
  else if(has(metadata,markets)) section="Markets";
  else if(has(metadata,climate)) section="Climate";
  else if(has(metadata,technology)) section="Technology";
  else if(has(metadata,policy)) section="Policy";

  const commodities=["maize","corn","rice","wheat","coffee","tea","cocoa","sesame","cashew","sunflower","soybean","soy","beans","avocado","fertilizer","sugar","cotton","tobacco","palm oil"];
  const commodity=commodities.find(name=>metadata.includes(name)) || null;
  return {section,commodity};
}

function usableImage(value:any){
  const url=String(value||"").trim();
  if(!url) return null;
  if(/(?:\/|\b)(?:rt|pixel|tracking)\.gif(?:\?|$)/i.test(url)) return null;
  if(/\.gif(?:\?|$)/i.test(url)) return null;
  return url;
}

function cleanExcerpt(value:any,max=900){
  let text=String(value||"").replace(/\s+/g," ").trim();
  text=text.replace(/^Membership is now required to use this feature\. To learn more:\s*View Membership Benefits\s*/i,"");
  text=text.replace(/^Subscribe(?: now)?(?: to continue reading)?[.\s:-]*/i,"");

  if(!text) return "";
  if(text.length<=max) return text;
  const clipped=text.slice(0,max);
  const stop=Math.max(clipped.lastIndexOf(". "),clipped.lastIndexOf("! "),clipped.lastIndexOf("? "));
  return (stop>320?clipped.slice(0,stop+1):clipped.trimEnd()+"…");
}

function sourceBrief(source:string,section:string,region:string,commodity:string|null,publishedAt:string|null,excerpt:string){
  const when=publishedAt ? new Intl.DateTimeFormat("en",{dateStyle:"medium"}).format(new Date(publishedAt)) : "recently";
  const subject=commodity ? commodity+" markets" : section.toLowerCase();
  const dek=excerpt
    ? cleanExcerpt(excerpt,260)
    : "MARS Radar surfaced this "+subject+" development from "+source+" "+when+".";
  const body=[
    {eyebrow:"MARS RADAR",title:"What happened",body:[dek]},
    ...(excerpt ? [{eyebrow:"FROM THE REPORT",title:"Source extract",body:[cleanExcerpt(excerpt,900)]}] : []),
    {eyebrow:"WHY IT'S HERE",title:"Business signal",body:["This item matched MARS monitoring for "+section.toLowerCase()+" developments affecting "+region+". MARS Radar surfaces the signal quickly and keeps the original publisher as the source of record."]},
    {eyebrow:"SOURCE",title:"Read the full original",body:["Use the original-source link below for the complete report, attribution, figures and context."]},
  ];
  return {dek,body};
}

async function ensureRadarAuthor(client:any){
  const {data:existing}=await client.from("authors").select("id").eq("slug","mars-radar").maybeSingle();
  if(existing?.id) return existing.id;
  const {data,error}=await client.from("authors").insert({name:"MARS Radar",slug:"mars-radar",bio:"Automated source-linked business and food-economy radar."}).select("id").single();
  if(error) throw error;
  return data.id;
}

export async function POST(request:NextRequest){
  if(!authorized(request)) return NextResponse.json({error:"Unauthorized"},{status:401});
  const client=serviceClient();
  if(!client) return NextResponse.json({error:"Supabase is not connected."},{status:503});
  const apiKey=process.env.NEWSAPI_AI_KEY;
  if(!apiKey) return NextResponse.json({error:"NEWSAPI_AI_KEY is missing in Vercel."},{status:503});

  const query={
    "$query":{
      "$and":[
        {"lang":"eng"},
        {"$or":[
          {"categoryUri":"dmoz/Business"},
          {"categoryUri":"dmoz/Science/Agriculture"},
          keywordOr(["shipping","logistics","commodity","agriculture","climate"])
        ]}
      ]
    },
    "$filter":{"isDuplicate":"skipDuplicates"}
  };
  const startedAt=new Date().toISOString();

  const {data:run,error:runError}=await client.from("ingestion_runs").insert({
    provider:"newsapi.ai",pipeline:"radar-daily-business",query,status:"running",estimated_searches:1,started_at:startedAt
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
        articlesArticleBodyLen:1200,
        includeArticleCategories:true,
        includeArticleConcepts:true,
        includeArticleLocation:true,
        includeArticleImage:true,
        dataType:["news"],
        forceMaxDataTimeWindow:7,
        apiKey,
      }),
      cache:"no-store",
    });

    const raw=await response.text();
    if(!response.ok) throw new Error("NewsAPI.ai returned "+response.status+": "+raw.slice(0,400));
    const payload=JSON.parse(raw);
    if(payload?.error) throw new Error("NewsAPI.ai error: "+(payload.error?.message || payload.error || "Unknown provider error"));
    if(!payload?.articles || !Array.isArray(payload.articles.results)) {
      throw new Error("Unexpected NewsAPI.ai response: "+JSON.stringify(payload).slice(0,500));
    }

    const results=payload.articles.results;
    const publishable=results.filter(isBusinessRelevant);
    const authorId=await ensureRadarAuthor(client);
    const siteUrl=process.env.NEXT_PUBLIC_SITE_URL || "https://mars-rust.vercel.app";
    const items=publishable
      .filter((item:any)=>item?.url&&item?.title)
      .map((item:any)=>{
        const externalId=String(item.uri||item.url);
        const source=String(item?.source?.title||item?.source?.uri||"News source").slice(0,300);
        const publishedAt=item.dateTimePub||item.dateTime||item.date||null;
        const {section,commodity}=classify(item);
        const region=inferRegion(item);
        const slug=slugify(String(item.title))+"-"+createHash("sha1").update(externalId).digest("hex").slice(0,8);
        const excerpt=cleanExcerpt(item.body,1200);
        const brief=sourceBrief(source,section,region,commodity,publishedAt,excerpt);
        const imageUrl=usableImage(item.image);
        const hero=imageUrl || siteUrl+"/api/social/card?slug="+encodeURIComponent(slug)+"&slide=1";

        return {
          candidate:{
            external_id:externalId,
            pipeline:"radar-daily-business",
            title:String(item.title).slice(0,1000),
            url:String(item.url),
            source_name:source,
            source_uri:item?.source?.uri?String(item.source.uri):null,
            published_at:publishedAt,
            image_url:imageUrl,
            language:item.lang?String(item.lang):null,
            body_excerpt:excerpt||null,
            categories:Array.isArray(item.categories)?item.categories.slice(0,20):[],
            concepts:Array.isArray(item.concepts)?item.concepts.slice(0,20):[],
            locations:item.location?[item.location]:[],
            provider_payload:{eventUri:item.eventUri||null,sourceRank:item?.source?.ranking?.importanceRank??null},
            region,
            desk:section,
            commodity,
          },
          article:{
            slug,
            title:String(item.title).slice(0,1000),
            dek:brief.dek,
            body:brief.body,
            section,
            region,
            country:region==="Africa"?"Regional":"Global",
            commodity,
            featured_image_url:hero,
            image_credit:imageUrl ? "Image via "+source : "MARS Radar",
            meta_title:String(item.title).slice(0,65),
            meta_description:brief.dek.slice(0,165),
          }
        };
      });

    const {data:ingest,error:ingestError}=await client.rpc("ingest_mars_radar_batch",{
      p_items:items,
      p_author_id:authorId,
    });
    if(ingestError) throw ingestError;

    const published=Number(ingest?.published || 0);
    const duplicates=Number(ingest?.duplicates || 0);
    const failed=Number(ingest?.failed || 0);

    await client.from("ingestion_runs").update({
      status:"completed",items_fetched:results.length,items_upserted:published,finished_at:new Date().toISOString()
    }).eq("id",run.id);

    return NextResponse.json({
      ok:true,pipeline:"daily-business",fetched:results.length,relevant:publishable.length,
      published,duplicates,failed,searchesUsed:1
    });
  }catch(error){
    const message=error instanceof Error?error.message:"Radar sync failed";
    await client.from("ingestion_runs").update({status:"failed",error:message,finished_at:new Date().toISOString()}).eq("id",run.id);
    return NextResponse.json({error:message},{status:502});
  }
}
