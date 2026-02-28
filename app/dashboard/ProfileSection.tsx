"use client";

import { useState } from "react";

import type { ProfileData } from "./actions";
import { updateProfile, type UpdateProfileResult } from "./actions";

type Props = {
  profile: ProfileData | null;
};

export function ProfileSection({ profile }: Props) {
  const [savedDisplayName, setSavedDisplayName] = useState(profile?.display_name ?? "");
  const [savedPhone, setSavedPhone] = useState(profile?.phone ?? "");
  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [phone, setPhone] = useState(savedPhone);
  const [isEditing, setIsEditing] = useState(
    !savedDisplayName.trim() && !savedPhone.trim(),
  );
  const [result, setResult] = useState<UpdateProfileResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    const res = await updateProfile(displayName.trim() || null, phone.trim() || null);
    setResult(res);
    setLoading(false);
    if (res.ok) {
      const nextDisplayName = displayName.trim();
      const nextPhone = phone.trim();
      setSavedDisplayName(nextDisplayName);
      setSavedPhone(nextPhone);
      setIsEditing(false);
    }
  }

  function handleCancel() {
    setDisplayName(savedDisplayName);
    setPhone(savedPhone);
    setResult(null);
    setIsEditing(false);
  }

  return (
    <section className="brand-card my-5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-(--ink)">Contact information</h2>
          <p className="text-xs text-(--ink-soft)">
            Used for finder alerts and owner notifications.
          </p>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setResult(null);
              setIsEditing(true);
            }}
            className="hover:underline text-sm cursor-pointer text-(--ink-soft) hover:text-(--ink) transition-colors font-semibold"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="brand-card-muted rounded-xl px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Name</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--ink)]">
              {savedDisplayName.trim() || "Not set"}
            </p>
          </div>
          <div className="brand-card-muted rounded-xl px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">Phone</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--ink)]">
              {savedPhone.trim() || "Not set"}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="brand-button brand-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {loading ? "Saving..." : "Save profile"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="brand-button brand-button-secondary w-full border disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
