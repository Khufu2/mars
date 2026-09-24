import { NextResponse } from "next/server";
import { requireEditor, serviceClient } from "@/lib/studioServer";

export async function POST(request: Request) {
  const client = serviceClient();
  if (!client) return NextResponse.json({ mode: "pre-supabase" }, { status: 202 });

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const { data: authData, error } = await client.auth.getUser(token);
  if (error || !authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const displayName = authData.user.user_metadata?.display_name || authData.user.email?.split("@")[0] || "MARS Editor";
  const { data: ownProfile } = await client.from("profiles").select("id,role").eq("id", authData.user.id).maybeSingle();
  if (!ownProfile) await client.from("profiles").insert({ id:authData.user.id, display_name:displayName, role:"author" });

  const { count } = await client.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
  if ((count || 0) === 0) {
    await client.from("profiles").update({ role:"admin", display_name:displayName, updated_at:new Date().toISOString() }).eq("id", authData.user.id);
  }

  try {
    const session = await requireEditor(request);
    return NextResponse.json({ ok: true, role: session.profile?.role, displayName: session.profile?.display_name });
  } catch {
    return NextResponse.json({ error: "Newsroom profile is not ready." }, { status: 403 });
  }
}
