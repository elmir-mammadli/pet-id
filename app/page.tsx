import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  MessageSquareText,
  ScanLine,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
} from "lucide-react";

import { ETSY_TAG_URL } from "@/lib/constants";
import heroNfc from "@/public/images/hero-nfc.png";
import { DismissibleTagBanner } from "./DismissibleTagBanner";

function PawPrintIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24"
      className="h-6 w-6 text-[#2d6a4f]"
      aria-hidden
    >
      <path d="M12 2C9.5 2 8 4 8 6s1.5 4 4 4 4-2 4-4-1.5-4-4-4zm-5 6C5.5 8 4 9.5 4 11s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3zm10 0c-1.5 0-3 1.5-3 3s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3zM6.5 15C4.5 15 3 17 3 19s1.5 3 3 3c.8 0 1.5-.3 2-.8L12 24l4-2.8c.5.5 1.2.8 2 .8 1.5 0 3-1.5 3-3s-1.5-4-3.5-4c-.8 0-1.6.4-2.2 1L12 17.5l-3.3-1.5c-.6-.6-1.4-1-2.2-1z" />
    </svg>
  );
}

function TigoWordmark() {
  return (
    <Image
      src="/tigo.svg"
      alt="Tigo"
      width={100}
      height={32}
      className="hidden md:block h-5 w-auto"
      priority
    />
  );
}

export const metadata: Metadata = {
  title: "PawPort by Tigo",
  description:
    "Buy an NFC PawPort tag and activate it in minutes. If your dog or cat is found, PawPort sends private alerts so you reconnect quickly.",
};

const trustPoints = [
  "Private contact flow",
  "2-minute setup",
  "Mobile-first finder experience",
];

type OnboardingStep = {
  title: string;
  body: string;
  hint: string;
  icon: LucideIcon;
  secondaryIcon: LucideIcon;
  visualLabel: string;
  bullets: string[];
};

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Buy and attach your tag",
    body: "Get a PawPort NFC tag and clip it to your pet's collar so finders have one clear place to scan.",
    hint: "Physical tag on collar",
    icon: ShoppingBag,
    secondaryIcon: Tag,
    visualLabel: "Purchase -> Attach",
    bullets: [
      "Attach once to the collar.",
      "Ready for finder scans right away.",
    ],
  },
  {
    title: "Tap and complete setup",
    body: "Tap the tag with your phone, open the activation link, and add your pet profile details in minutes.",
    hint: "No app download required",
    icon: Smartphone,
    secondaryIcon: ScanLine,
    visualLabel: "Tap -> Activate",
    bullets: [
      "Open your personal activation link.",
      "Add photo, notes, and key info.",
    ],
  },
  {
    title: "Get finder alerts instantly",
    body: "When someone scans the tag, they land on your pet's page and can send you a direct private alert.",
    hint: "Fast owner notification",
    icon: BellRing,
    secondaryIcon: MessageSquareText,
    visualLabel: "Scan -> Alert",
    bullets: [
      "Finder sees a clear public page.",
      "You get a private contact alert fast.",
    ],
  },
];

export default function HomePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "PawPort NFC Tag",
    description: "NFC pet tag with digital profile and recovery alerts.",
    brand: "PawPort",
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
            <PawPrintIcon />
            <div className="flex items-center gap-2">
              <p className="text-sm font-extrabold tracking-tight text-[var(--ink)] sm:text-base">
                PawPort <span className="hidden md:inline">by</span>
              </p>
              <TigoWordmark />
            </div>
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

      <DismissibleTagBanner etsyUrl={ETSY_TAG_URL} />

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
              Buy tag
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

        <div className="reveal-up relative brand-card p-5 rounded-3xl">
          <Image
            src={heroNfc}
            alt="PawPort NFC tag product image"
            priority
            className="mx-auto w-full max-w-lg rounded-2xl"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-3">
        <div className="brand-card p-5 sm:p-6">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--brand-strong)">
              onboarding
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--ink)]">
              How PawPort works in real life
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
              This flow is built around the physical NFC tag so setup is simple for you and obvious for anyone who finds your pet.
            </p>
          </div>

          <ol className="grid gap-4 md:grid-cols-3">
            {onboardingSteps.map(({ title, body, hint, icon: Icon, secondaryIcon: SecondaryIcon, visualLabel, bullets }, index) => (
              <li key={title} className="brand-card-muted overflow-hidden p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]">
                    Step {index + 1}
                  </span>
                  <span className="rounded-full border border-[#cfe0d3] bg-[#eaf4ee] px-2 py-0.5 text-[11px] font-semibold text-[var(--brand-strong)]">
                    {hint}
                  </span>
                </div>

                <div className="mt-3 rounded-2xl border border-[#d7ded3] bg-[linear-gradient(145deg,#fbfdfa_0%,#eff5ef_100%)] p-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#dff0e5] text-[var(--brand-strong)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-[#7b8d7f]" />
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#cadece] bg-white text-[var(--brand-strong)]">
                      <SecondaryIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-2 text-center text-[11px] font-semibold text-[var(--ink-soft)]">{visualLabel}</p>
                </div>

                <h3 className="mt-3 text-base font-extrabold tracking-tight text-[var(--ink)]">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">{body}</p>
                <ul className="mt-3 space-y-1.5">
                  {bullets.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-[var(--ink-soft)]">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-strong)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="mx-auto mt-8 w-full max-w-6xl px-4">
        <div className="flex flex-wrap items-center gap-4 pb-4 text-xs text-[var(--ink-soft)]">
          <Link href="/privacy" className="font-semibold text-[var(--brand-strong)] hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="font-semibold text-[var(--brand-strong)] hover:underline">
            Terms of Service
          </Link>
          <Link href="/legal" className="font-semibold text-[var(--brand-strong)] hover:underline">
            Legal
          </Link>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </main>
  );
}
