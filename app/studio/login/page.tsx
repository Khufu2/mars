"use client";

import { FormEvent, useEffect, useState } from "react";
import { newsroomClient, newsroomToken } from "@/lib/studioClient";

export default function NewsroomLogin() {
  const [mode, setMode] = useState<"signin"|"signup">("signin");
  const [message, setMessage] = useState("");
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    newsroomToken().then(token => { if (token) window.location.href = "/studio"; });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = newsroomClient();
    if (!supabase) { setMessage("Supabase is not connected yet. The newsroom is currently running in local prototype mode."); return; }

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    const displayName = String(data.get("displayName") || "");

    setMessage("Working…");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName || email.split("@")[0] } } });

    if (result.error) { setMessage(result.error.message); return; }
    const token = result.data.session?.access_token;
    if (!token) { setMessage("Account created. Confirm your email if Supabase email confirmation is enabled, then sign in."); return; }

    const bootstrap = await fetch("/api/studio/bootstrap", { method:"POST", headers:{ authorization:"Bearer " + token } });
    const body = await bootstrap.json();
    if (!bootstrap.ok) { setMessage(body.error || "Could not initialize newsroom access."); return; }
    window.location.href = "/studio";
  }

  return (
    <main className="loginPage">
      <section className="loginEditorial">
        <span className="miniLabel">MARS NEWSROOM</span>
        <h1>Publish with evidence.</h1>
        <p>Discovery, verification, structured analysis, social packaging and publication from one desk.</p>
        <div className="loginSteps"><span>Discover</span><span>Verify</span><span>Write</span><span>Publish</span></div>
      </section>
      <form className="loginCard" onSubmit={submit}>
        <div className="loginSwitch"><button type="button" className={mode==="signin"?"active":""} onClick={()=>setMode("signin")}>Sign in</button><button type="button" className={mode==="signup"?"active":""} onClick={()=>setMode("signup")}>Create account</button></div>
        {!configured && <div className="preSupabaseBanner">Supabase not connected yet. This form activates automatically once the three Supabase env vars are added.</div>}
        {mode === "signup" && <label>Name<input name="displayName" placeholder="Editor name" /></label>}
        <label>Email<input type="email" name="email" required placeholder="editor@mars.africa" /></label>
        <label>Password<input type="password" name="password" required minLength={8} placeholder="••••••••" /></label>
        <button className="primaryButton">{mode === "signin" ? "Enter newsroom" : "Create newsroom account"}</button>
        {message && <p className="formMessage">{message}</p>}
      </form>
    </main>
  );
}
