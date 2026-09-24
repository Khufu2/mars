import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/studioServer";

export async function GET() {
  const env = {
    siteUrl:Boolean(process.env.NEXT_PUBLIC_SITE_URL),
    supabaseUrl:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey:Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serviceRole:Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };

  const client=serviceClient();
  if (!client) return NextResponse.json({ mode:"pre-supabase", env, database:null, ready:false });

  const tables=["profiles","authors","articles","article_sources","article_revisions","corrections","newsletter_subscribers","newsletter_queue","social_queue","publication_events"];
  const database:Record<string,boolean>={};
  for (const table of tables) {
    const {error}=await client.from(table).select("*",{count:"exact",head:true});
    database[table]=!error;
  }

  let mediaBucket=false;
  const {data:bucket}=await client.storage.getBucket("article-media");
  mediaBucket=Boolean(bucket);

  const ready=Object.values(env).every(Boolean) && Object.values(database).every(Boolean) && mediaBucket;
  return NextResponse.json({ mode:"live", env, database, mediaBucket, ready });
}
