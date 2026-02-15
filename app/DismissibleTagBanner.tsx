"use client";

import { useState } from "react";
import { ShoppingBag, X } from "lucide-react";

const STORAGE_KEY = "home_tag_banner_dismissed";

type Props = {
  etsyUrl: string;
};

export function DismissibleTagBanner({ etsyUrl }: Props) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });

  function handleDismiss() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors; still hide in current view.
    }
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <section className="mx-auto mt-4 w-full max-w-6xl px-4">
      <div className="brand-card-muted relative flex flex-col items-start justify-between gap-3 p-4 pr-12 sm:flex-row sm:items-center">
        <p className="text-sm font-medium text-[var(--ink-soft)]">
          New customer? Buy your NFC pet tag first, then tap it to start activation.
        </p>
        <a
          href={etsyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="brand-button brand-button-secondary border px-4 py-2 text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop on Etsy
        </a>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ccd4ca] bg-white text-[var(--ink-soft)] transition-colors hover:bg-[#f2f5f0] hover:text-[var(--ink)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
