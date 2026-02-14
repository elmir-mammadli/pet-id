"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { Pet } from "@/lib/types/pet";

import type { CreatePetResult, UpdatePetResult, UploadPhotoResult } from "../actions";
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
  const [input, setInput] = useState<CreatePetInput>(() => getDefaultInput(pet ?? undefined));
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

      const file = photoInputRef.current?.files?.[0];
      if (file && file.size > 0) {
        const formData = new FormData();
        formData.set("photo", file);
        const uploadResult: UploadPhotoResult = await uploadPetPhoto(result.petId, formData);
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
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="brand-card flex flex-col gap-5 p-5 md:p-6">
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold tracking-tight text-[var(--ink)]">
          {props.mode === "create" ? "New pet profile" : "Pet profile"}
        </h2>

        <div>
          <label htmlFor="pet-name" className="block text-sm font-semibold text-[var(--ink)]">
            Name *
          </label>
          <input
            id="pet-name"
            type="text"
            required
            value={input.name}
            onChange={(e) => setInput((p) => ({ ...p, name: e.target.value }))}
            className="brand-input mt-1"
            placeholder="e.g. Max"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pet-age" className="block text-sm font-semibold text-[var(--ink)]">
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
                    v === "" ? null : Number.isNaN(parseInt(v, 10)) ? null : parseInt(v, 10),
                }));
              }}
              className="brand-input mt-1"
              placeholder="3"
            />
          </div>

          <div>
            <label htmlFor="pet-breed" className="block text-sm font-semibold text-[var(--ink)]">
              Breed
            </label>
            <input
              id="pet-breed"
              type="text"
              value={input.breed}
              onChange={(e) => setInput((p) => ({ ...p, breed: e.target.value }))}
              className="brand-input mt-1"
              placeholder="Labrador"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Photo</h3>

        {((pet && pet.photo_path) || input.photo_path) && (
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#e8ede5]">
              <Image
                src={(pet && pet.photo_path) || input.photo_path}
                alt={pet?.name || input.name || "Pet photo"}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-[var(--ink-soft)]">Current preview</p>
          </div>
        )}

        <input
          ref={photoInputRef}
          id="pet-photo-file"
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="brand-input"
        />
        <p className="text-xs text-[var(--ink-soft)]">JPEG, PNG, WebP or GIF, max 3 MB.</p>

        <div>
          <label htmlFor="pet-photo-url" className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
            Or paste image URL
          </label>
          <input
            id="pet-photo-url"
            type="url"
            value={input.photo_path}
            onChange={(e) => setInput((p) => ({ ...p, photo_path: e.target.value }))}
            className="brand-input mt-1"
            placeholder="https://..."
          />
        </div>
      </section>

      <section className="space-y-3">
        <label htmlFor="pet-notes" className="block text-sm font-semibold text-[var(--ink)]">
          Notes (visible to finders)
        </label>
        <textarea
          id="pet-notes"
          rows={3}
          value={input.notes}
          onChange={(e) => setInput((p) => ({ ...p, notes: e.target.value }))}
          className="brand-input"
          placeholder="e.g. Friendly, microchipped, allergic to chicken"
        />

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={input.is_active}
            onChange={(e) => setInput((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-[#b9c6b8] text-[var(--brand)] focus:ring-[var(--focus)]"
          />
          <span className="text-sm font-medium text-[var(--ink)]">Tag is active and visible to finders</span>
        </label>
      </section>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="brand-button brand-button-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? props.mode === "create"
              ? "Adding pet..."
              : "Saving changes..."
            : props.mode === "create"
              ? "Add pet"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="brand-button brand-button-secondary w-full border sm:w-auto"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
