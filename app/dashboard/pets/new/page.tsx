import Link from "next/link";
import { ScanLine, ShoppingBag } from "lucide-react";

import { ETSY_TAG_URL } from "@/lib/constants";

export default function NewPetPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <header className="glass-panel mx-auto flex w-full max-w-3xl items-center gap-4 rounded-full px-4 py-2.5">
        <Link href="/dashboard" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
          Back to dashboard
        </Link>
        <h1 className="text-base font-extrabold tracking-tight text-[var(--ink)]">Add pet (tag-first)</h1>
      </header>

      <div className="mx-auto mt-5 w-full max-w-3xl">
        <section className="brand-card p-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Activate a physical tag to add a pet</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            New pet profiles are created only through the tag activation flow. This guarantees every pet profile is tied to a purchased NFC tag.
          </p>

          <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-[var(--ink-soft)]">
            <li>Buy a Pet ID tag.</li>
            <li>Tap or scan the tag with your phone.</li>
            <li>Open the activation link and complete setup.</li>
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={ETSY_TAG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-button brand-button-primary"
            >
              <ShoppingBag className="h-4 w-4" />
              Buy tag on Etsy
            </a>
            <Link href="/dashboard" className="brand-button brand-button-secondary border">
              <ScanLine className="h-4 w-4" />
              I already scanned a tag
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
