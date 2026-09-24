"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authedFetch, newsroomClient, newsroomToken } from "@/lib/studioClient";

type QueueItem = {
  id:string; slug:string; title:string; dek?:string; section:string; status:string; story_type?:string;
  updated_at?:string; published_at?:string; scheduled_at?:string;
};

export default function StudioPage() {
  const [items,setItems] = useState<QueueItem[]>([]);
  const [signedIn,setSignedIn] = useState(false);
  const [mode,setMode] = useState<"loading"|"local"|"live">("loading");
  const [notice,setNotice] = useState("");

  useEffect(()=>{
    (async()=>{
      const token = await newsroomToken();
      setSignedIn(Boolean(token));
      if (!token) { setMode("local"); return; }
      const response = await authedFetch("/api/studio/articles");
      const body = await response.json();
      if (response.ok && body.mode === "live") { setItems(body.items || []); setMode("live"); }
      else { setMode("local"); setNotice(body.error || "Newsroom database is not connected yet."); }
    })();
  },[]);

  async function signOut(){
    await newsroomClient()?.auth.signOut();
    setSignedIn(false); setMode("local"); setItems([]); setNotice("Signed out.");
  }

  const counts = {
    drafts: items.filter(x=>x.status==="draft").length,
    review: items.filter(x=>x.status==="review").length,
    scheduled: items.filter(x=>x.status==="scheduled").length,
    published: items.filter(x=>x.status==="published").length,
  };

  return (
    <main className="studioPage">
      <header className="studioHeader">
        <div><span className="miniLabel">MARS NEWSROOM</span><h1>Editorial cockpit.</h1></div>
        <div className="studioHeaderActions">
          <span className={"demoBadge " + (mode==="live"?"liveBadge":"")}>{mode==="live"?"LIVE DATABASE":"PRE-SUPABASE"}</span>
          {signedIn ? <button onClick={signOut} className="textButton">Sign out</button> : <Link href="/studio/login">Sign in</Link>}
        </div>
      </header>

      <section className="workflowGrid">
        <Link className="workflowCard discovery" href="/studio/discover"><span>01</span><strong>Discover</strong><p>Find live leads across agriculture, trade, climate and logistics.</p></Link>
        <div className="workflowArrow">→</div>
        <Link className="workflowCard verify" href="/sources"><span>02</span><strong>Verify</strong><p>Trace claims to primary documents, official data and attributable reporting.</p></Link>
        <div className="workflowArrow">→</div>
        <Link className="workflowCard draft" href="/studio/articles/new"><span>03</span><strong>Write</strong><p>Compose structured MARS analysis with evidence, SEO and publication checks.</p></Link>
        <div className="workflowArrow">→</div>
        <Link className="workflowCard social" href="/studio/social"><span>04</span><strong>Package</strong><p>Generate social carousels and distribution copy from the finished story.</p></Link>
      </section>

      <section className="newsroomStats">
        <div><span>Drafts</span><strong>{counts.drafts}</strong></div>
        <div><span>In review</span><strong>{counts.review}</strong></div>
        <div><span>Scheduled</span><strong>{counts.scheduled}</strong></div>
        <div><span>Published</span><strong>{counts.published}</strong></div>
      </section>

      <section className="newsroomToolbar">
        <div>
          <span className="miniLabel">STORY QUEUE</span>
          <h2>{mode==="live" ? "Your newsroom" : "Ready for tomorrow's database"}</h2>
        </div>
        <div className="toolbarActions">
          <Link href="/studio/discover" className="secondaryButton">Discover leads</Link>
          <Link href="/studio/articles/new" className="primaryButton">New story</Link>
        </div>
      </section>

      {notice && <div className="composerNotice">{notice}</div>}

      {mode==="live" ? (
        <div className="queueTable">
          <div className="queueHead"><span>Story</span><span>Desk</span><span>Status</span><span>Updated</span></div>
          {items.length===0 ? <div className="queueEmpty"><h3>No newsroom stories yet.</h3><p>Create the first MARS article and it will appear here.</p></div> :
            items.map(item=>(
              <div className="queueRow" key={item.id}>
                <div><Link href={"/studio/articles/new?id=" + item.id}><strong>{item.title}</strong></Link><small>{item.story_type || "Story"} · /{item.slug}</small></div>
                <span>{item.section}</span>
                <span className={"statusPill status-"+item.status}>{item.status}</span>
                <span>{item.updated_at ? new Date(item.updated_at).toLocaleString() : "—"}</span>
              </div>
            ))}
        </div>
      ) : (
        <div className="preSupabaseReadiness">
          <div className="readinessIntro">
            <span className="miniLabel">WHAT IS ALREADY WIRED</span>
            <h2>Connect Supabase and the newsroom switches from local prototype to persistent publishing.</h2>
          </div>
          <div className="readinessList">
            <div><strong>Authentication</strong><p>Email/password newsroom accounts, roles and first-admin bootstrap.</p></div>
            <div><strong>Publishing</strong><p>Draft → review-ready checks → publish now or schedule.</p></div>
            <div><strong>Evidence</strong><p>Source URLs, verification state and article-source relationships.</p></div>
            <div><strong>Media</strong><p>Public article-media bucket and image upload endpoint.</p></div>
            <div><strong>Distribution</strong><p>Social queue + newsletter queue created automatically on publication.</p></div>
            <div><strong>Audit trail</strong><p>Revisions and publication events stored for every newsroom action.</p></div>
          </div>
        </div>
      )}
    </main>
  );
}
