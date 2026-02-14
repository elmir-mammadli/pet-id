import Link from "next/link";

import { createPet } from "../../actions";
import { PetForm } from "../PetForm";

export default function NewPetPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <header className="glass-panel mx-auto flex w-full max-w-3xl items-center gap-4 rounded-full px-4 py-2.5">
        <Link href="/dashboard" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
          Back to dashboard
        </Link>
        <h1 className="text-base font-extrabold tracking-tight text-[var(--ink)]">Add pet profile</h1>
      </header>

      <div className="mx-auto mt-5 w-full max-w-3xl">
        <PetForm mode="create" onSubmit={createPet} />
      </div>
    </main>
  );
}
