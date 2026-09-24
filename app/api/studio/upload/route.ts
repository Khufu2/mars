import { NextResponse } from "next/server";
import { apiError, requireEditor } from "@/lib/studioServer";

export async function POST(request: Request) {
  try {
    const session = await requireEditor(request);
    if (session.mode === "pre-supabase") return NextResponse.json({ error: "Connect Supabase before uploading media." }, { status: 503 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images are supported." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });

    const ext = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const path = new Date().toISOString().slice(0,10) + "/" + crypto.randomUUID() + "." + ext;
    const bytes = await file.arrayBuffer();
    const { error } = await session.client!.storage.from("article-media").upload(path, bytes, { contentType: file.type, upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    const { data } = session.client!.storage.from("article-media").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (error) { const out = apiError(error); return NextResponse.json(out.body, { status: out.status }); }
}
