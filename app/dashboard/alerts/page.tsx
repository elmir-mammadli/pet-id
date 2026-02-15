import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock3, MapPinned, MessageSquareText, PhoneCall, ShieldCheck } from "lucide-react";

import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";

type PetSummary = {
  id: string;
  name: string;
  public_id: string;
  photo_path: string | null;
};

type AlertRow = {
  id: string;
  pet_id: string;
  public_id: string;
  finder_message: string;
  finder_phone: string | null;
  finder_location_url: string | null;
  user_agent: string | null;
  created_at: string;
};

export const metadata: Metadata = {
  title: "Alerts Inbox",
  description: "Owner inbox for finder reports and recovery alerts.",
  robots: { index: false, follow: false },
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `+${digits}` : phone;
}

function formatTimestamp(iso: string): { relative: string; full: string; isFresh: boolean } {
  const created = new Date(iso);
  const diffMs = Date.now() - created.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const full = created.toLocaleString();

  if (diffMins < 1) {
    return { relative: "Just now", full, isFresh: true };
  }
  if (diffMins < 60) {
    return { relative: `${diffMins} min ago`, full, isFresh: diffMins <= 15 };
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return { relative: `${diffHours}h ago`, full, isFresh: diffHours <= 6 };
  }

  const diffDays = Math.floor(diffHours / 24);
  return { relative: `${diffDays}d ago`, full, isFresh: false };
}

export default async function AlertsInboxPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: pets } = await supabase
    .from("pets")
    .select("id, name, public_id, photo_path")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const petList = (pets ?? []) as PetSummary[];
  const petMap = new Map(petList.map((pet) => [pet.id, pet]));

  let alerts: AlertRow[] = [];
  if (petList.length > 0) {
    const petIds = petList.map((p) => p.id);
    const service = createSupabaseServiceRoleClient();

    const { data } = await service
      .from("alerts")
      .select("id, pet_id, public_id, finder_message, finder_phone, finder_location_url, user_agent, created_at")
      .in("pet_id", petIds)
      .order("created_at", { ascending: false })
      .limit(200);

    alerts = (data ?? []) as AlertRow[];
  }

  const freshCount = alerts.filter((alert) => formatTimestamp(alert.created_at).isFresh).length;

  return (
    <main className="min-h-screen px-4 py-8">
      <header className="glass-panel mx-auto flex w-full max-w-4xl items-center justify-between gap-3 rounded-full px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
            Back to dashboard
          </Link>
          <h1 className="text-base font-extrabold tracking-tight text-[var(--ink)]">Alerts inbox</h1>
        </div>
        <span className="brand-pill">
          {alerts.length} total{freshCount > 0 ? ` · ${freshCount} new` : ""}
        </span>
      </header>

      <div className="mx-auto mt-5 flex w-full max-w-4xl flex-col gap-4">
        <section className="brand-card-muted flex items-start gap-3 p-4">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ddf1e4] text-[var(--brand-strong)]">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Recovery-first inbox</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Respond fast when alerts are fresh. Call or text the finder, confirm pickup location, and coordinate safe return.
            </p>
          </div>
        </section>

        {alerts.length === 0 ? (
          <section className="brand-card p-8 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--ink)]">No alerts yet</h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              When someone reports finding your pet, alerts will appear here instantly.
            </p>
          </section>
        ) : (
          <ul className="space-y-4">
            {alerts.map((alert) => {
              const pet = petMap.get(alert.pet_id);
              const time = formatTimestamp(alert.created_at);
              const finderPhone = alert.finder_phone?.trim();
              const normalizedPhone = finderPhone ? normalizePhone(finderPhone) : null;

              return (
                <li key={alert.id} className="brand-card overflow-hidden">
                  <article className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="flex items-center gap-3 sm:w-[17rem]">
                        <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#e6ece3]">
                          {pet?.photo_path ? (
                            <Image
                              src={pet.photo_path}
                              alt={pet.name}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] text-[var(--ink-soft)]">
                              No photo
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-base font-extrabold tracking-tight text-[var(--ink)]">
                            {pet?.name ?? "Unknown pet"}
                          </p>
                          <p className="truncate font-mono text-xs text-[var(--ink-soft)]">/p/{alert.public_id}</p>
                          <p className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--ink-soft)]" title={time.full}>
                            <Clock3 className="h-3.5 w-3.5" />
                            {time.relative}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
                            Finder message
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">
                            {alert.finder_message}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {normalizedPhone && (
                            <a href={`tel:${normalizedPhone}`} className="brand-button brand-button-primary px-3 py-2 text-sm">
                              <PhoneCall className="h-4 w-4" />
                              Call finder
                            </a>
                          )}

                          {normalizedPhone && (
                            <a href={`sms:${normalizedPhone}`} className="brand-button brand-button-secondary border px-3 py-2 text-sm">
                              <MessageSquareText className="h-4 w-4" />
                              Text finder
                            </a>
                          )}

                          {alert.finder_location_url && (
                            <a
                              href={alert.finder_location_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="brand-button brand-button-secondary border px-3 py-2 text-sm"
                            >
                              <MapPinned className="h-4 w-4" />
                              Open location
                            </a>
                          )}

                          {pet && (
                            <Link href={`/dashboard/pets/${pet.id}`} className="brand-button brand-button-secondary border px-3 py-2 text-sm">
                              Open owner view
                            </Link>
                          )}

                          <a
                            href={`/p/${encodeURIComponent(alert.public_id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="brand-button brand-button-secondary border px-3 py-2 text-sm"
                          >
                            Open public page
                          </a>
                        </div>

                        {finderPhone && (
                          <p className="mt-2 text-xs text-[var(--ink-soft)]">Finder phone: {finderPhone}</p>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
