import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "./LoginForm";
import { OAuthButtons } from "./OAuthButtons";

export const metadata: Metadata = {
  title: "Log in | Pet ID",
  description: "Log in to your Pet ID account",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">Log in</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Enter your email and password to access your pets.
          </p>
        </div>

        {error === "auth" && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Something went wrong during sign in. Please try again.
          </div>
        )}

        <OAuthButtons redirectTo={next ?? "/dashboard"} />

        <div className="relative">
          <span className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-zinc-200" />
          </span>
          <p className="relative flex justify-center text-xs text-zinc-500">
            <span className="bg-zinc-100 px-2">or</span>
          </p>
        </div>

        <LoginForm redirectTo={next ?? "/dashboard"} />

        <p className="text-center text-sm text-zinc-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
