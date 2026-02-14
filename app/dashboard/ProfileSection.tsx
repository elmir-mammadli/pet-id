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
    const res = await updateProfile(
      displayName.trim() || null,
      phone.trim() || null,
    );
    setResult(res);
    setLoading(false);
  }

  return (
    <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-zinc-900">About you</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Name and phone are used so finders can text you when they find your pet.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="profile-display-name"
            className="block text-sm font-medium text-zinc-800"
          >
            Your name
          </label>
          <input
            id="profile-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. Alex"
          />
        </div>
        <div>
          <label
            htmlFor="profile-phone"
            className="block text-sm font-medium text-zinc-800"
          >
            Your phone number
          </label>
          <input
            id="profile-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-zinc-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. +7 900 123 45 67"
          />
        </div>
        {result && !result.ok && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {result.error}
          </p>
        )}
        {result?.ok && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Saved.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
