"use client";

import Link from "next/link";
import { useEffect,useState } from "react";

type Readiness={
  mode:string;
  env:Record<string,boolean>;
  database:Record<string,boolean>|null;
  mediaBucket?:boolean;
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
    ...Object.entries(data.database || {}).map(([name,ok])=>["Table: "+name,ok] as [string,boolean]),
    ["Storage: article-media",Boolean(data.mediaBucket)],
  ] : [];

  return <main className="studioPage">
    <header className="studioHeader">
      <div><span className="miniLabel">MARS NEWSROOM / LAUNCH CHECK</span><h1>Production readiness.</h1></div>
      {data && <span className={"demoBadge "+(data.ready?"liveBadge":"")}>{data.ready?"READY":"SETUP REQUIRED"}</span>}
    </header>
    {error && <div className="composerNotice">{error}</div>}
    {!data && !error ? <div className="loadingStory">Checking MARS…</div> :
      <section className="setupChecks">
        {items.map(([label,ok])=><div className="setupCheck" key={String(label)}><span className={ok?"checkOk":"checkMissing"}>{ok?"✓":"×"}</span><strong>{label}</strong><em>{ok?"Ready":"Missing"}</em></div>)}
      </section>
    }
    <section className="setupInstructions">
      <div><span className="miniLabel">TOMORROW</span><h2>Three steps to first publication.</h2></div>
      <ol>
        <li>Run <code>20260922_init.sql</code> then <code>20260924_publishing.sql</code>.</li>
        <li>Add the Supabase URL, anon key and service-role key in Vercel, then redeploy.</li>
        <li>Open <Link href="/studio/login">Newsroom Login</Link>, create the first admin account, then publish from <Link href="/studio/articles/new">New Story</Link>.</li>
      </ol>
    </section>
  </main>;
}
