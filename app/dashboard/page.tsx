import Link from "next/link";

import type { Pet } from "@/lib/types/pet";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { getProfile } from "./actions";
import { PetCard } from "./PetCard";
import { ProfileSection } from "./ProfileSection";
import { SignOutButton } from "./SignOutButton";

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [profile, { data: pets }] = await Promise.all([
    getProfile(),
    supabase
      .from("pets")
      .select("id, owner_id, public_id, name, age_years, breed, photo_path, notes, is_active, created_at, updated_at")
      .eq("owner_id", user?.id ?? "")
      .order("created_at", { ascending: false }),
  ]);

  const baseUrl = getBaseUrl();

  return (
    <main className="min-h-screen px-4 py-6 sm:py-8">
      <header className="glass-panel mx-auto flex w-full max-w-3xl items-center justify-between rounded-full px-4 py-2.5">
        <h1 className="text-base font-extrabold tracking-tight text-[var(--ink)]">Pet ID Dashboard</h1>
        <SignOutButton />
      </header>

      <div className="mx-auto mt-5 w-full max-w-3xl">
        <ProfileSection profile={profile} />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">My pets</h2>
          <Link href="/dashboard/pets/new" className="brand-button brand-button-primary px-4 py-2 text-sm">
            Add pet
          </Link>
        </div>

        {(pets?.length ?? 0) === 0 ? (
          <div className="brand-card p-8 text-center">
            <p className="text-[var(--ink-soft)]">No pets added yet.</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Add your first pet to generate a shareable tag page.
            </p>
            <Link href="/dashboard/pets/new" className="brand-button brand-button-primary mt-4 text-sm">
              Add first pet
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {(pets as Pet[]).map((pet) => (
              <li key={pet.id}>
                <PetCard pet={pet} baseUrl={baseUrl} />
              </li>
            ))}
          </ul>
        )}

        <Link href="/" className="mt-8 inline-block text-sm font-semibold text-[var(--brand-strong)] hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
