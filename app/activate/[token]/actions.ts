"use server";

import { revalidatePath } from "next/cache";

import { generatePublicId } from "@/lib/utils/public-id";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { CreatePetInput } from "@/app/dashboard/actions";

export type ClaimTagProfileInput = {
  display_name?: string | null;
  phone?: string | null;
};

export type ClaimTagResult =
  | { ok: true; publicId: string; petId: string }
  | { ok: false; error: string };

/**
 * Claims an unclaimed tag: creates pet, binds tag, saves owner profile (name, phone).
 */
export async function claimTag(
  activationToken: string,
  input: CreatePetInput,
  profileInput?: ClaimTagProfileInput,
): Promise<ClaimTagResult> {
  const name = input.name?.trim();
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in to register this tag." };
  }

  const { data: tag } = await supabase
    .from("tags")
    .select("id, status")
    .eq("activation_token", activationToken)
    .maybeSingle();

  if (!tag) {
    return { ok: false, error: "Tag not found." };
  }
  if (tag.status !== "unclaimed") {
    return { ok: false, error: "This tag is already registered." };
  }

  let publicId = generatePublicId();
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data: existing } = await supabase
      .from("pets")
      .select("id")
      .eq("public_id", publicId)
      .maybeSingle();
    if (!existing) break;
    publicId = generatePublicId();
  }

  const { data: pet, error: petError } = await supabase
    .from("pets")
    .insert({
      owner_id: user.id,
      public_id: publicId,
      name,
      age_years: input.age_years ?? null,
      breed: input.breed?.trim() || null,
      photo_path: input.photo_path?.trim() || null,
      notes: input.notes?.trim() || null,
      is_active: input.is_active ?? true,
    })
    .select("id")
    .single();

  if (petError) {
    console.error("[claimTag] create pet", petError);
    return { ok: false, error: "Failed to create pet. Please try again." };
  }

  const { error: tagError } = await supabase
    .from("tags")
    .update({
      pet_id: pet.id,
      owner_id: user.id,
      status: "active",
    })
    .eq("id", tag.id)
    .eq("status", "unclaimed");

  if (tagError) {
    console.error("[claimTag] update tag", tagError);
    return { ok: false, error: "Pet created but tag link failed. Contact support." };
  }

  if (profileInput && (profileInput.display_name?.trim() || profileInput.phone?.trim())) {
    await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        display_name: profileInput.display_name?.trim() || null,
        phone: profileInput.phone?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }

  revalidatePath("/dashboard");
  revalidatePath(`/activate/${activationToken}`);
  return { ok: true, publicId, petId: pet.id };
}
