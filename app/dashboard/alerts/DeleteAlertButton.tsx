"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteAlert } from "./actions";

type Props = {
  alertId: string;
};

export function DeleteAlertButton({ alertId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Remove this alert from inbox?")) {
      return;
    }

    setLoading(true);
    const result = await deleteAlert(alertId);

    if (!result.ok) {
      alert(result.error);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="brand-button brand-button-secondary border px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Removing..." : "Remove alert"}
    </button>
  );
}
