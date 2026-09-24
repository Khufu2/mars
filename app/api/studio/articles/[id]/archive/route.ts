import { NextResponse } from "next/server";
import { apiError, requireEditor } from "@/lib/studioServer";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireEditor(request);
    if (session.mode === "pre-supabase") return NextResponse.json({ error:"Supabase is not connected." }, { status:503 });
    if (!["admin","editor"].includes(session.profile?.role || "")) {
      return NextResponse.json({ error:"Only editors can archive stories." }, { status:403 });
    }

    const { data:article, error } = await session.client!.from("articles")
      .select("id,status,slug").eq("id",params.id).single();
    if (error || !article) return NextResponse.json({ error:"Story not found." }, { status:404 });

    await session.client!.from("articles").update({ status:"archived", updated_at:new Date().toISOString() }).eq("id",params.id);
    await session.client!.from("publication_events").insert({
      article_id:params.id, actor_id:session.user!.id, event_type:"archived",
      payload:{ previous_status:article.status }
    });
    return NextResponse.json({ ok:true, status:"archived", slug:article.slug });
  } catch (error) {
    const out=apiError(error); return NextResponse.json(out.body,{status:out.status});
  }
}
