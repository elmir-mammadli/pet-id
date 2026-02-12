import Image from "next/image";
import Link from "next/link";

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
    subtitle.push(
      pet.age_years === 1 ? "1 year" : `${pet.age_years} years`,
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
          {pet.photo_path ? (
            <Image
              src={pet.photo_path}
              alt={pet.name}
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-400 text-xs">
              No photo
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-zinc-900">{pet.name}</h3>
              {subtitle.length > 0 && (
                <p className="text-sm text-zinc-500">{subtitle.join(" · ")}</p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                pet.is_active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {pet.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-500 font-mono truncate" title={publicUrl}>
            {publicUrl}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Open tag page →
            </a>
            <Link
              href={`/dashboard/pets/${pet.id}/edit`}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              Edit
            </Link>
            <span className="text-zinc-300">·</span>
            <DeletePetButton petId={pet.id} petName={pet.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
