import { createClient } from "@supabase/supabase-js";

export function studioConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function serviceClient() {
  if (!studioConfigured()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function requireEditor(request: Request) {
  const client = serviceClient();
  if (!client) return { mode: "pre-supabase" as const, client: null, user: null, profile: null };

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new Error("UNAUTHORIZED");

  const { data: authData, error: authError } = await client.auth.getUser(token);
  if (authError || !authData.user) throw new Error("UNAUTHORIZED");

  const { data: profile } = await client.from("profiles").select("id,role,display_name").eq("id", authData.user.id).maybeSingle();
  if (!profile || !["admin", "editor", "author"].includes(profile.role)) throw new Error("FORBIDDEN");

  return { mode: "live" as const, client, user: authData.user, profile };
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return { status: 401, body: { error: "Sign in to the MARS newsroom." } };
  if (message === "FORBIDDEN") return { status: 403, body: { error: "Your newsroom role cannot perform this action." } };
  return { status: 500, body: { error: "Newsroom operation failed." } };
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

export function parseSourceLines(value: unknown) {
  const lines = Array.isArray(value) ? value.map(String) : String(value || "").split("\n");
  return lines
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [urlPart, ...noteParts] = line.split("|");
      return { url: urlPart.trim(), note: noteParts.join("|").trim() || null };
    })
    .filter(item => /^https?:\/\//i.test(item.url));
}


export async function ensureAuthor(client: any, user: any, profile: any) {
  const { data: existing } = await client.from("authors").select("id").eq("user_id", user.id).maybeSingle();
  if (existing?.id) return existing.id;
  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "MARS Editor";
  const authorSlug = slugify(displayName) + "-" + user.id.slice(0,6);
  const { data: created, error } = await client.from("authors").insert({
    user_id: user.id,
    name: displayName,
    slug: authorSlug,
  }).select("id").single();
  if (error) throw error;
  return created.id;
}
