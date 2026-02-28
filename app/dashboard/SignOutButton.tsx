"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOut } from "./actions";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut} className=" border rounded-full brand-button-secondary p-2 text-sm cursor-pointer">
      <LogOut className="h-4.5 w-4.5 text-(--ink-soft)" />
    </button>
  );
}
