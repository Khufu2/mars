"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm({ source = "inline" }: { source?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const website = String(form.get("website") || "");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, briefing: "flagship", source, website })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Unable to subscribe");
      setMessage(body.mode === "demo" ? "Signup is ready. Connect Supabase to persist subscribers." : "You're on the list.");
      setState("done");
      e.currentTarget.reset();
      if (body.mode === "live") {
        try { localStorage.setItem("mars_brief_subscribed_until", String(Date.now() + 180 * 24 * 60 * 60 * 1000)); } catch {}
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to subscribe");
      setState("error");
    }
  }

  return (
    <form className="newsletterForm" onSubmit={submit}>
      <input className="newsletterHoney" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
      <label htmlFor={"brief-email-" + source}>Email address</label>
      <div className="newsletterRow">
        <input id={"brief-email-" + source} name="email" type="email" placeholder="you@company.com" required autoComplete="email" />
        <button disabled={state === "loading"}>{state === "loading" ? "Joining…" : "Sign up free"}</button>
      </div>
      {message && <p className={"formMessage " + state}>{message}</p>}
    </form>
  );
}
