import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "./LoginForm";
import { OAuthButtons } from "./OAuthButtons";

export const metadata: Metadata = {
  title: "Log In",
  description: "Access your Pet ID dashboard to manage pet profiles and recovery alerts.",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error, reset } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[1fr_1.05fr] md:items-center">
        <section className="brand-card-muted hidden p-8 md:block">
          <span className="brand-pill">
            <ShieldCheck className="h-3.5 w-3.5" />
            Account security
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            Sign in to update your pet profile, keep your tag active, and respond fast to finder alerts.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[var(--ink-soft)]">
            <p>Private owner details stay protected.</p>
            <p>Finder alerts land instantly.</p>
            <p>Designed for mobile recovery moments.</p>
          </div>
        </section>

        <section className="brand-card p-5 sm:p-7">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Log in</h2>
            <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
              Enter your details to access your dashboard.
            </p>
          </div>

          {error === "auth" && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Something went wrong during sign in. Please try again.
            </div>
          )}
          {reset === "success" && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Password updated. You can log in with your new password.
            </div>
          )}

          <div className="mt-5 space-y-4">
            <OAuthButtons redirectTo={next ?? "/dashboard"} />

            <div className="relative">
              <span className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-[var(--line)]" />
              </span>
              <p className="relative flex justify-center text-xs text-[var(--ink-soft)]">
                <span className="bg-white px-2">or continue with email</span>
              </p>
            </div>

            <LoginForm redirectTo={next ?? "/dashboard"} />
          </div>

          <p className="mt-5 text-center text-sm text-[var(--ink-soft)]">
            Don&apos;t have an account?{" "}
            <Link
              href={
                next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"
              }
              className="font-semibold text-[var(--brand-strong)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
