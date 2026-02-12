"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { Pet } from "@/lib/types/pet";
import type {
  CreatePetResult,
  UpdatePetResult,
  UploadPhotoResult,
} from "../actions";
import { uploadPetPhoto } from "../actions";

type PetFormProps =
  | {
      mode: "create";
      onSubmit: (input: CreatePetInput) => Promise<CreatePetResult>;
    }
  | {
      mode: "edit";
      pet: Pet;
      onSubmit: (petId: string, input: UpdatePetInput) => Promise<UpdatePetResult>;
    };

export type CreatePetInput = {
  name: string;
  age_years: number | null;
  breed: string;
  photo_path: string;
  notes: string;
  is_active: boolean;
};

export type UpdatePetInput = CreatePetInput;

function getDefaultInput(pet?: Pet): CreatePetInput {
  if (!pet) {
    return {
      name: "",
      age_years: null,
      breed: "",
      photo_path: "",
      notes: "",
      is_active: true,
    };
  }
  return {
    name: pet.name,
    age_years: pet.age_years,
    breed: pet.breed ?? "",
    photo_path: pet.photo_path ?? "",
    notes: pet.notes ?? "",
    is_active: pet.is_active,
  };
}

export function PetForm(props: PetFormProps) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const pet = props.mode === "edit" ? props.pet : null;
  const [input, setInput] = useState<CreatePetInput>(() =>
    getDefaultInput(pet ?? undefined),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const name = input.name.trim();
    if (!name) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    const payload: CreatePetInput = {
      name,
      age_years: input.age_years ?? null,
      breed: input.breed.trim(),
      photo_path: input.photo_path.trim(),
      notes: input.notes.trim(),
      is_active: input.is_active,
    };

    if (props.mode === "create") {
      const result = await props.onSubmit(payload);
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      const petId = result.petId;
      const file = photoInputRef.current?.files?.[0];
      if (file && file.size > 0) {
        const formData = new FormData();
        formData.set("photo", file);
        const uploadResult: UploadPhotoResult = await uploadPetPhoto(
          petId,
          formData,
        );
        if (!uploadResult.ok) {
          setError(uploadResult.error);
          setLoading(false);
          return;
        }
      }
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Edit mode
    const file = photoInputRef.current?.files?.[0];
    if (file && file.size > 0) {
      const formData = new FormData();
      formData.set("photo", file);
      const uploadResult = await uploadPetPhoto(props.pet.id, formData);
      if (!uploadResult.ok) {
        setError(uploadResult.error);
        setLoading(false);
        return;
      }
    }
    const result = await props.onSubmit(props.pet.id, payload);
    if (result.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setError(result.error);
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm"
    >
      <div>
        <label
          htmlFor="pet-name"
          className="block text-sm font-medium text-zinc-800"
        >
          Name *
        </label>
        <input
          id="pet-name"
          type="text"
          required
          value={input.name}
          onChange={(e) => setInput((p) => ({ ...p, name: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. Max"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="pet-age"
            className="block text-sm font-medium text-zinc-800"
          >
            Age (years)
          </label>
        <input
            id="pet-age"
            type="number"
            min={0}
            max={30}
            value={input.age_years ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setInput((p) => ({
                ...p,
                age_years:
                  v === ""
                    ? null
                    : (Number.isNaN(parseInt(v, 10))
                        ? null
                        : parseInt(v, 10)),
              }));
            }}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="3"
          />
        </div>
        <div>
          <label
            htmlFor="pet-breed"
            className="block text-sm font-medium text-zinc-800"
          >
            Breed
          </label>
          <input
            id="pet-breed"
            type="text"
            value={input.breed}
            onChange={(e) => setInput((p) => ({ ...p, breed: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Labrador"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="pet-photo-file"
          className="block text-sm font-medium text-zinc-800"
        >
          Photo
        </label>
        {((pet && pet.photo_path) || input.photo_path) && (
          <div className="mt-2 flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={(pet && pet.photo_path) || input.photo_path}
                alt={pet?.name ?? (input.name || "Pet photo")}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-zinc-500">Current photo preview</p>
          </div>
        )}
        <input
          ref={photoInputRef}
          id="pet-photo-file"
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-3 w-full text-sm text-zinc-600 border border-zinc-400 file:rounded-none bg-zinc-50 rounded-xl file:mr-3 file:cursor-pointer file:border-0 file:bg-emerald-200  file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="mt-1 ml-1 text-xs text-zinc-500">
          JPEG, PNG, WebP or GIF, max 3 MB (Optional)
        </p>
        <p className="mt-3 ml-1 text-xs text-zinc-500">
          Or paste a link:
        </p>
        <input
          id="pet-photo-url"
          type="url"
          value={input.photo_path}
          onChange={(e) =>
            setInput((p) => ({ ...p, photo_path: e.target.value }))
          }
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label
          htmlFor="pet-notes"
          className="block text-sm font-medium text-zinc-800"
        >
          Notes (for finders)
        </label>
        <textarea
          id="pet-notes"
          rows={3}
          value={input.notes}
          onChange={(e) => setInput((p) => ({ ...p, notes: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. Microchipped, friendly with kids"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={input.is_active}
          onChange={(e) =>
            setInput((p) => ({ ...p, is_active: e.target.checked }))
          }
          className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm font-medium text-zinc-800">
          Tag is active (finders can report finding this pet)
        </span>
      </label>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {loading
            ? props.mode === "create"
              ? "Adding…"
              : "Saving…"
            : props.mode === "create"
              ? "Add pet"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
