"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deletePet } from "./actions";

type Props = {
  petId: string;
  petName: string;
};

export function DeletePetButton({ petId, petName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(`Remove ${petName}? This cannot be undone. Their tag link will stop working.`)
    ) {
      return;
    }
    setLoading(true);
    const result = await deletePet(petId);
    if (result.ok) {
      router.refresh();
      return;
    }
    alert(result.error);
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? "Removing…" : "Remove"}
    </button>
  );
}
