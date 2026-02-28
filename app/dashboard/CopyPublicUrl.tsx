"use client";

import { Copy } from "lucide-react";
import { useState, useCallback } from "react";

type Props = {
  publicUrl: string;
};

export function CopyPublicUrl({ publicUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    } catch {
      setCopied(false);
    }
  }, [publicUrl]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="mt-2 flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-transparent py-1.5 pr-2 pl-1 text-left font-mono text-xs text-(--ink-soft) transition-colors hover:bg-(--surface-muted) hover:text-(--ink) focus:bg-(--surface-muted) focus:text-(--ink) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--brand-strong)"
      aria-label={copied ? "Copied to clipboard" : "Copy public page link"}
      title={publicUrl}
    >
      <Copy className="h-4 w-4 shrink-0 text-(--ink-soft)" aria-hidden />
      <span className="min-w-0 truncate relative block">
        <span
          className={`absolute inset-0 transition-opacity duration-250 ease-in-out ${
            copied ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-live="polite"
        >
          Copied!
        </span>
        <span
          className={`transition-opacity duration-250 ease-in-out ${
            copied ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          {publicUrl}
        </span>
      </span>
    </button>
  );
}
