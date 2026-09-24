"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function newsroomClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export async function newsroomToken() {
  const supabase = newsroomClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export async function authedFetch(input: string, init: RequestInit = {}) {
  const token = await newsroomToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("authorization", "Bearer " + token);
  if (!headers.has("content-type") && init.body && !(init.body instanceof FormData)) headers.set("content-type", "application/json");
  return fetch(input, { ...init, headers });
}
