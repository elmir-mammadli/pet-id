import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Pet ID.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header className="brand-card p-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)]">Terms of Service</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">Effective date: February 15, 2026</p>
        </header>

        <section className="brand-card space-y-5 p-6 text-sm leading-relaxed text-[var(--ink-soft)]">
          <p>
            These Terms govern your use of Pet ID services, including account access, tag activation, public pet
            profiles, finder reporting, and dashboard tools.
          </p>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">1. Acceptance of Terms</h2>
            <p className="mt-1">
              By using Pet ID, you agree to these Terms. If you do not agree, do not use the service.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">2. Service Description</h2>
            <p className="mt-1">
              Pet ID provides a digital profile and recovery communication service linked to physical NFC tags.
              Activation and account setup are tied to tag ownership and activation links.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">3. Account Responsibilities</h2>
            <p className="mt-1">
              You are responsible for account security, the accuracy of information you provide, and all actions taken
              under your account.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">4. Prohibited Use</h2>
            <p className="mt-1">
              You may not use Pet ID for unlawful, abusive, fraudulent, or harmful activity, including impersonation,
              spam, or unauthorized access attempts.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">5. User Content</h2>
            <p className="mt-1">
              You retain rights to content you provide (pet info, notes, documents), and you grant us the rights needed
              to host, process, and display that content for service functionality.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">6. Availability and Changes</h2>
            <p className="mt-1">
              We may modify, suspend, or discontinue parts of the service, including features and policies, at any time.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">7. Disclaimers</h2>
            <p className="mt-1">
              The service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. We do not guarantee
              uninterrupted operation or successful reunification outcomes.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">8. Limitation of Liability</h2>
            <p className="mt-1">
              To the maximum extent permitted by law, Pet ID is not liable for indirect, incidental, or consequential
              damages arising from use of the service.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">9. Governing Law</h2>
            <p className="mt-1">
              These Terms are governed by applicable laws of your operating jurisdiction unless otherwise required by law.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">10. Contact</h2>
            <p className="mt-1">
              For Terms questions, contact: <a href="mailto:support@pet-id.app" className="font-semibold text-[var(--brand-strong)] hover:underline">support@pet-id.app</a>
            </p>
          </div>

          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Replace legal wording, jurisdiction, and contact details with counsel-approved final text before launch.
          </p>

          <p>
            <Link href="/legal" className="font-semibold text-[var(--brand-strong)] hover:underline">Back to legal</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
