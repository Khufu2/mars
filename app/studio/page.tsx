"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Draft = { title: string; section: string; dek: string; savedAt: string };

export default function StudioPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { setDrafts(JSON.parse(localStorage.getItem("mars-drafts") || "[]")); } catch {}
  }, []);

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const draft: Draft = {
      title: String(data.get("title") || ""),
      section: String(data.get("section") || "Markets"),
      dek: String(data.get("dek") || ""),
      savedAt: new Date().toISOString()
    };
    const next = [draft, ...drafts];
    localStorage.setItem("mars-drafts", JSON.stringify(next));
    setDrafts(next);
    setNotice("Draft saved in this browser. Supabase will make the newsroom persistent and multi-user.");
    e.currentTarget.reset();
  }

  return (
    <main className="studioPage">
      <header className="studioHeader">
        <div><span className="miniLabel">MARS NEWSROOM</span><h1>Editorial cockpit.</h1></div>
        <span className="demoBadge">PRE-SUPABASE</span>
      </header>

      <section className="workflowGrid">
        <Link className="workflowCard discovery" href="/studio/discover"><span>01</span><strong>Discover</strong><p>Search live news leads across agriculture, trade, climate and logistics.</p></Link>
        <div className="workflowArrow">→</div>
        <div className="workflowCard verify"><span>02</span><strong>Verify</strong><p>Open primary sources and corroborate figures before a MARS draft becomes reporting.</p></div>
        <div className="workflowArrow">→</div>
        <div className="workflowCard draft"><span>03</span><strong>Draft</strong><p>Structure the story around what happened, why it matters, numbers and what to watch.</p></div>
        <div className="workflowArrow">→</div>
        <Link className="workflowCard social" href="/studio/social"><span>04</span><strong>Package</strong><p>Generate a six-slide 1080 × 1350 social carousel from the story.</p></Link>
      </section>

      <div className="studioGrid">
        <form className="editorCard" onSubmit={save}>
          <div className="draftListHead"><h2>New story</h2><Link href="/studio/discover">Find leads →</Link></div>
          <label>Headline<input name="title" required placeholder="What happened?" /></label>
          <label>Desk<select name="section"><option>Markets</option><option>Climate</option><option>Trade</option><option>Logistics</option><option>Policy</option><option>Finance</option></select></label>
          <label>Standfirst<textarea name="dek" required placeholder="Why should a serious reader care?" /></label>
          <button>Save local draft</button>
          {notice && <p className="formMessage done">{notice}</p>}
        </form>
        <div className="draftList">
          <div className="draftListHead"><h2>Draft queue</h2><span>{drafts.length}</span></div>
          {drafts.length === 0 ? <div className="emptyCopy"><p>No local drafts yet.</p><p>Use <strong>Discover</strong> to find a lead, verify it, then draft the MARS angle here.</p></div> : drafts.map((draft, index) => (
            <article key={draft.savedAt + index}><span>{draft.section}</span><h3>{draft.title}</h3><p>{draft.dek}</p><small>{new Date(draft.savedAt).toLocaleString()}</small></article>
          ))}
        </div>
      </div>
    </main>
  );
}
