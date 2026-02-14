"use client";

import { useState } from "react";

import type { ProfileData } from "./actions";
import { updateProfile, type UpdateProfileResult } from "./actions";

type Props = {
  profile: ProfileData | null;
};

export function ProfileSection({ profile }: Props) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [result, setResult] = useState<UpdateProfileResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    const res = await updateProfile(displayName.trim() || null, phone.trim() || null);
    setResult(res);
    setLoading(false);
  }

  return (
    <section className="brand-card mb-7 p-5">
      <h2 className="mb-1 text-lg font-bold text-[var(--ink)]">Owner profile</h2>
      <p className="mb-4 text-sm text-[var(--ink-soft)]">
        This information is used when someone reports finding your pet.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="profile-display-name" className="block text-sm font-semibold text-[var(--ink)]">
            Your name
          </label>
          <input
            id="profile-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="brand-input mt-1"
            placeholder="e.g. Alex"
          />
        </div>
        <div>
          <label htmlFor="profile-phone" className="block text-sm font-semibold text-[var(--ink)]">
            Your phone number
          </label>
          <input
            id="profile-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="brand-input mt-1"
            placeholder="e.g. +1 555 123 4567"
          />
        </div>
        {result && !result.ok && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {result.error}
          </p>
        )}
        {result?.ok && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Profile saved.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="brand-button brand-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}
