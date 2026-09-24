"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { blankDraft, draftReadiness, editorialSections, storyTypes, type ComposerDraft } from "@/lib/editorial";
import { authedFetch, newsroomClient, newsroomToken } from "@/lib/studioClient";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0,90);
}

export default function NewArticlePage() {
  const [draft, setDraft] = useState<ComposerDraft>(blankDraft());
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const readiness = useMemo(() => draftReadiness(draft), [draft]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mars-composer-draft");
      if (saved) setDraft({ ...blankDraft(), ...JSON.parse(saved) });
    } catch {}
    newsroomToken().then(token => setSignedIn(Boolean(token)));
  }, []);

  function patch<K extends keyof ComposerDraft>(key: K, value: ComposerDraft[K]) {
    setDraft(current => {
      const next = { ...current, [key]: value };
      if (key === "title" && !current.id) next.slug = slugify(String(value));
      return next;
    });
  }

  function updateBlock(index: number, field: "eyebrow"|"title"|"body", value: string) {
    const blocks = draft.blocks.map((block, i) => {
      if (i !== index) return block;
      return field === "body" ? { ...block, body: value.split("\n\n") } : { ...block, [field]: value };
    });
    patch("blocks", blocks);
  }

  function saveLocal() {
    localStorage.setItem("mars-composer-draft", JSON.stringify(draft));
    setNotice("Saved in this browser.");
  }

  async function saveServer(): Promise<string | null> {
    if (!signedIn) { setNotice("Sign in to save to the newsroom database. Local save still works before Supabase is connected."); return null; }
    setWorking(true);
    const path = draft.id ? "/api/studio/articles/" + draft.id : "/api/studio/articles";
    const response = await authedFetch(path, { method: draft.id ? "PATCH" : "POST", body: JSON.stringify(draft) });
    const body = await response.json();
    setWorking(false);
    if (!response.ok) { setNotice(body.error || "Could not save draft."); return null; }
    const id = draft.id || body.article?.id;
    if (id && !draft.id) setDraft(current => ({ ...current, id }));
    localStorage.setItem("mars-composer-draft", JSON.stringify({ ...draft, id }));
    setNotice("Saved to MARS newsroom.");
    return id || null;
  }

  async function publish() {
    if (!readiness.ready) { setNotice("Before publishing, complete: " + readiness.missing.join(", ") + "."); return; }
    const id = await saveServer();
    if (!id) return;
    setWorking(true);
    const response = await authedFetch("/api/studio/articles/" + id + "/publish", {
      method:"POST",
      body:JSON.stringify({ scheduledAt: draft.scheduledAt || null }),
    });
    const body = await response.json();
    setWorking(false);
    if (!response.ok) { setNotice((body.error || "Could not publish.") + (body.missing ? " Missing: " + body.missing.join(", ") : "")); return; }
    localStorage.removeItem("mars-composer-draft");
    setNotice(body.status === "scheduled" ? "Scheduled successfully." : "Published. Opening story…");
    if (body.status === "published") setTimeout(() => { window.location.href = "/article/" + body.slug; }, 600);
  }

  async function uploadImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = await newsroomToken();
    if (!token) { setNotice("Sign in and connect Supabase before uploading media. You can use an external image URL for now."); return; }
    setWorking(true);
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/studio/upload", { method:"POST", headers:{authorization:"Bearer "+token}, body:form });
    const body = await response.json(); setWorking(false);
    if (!response.ok) { setNotice(body.error || "Upload failed."); return; }
    patch("featuredImageUrl", body.url); setNotice("Image uploaded.");
  }

  async function signOut() {
    await newsroomClient()?.auth.signOut();
    setSignedIn(false);
    setNotice("Signed out. Local drafting remains available.");
  }

  return (
    <main className="composerPage">
      <header className="composerHeader">
        <div><span className="miniLabel">MARS NEWSROOM / COMPOSER</span><h1>Write the story.</h1></div>
        <div className="composerStatus">
          <span className={signedIn ? "statusLive" : "statusLocal"}>{signedIn ? "Database connected" : "Local mode"}</span>
          {signedIn ? <button onClick={signOut}>Sign out</button> : <a href="/studio/login">Sign in</a>}
        </div>
      </header>

      <div className="composerLayout">
        <section className="composerForm">
          <div className="formSection">
            <div className="formSectionTitle"><span>01</span><h2>Story</h2></div>
            <label>Headline<input value={draft.title} onChange={e=>patch("title",e.target.value)} placeholder="A headline that says exactly what changed" /></label>
            <div className="twoCol">
              <label>Kicker<input value={draft.kicker} onChange={e=>patch("kicker",e.target.value)} placeholder="THE MOVE" /></label>
              <label>Slug<input value={draft.slug} onChange={e=>patch("slug",slugify(e.target.value))} /></label>
            </div>
            <label>Standfirst<textarea value={draft.dek} onChange={e=>patch("dek",e.target.value)} placeholder="What happened and why should a serious reader care?" /></label>
            <div className="fourCol">
              <label>Desk<select value={draft.section} onChange={e=>patch("section",e.target.value)}>{editorialSections.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Type<select value={draft.storyType} onChange={e=>patch("storyType",e.target.value)}>{storyTypes.map(x=><option key={x}>{x}</option>)}</select></label>
              <label>Region<input value={draft.region} onChange={e=>patch("region",e.target.value)} /></label>
              <label>Country<input value={draft.country} onChange={e=>patch("country",e.target.value)} /></label>
            </div>
            <label>Commodity / market<input value={draft.commodity} onChange={e=>patch("commodity",e.target.value)} placeholder="Sesame, Maize, Coffee…" /></label>
          </div>

          <div className="formSection">
            <div className="formSectionTitle"><span>02</span><h2>Analysis blocks</h2></div>
            {draft.blocks.map((block,index)=>(
              <div className="blockEditor" key={index}>
                <div className="twoCol">
                  <label>Label<input value={block.eyebrow} onChange={e=>updateBlock(index,"eyebrow",e.target.value)} /></label>
                  <label>Block headline<input value={block.title} onChange={e=>updateBlock(index,"title",e.target.value)} /></label>
                </div>
                <label>Paragraphs<textarea value={block.body.join("\n\n")} onChange={e=>updateBlock(index,"body",e.target.value)} placeholder="Separate paragraphs with a blank line." /></label>
              </div>
            ))}
          </div>

          <div className="formSection">
            <div className="formSectionTitle"><span>03</span><h2>Evidence</h2></div>
            <label>Sources<textarea className="sourceTextarea" value={draft.sources} onChange={e=>patch("sources",e.target.value)} placeholder={"One source per line.\nhttps://official-source.example/document | Primary announcement\nhttps://second-source.example/report | Corroborating data"} /></label>
            <p className="fieldHelp">Use primary documents whenever possible. You can add a note after <strong>|</strong>.</p>
            <div className="checkGrid">
              <label><input type="checkbox" checked={draft.checks.primarySource} onChange={e=>patch("checks",{...draft.checks,primarySource:e.target.checked})} /> Primary source opened</label>
              <label><input type="checkbox" checked={draft.checks.figuresChecked} onChange={e=>patch("checks",{...draft.checks,figuresChecked:e.target.checked})} /> Figures/date checked</label>
              <label><input type="checkbox" checked={draft.checks.imageRights} onChange={e=>patch("checks",{...draft.checks,imageRights:e.target.checked})} /> Image rights/credit checked</label>
              <label><input type="checkbox" checked={draft.checks.headlineSupported} onChange={e=>patch("checks",{...draft.checks,headlineSupported:e.target.checked})} /> Headline supported by evidence</label>
            </div>
          </div>

          <div className="formSection">
            <div className="formSectionTitle"><span>04</span><h2>Media & distribution</h2></div>
            <label>Featured image URL<input value={draft.featuredImageUrl} onChange={e=>patch("featuredImageUrl",e.target.value)} placeholder="https://…" /></label>
            <div className="uploadRow"><label className="fileButton">Upload to MARS<input type="file" accept="image/*" onChange={uploadImage} /></label><span>Activates with Supabase Storage.</span></div>
            <label>Image credit<input value={draft.imageCredit} onChange={e=>patch("imageCredit",e.target.value)} placeholder="Photographer / agency / source" /></label>
            <label>Social caption<textarea value={draft.socialCopy} onChange={e=>patch("socialCopy",e.target.value)} placeholder="Optional. If blank, MARS uses the standfirst." /></label>
            <label className="inlineCheck"><input type="checkbox" checked={draft.includeInBrief} onChange={e=>patch("includeInBrief",e.target.checked)} /> Add to MARS Brief queue after publication</label>
          </div>

          <div className="formSection">
            <div className="formSectionTitle"><span>05</span><h2>SEO & commercial</h2></div>
            <label>SEO title<input value={draft.metaTitle} maxLength={65} onChange={e=>patch("metaTitle",e.target.value)} placeholder={draft.title || "Search title"} /></label>
            <label>SEO description<textarea value={draft.metaDescription} maxLength={165} onChange={e=>patch("metaDescription",e.target.value)} placeholder="Search/social description" /></label>
            <div className="twoCol">
              <label>Sponsor name<input value={draft.sponsorName} onChange={e=>patch("sponsorName",e.target.value)} placeholder="Leave blank for editorial" /></label>
              <label>Disclosure<input value={draft.sponsorDisclosure} onChange={e=>patch("sponsorDisclosure",e.target.value)} placeholder="Presented by… / Sponsored by…" /></label>
            </div>
            <label>Schedule publication<input type="datetime-local" value={draft.scheduledAt} onChange={e=>patch("scheduledAt",e.target.value)} /></label>
          </div>

          <div className="composerActions">
            <button onClick={saveLocal} className="secondaryButton">Save in browser</button>
            <button onClick={saveServer} className="secondaryButton" disabled={working}>{working?"Working…":"Save newsroom draft"}</button>
            <button onClick={publish} className="primaryButton" disabled={working}>{draft.scheduledAt ? "Schedule story" : "Publish story"}</button>
          </div>
          {notice && <div className="composerNotice">{notice}</div>}
        </section>

        <aside className="composerPreview">
          <div className="previewSticky">
            <div className="readinessCard">
              <div className="readinessTop"><strong>{readiness.ready ? "Ready to publish" : "Not ready"}</strong><span>{readiness.sourceCount} source{readiness.sourceCount===1?"":"s"}</span></div>
              {!readiness.ready && <p>Missing: {readiness.missing.join(", ")}.</p>}
            </div>
            <article className="livePreview">
              <div className="storyLabel">{draft.section} / {draft.storyType}</div>
              <h2>{draft.title || "Your headline will appear here"}</h2>
              <p className="previewDek">{draft.dek || "Your standfirst will summarize the move and why it matters."}</p>
              {draft.featuredImageUrl && <img src={draft.featuredImageUrl} alt="" />}
              {draft.blocks.filter(block=>block.title).map((block,index)=><section key={index}><span>{block.eyebrow}</span><h3>{block.title}</h3><p>{block.body.filter(Boolean)[0]}</p></section>)}
              {draft.sponsorName && <div className="sponsorPreview">{draft.sponsorDisclosure || "Sponsored"} · {draft.sponsorName}</div>}
            </article>
          </div>
        </aside>
      </div>
    </main>
  );
}
