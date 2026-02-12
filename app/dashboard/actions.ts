"use server";

import { revalidatePath } from "next/cache";

import { generatePublicId } from "@/lib/utils/public-id";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PetUpdate } from "@/lib/types/pet";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

export type CreatePetInput = {
  name: string;
  age_years?: number | null;
  breed?: string | null;
  photo_path?: string | null;
  notes?: string | null;
  is_active?: boolean;
};

export type CreatePetResult =
  | { ok: true; petId: string }
  | { ok: false; error: string };

export async function createPet(
  input: CreatePetInput,
): Promise<CreatePetResult> {
  const name = input.name?.trim();
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in to add a pet." };
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

  const { data: pet, error } = await supabase
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

  if (error) {
    console.error("[createPet]", error);
    return { ok: false, error: "Failed to create pet. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true, petId: pet.id };
}

export type UpdatePetResult = { ok: true } | { ok: false; error: string };

export async function updatePet(
  petId: string,
  input: PetUpdate,
): Promise<UpdatePetResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name.trim() || null;
  if (input.age_years !== undefined) updates.age_years = input.age_years;
  if (input.breed !== undefined) updates.breed = input.breed?.trim() || null;
  if (input.photo_path !== undefined)
    updates.photo_path = input.photo_path?.trim() || null;
  if (input.notes !== undefined) updates.notes = input.notes?.trim() || null;
  if (input.is_active !== undefined) updates.is_active = input.is_active;

  if (Object.keys(updates).length === 0) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("pets")
    .update(updates)
    .eq("id", petId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[updatePet]", error);
    return { ok: false, error: "Failed to update pet. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${petId}/edit`);
  return { ok: true };
}

export type DeletePetResult = { ok: true } | { ok: false; error: string };

export async function deletePet(petId: string): Promise<DeletePetResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("id", petId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[deletePet]", error);
    return { ok: false, error: "Failed to remove pet. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

const PET_PHOTOS_BUCKET = "pet-photos";
const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function getExtension(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".gif")) return "gif";
  return "jpg";
}

export type UploadPhotoResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Загружает фото питомца в Storage и обновляет pets.photo_path.
 * Путь в бакете: {owner_id}/{pet_id}/{timestamp}.{ext}
 */
export async function uploadPetPhoto(
  petId: string,
  formData: FormData,
): Promise<UploadPhotoResult> {
  const file = formData.get("photo");
  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No photo file provided." };
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: "Photo must be under 3 MB." };
  }

  const mime = file.type?.toLowerCase();
  if (!mime || !ALLOWED_TYPES.includes(mime)) {
    return { ok: false, error: "Allowed formats: JPEG, PNG, WebP, GIF." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: pet } = await supabase
    .from("pets")
    .select("id, owner_id")
    .eq("id", petId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!pet) {
    return { ok: false, error: "Pet not found or access denied." };
  }

  const ext = getExtension(file);
  const path = `${user.id}/${petId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(PET_PHOTOS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadPetPhoto]", uploadError);
    const message =
      uploadError.message ||
      "Upload failed. Ensure the Storage bucket 'pet-photos' exists and RLS policies are applied (run supabase/storage-pet-photos.sql).";
    return { ok: false, error: message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PET_PHOTOS_BUCKET).getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("pets")
    .update({ photo_path: publicUrl })
    .eq("id", petId)
    .eq("owner_id", user.id);

  if (updateError) {
    console.error("[uploadPetPhoto] update", updateError);
    return { ok: false, error: "Photo saved but profile update failed." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${petId}/edit`);
  return { ok: true, url: publicUrl };
}
