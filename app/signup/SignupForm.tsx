"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  redirectTo?: string;
};

export function SignupForm({ redirectTo = "/dashboard" }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="brand-card-muted p-5">
        <h2 className="text-lg font-bold text-[var(--ink)]">Check your inbox</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          We sent a confirmation link to <strong>{email}</strong>. Open it to activate your account, then log in.
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="brand-button brand-button-primary mt-4 w-full"
        >
          Continue to log in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="signup-email" className="block text-sm font-semibold text-[var(--ink)]">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="brand-input mt-1"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="block text-sm font-semibold text-[var(--ink)]">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="brand-input mt-1"
          placeholder="At least 6 characters"
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
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
