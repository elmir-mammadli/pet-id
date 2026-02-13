import Link from "next/link";
import { Shield } from "lucide-react";
import heroPet from "@/public/images/hero-pet.png";
import Image from "next/image";

/**
 * WHY IS MY BG BLACK?
 * 
 * Your background color is controlled by `bg-background` (Tailwind utility).
 * If your Tailwind theme doesn't define `background` in the `colors` palette,
 * it defaults to `black`! 
 * 
 * To fix this, define "background" (and other semantic colors) in your 
 * Tailwind config, or use a hardcoded class like `bg-white`.
 * 
 * Example quick fix: change `bg-background` to `bg-white` below.
 */

const Index = () => {
  return (
    <main className="flex min-h-screen flex-col bg-linear-to-b from-[#f5f0eb] via-[#f5f0eb] to-[#ebe5dd]">
      {/* Header */}
      <header className="border-b border-[#e0d8cf] bg-[#faf8f6]/80 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#3a8f6a]" />
            <span className="text-lg font-semibold tracking-tight text-[#2a1f14]">Pet ID</span>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-[#3a8f6a] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#327a5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a8f6a] focus-visible:ring-offset-2"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-8 px-5 py-12">
        {/* Pet image */}
        <div className=" overflow-hidden rounded-3xl shadow-soft-lg">
          <Image
            src={heroPet}
            alt="A cute golden retriever puppy"
            width={heroPet.width}
            height={heroPet.height}
            className="h-48 md:h-64 w-full object-cover"
          />
        </div>

        {/* Text */}
        <div className=" text-center">
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-[#2a1f14]">
          Because they&apos;d never <br />
          stop looking for you.
          </h1>
          <p className="mx-auto mt-4 max-w-68 text-[0.95rem] leading-relaxed text-[#7a6e62]">
          A simple digital ID that helps bring your pet home safely.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex w-full  flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-full bg-[#3a8f6a] px-4 py-4 text-[17px] font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a8f6a] focus-visible:ring-offset-2"
          >
            Protect my pet
          </Link>
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center rounded-full border border-[#e0d8cf] bg-[#faf8f6] px-4 py-4 text-[17px] font-semibold text-[#2a1f14] shadow-sm transition-all hover:bg-[#ebe5dd] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a8f6a] focus-visible:ring-offset-2"
          >
            Create account
          </Link>
        </div>

        {/* Footer note */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-5 text-[#7a6e62]">
            <span className="flex items-center gap-1.5 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-heart h-3.5 w-3.5 text-[#d4822a]"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
              10k+ pets safe
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-star h-3.5 w-3.5 text-[#d4822a]"
              >
                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
              </svg>
              4.9 rated
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-lock h-3.5 w-3.5 text-[#d4822a]"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Secure
            </span>
          </div>
          <p className="text-center text-xs text-[#7a6e62]/70">
            Found a pet? Use the link on their tag to report it.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Index;
