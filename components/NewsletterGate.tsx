"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function storedNumber(key: string) {
  try { return Number(localStorage.getItem(key) || "0"); } catch { return 0; }
}

export function NewsletterGate() {
  const pathname = usePathname();
  const [open,setOpen] = useState(false);
  const [state,setState] = useState<"idle"|"loading"|"done"|"error">("idle");
  const [message,setMessage] = useState("");

  useEffect(() => {
    if (pathname.startsWith("/studio")) return;
    const now = Date.now();
    const subscribedUntil = storedNumber("mars_brief_subscribed_until");
    const dismissedUntil = storedNumber("mars_brief_dismissed_until");
    if (subscribedUntil > now || dismissedUntil > now) return;

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      setOpen(true);
      try { localStorage.setItem("mars_brief_last_seen", String(Date.now())); } catch {}
    };

    const timer = window.setTimeout(show, 16000);
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      if (window.scrollY / max >= .42) show();
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", onScroll); };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(3); };
    window.addEventListener("keydown",onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown",onKey); };
  }, [open]);

  function dismiss(days = 3) {
    try { localStorage.setItem("mars_brief_dismissed_until", String(Date.now() + days * DAY)); } catch {}
    setOpen(false);
  }

  function markAlreadySubscribed() {
    try { localStorage.setItem("mars_brief_subscribed_until", String(Date.now() + 180 * DAY)); } catch {}
    setOpen(false);
  }

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");
    const website = String(form.get("website") || "");
    try {
      const response = await fetch("/api/newsletter", {
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({ email, briefing:"flagship", source:"newsletter_gate", website }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not subscribe.");
      if (body.mode === "live") {
        try { localStorage.setItem("mars_brief_subscribed_until", String(Date.now() + 180 * DAY)); } catch {}
        setState("done");
        setMessage("You're on the MARS Brief.");
        window.setTimeout(()=>setOpen(false),900);
      } else {
        setState("done");
        setMessage("Signup is ready. Supabase will persist it once connected.");
        try { localStorage.setItem("mars_brief_dismissed_until", String(Date.now() + DAY)); } catch {}
      }
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not subscribe.");
    }
  }

  if (!open) return null;

  return (
    <div className="newsletterGateBackdrop" role="presentation" onMouseDown={e=>{ if (e.currentTarget===e.target) dismiss(3); }}>
      <section className="newsletterGate" role="dialog" aria-modal="true" aria-labelledby="mars-brief-title">
        <button className="newsletterGateClose" aria-label="Close newsletter signup" onClick={()=>dismiss(3)}>×</button>
        <div className="newsletterGateRule" />
        <div className="newsletterGateHeading">
          <div>
            <span className="miniLabel">THE MARS BRIEF</span>
            <h2 id="mars-brief-title">Sign up for MARS Africa.</h2>
          </div>
          <div className="gateOrb" aria-hidden="true">✺</div>
        </div>
        <p className="newsletterGateDek">The crucial stories moving Africa&apos;s food economy — agriculture, commodities, climate, logistics and trade. Three sharp briefings per week.</p>

        <form className="newsletterGateForm" onSubmit={subscribe}>
          <input className="newsletterHoney" tabIndex={-1} autoComplete="off" name="website" aria-hidden="true" />
          <label htmlFor="gate-email">Email address</label>
          <div className="newsletterGateInput">
            <span aria-hidden="true">✉</span>
            <input id="gate-email" name="email" type="email" required placeholder="Your email address" autoComplete="email" />
          </div>
          <button className="newsletterGateSubmit" disabled={state==="loading"}>{state==="loading"?"Joining…":"Sign up for free"}</button>
        </form>

        {message && <p className={"newsletterGateMessage " + state}>{message}</p>}
        <button className="newsletterGateExisting" onClick={markAlreadySubscribed}>Already subscribed? Don&apos;t show this again.</button>
        <button className="newsletterGateBack" onClick={()=>dismiss(3)}>Take me back to the story ↓</button>
      </section>
    </div>
  );
}
