'use server';

import { cookies, headers } from "next/headers";

import {
  createSupabaseAnonServerClient,
  createSupabaseServiceRoleClient,
  type PublicPetProfile,
} from "@/lib/supabase/server";

export type FoundFormState = {
  status: "idle" | "submitting" | "success" | "error";
  error?: string;
};

const MAX_MESSAGE_LENGTH = 1000;

// Простая защита от частых отправок: не чаще одного раза в 60 секунд с одного браузера.
const RATE_LIMIT_COOKIE = "finder_last_alert_at";
const RATE_LIMIT_WINDOW_MS = 60_000;

async function getPetByPublicId(
  publicId: string,
): Promise<PublicPetProfile | null> {
  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("public_pet_profiles")
    .select(
      "public_id, name, age_years, breed, photo_path, notes, is_active",
    )
    .eq("public_id", publicId)
    .maybeSingle();

  if (error) {
    console.error("[found-action] Failed to load pet profile", error);
    return null;
  }

  return data;
}

export async function submitFoundForm(
  _prevState: FoundFormState,
  formData: FormData,
): Promise<FoundFormState> {
  const publicId = String(formData.get("publicId") ?? "").trim();
  const finderMessage = String(formData.get("finder_message") ?? "").trim();
  const finderPhone = String(formData.get("finder_phone") ?? "").trim();
  const finderLocationUrl = String(
    formData.get("finder_location_url") ?? "",
  ).trim();

  if (!publicId) {
    return {
      status: "error",
      error: "Missing tag identifier.",
    };
  }

  if (!finderMessage) {
    return {
      status: "error",
      error: "Please enter a short message for the pet's owner.",
    };
  }

  if (finderMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      status: "error",
      error: "Your message is a bit too long. Please shorten it.",
    };
  }

  // Best-effort rate limiting по cookie.
  const cookieStore = await cookies();
  const lastAlertCookie = cookieStore.get(RATE_LIMIT_COOKIE);
  const now = Date.now();

  if (lastAlertCookie) {
    const last = Number.parseInt(lastAlertCookie.value, 10);
    if (!Number.isNaN(last) && now - last < RATE_LIMIT_WINDOW_MS) {
      return {
        status: "error",
        error:
          "You recently sent an alert. Please wait a minute before sending another.",
      };
    }
  }

  const pet = await getPetByPublicId(publicId);

  if (!pet) {
    return {
      status: "error",
      error: "This tag is not active or not found.",
    };
  }

  if (!pet.is_active) {
    return {
      status: "error",
      error: "This tag is currently inactive.",
    };
  }

  // Ищем фактический pet_id через сервисный клиент (обходит RLS, но мы уже проверили условия).
  const serviceClient = createSupabaseServiceRoleClient();

  const { data: petRow, error: petRowError } = await serviceClient
    .from("pets")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();

  if (petRowError || !petRow) {
    console.error("[found-action] Failed to resolve pet_id", petRowError);
    return {
      status: "error",
      error: "Something went wrong. Please try again in a moment.",
    };
  }

  const userAgent = (await headers()).get("user-agent");

  const { error: insertError } = await serviceClient.from("alerts").insert({
    pet_id: petRow.id,
    public_id: publicId,
    finder_message: finderMessage,
    finder_phone: finderPhone || null,
    finder_location_url: finderLocationUrl || null,
    user_agent: userAgent,
  });

  if (insertError) {
    console.error("[found-action] Failed to insert alert", insertError);
    return {
      status: "error",
      error:
        "We couldn't send your alert right now. Please try again in a minute.",
    };
  }

  // Обновляем cookie для rate limiting.
  cookieStore.set(RATE_LIMIT_COOKIE, String(now), {
    httpOnly: true,
    path: "/",
    maxAge: 5 * 60, // 5 минут
    sameSite: "lax",
    secure: true,
  });

  return {
    status: "success",
  };
}

