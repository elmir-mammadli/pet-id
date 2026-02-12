import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  // Явная ошибка конфигурации на сервере
  throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL for Supabase client");
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing env NEXT_PUBLIC_SUPABASE_ANON_KEY for Supabase client",
  );
}

/**
 * Базовый тип публичного профиля питомца из представления public_pet_profiles.
 * Дублируем здесь, чтобы иметь строгую типизацию в UI.
 */
export type PublicPetProfile = {
  public_id: string;
  name: string;
  age_years: number | null;
  breed: string | null;
  photo_path: string | null;
  notes: string | null;
  is_active: boolean;
};

type SupabaseServerClient = SupabaseClient;

/**
 * Клиент для сервера с сессией пользователя (cookies).
 * Используй в Server Components и Server Actions для owner flow — RLS видит auth.uid().
 */
export async function createSupabaseServerClient(): Promise<SupabaseServerClient> {
  const cookieStore = await cookies();

  return createSSRServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Вызвано из Server Component — middleware обновит сессию при следующем запросе
        }
      },
    },
  });
}

/**
 * Клиент с анонимным ключом — уважает RLS.
 * Используем для публичного чтения (view public_pet_profiles).
 */
export function createSupabaseAnonServerClient(): SupabaseServerClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Клиент c service-role ключом — используется ТОЛЬКО на сервере в доверенном коде,
 * например, в server actions для вставки алертов.
 *
 * ВАЖНО: env SUPABASE_SERVICE_ROLE_KEY не должен быть доступен на клиенте.
 */
export function createSupabaseServiceRoleClient(): SupabaseServerClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY for Supabase");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
}

