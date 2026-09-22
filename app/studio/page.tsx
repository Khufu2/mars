"use client";

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
    setNotice("Draft saved locally. Connect Supabase to turn this into the multi-user newsroom.");
    e.currentTarget.reset();
  }

  return (
    <main className="studioPage">
      <header className="studioHeader"><div><span className="miniLabel">MARS NEWSROOM</span><h1>Editorial cockpit</h1></div><span className="demoBadge">LOCAL PROTOTYPE</span></header>
      <div className="studioGrid">
        <form className="editorCard" onSubmit={save}>
          <h2>New story</h2>
          <label>Headline<input name="title" required placeholder="What happened?" /></label>
          <label>Desk<select name="section"><option>Markets</option><option>Climate</option><option>Trade</option><option>Logistics</option><option>Policy</option><option>Finance</option></select></label>
          <label>Standfirst<textarea name="dek" required placeholder="Why should a serious reader care?" /></label>
          <button>Save draft</button>
          {notice && <p className="formMessage done">{notice}</p>}
        </form>
        <div className="draftList">
          <div className="draftListHead"><h2>Draft queue</h2><span>{drafts.length}</span></div>
          {drafts.length === 0 ? <p className="emptyCopy">No local drafts yet.</p> : drafts.map((draft, index) => (
            <article key={draft.savedAt + index}><span>{draft.section}</span><h3>{draft.title}</h3><p>{draft.dek}</p><small>{new Date(draft.savedAt).toLocaleString()}</small></article>
          ))}
        </div>
      </div>
    </main>
  );
}
