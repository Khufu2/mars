import { NextResponse } from "next/server";
import { apiError, requireEditor } from "@/lib/studioServer";

export async function GET(request: Request) {
  try {
    const session = await requireEditor(request);
    if (session.mode === "pre-supabase") {
      return NextResponse.json({ mode:"pre-supabase", role:null, displayName:null });
    }
    return NextResponse.json({
      mode:"live",
      role:session.profile?.role || null,
      displayName:session.profile?.display_name || null,
      email:session.user?.email || null,
    });
  } catch (error) {
    const out = apiError(error);
    return NextResponse.json(out.body, { status: out.status });
  }
}
