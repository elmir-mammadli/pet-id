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
    <main className="min-h-screen px-4 py-8">
      <header className="glass-panel mx-auto flex w-full max-w-3xl items-center gap-4 rounded-full px-4 py-2.5">
        <Link href="/dashboard" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
          Back to dashboard
        </Link>
        <h1 className="text-base font-extrabold tracking-tight text-[var(--ink)]">Edit {pet.name}</h1>
      </header>

      <div className="mx-auto mt-5 flex w-full max-w-3xl flex-col gap-6">
        <PetForm mode="edit" pet={pet as Pet} onSubmit={updatePet} />
        <DocumentSection petId={id} documents={(documents ?? []) as Document[]} />
      </div>
    </main>
  );
}
