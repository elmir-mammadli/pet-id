import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createSupabaseAnonServerClient } from "@/lib/supabase/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { ClaimTagForm } from "./ClaimTagForm";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ActivatePage({ params }: Props) {
  const { token } = await params;
  const anon = createSupabaseAnonServerClient();

  // Resolve active tag → redirect to public pet page
  const { data: redirectRow } = await anon
    .from("tag_redirects")
    .select("public_id")
    .eq("activation_token", token)
    .maybeSingle();

  if (redirectRow?.public_id) {
    redirect(`/p/${redirectRow.public_id}`);
  }

  // Tag might be unclaimed or invalid
  const { data: tag } = await anon
    .from("tags")
    .select("id, activation_token, status")
    .eq("activation_token", token)
    .maybeSingle();

  if (!tag) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">
            Invalid or unknown tag
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            This activation link is not recognized. If you found this pet, please
            contact a local shelter or vet.
          </p>
        </div>
      </main>
    );
  }

  if (tag.status !== "unclaimed") {
    // Should have been redirected; if not, tag might be in inconsistent state
    notFound();
  }

  const serverSupabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-zinc-900">
              This tag has not been registered yet
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              Log in or create an account to register this Pet ID tag and add your
              pet&apos;s profile.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/login?next=${encodeURIComponent(`/activate/${token}`)}`}
                className="inline-flex w-full justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Log in to register this tag
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(`/activate/${token}`)}`}
                className="inline-flex w-full justify-center rounded-full border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-zinc-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-900">
            Register your Pet ID tag
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Add your pet&apos;s details. After this, anyone who taps the tag will
            see the profile and can report finding your pet.
          </p>
        </div>
        <ClaimTagForm activationToken={token} />
      </div>
    </main>
  );
}
