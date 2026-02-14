"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

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
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
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

    const profileInput = {
      display_name: ownerName.trim() || null,
      phone: ownerPhone.trim() || null,
    };

    const result: ClaimTagResult = await claimTag(activationToken, payload, profileInput);
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
    <form onSubmit={handleSubmit} className="brand-card flex flex-col gap-5 p-5 md:p-6">
      <section className="space-y-4">
        <h2 className="text-lg font-extrabold tracking-tight text-[var(--ink)]">Pet details</h2>

        <div>
          <label htmlFor="claim-name" className="block text-sm font-semibold text-[var(--ink)]">
            Pet name *
          </label>
          <input
            id="claim-name"
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
            <label htmlFor="claim-age" className="block text-sm font-semibold text-[var(--ink)]">
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
              className="brand-input mt-1"
              placeholder="3"
            />
          </div>
          <div>
            <label htmlFor="claim-breed" className="block text-sm font-semibold text-[var(--ink)]">
              Breed
            </label>
            <input
              id="claim-breed"
              type="text"
              value={input.breed ?? ""}
              onChange={(e) => setInput((p) => ({ ...p, breed: e.target.value }))}
              className="brand-input mt-1"
              placeholder="Labrador"
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Pet photo</h3>

        {input.photo_path && (
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-[#e8ede5]">
              <Image
                src={input.photo_path}
                alt={input.name || "Pet"}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-xs text-[var(--ink-soft)]">Current URL preview</p>
          </div>
        )}

        <input
          ref={photoInputRef}
          id="claim-photo-file"
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="brand-input"
        />
        <p className="text-xs text-[var(--ink-soft)]">JPEG, PNG, WebP, or GIF. Max 3 MB.</p>

        <div>
          <label htmlFor="claim-photo-url" className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
            Or paste image URL
          </label>
          <input
            id="claim-photo-url"
            type="url"
            value={input.photo_path ?? ""}
            onChange={(e) => setInput((p) => ({ ...p, photo_path: e.target.value }))}
            className="brand-input mt-1"
            placeholder="https://..."
          />
        </div>
      </section>

      <section className="space-y-3">
        <label htmlFor="claim-notes" className="block text-sm font-semibold text-[var(--ink)]">
          Notes for finders
        </label>
        <textarea
          id="claim-notes"
          rows={3}
          value={input.notes ?? ""}
          onChange={(e) => setInput((p) => ({ ...p, notes: e.target.value }))}
          className="brand-input"
          placeholder="e.g. Friendly, microchipped, needs medication"
        />

        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={input.is_active}
            onChange={(e) => setInput((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-[#b9c6b8] text-[var(--brand)] focus:ring-[var(--focus)]"
          />
          <span className="text-sm font-medium text-[var(--ink)]">
            Activate tag immediately after registration
          </span>
        </label>
      </section>

      <section className="space-y-4 border-t border-[var(--line)] pt-5">
        <h3 className="text-lg font-extrabold tracking-tight text-[var(--ink)]">Owner contact (optional)</h3>
        <p className="text-sm text-[var(--ink-soft)]">This helps finders contact you faster when your pet is found.</p>

        <div>
          <label htmlFor="claim-owner-name" className="block text-sm font-semibold text-[var(--ink)]">
            Your name
          </label>
          <input
            id="claim-owner-name"
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="brand-input mt-1"
            placeholder="e.g. Alex"
          />
        </div>

        <div>
          <label htmlFor="claim-owner-phone" className="block text-sm font-semibold text-[var(--ink)]">
            Your phone number
          </label>
          <input
            id="claim-owner-phone"
            type="tel"
            inputMode="tel"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            className="brand-input mt-1"
            placeholder="e.g. +1 555 123 4567"
          />
        </div>
      </section>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="brand-button brand-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Registering tag..." : "Register this tag"}
      </button>
    </form>
  );
}
