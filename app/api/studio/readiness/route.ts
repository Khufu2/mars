import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/studioServer";

export async function GET() {
  const env = {
    siteUrl:Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    supabaseUrl:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey:Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRole:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    newsApi:Boolean(process.env.NEWSAPI_AI_KEY),
    gemini:Boolean(process.env.GEMINI_API_KEY),
  };

  const client=serviceClient();
  if (!client) return NextResponse.json({ mode:"pre-supabase", env, database:null, publishingReady:false, automationReady:false, ready:false });

  const tables=["profiles","authors","articles","article_sources","article_revisions","corrections","newsletter_subscribers","newsletter_queue","social_queue","publication_events","news_candidates","ingestion_runs"];
  const database:Record<string,boolean>={};
  for (const table of tables) {
    const {error}=await client.from(table).select("*",{count:"exact",head:true});
    database[table]=!error;
  }

  const {data:bucket}=await client.storage.getBucket("article-media");
  const mediaBucket=Boolean(bucket);

  const publishingEnv=[env.siteUrl,env.supabaseUrl,env.anonKey,env.serviceRole].every(Boolean);
  const coreTables=["profiles","authors","articles","article_sources","article_revisions","corrections","newsletter_subscribers","newsletter_queue","social_queue","publication_events"].every(t=>database[t]);
  const publishingReady=publishingEnv&&coreTables&&mediaBucket;
  const automationReady=publishingReady&&env.newsApi&&env.gemini&&database.news_candidates&&database.ingestion_runs;

  return NextResponse.json({ mode:"live", env, database, mediaBucket, publishingReady, automationReady, ready:publishingReady });
}
