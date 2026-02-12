import Image from "next/image";

import {
  createSupabaseAnonServerClient,
  type PublicPetProfile,
} from "@/lib/supabase/server";

import { FoundForm } from "./FoundForm";

type PageProps = {
  params: Promise<{ publicId: string }>;
};

async function getPublicPetProfile(
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
    console.error("[found-page] Failed to load pet profile", error);
    return null;
  }

  return data;
}

export default async function FoundPage({ params }: PageProps) {
  const { publicId } = await params;
  const pet = await getPublicPetProfile(publicId);

  if (!pet) {
    return (
      <main className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <h1 className="text-center text-xl font-semibold">
            This tag is not active or not found
          </h1>
          <p className="text-center text-sm text-zinc-600">
            Please double-check the URL printed on the pet&apos;s tag.
          </p>
        </div>
      </main>
    );
  }

  if (!pet.is_active) {
    return (
      <main className="min-h-screen bg-zinc-100 px-4 py-10 text-zinc-900">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <h1 className="text-center text-xl font-semibold">
            This tag is currently inactive
          </h1>
          <p className="text-center text-sm text-zinc-600">
            The pet&apos;s owner has temporarily deactivated this tag.
          </p>
        </div>
      </main>
    );
  }

  const subtitleParts: string[] = [];
  if (pet.breed) subtitleParts.push(pet.breed);
  if (typeof pet.age_years === "number") {
    subtitleParts.push(
      pet.age_years === 1 ? "1 year old" : `${pet.age_years} years old`,
    );
  }

  return (
    <main className="flex min-h-screen bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="pt-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Help {pet.name} get home
          </h1>
          {subtitleParts.length > 0 && (
            <p className="mt-1 text-sm text-zinc-600">
              {subtitleParts.join(" • ")}
            </p>
          )}
        </header>

        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {pet.photo_path ? (
            <div className="relative h-48 w-full bg-zinc-200">
              <Image
                src={pet.photo_path}
                alt={pet.name}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-2 text-sm">
              <p className="font-medium">
                You&apos;re doing something kind 💚
              </p>
              <p className="text-zinc-600">
                Fill out the short form below. We&apos;ll send your message to
                {` ${pet.name}`}&apos;s human right away.
              </p>
            </div>
          </div>
        </section>

        <FoundForm publicId={pet.public_id} petName={pet.name} />

        <p className="pb-4 text-center text-[11px] text-zinc-500">
          We don&apos;t publicly share your data. Only the pet&apos;s owner
          will see this alert.
        </p>
      </div>
    </main>
  );
}

