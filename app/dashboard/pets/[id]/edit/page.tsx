import Link from "next/link";
import { notFound } from "next/navigation";

import type { Document } from "@/lib/types/document";
import type { Pet } from "@/lib/types/pet";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { updatePet } from "../../../actions";
import { DocumentSection } from "../../DocumentSection";
import { PetForm } from "../../PetForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPetPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: pet, error } = await supabase
    .from("pets")
    .select("id, owner_id, public_id, name, age_years, breed, photo_path, notes, is_active, created_at, updated_at")
    .eq("id", id)
    .eq("owner_id", user?.id ?? "")
    .maybeSingle();

  if (error || !pet) {
    notFound();
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, pet_id, owner_id, type, file_path, created_at")
    .eq("pet_id", id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">
            Edit {pet.name}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        <PetForm
          mode="edit"
          pet={pet as Pet}
          onSubmit={updatePet}
        />
        <DocumentSection
          petId={id}
          documents={(documents ?? []) as Document[]}
        />
      </div>
    </main>
  );
}
