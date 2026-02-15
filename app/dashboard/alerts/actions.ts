"use server";

import { revalidatePath } from "next/cache";

import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

export type DeleteAlertResult = { ok: true } | { ok: false; error: string };

export async function deleteAlert(alertId: string): Promise<DeleteAlertResult> {
  if (!alertId) {
    return { ok: false, error: "Missing alert id." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be logged in." };
  }

  const service = createSupabaseServiceRoleClient();

  const { data: alert } = await service
    .from("alerts")
    .select("id, pet_id")
    .eq("id", alertId)
    .maybeSingle();

  if (!alert) {
    return { ok: false, error: "Alert not found." };
  }

  const { data: pet } = await supabase
    .from("pets")
    .select("id")
    .eq("id", alert.pet_id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!pet) {
    return { ok: false, error: "Access denied." };
  }

  const { error } = await service.from("alerts").delete().eq("id", alertId);
  if (error) {
    console.error("[deleteAlert]", error);
    return { ok: false, error: "Failed to remove alert. Please try again." };
  }

  revalidatePath("/dashboard/alerts");
  return { ok: true };
}
