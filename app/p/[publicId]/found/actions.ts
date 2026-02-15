'use server';

import { createHash, randomUUID } from "crypto";
import { cookies, headers } from "next/headers";

import {
  createSupabaseAnonServerClient,
  createSupabaseServiceRoleClient,
  type PublicPetProfile,
} from "@/lib/supabase/server";

export type FoundFormState = {
  status: "idle" | "submitting" | "success" | "error";
  error?: string;
  /** When owner has phone: open dialer. */
  telLink?: string | null;
  /** When owner has phone: open SMS app with pre-filled message. */
  smsLink?: string | null;
};

const MAX_MESSAGE_LENGTH = 1000;
const MIN_MESSAGE_LENGTH = 8;
const MAX_LINKS_IN_MESSAGE = 2;

// Browser-level cooldown.
const RATE_LIMIT_COOKIE = "finder_last_alert_at";
const RATE_LIMIT_WINDOW_MS = 120_000;
const FINDER_ID_COOKIE = "finder_id";

// In-process abuse controls (best effort; complements cookie + DB checks).
const MEMORY_WINDOW_MS = 10 * 60_000;
const MEMORY_LIMIT_PER_FINGERPRINT = 8;
const MEMORY_LIMIT_PER_FINGERPRINT_TAG = 4;
const MEMORY_LIMIT_PER_TAG = 30;
const hitMap = new Map<string, number[]>();

function hashValue(input: string) {
  return createHash("sha256").update(input).digest("hex").slice(0, 24);
}

function cleanHits(now: number) {
  for (const [key, hits] of hitMap.entries()) {
    const filtered = hits.filter((ts) => now - ts <= MEMORY_WINDOW_MS);
    if (filtered.length === 0) {
      hitMap.delete(key);
      continue;
    }
    hitMap.set(key, filtered);
  }
}

function consumeHit(key: string, now: number, limit: number): boolean {
  const existing = hitMap.get(key) ?? [];
  const recent = existing.filter((ts) => now - ts <= MEMORY_WINDOW_MS);
  if (recent.length >= limit) {
    hitMap.set(key, recent);
    return false;
  }
  recent.push(now);
  hitMap.set(key, recent);
  return true;
}

