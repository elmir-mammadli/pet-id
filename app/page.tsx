import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { ETSY_TAG_URL } from "@/lib/constants";
import heroPet from "@/public/images/hero-pet.png";

export const metadata: Metadata = {
  title: "NFC Pet Tags That Bring Pets Home Faster",
  description:
    "Buy an NFC Pet ID tag and activate it in minutes. If your dog or cat is found, Pet ID sends private alerts so you reconnect quickly.",
};

const trustPoints = [
  "Private contact flow",
  "2-minute setup",
  "Mobile-first finder experience",
];

const steps = [
  {
    title: "Buy your NFC tag",
    body: "Order the physical tag, attach it to your pet, and keep it on the collar.",
    icon: ShoppingBag,
  },
  {
    title: "Tap and activate",
    body: "Tap the tag with your phone and complete activation from the personal token link.",
    icon: Smartphone,
  },
  {
    title: "Get alerts instantly",
    body: "When someone finds your pet, they can notify you in seconds through the public profile page.",
    icon: BellRing,
  },
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Pet ID NFC Tag",
    description: "NFC pet tag with digital profile and recovery alerts.",
    brand: "Pet ID",
    category: "Pet Safety",
    offers: {
      "@type": "Offer",
      price: "19.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: ETSY_TAG_URL,
    },
  };

  return (
    <main className="relative min-h-screen overflow-hidden pb-14">
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-30" />

      <header className="reveal-up px-4 pt-5">
        <div className="glass-panel mx-auto flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-white">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <p className="text-sm font-extrabold tracking-tight text-[var(--ink)] sm:text-base">
              Pet ID
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="brand-button brand-button-secondary px-4 py-2 text-sm">
              Log in
            </Link>
            <a
              href={ETSY_TAG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-button brand-button-primary px-4 py-2 text-sm"
            >
              Buy tag
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto mt-4 w-full max-w-6xl px-4">
        <div className="brand-card-muted flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
          <p className="text-sm font-medium text-[var(--ink-soft)]">
            New customer? Buy your NFC pet tag first, then tap it to start activation.
          </p>
          <a
            href={ETSY_TAG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="brand-button brand-button-secondary border px-4 py-2 text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop on Etsy
          </a>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-12 pt-10 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pt-16">
        <div className="reveal-up space-y-6">
          <span className="brand-pill">
            <Sparkles className="h-3.5 w-3.5" />
            Designed for faster reunions
          </span>

          <h1 className="max-w-xl text-4xl font-extrabold tracking-tight text-[var(--ink)] sm:text-5xl">
            NFC pet tags built for real emergency moments.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
            Buy a physical tag, attach it to your pet, then activate it by tapping the tag on a phone. Finders get one clear action path and you get a direct alert.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={ETSY_TAG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-button brand-button-primary text-base"
            >
              Buy tag on Etsy
            </a>
            <Link href="/login" className="brand-button brand-button-secondary text-base">
              I already own a tag
            </Link>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {trustPoints.map((point) => (
              <span key={point} className="brand-pill text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand-strong)]" />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="reveal-up relative">
          <div className="brand-card relative mx-auto max-w-md overflow-hidden p-4 sm:p-6">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#d9f2e0] blur-2xl" />
            <div className="absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-[#e9efe2] blur-xl" />
            <Image
              src={heroPet}
              alt="Golden retriever wearing a digital pet tag"
              priority
              className="relative z-10 mx-auto w-full max-w-[340px] rounded-3xl"
            />
            <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">
              <div className="brand-card-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                  Alert Time
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[var(--ink)]">
                  <Clock3 className="h-4 w-4 text-[var(--brand-strong)]" />
                  Instant delivery
                </p>
              </div>
              <div className="brand-card-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                  Finder UX
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--ink)]">Simple and stress-free</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-3">
        <div className="brand-card grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          {steps.map(({ title, body, icon: Icon }) => (
            <article key={title} className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ddf1e4] text-[var(--brand-strong)]">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h2 className="mt-3 text-base font-bold text-[var(--ink)]">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
