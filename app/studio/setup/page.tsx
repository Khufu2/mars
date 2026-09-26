"use client";

import Link from "next/link";
import { useEffect,useState } from "react";

type Readiness={
  mode:string;
  env:Record<string,boolean>;
  database:Record<string,boolean>|null;
  mediaBucket?:boolean;
  publishingReady?:boolean;
  radarReady?:boolean;
  automationReady?:boolean;
  ready:boolean;
};

export default function StudioSetup(){
  const [data,setData]=useState<Readiness|null>(null);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch("/api/studio/readiness",{cache:"no-store"})
      .then(async r=>{const body=await r.json(); if(!r.ok) throw new Error(body.error||"Check failed"); return body;})
      .then(setData).catch(e=>setError(e.message));
  },[]);

  const items=data ? [
    ["NEXT_PUBLIC_SITE_URL",data.env.siteUrl],
    ["NEXT_PUBLIC_SUPABASE_URL",data.env.supabaseUrl],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY",data.env.anonKey],
    ["SUPABASE_SERVICE_ROLE_KEY",data.env.serviceRole],
    ["NEWSAPI_AI_KEY",data.env.newsApi],
    ["GEMINI_API_KEY",data.env.gemini],
    ...Object.entries(data.database || {}).map(([name,ok])=>["Table: "+name,ok] as [string,boolean]),
    ["Storage: article-media",Boolean(data.mediaBucket)],
  ] : [];

  return <main className="studioPage">
    <header className="studioHeader">
      <div><span className="miniLabel">MARS NEWSROOM / LAUNCH CHECK</span><h1>Production readiness.</h1></div>
      {data && <div className="readinessBadges">
        <span className={"demoBadge "+(data.publishingReady?"liveBadge":"")}>{data.publishingReady?"PUBLISHING READY":"PUBLISHING SETUP"}</span>
        <span className={"demoBadge "+(data.radarReady?"liveBadge":"")}>{data.radarReady?"RADAR READY":"RADAR SETUP"}</span>
        <span className={"demoBadge "+(data.automationReady?"liveBadge":"")}>{data.automationReady?"OPTIONAL AI READY":"AI OPTIONAL"}</span>
      </div>}
    </header>
    {error && <div className="composerNotice">{error}</div>}
    {!data && !error ? <div className="loadingStory">Checking MARS…</div> :
      <section className="setupChecks">
        {items.map(([label,ok])=><div className="setupCheck" key={String(label)}><span className={ok?"checkOk":"checkMissing"}>{ok?"✓":"×"}</span><strong>{label}</strong><em>{ok?"Ready":"Missing"}</em></div>)}
      </section>
    }
    <section className="setupInstructions">
      <div><span className="miniLabel">LAUNCH PATH</span><h2>Database → news radar → first story.</h2></div>
      <ol>
        <li>Vercel must use <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>. The older name <code>NEXT_SUPABASE_ANON_KEY</code> will not reach browser-side Supabase.</li>
        <li>Add <code>NEWSAPI_AI_KEY</code> and redeploy. Gemini is optional; MARS Radar can publish without AI.</li>
        <li>Open <Link href="/studio/login">Newsroom Login</Link>, create the first admin, then use <Link href="/studio/intake">News Intake</Link> to sync, triage and create the first draft.</li>
      </ol>
    </section>
  </main>;
}
