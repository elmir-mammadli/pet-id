"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  redirectPath: string;
};

export function RequestResetForm({ redirectPath }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("App is not configured. Please try again later.");
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Reset link sent. Check your inbox and open the link to set a new password.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="reset-email" className="block text-sm font-semibold text-[var(--ink)]">
          Account email
        </label>
        <input
          id="reset-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="brand-input mt-1"
          placeholder="you@example.com"
        />
      </div>

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
        {loading ? "Sending link..." : "Send reset link"}
      </button>
    </form>
  );
}
