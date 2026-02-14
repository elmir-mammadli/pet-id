import type { Metadata } from "next";
import Link from "next/link";

import { RequestResetForm } from "./RequestResetForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset link for your Pet ID account.",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <section className="brand-card p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Reset your password</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Enter your account email and we will send a secure link to create a new password.
          </p>

          <div className="mt-5">
            <RequestResetForm redirectPath="/reset-password/update" />
          </div>

          <p className="mt-5 text-sm text-[var(--ink-soft)]">
            Remembered your password?{" "}
            <Link href="/login" className="font-semibold text-[var(--brand-strong)] hover:underline">
              Back to log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
