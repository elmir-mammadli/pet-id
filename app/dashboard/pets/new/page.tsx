import Link from "next/link";

import { createPet } from "../../actions";
import { PetForm } from "../PetForm";

export default function NewPetPage() {
  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            ← Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900">Add pet</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <PetForm
          mode="create"
          onSubmit={createPet}
        />
      </div>
    </main>
  );
}
