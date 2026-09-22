"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, briefing: "flagship" })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Unable to subscribe");
      setMessage(body.mode === "demo" ? "Saved in demo mode. Connect Supabase to persist subscribers." : "You're on the list.");
      setState("done");
      e.currentTarget.reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to subscribe");
      setState("error");
    }
  }

  return (
    <form className="newsletterForm" onSubmit={submit}>
      <label htmlFor="brief-email">Email address</label>
      <div className="newsletterRow">
        <input id="brief-email" name="email" type="email" placeholder="you@company.com" required />
        <button disabled={state === "loading"}>{state === "loading" ? "Joining…" : "Sign up free"}</button>
      </div>
      {message && <p className={"formMessage " + state}>{message}</p>}
    </form>
  );
}
