import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    product: "MARS",
    mode: process.env.NEXT_PUBLIC_SUPABASE_URL ? "supabase-ready" : "pre-supabase",
    features: {
      publicPublication: true,
      liveDiscovery: true,
      socialCardRenderer: true,
      persistentNewsroom: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    },
    timestamp: new Date().toISOString(),
  });
}
