import type { Metadata } from "next";
import Link from "next/link";

import { OAuthButtons } from "../login/OAuthButtons";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Sign up | Pet ID",
  description: "Create your Pet ID account",
};

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const redirectTo = next?.startsWith("/") ? next : "/dashboard";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">Sign up</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Create an account to register your pets and receive finder alerts.
          </p>
        </div>

        <OAuthButtons redirectTo={redirectTo} />

        <div className="relative">
          <span className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-zinc-200" />
          </span>
          <p className="relative flex justify-center text-xs text-zinc-500">
            <span className="bg-zinc-100 px-2">or</span>
          </p>
        </div>

        <SignupForm redirectTo={redirectTo} />

        <p className="text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
