"use client";

import { createBrowserClient } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Supabase client: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing",
  );
}

export type SupabaseBrowserClient = SupabaseClient;

/**
 * Клиент для браузера (owner flow: логин, личный кабинет).
 * Сессия хранится в cookies и синхронизируется с middleware.
 */
export function createSupabaseBrowserClient(): SupabaseBrowserClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
