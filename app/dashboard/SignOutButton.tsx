"use client";

import { useRouter } from "next/navigation";

import { signOut } from "./actions";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} className="brand-button brand-button-secondary border px-4 py-2 text-sm">
      Sign out
    </button>
  );
}
