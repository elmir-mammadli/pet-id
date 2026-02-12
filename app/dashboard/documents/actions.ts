"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import type { DocumentType } from "@/lib/types/document";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "pet-documents";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const DOC_TYPES: DocumentType[] = ["vet", "vaccine", "insurance", "other"];

function getExtension(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".gif")) return "gif";
  return "jpg";
}

export type UploadDocumentResult =
  | { ok: true }
  | { ok: false; error: string };

export async function uploadDocument(
  petId: string,
  formData: FormData,
): Promise<UploadDocumentResult> {
  const type = formData.get("type") as string;
  const file = formData.get("file");

  if (!DOC_TYPES.includes(type as DocumentType)) {
    return { ok: false, error: "Invalid document type." };
  }
  if (!file || !(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please select a file." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "File must be under 5 MB." };
  }
  const mime = file.type?.toLowerCase();
  if (!mime || !ALLOWED_MIMES.includes(mime)) {
    return { ok: false, error: "Allowed: PDF, JPEG, PNG, WebP, GIF." };
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

  const docId = randomUUID();
  const ext = getExtension(file);
  const path = `${user.id}/${petId}/${docId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });

  if (uploadError) {
    console.error("[uploadDocument]", uploadError);
    return {
      ok: false,
      error:
        uploadError.message ||
        "Upload failed. Run supabase/storage-pet-documents.sql if needed.",
    };
  }

  const { error: insertError } = await supabase.from("documents").insert({
    pet_id: petId,
    owner_id: user.id,
    type,
    file_path: path,
  });

  if (insertError) {
    console.error("[uploadDocument] insert", insertError);
    return { ok: false, error: "File uploaded but record failed. Try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${petId}/edit`);
  return { ok: true };
}

export type DeleteDocumentResult = { ok: true } | { ok: false; error: string };

export async function deleteDocument(
  documentId: string,
): Promise<DeleteDocumentResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("id, file_path, pet_id")
    .eq("id", documentId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!doc) {
    return { ok: false, error: "Document not found or access denied." };
  }

  await supabase.storage.from(BUCKET).remove([doc.file_path]);

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("[deleteDocument]", error);
    return { ok: false, error: "Failed to remove document." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${doc.pet_id}/edit`);
  return { ok: true };
}
