"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { CreatePetInput } from "@/app/dashboard/actions";
import { uploadPetPhoto } from "@/app/dashboard/actions";

import { claimTag, type ClaimTagResult } from "./actions";

type Props = {
  activationToken: string;
};

const defaultInput: CreatePetInput = {
  name: "",
  age_years: null,
  breed: "",
  photo_path: "",
  notes: "",
  is_active: true,
};

export function ClaimTagForm({ activationToken }: Props) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<CreatePetInput>(defaultInput);
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
      breed: input.breed?.trim() ?? "",
      photo_path: input.photo_path?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      is_active: input.is_active,
    };

    const result: ClaimTagResult = await claimTag(activationToken, payload);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const file = photoInputRef.current?.files?.[0];
    if (file && file.size > 0) {
      const formData = new FormData();
      formData.set("photo", file);
      const uploadResult = await uploadPetPhoto(result.petId, formData);
      if (!uploadResult.ok) {
        setError(uploadResult.error);
        setLoading(false);
        return;
      }
    }

    router.push(`/p/${result.publicId}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm"
    >
      <div>
        <label htmlFor="claim-name" className="block text-sm font-medium text-zinc-800">
          Pet name *
        </label>
        <input
          id="claim-name"
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
          <label htmlFor="claim-age" className="block text-sm font-medium text-zinc-800">
            Age (years)
          </label>
          <input
            id="claim-age"
            type="number"
            min={0}
            max={30}
            value={input.age_years ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setInput((p) => ({
                ...p,
                age_years: v === "" ? null : parseInt(v, 10) || null,
              }));
            }}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="3"
          />
        </div>
        <div>
          <label htmlFor="claim-breed" className="block text-sm font-medium text-zinc-800">
            Breed
          </label>
          <input
            id="claim-breed"
            type="text"
            value={input.breed ?? ""}
            onChange={(e) => setInput((p) => ({ ...p, breed: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Labrador"
          />
        </div>
      </div>

      <div>
        <label htmlFor="claim-photo-file" className="block text-sm font-medium text-zinc-800">
          Photo
        </label>
        {input.photo_path && (
          <div className="mt-2 flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-zinc-100">
              <Image
                src={input.photo_path}
                alt={input.name || "Pet"}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}
        <input
          ref={photoInputRef}
          id="claim-photo-file"
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-2 w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
        />
        <p className="mt-1 text-xs text-zinc-500">Or paste URL:</p>
        <input
          id="claim-photo-url"
          type="url"
          value={input.photo_path ?? ""}
          onChange={(e) => setInput((p) => ({ ...p, photo_path: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="claim-notes" className="block text-sm font-medium text-zinc-800">
          Notes (for finders)
        </label>
        <textarea
          id="claim-notes"
          rows={3}
          value={input.notes ?? ""}
          onChange={(e) => setInput((p) => ({ ...p, notes: e.target.value }))}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          placeholder="e.g. Microchipped, friendly with kids"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={input.is_active}
          onChange={(e) => setInput((p) => ({ ...p, is_active: e.target.checked }))}
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Registering…" : "Register this tag"}
      </button>
    </form>
  );
}
