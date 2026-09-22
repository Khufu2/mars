import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const briefing = String(body.briefing || "flagship");
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: true, mode: "demo" }, { status: 202 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("newsletter_subscribers").upsert({ email, briefing, status: "active" }, { onConflict: "email,briefing" });
  if (error) return NextResponse.json({ error: "Subscription could not be saved." }, { status: 500 });
  return NextResponse.json({ ok: true, mode: "live" });
}
