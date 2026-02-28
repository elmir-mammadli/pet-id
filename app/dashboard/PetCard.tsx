import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ExternalLinkIcon, EyeIcon, MoreHorizontal, MoreVertical, UserIcon } from "lucide-react";

import type { Pet } from "@/lib/types/pet";

import { DeletePetButton } from "./DeletePetButton";

type Props = {
  pet: Pet;
  baseUrl: string;
};

export function PetCard({ pet, baseUrl }: Props) {
  const publicUrl = `${baseUrl}/p/${pet.public_id}`;
  const subtitle: string[] = [];
  if (pet.breed) subtitle.push(pet.breed);
  if (pet.age_years != null) {
    subtitle.push(pet.age_years === 1 ? "1 year" : `${pet.age_years} years`);
  }

  return (
    <div className="brand-card overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#edf1e8]">
          {pet.photo_path ? (
            <Image
              src={pet.photo_path}
              alt={pet.name}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[var(--ink-soft)]">
              No photo
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start justify-between gap-2">
            <div className="flex items-start justify-between w-full">
            <div>
              <h3 className="font-bold text-[var(--ink)]">{pet.name}</h3>
              {subtitle.length > 0 && <p className="text-sm text-[var(--ink-soft)]">{subtitle.join(" · ")}</p>}
            </div>
            <details className="group relative shrink-0">
              <summary
                aria-label="More actions"
                className="brand-button brand-button-secondary border-none! p-2! m-0! cursor-pointer"
              >
                <MoreVertical className="h-5 w-5 text-(--ink-soft) group-hover:text-(--ink) group-focus:text-(--ink) group-focus-visible:text-(--ink) transition-colors" />
              </summary>
              <div className="absolute right-0 z-20 mt-2 min-w-38 rounded-xl border border-(--line) bg-white p-1 shadow-[0_10px_28px_-20px_rgba(18,30,22,0.65)]">
                <Link
                  href={`/dashboard/pets/${pet.id}/edit`}
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--surface-muted)]"
                >
                  Edit
                </Link>
                <DeletePetButton
                  petId={pet.id}
                  petName={pet.name}
                  className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                />
              </div>
            </details>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                pet.is_active ? "bg-[#ddf1e4] text-[#1c5f3b]" : "bg-[#ecefeb] text-[#607065]"
              }`}
            >
              {pet.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-2 truncate font-mono text-xs text-[var(--ink-soft)]" title={publicUrl}>
            {publicUrl}
          </p>
          <div className="mt-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <Link href={`/dashboard/pets/${pet.id}`} className="text-sm font-semibold text-(--brand-strong) group-hover:text-(--ink) group-focus:text-(--ink) group-focus-visible:text-(--ink) transition-colors p-1 brand-button-secondary rounded-full">
                <UserIcon className="h-4.5 w-4.5 text-(--brand-strong)" />
              </Link>
              <span className="text-[#b1b8ad] text-sm">·</span>
              <Link
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-(--ink-soft) hover:text-(--ink) focus:text-(--ink) focus-visible:text-(--ink) transition-colors p-1 brand-button-secondary rounded-full"
                tabIndex={0}
                aria-label="Open public page"
                title="Open public page"
              >
                <ExternalLink className="h-4.5 w-4.5 text-(--ink-soft)" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
