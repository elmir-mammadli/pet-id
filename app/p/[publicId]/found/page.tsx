import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, ShieldCheck } from "lucide-react";

import {
  createSupabaseAnonServerClient,
  type PublicPetProfile,
} from "@/lib/supabase/server";

import { FoundForm } from "./FoundForm";

type PageProps = {
  params: Promise<{ publicId: string }>;
};

async function getPublicPetProfile(publicId: string): Promise<PublicPetProfile | null> {
  const supabase = createSupabaseAnonServerClient();

  const { data, error } = await supabase
    .from("public_pet_profiles")
    .select("public_id, name, age_years, breed, photo_path, notes, is_active")
    .eq("public_id", publicId)
    .maybeSingle();

  if (error) {
    console.error("[found-page] Failed to load pet profile", error);
    return null;
  }

  return data;
}

function buildSubtitle(pet: PublicPetProfile): string[] {
  const subtitleParts: string[] = [];
  if (pet.breed) subtitleParts.push(pet.breed);
  if (typeof pet.age_years === "number") {
    subtitleParts.push(pet.age_years === 1 ? "1 year old" : `${pet.age_years} years old`);
  }
  return subtitleParts;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const pet = await getPublicPetProfile(publicId);

  if (!pet || !pet.is_active) {
    return {
      title: "Report Found Pet",
      description: "Use this page to report a found pet to the owner.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Report found ${pet.name}`,
    description: `Send a direct alert to ${pet.name}'s owner through Pet ID.`,
    robots: { index: false, follow: false },
  };
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <main className="min-h-screen px-4 py-12 text-[var(--ink)]">
      <div className="brand-card mx-auto max-w-lg p-6 text-center">
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{description}</p>
      </div>
    </main>
  );
}

export default async function FoundPage({ params }: PageProps) {
  const { publicId } = await params;
  const pet = await getPublicPetProfile(publicId);

  if (!pet) {
    return (
      <EmptyState
        title="Tag not found"
        description="This pet link is not active right now. Please verify the URL and try again."
      />
    );
  }

  if (!pet.is_active) {
    return (
      <EmptyState
        title="Tag is currently inactive"
        description="The owner has temporarily paused this tag."
      />
    );
  }

  const subtitleParts = buildSubtitle(pet);

  return (
    <main className="relative min-h-screen overflow-x-clip px-4 py-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-20" />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="brand-card overflow-hidden">
          <div className="grid gap-0 md:grid-cols-[0.44fr_0.56fr]">
            {pet.photo_path ? (
              <div className="relative h-56 bg-[#e4ede1] md:h-full">
                <Image
                  src={pet.photo_path}
                  alt={`${pet.name} profile photo`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center bg-[#eef2ea] text-sm text-[var(--ink-soft)]">
                No photo available
              </div>
            )}

            <div className="p-5 md:p-6">
              <span className="brand-pill">
                <HeartHandshake className="h-3.5 w-3.5" />
                Thank you for helping
              </span>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--ink)]">Help {pet.name} get home</h1>
              {subtitleParts.length > 0 && (
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{subtitleParts.join(" • ")}</p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                Fill out this short form. Your alert goes directly to the owner so they can contact you quickly.
              </p>
              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-soft)]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-strong)]" />
                  Only the owner can view your submitted details.
                </p>
              </div>
            </div>
          </div>
        </header>

        <FoundForm publicId={pet.public_id} petName={pet.name} />
      </div>
    </main>
  );
}
