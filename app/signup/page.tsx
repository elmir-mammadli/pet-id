import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine, Sparkles } from "lucide-react";

import { ETSY_TAG_URL } from "@/lib/constants";

import { OAuthButtons } from "../login/OAuthButtons";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Pet ID account to activate tags and receive finder alerts instantly.",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const redirectTo = next?.startsWith("/") ? next : "/dashboard";
  const isActivationFlow = redirectTo.startsWith("/activate/");

  if (!isActivationFlow) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <section className="brand-card p-6 text-center sm:p-8">
            <span className="brand-pill">
              <ScanLine className="h-3.5 w-3.5" />
              Tag-first activation
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
              Account creation starts from your physical tag
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
              For this MVP, new accounts are created during tag activation only. Buy a tag, tap it with your phone, then complete signup from your personal activation link.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href={ETSY_TAG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="brand-button brand-button-primary"
              >
                Buy tag on Etsy
              </a>
              <Link href="/login" className="brand-button brand-button-secondary border">
                I already have an account
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[1fr_1.05fr] md:items-center">
        <section className="brand-card-muted hidden p-8 md:block">
          <span className="brand-pill">
            <Sparkles className="h-3.5 w-3.5" />
            Tag activation step
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--ink)]">
            Create your account to claim this tag.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            You are in activation flow. After sign up, this tag will be linked to your pet profile.
          </p>
          <div className="mt-6 space-y-3 text-sm text-[var(--ink-soft)]">
            <p>Fast setup with Google or email.</p>
            <p>Private owner contact, public-friendly pet page.</p>
            <p>Built for real-world lost and found situations.</p>
          </div>
        </section>

        <section className="brand-card p-5 sm:p-7">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Create account</h2>
            <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
              Continue to claim and activate your tag.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <OAuthButtons redirectTo={redirectTo} />

            <div className="relative">
              <span className="absolute inset-0 flex items-center" aria-hidden>
                <span className="w-full border-t border-[var(--line)]" />
              </span>
              <p className="relative flex justify-center text-xs text-[var(--ink-soft)]">
                <span className="bg-white px-2">or create with email</span>
              </p>
            </div>

            <SignupForm redirectTo={redirectTo} />
          </div>

          <p className="mt-5 text-center text-sm text-[var(--ink-soft)]">
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(redirectTo)}`} className="font-semibold text-[var(--brand-strong)] hover:underline">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
