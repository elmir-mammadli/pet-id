import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { createSupabaseAnonServerClient, createSupabaseServerClient } from "@/lib/supabase/server";

import { ClaimTagForm } from "./ClaimTagForm";

type Props = {
  params: Promise<{ token: string }>;
};

function CenterState({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-14">
      <div className="brand-card mx-auto w-full max-w-xl p-7 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">{description}</p>
        {children}
      </div>
    </main>
  );
}

export default async function ActivatePage({ params }: Props) {
  const { token } = await params;
  const anon = createSupabaseAnonServerClient();

  const { data: redirectRow } = await anon
    .from("tag_redirects")
    .select("public_id")
    .eq("activation_token", token)
    .maybeSingle();

  if (redirectRow?.public_id) {
    redirect(`/p/${redirectRow.public_id}`);
  }

  const { data: tag } = await anon
    .from("tags")
    .select("id, activation_token, status")
    .eq("activation_token", token)
    .maybeSingle();

  if (!tag) {
    return (
      <CenterState
        title="Invalid or unknown tag"
        description="This activation link is not recognized. If you found this pet, please contact a nearby shelter or veterinary clinic."
      />
    );
  }

  if (tag.status !== "unclaimed") {
    notFound();
  }

  const serverSupabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return (
      <CenterState
        title="This tag has not been registered yet"
        description="Log in or create an account to claim this Pet ID tag and publish your pet's profile."
      >
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/login?next=${encodeURIComponent(`/activate/${token}`)}`}
            className="brand-button brand-button-primary w-full"
          >
            Log in to register this tag
          </Link>
          <Link
            href={`/signup?next=${encodeURIComponent(`/activate/${token}`)}`}
            className="brand-button brand-button-secondary w-full border"
          >
            Create account
          </Link>
        </div>
      </CenterState>
    );
  }

  return (
    <main className="relative min-h-screen overflow-x-clip px-4 py-10">
      <div className="pointer-events-none absolute inset-0 soft-grid opacity-20" />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-5">
        <header className="brand-card-muted p-6">
          <span className="brand-pill">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tag activation
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--ink)]">Register your Pet ID tag</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">
            Add your pet details once. After activation, anyone who scans the tag sees a clear public profile and can notify you immediately.
          </p>
        </header>

        <ClaimTagForm activationToken={token} />
      </div>
    </main>
  );
}
