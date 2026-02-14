import Image from "next/image";
import Link from "next/link";

import {
  createSupabaseAnonServerClient,
  type PublicPetProfile,
} from "@/lib/supabase/server";

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
    console.error("[public-pet] Failed to load pet profile", error);
    return null;
  }

  return data;
}

export default async function PublicPetPage({ params }: PageProps) {
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
      {pet.photo_path ? (
            <div className="relative h-48 w-48 mx-auto rounded-full bg-transparent">
              <Image
                src={pet.photo_path}
                alt={pet.name}
                fill
                sizes="100vw"
                className="object-cover rounded-full"
                priority
              />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center bg-zinc-200 text-zinc-500">
              <span className="text-sm">No photo available</span>
            </div>
          )}
        <header className="pt-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {pet.name}
          </h1>
          {subtitleParts.length > 0 && (
            <p className="mt-1 text-sm text-zinc-600">{subtitleParts.join(" • ")}</p>
          )}
        </header>
        <section className="overflow-hidden rounded-2xl shadow-lg border border-zinc-200">
          <div className="flex flex-col gap-4 p-5">
            <div className="space-y-2 text-sm">
              <p className="font-medium">
                Hi! You found me 🐾
              </p>
              <p className="text-zinc-600">
                My human is probably worried. Please use the button below to help
                us reunite.
              </p>
            </div>

            {pet.notes && (
              <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700">
                <p className="font-medium text-xs uppercase tracking-wide text-zinc-500">
                  Notes from my human
                </p>
                <p className="mt-1 whitespace-pre-wrap">{pet.notes}</p>
              </div>
            )}

            <Link
              href={`/p/${encodeURIComponent(pet.public_id)}/found`}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              I found {pet.name}!
            </Link>
          </div>
        </section>

        <p className="pb-4 text-center text-[11px] text-zinc-500">
          Powered by your digital Pet ID.
        </p>
      </div>
    </main>
  );
}

