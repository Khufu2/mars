import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const briefing = String(body.briefing || "flagship").slice(0,64);
  const source = String(body.source || "unknown").slice(0,64);
  const website = String(body.website || "");
  if (website) return NextResponse.json({ ok:true, mode:"live" });
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: true, mode: "demo" }, { status: 202 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const now = new Date().toISOString();
  const { error } = await supabase.from("newsletter_subscribers").upsert({
    email,
    briefing,
    status:"active",
    source,
    consented_at:now,
    last_subscribed_at:now,
  }, { onConflict: "email,briefing" });

  if (error) {
    console.error("newsletter_subscribe_failed", error.message);
    return NextResponse.json({ error: "Subscription could not be saved." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, mode: "live" });
}
