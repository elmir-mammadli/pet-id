import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal",
  description: "Legal pages for Pet ID, including Privacy Policy and Terms of Service.",
};

export default function LegalIndexPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header className="brand-card p-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)]">Legal</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Review our legal policies before using Pet ID.
          </p>
        </header>

        <section className="brand-card p-6">
          <ul className="space-y-3">
            <li>
              <Link href="/privacy" className="text-base font-semibold text-[var(--brand-strong)] hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-base font-semibold text-[var(--brand-strong)] hover:underline">
                Terms of Service
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
