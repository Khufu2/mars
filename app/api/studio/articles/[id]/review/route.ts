import { NextResponse } from "next/server";
import { apiError, requireEditor } from "@/lib/studioServer";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireEditor(request);
    if (session.mode === "pre-supabase") return NextResponse.json({ error:"Supabase is not connected." }, { status:503 });

    const { data:article, error } = await session.client!.from("articles")
      .select("id,status,created_by,title")
      .eq("id",params.id).single();
    if (error || !article) return NextResponse.json({ error:"Story not found." }, { status:404 });

    const elevated = ["admin","editor"].includes(session.profile?.role || "");
    if (!elevated && article.created_by !== session.user!.id) {
      return NextResponse.json({ error:"You can only submit your own stories for review." }, { status:403 });
    }
    if (article.status === "published" || article.status === "archived") {
      return NextResponse.json({ error:"This story cannot be submitted for review in its current state." }, { status:409 });
    }

    await session.client!.from("articles").update({ status:"review", updated_at:new Date().toISOString() }).eq("id",params.id);
    await session.client!.from("publication_events").insert({
      article_id:params.id, actor_id:session.user!.id, event_type:"submitted_for_review"
    });
    return NextResponse.json({ ok:true, status:"review" });
  } catch (error) {
    const out=apiError(error); return NextResponse.json(out.body,{status:out.status});
  }
}
