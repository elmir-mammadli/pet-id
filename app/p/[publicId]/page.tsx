import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, HeartHandshake, MapPinned, ShieldCheck } from "lucide-react";

import {
  createSupabaseAnonServerClient,
  type PublicPetProfile,
} from "@/lib/supabase/server";

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
    console.error("[public-pet] Failed to load pet profile", error);
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
      title: "Pet Tag",
      description: "Public pet ID tag page.",
      robots: { index: false, follow: false },
    };
  }

  const subtitle = buildSubtitle(pet).join(" - ");
  const pageTitle = `Found ${pet.name}? Help them get home`;
  const description = subtitle
    ? `${pet.name} (${subtitle}) is registered with Pet ID. Tap to notify the owner quickly.`
    : `${pet.name} is registered with Pet ID. Tap to notify the owner quickly.`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      images: pet.photo_path
        ? [
            {
              url: pet.photo_path,
              width: 1200,
              height: 630,
              alt: `${pet.name} pet profile photo`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: pet.photo_path ? [pet.photo_path] : undefined,
    },
  };
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <main className="min-h-screen px-4 py-14">
      <div className="brand-card mx-auto max-w-lg p-7 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{description}</p>
      </div>
    </main>
  );
}

export default async function PublicPetPage({ params }: PageProps) {
  const { publicId } = await params;
  const pet = await getPublicPetProfile(publicId);

  if (!pet) {
    return (
      <EmptyState
        title="Tag not found"
        description="This pet link is not active right now. Please verify the URL on the tag and try again."
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
    <main className="relative min-h-screen overflow-x-clip px-4 py-7 pb-28 md:py-10 md:pb-12">
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-20" />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="brand-card overflow-hidden">
          <div className="relative bg-gradient-to-r from-[#e9f4ed] via-[#f5f8f2] to-[#eef5ea] p-5 md:p-7">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#d8efdf] blur-2xl" />
            <div className="absolute -bottom-14 -left-6 h-32 w-32 rounded-full bg-[#ebf2e6] blur-2xl" />
            <div className="relative flex flex-col items-center text-center">
              <span className="brand-pill">
                <HeartHandshake className="h-3.5 w-3.5" />
                You found a registered pet
              </span>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--ink)] md:text-5xl">
                {pet.name}
              </h1>
              {subtitleParts.length > 0 && (
                <p className="mt-1 text-sm font-medium text-[var(--ink-soft)]">{subtitleParts.join(" • ")}</p>
              )}
            </div>
          </div>

          {pet.photo_path ? (
            <div className="relative h-72 w-full bg-[#e7eee3] md:h-[25rem]">
              <Image
                src={pet.photo_path}
                alt={`${pet.name} profile photo`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center bg-[#edf1e8] text-sm text-[var(--ink-soft)]">
              No photo available
            </div>
          )}

          <div className="grid gap-3 border-t border-[var(--line)] p-5 md:grid-cols-3">
            <div className="brand-card-muted p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Step 1</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">Keep them calm and safe</p>
            </div>
            <div className="brand-card-muted p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Step 2</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">Send a quick alert to owner</p>
            </div>
            <div className="brand-card-muted p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Step 3</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">Coordinate pickup safely</p>
            </div>
          </div>
        </header>

        <section className="brand-card p-5 md:p-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ddf1e4] text-[var(--brand-strong)]">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-[var(--ink)]">Fast and private contact</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
                Your message is shared only with the pet owner. The process is designed to be fast, clear, and safe for both of you.
              </p>
            </div>
          </div>

          {pet.notes && (
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                Notes from owner
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-[var(--ink)]">{pet.notes}</p>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link href={`/p/${encodeURIComponent(pet.public_id)}/found`} className="brand-button brand-button-primary w-full sm:w-auto">
              <MapPinned className="h-4.5 w-4.5" />
              Report found now
            </Link>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ink-soft)]">
              <AlertTriangle className="h-3.5 w-3.5" />
              If urgent, contact local shelter or non-emergency services.
            </span>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-3 z-20 px-4 md:hidden">
        <Link
          href={`/p/${encodeURIComponent(pet.public_id)}/found`}
          className="brand-button brand-button-primary w-full shadow-[0_12px_24px_-14px_rgba(20,40,25,0.55)]"
        >
          Report found: {pet.name}
        </Link>
      </div>
    </main>
  );
}
