"use client";

import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { authedFetch } from "@/lib/studioClient";
import { newsPipelines } from "@/lib/newsPipelines";

type Candidate={
  id:string;provider:string;pipeline:string;title:string;url:string;source_name?:string;
  published_at?:string;image_url?:string;region?:string;desk?:string;commodity?:string;
  relevance_score?:number|null;ai_summary?:string;ai_angle?:string;ai_headline?:string;
  ai_verification_notes?:string[];status:string;article_id?:string|null;
};

export default function IntakePage(){
  const [items,setItems]=useState<Candidate[]>([]);
  const [status,setStatus]=useState("shortlisted");
  const [pipeline,setPipeline]=useState("all");
  const [loading,setLoading]=useState(true);
  const [working,setWorking]=useState("");
  const [notice,setNotice]=useState("");
  const [role,setRole]=useState<string|null>(null);

  async function load(nextStatus=status,nextPipeline=pipeline){
    setLoading(true);
    const res=await authedFetch("/api/studio/news/candidates?status="+encodeURIComponent(nextStatus)+"&pipeline="+encodeURIComponent(nextPipeline)+"&limit=80");
    const body=await res.json();
    if(res.ok){setItems(body.items||[]);setRole(body.role||null);setNotice("");}
    else setNotice(body.error||"Could not load news intake.");
    setLoading(false);
  }

  useEffect(()=>{load("shortlisted","all");},[]);

  const counts=useMemo(()=>items.reduce((acc,item)=>{acc[item.status]=(acc[item.status]||0)+1;return acc;},{} as Record<string,number>),[items]);

  async function sync(which:string){
    setWorking("sync:"+which);
    setNotice(which==="all"?"Running five NewsAPI.ai searches — up to 500 fresh leads.":"Running one NewsAPI.ai search — up to 100 fresh leads.");
    const res=await authedFetch("/api/studio/news/sync",{method:"POST",body:JSON.stringify({pipeline:which})});
    const body=await res.json();
    setWorking("");
    if(!res.ok){setNotice(body.error||"News sync failed.");return;}
    setNotice("NewsAPI.ai sync complete. Searches used: "+body.searchesUsed+". Run AI triage next.");
    setStatus("new");
    await load("new",pipeline);
  }

  async function triage(ids?:string[]){
    setWorking(ids?.length?"triage:"+ids[0]:"triage-batch");
    setNotice(ids?.length?"Triaging one lead with Gemini…":"Triaging the newest 10 leads with Gemini…");
    const res=await authedFetch("/api/studio/news/triage",{method:"POST",body:JSON.stringify(ids?.length?{ids}:{limit:10})});
    const body=await res.json();
    setWorking("");
    if(!res.ok){setNotice(body.error||"AI triage failed.");return;}
    setNotice("AI triage processed "+body.processed+" lead(s) with "+body.model+".");
    setStatus("shortlisted");
    await load("shortlisted",pipeline);
  }

  async function draft(candidate:Candidate){
    setWorking("draft:"+candidate.id);
    const res=await authedFetch("/api/studio/news/candidates/"+candidate.id+"/draft",{method:"POST"});
    const body=await res.json();
    setWorking("");
    if(!res.ok){setNotice(body.error||"Could not create draft.");return;}
    window.location.href="/studio/articles/new?id="+body.articleId;
  }

  async function changeStatus(next:string){
    setStatus(next);await load(next,pipeline);
  }
  async function changePipeline(next:string){
    setPipeline(next);await load(status,next);
  }

  return <main className="studioPage">
    <header className="studioHeader">
      <div><span className="miniLabel">MARS NEWSROOM / INTAKE</span><h1>Build the news radar.</h1></div>
      <div className="studioHeaderActions"><span className="demoBadge liveBadge">NEWSAPI.AI + GEMINI</span><Link href="/studio/discover">Web search</Link></div>
    </header>

    <section className="intakeHero">
      <div>
        <span className="miniLabel">PRIMARY PIPELINE</span>
        <h2>One search can bring back up to 100 structured articles.</h2>
        <p>MARS stores leads, not finished reporting. NewsAPI.ai finds the signal; Gemini ranks it; editors still verify primary sources before publication.</p>
      </div>
      <div className="intakeActions">
        <button className="primaryButton" disabled={Boolean(working)||!["admin","editor"].includes(role||"")} onClick={()=>sync("all")}>{working==="sync:all"?"Syncing…":"Sync all 5 pipelines · ~5 searches"}</button>
        <button className="secondaryButton" disabled={Boolean(working)||!["admin","editor"].includes(role||"")} onClick={()=>triage()}>{working==="triage-batch"?"Triaging…":"AI triage newest 10"}</button>
      </div>
    </section>

    <section className="pipelineStrip">
      {newsPipelines.map(item=><button key={item.key} disabled={Boolean(working)||!["admin","editor"].includes(role||"")} onClick={()=>sync(item.key)}><span>{item.label}</span><small>1 search · up to 100</small></button>)}
    </section>

    <div className="intakeFilters">
      <div className="filterGroup">
        {["new","shortlisted","drafted","dismissed","all"].map(value=><button className={status===value?"active":""} key={value} onClick={()=>changeStatus(value)}>{value}{counts[value]?" · "+counts[value]:""}</button>)}
      </div>
      <select value={pipeline} onChange={e=>changePipeline(e.target.value)}>
        <option value="all">All pipelines</option>
        {newsPipelines.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}
      </select>
    </div>

    {notice&&<div className="composerNotice">{notice}</div>}

    <section className="intakeGrid">
      {loading?<div className="loadingStory">Loading MARS intake…</div>:
      items.length===0?<div className="emptyState"><h2>No leads in this view.</h2><p>Sync a NewsAPI.ai pipeline, then run AI triage.</p></div>:
      items.map(item=><article className="intakeCard" key={item.id}>
        <div className="intakeCardMeta"><span>{item.pipeline}</span><span>{item.published_at?new Date(item.published_at).toLocaleString():"Undated"}</span></div>
        <h2>{item.ai_headline||item.title}</h2>
        <div className="intakeSource">{item.source_name||"Unknown source"} · {item.provider}</div>
        {item.relevance_score!=null&&<div className="scoreBar"><span style={{width:Math.max(0,Math.min(100,item.relevance_score))+"%"}}/><strong>{Math.round(item.relevance_score)}/100</strong></div>}
        {item.ai_summary&&<p className="intakeSummary">{item.ai_summary}</p>}
        {item.ai_angle&&<p className="intakeAngle"><strong>MARS angle:</strong> {item.ai_angle}</p>}
        <div className="intakeTags"><span>{item.desk||"Unsorted"}</span>{item.region&&<span>{item.region}</span>}{item.commodity&&<span>{item.commodity}</span>}</div>
        {Array.isArray(item.ai_verification_notes)&&item.ai_verification_notes.length>0&&<details className="verifyQuestions"><summary>What must be verified</summary><ul>{item.ai_verification_notes.map((q,i)=><li key={i}>{q}</li>)}</ul></details>}
        <div className="intakeCardActions">
          <a href={item.url} target="_blank" rel="noreferrer">Open source ↗</a>
          {item.status==="new"&&["admin","editor"].includes(role||"")&&<button disabled={Boolean(working)} onClick={()=>triage([item.id])}>{working==="triage:"+item.id?"Triaging…":"AI triage"}</button>}
          {!item.article_id&&item.status!=="dismissed"&&<button disabled={Boolean(working)} onClick={()=>draft(item)}>{working==="draft:"+item.id?"Creating…":"Create newsroom draft"}</button>}
          {item.article_id&&<Link href={"/studio/articles/new?id="+item.article_id}>Open draft →</Link>}
        </div>
      </article>)}
    </section>
  </main>;
}
