import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Pet ID.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <header className="brand-card p-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--ink)]">Privacy Policy</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">Effective date: February 15, 2026</p>
        </header>

        <section className="brand-card space-y-5 p-6 text-sm leading-relaxed text-[var(--ink-soft)]">
          <p>
            This Privacy Policy explains how Pet ID collects, uses, and protects information when you use our website,
            dashboard, and tag activation services.
          </p>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">1. Information We Collect</h2>
            <p className="mt-1">
              We may collect account details (email), profile details (name, phone), pet profile information, documents
              you upload, and finder alert submissions (message, optional contact data, optional location).
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">2. How We Use Information</h2>
            <p className="mt-1">
              We use data to provide tag activation, public pet profile display, owner notifications, account security,
              and service operations (such as anti-abuse checks and troubleshooting).
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">3. Public vs Private Data</h2>
            <p className="mt-1">
              Data intentionally entered into the public pet profile may be visible to people who access the pet tag URL.
              Owner account data and uploaded documents are private to the owner unless explicitly shared.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">4. Data Sharing</h2>
            <p className="mt-1">
              We do not sell personal information. We may share data with service providers required to operate the
              platform (for example hosting, authentication, and infrastructure) and when required by law.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">5. Data Retention</h2>
            <p className="mt-1">
              We retain account and pet profile data while your account is active, and longer when needed for legal,
              security, or legitimate business reasons.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">6. Your Rights</h2>
            <p className="mt-1">
              Depending on your location, you may have rights to access, update, or delete your data. To request this,
              contact us using the contact details below.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">7. Security</h2>
            <p className="mt-1">
              We use reasonable technical and organizational safeguards, but no system is completely secure.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">8. Children</h2>
            <p className="mt-1">
              Pet ID is not directed to children under 13. Do not use the service if you are under the age required in
              your jurisdiction.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">9. Changes to This Policy</h2>
            <p className="mt-1">We may update this policy from time to time. Updated versions are posted on this page.</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-[var(--ink)]">10. Contact</h2>
            <p className="mt-1">
              For privacy questions, contact: <a href="mailto:support@pet-id.app" className="font-semibold text-[var(--brand-strong)] hover:underline">support@pet-id.app</a>
            </p>
          </div>

          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Replace contact details and legal wording with your final counsel-approved text before launch.
          </p>

          <p>
            <Link href="/legal" className="font-semibold text-[var(--brand-strong)] hover:underline">Back to legal</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
