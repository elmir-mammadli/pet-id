import Link from "next/link";

import type { Pet } from "@/lib/types/pet";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { PetCard } from "./PetCard";
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

  const { data: pets } = await supabase
    .from("pets")
    .select("id, owner_id, public_id, name, age_years, breed, photo_path, notes, is_active, created_at, updated_at")
    .eq("owner_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const baseUrl = getBaseUrl();

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900">Pet ID</h1>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-zinc-900">My pets</h2>
          <Link
            href="/dashboard/pets/new"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Add pet
          </Link>
        </div>

        {(pets?.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <p className="text-zinc-600">You don&apos;t have any pets yet.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Add your first pet to get a shareable tag link.
            </p>
            <Link
              href="/dashboard/pets/new"
              className="mt-4 inline-block rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Add pet
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

        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  );
}
