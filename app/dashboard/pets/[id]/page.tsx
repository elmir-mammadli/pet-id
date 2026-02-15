import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Document } from "@/lib/types/document";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

const TYPE_LABELS: Record<Document["type"], string> = {
  vet: "Vet / health",
  vaccine: "Vaccine",
  insurance: "Insurance",
  other: "Other",
};

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

export const metadata: Metadata = {
  title: "Pet Profile",
  description: "Owner view of your pet profile and documents.",
};

export default async function PetOwnerViewPage({ params }: Props) {
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

  const publicUrl = `${getBaseUrl()}/p/${pet.public_id}`;
  const subtitle: string[] = [];
  if (pet.breed) subtitle.push(pet.breed);
  if (pet.age_years != null) {
    subtitle.push(pet.age_years === 1 ? "1 year old" : `${pet.age_years} years old`);
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <header className="glass-panel mx-auto flex w-full max-w-3xl items-center gap-4 rounded-full px-4 py-2.5">
        <Link href="/dashboard" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
          Back to dashboard
        </Link>
        <Link href="/dashboard/alerts" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
          Alerts inbox
        </Link>
        <h1 className="text-base font-extrabold tracking-tight text-[var(--ink)]">{pet.name} profile</h1>
      </header>

      <div className="mx-auto mt-5 flex w-full max-w-3xl flex-col gap-5">
        <section className="brand-card overflow-hidden">
          {pet.photo_path ? (
            <div className="relative h-72 w-full bg-[#e5ece1]">
              <Image
                src={pet.photo_path}
                alt={pet.name}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center bg-[#edf1e8] text-sm text-[var(--ink-soft)]">
              No photo uploaded
            </div>
          )}

          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-[var(--ink)]">{pet.name}</h2>
                {subtitle.length > 0 && <p className="mt-1 text-sm text-[var(--ink-soft)]">{subtitle.join(" • ")}</p>}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  pet.is_active ? "bg-[#ddf1e4] text-[#1c5f3b]" : "bg-[#ecefeb] text-[#607065]"
                }`}
              >
                {pet.is_active ? "Tag active" : "Tag inactive"}
              </span>
            </div>

            {pet.notes && (
              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--ink)]">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Finder notes</p>
                <p className="mt-1 whitespace-pre-wrap">{pet.notes}</p>
              </div>
            )}

            <div className="mt-4 space-y-1">
              <p className="truncate font-mono text-xs text-[var(--ink-soft)]" title={publicUrl}>
                {publicUrl}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--brand-strong)] hover:underline">
                  Open public page
                </a>
                <Link href={`/dashboard/pets/${pet.id}/edit`} className="font-semibold text-[var(--ink-soft)] hover:underline">
                  Edit profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-extrabold tracking-tight text-[var(--ink)]">Documents</h3>
            <Link href={`/dashboard/pets/${pet.id}/edit`} className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
              Manage documents
            </Link>
          </div>

          {(documents?.length ?? 0) === 0 ? (
            <p className="mt-3 text-sm text-[var(--ink-soft)]">No documents yet. Add vet records, vaccine certificates, or insurance files.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {(documents as Document[]).map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">{TYPE_LABELS[doc.type]}</p>
                    <p className="text-xs text-[var(--ink-soft)]">{new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={`/api/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[var(--brand-strong)] hover:underline"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