function normalizeMessage(message: string): string {
  return message.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function getClientIp(headerStore: Headers): string {
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return headerStore.get("x-real-ip") ?? "unknown";
}

function isValidLocationUrl(urlValue: string): boolean {
  if (!urlValue) return true;
  try {
    const url = new URL(urlValue);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return (
      host.includes("google.com") ||
      host.includes("maps.app.goo.gl") ||
      host.includes("maps.google")
    );
  } catch {
    return false;
  }
}

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
  const honeypot = String(formData.get("website") ?? "").trim();
  const renderedAtRaw = String(formData.get("form_rendered_at") ?? "").trim();
  const finderLocationUrl = String(
    formData.get("finder_location_url") ?? "",
  ).trim();

  // Honeypot trap for simple bots.
  if (honeypot) {
    return { status: "success", telLink: null, smsLink: null };
  }

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
  if (finderMessage.length < MIN_MESSAGE_LENGTH) {
    return {
      status: "error",
      error: "Please add a bit more detail so the owner can help quickly.",
    };
  }

  if (finderMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      status: "error",
      error: "Your message is a bit too long. Please shorten it.",
    };
  }
  if ((finderMessage.match(/https?:\/\//gi)?.length ?? 0) > MAX_LINKS_IN_MESSAGE) {
    return {
      status: "error",
      error: "Please avoid adding multiple links in the message.",
    };
  }
  if (/(.)\1{9,}/.test(finderMessage)) {
    return {
      status: "error",
      error: "Your message looks invalid. Please edit and try again.",
    };
  }
  if (!isValidLocationUrl(finderLocationUrl)) {
    return {
      status: "error",
      error: "Please share a valid location link.",
    };
  }

  const normalizedFinderPhone = normalizePhone(finderPhone);
  if (
    normalizedFinderPhone &&
    (normalizedFinderPhone.length < 7 || normalizedFinderPhone.length > 15)
  ) {
    return {
      status: "error",
      error: "Please enter a valid phone number or leave it blank.",
    };
  }

  // Detect unrealistically fast submissions (basic bot signal).
  const now = Date.now();
  const renderedAt = Number.parseInt(renderedAtRaw, 10);
  if (!Number.isNaN(renderedAt) && now - renderedAt < 800) {
    return {
      status: "error",
      error: "Please review your message and submit again.",
    };
  }

  // Best-effort rate limiting по cookie.
  const cookieStore = await cookies();
  const lastAlertCookie = cookieStore.get(RATE_LIMIT_COOKIE);

  if (lastAlertCookie) {
    const last = Number.parseInt(lastAlertCookie.value, 10);
    if (!Number.isNaN(last) && now - last < RATE_LIMIT_WINDOW_MS) {
      return {
        status: "error",
        error:
          "You recently sent an alert. Please wait a couple minutes before sending another.",
      };
    }
  }

  let finderId = cookieStore.get(FINDER_ID_COOKIE)?.value;
  if (!finderId) {
    finderId = randomUUID();
  }

  const headerStore = await headers();
  const userAgent = headerStore.get("user-agent") ?? "unknown";
  const clientIp = getClientIp(headerStore);
  const fingerprint = hashValue(`${clientIp}|${userAgent}|${finderId}`);

  cleanHits(now);
  if (!consumeHit(`fp:${fingerprint}`, now, MEMORY_LIMIT_PER_FINGERPRINT)) {
    return {
      status: "error",
      error: "Too many attempts. Please wait a few minutes and try again.",
    };
  }
  if (
    !consumeHit(
      `fp:tag:${fingerprint}:${publicId}`,
      now,
      MEMORY_LIMIT_PER_FINGERPRINT_TAG,
    )
  ) {
    return {
      status: "error",
      error: "Please wait before sending another alert for this tag.",
    };
  }
  if (!consumeHit(`tag:${publicId}`, now, MEMORY_LIMIT_PER_TAG)) {
    return {
      status: "error",
      error: "This tag is receiving too many alerts right now. Please try again shortly.",
    };
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

  // Ищем фактический pet_id и owner_id через сервисный клиент.
  const serviceClient = createSupabaseServiceRoleClient();

  const { data: petRow, error: petRowError } = await serviceClient
    .from("pets")
    .select("id, owner_id")
    .eq("public_id", publicId)
    .maybeSingle();

  if (petRowError || !petRow) {
    console.error("[found-action] Failed to resolve pet_id", petRowError);
    return {
      status: "error",
      error: "Something went wrong. Please try again in a moment.",
    };
  }

  // DB-level duplicate/spam checks against recent submissions.
  const recentWindowIso = new Date(now - 10 * 60_000).toISOString();
  const normalizedMessage = normalizeMessage(finderMessage);

  const { data: recentAlerts } = await serviceClient
    .from("alerts")
    .select("finder_phone, finder_message, user_agent, created_at")
    .eq("public_id", publicId)
    .gte("created_at", recentWindowIso)
    .order("created_at", { ascending: false })
    .limit(50);

  const recent = recentAlerts ?? [];
  if (recent.length >= 30) {
    return {
      status: "error",
      error: "This tag is receiving many alerts right now. Please try again soon.",
    };
  }

  const looksDuplicate = recent.some((item) => {
    const phoneMatch =
      normalizedFinderPhone &&
      normalizePhone(item.finder_phone ?? "") === normalizedFinderPhone;
    const messageMatch =
      normalizeMessage(item.finder_message ?? "") === normalizedMessage;
    const sameDevice = (item.user_agent ?? "") === userAgent;
    return Boolean(phoneMatch || (messageMatch && sameDevice));
  });

  if (looksDuplicate) {
    return {
      status: "error",
      error: "This alert looks like a duplicate. If details changed, edit your message and resend.",
    };
  }

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
  cookieStore.set(FINDER_ID_COOKIE, finderId, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 180, // 180 days
    sameSite: "lax",
    secure: true,
  });

  // Ссылки для звонка и SMS, если у владельца указан телефон.
  let telLink: string | null = null;
  let smsLink: string | null = null;
  const { data: ownerProfile } = await serviceClient
    .from("profiles")
    .select("phone, display_name")
    .eq("user_id", petRow.owner_id)
    .maybeSingle();

  const ownerPhone = ownerProfile?.phone?.trim();
  if (ownerPhone) {
    const normalized = normalizePhone(ownerPhone);
    const smsPhone = normalized ? `+${normalized}` : ownerPhone;
    telLink = `tel:${smsPhone}`;

    const ownerName = ownerProfile?.display_name?.trim() || "there";
    const petInfo =
      pet.age_years != null && pet.breed?.trim()
        ? ` (${pet.age_years} year${pet.age_years === 1 ? "" : "s"} old ${pet.breed.trim()})`
        : pet.breed?.trim()
          ? ` (${pet.breed.trim()})`
          : pet.age_years != null
            ? ` (${pet.age_years} year${pet.age_years === 1 ? "" : "s"} old)`
            : "";
    const locationStr = finderLocationUrl
      ? finderLocationUrl
      : "Not shared";
    const contactStr = finderPhone
      ? finderPhone
      : "";
    const body = [
      `Hi ${ownerName}! Your pet ${pet.name}${petInfo} was found.`,
      "",
      `Location: ${locationStr}.`,
      `Contact: ${contactStr}.`,
      "",
      finderMessage,
    ].join("\n");
    smsLink = `sms:${smsPhone}?body=${encodeURIComponent(body)}`;
  }

  return {
    status: "success",
    telLink,
    smsLink,
  };
}
