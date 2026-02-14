import type { Metadata } from "next";
import Link from "next/link";

import { UpdatePasswordForm } from "./UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set a new password for your Pet ID account.",
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <section className="brand-card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Set a new password</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Choose a strong password for your account.
          </p>

          <div className="mt-5">
            <UpdatePasswordForm />
          </div>

          <p className="mt-5 text-sm text-[var(--ink-soft)]">
            Need a new reset link?{" "}
            <Link href="/reset-password" className="font-semibold text-[var(--brand-strong)] hover:underline">
              Request again
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
