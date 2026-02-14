"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { submitFoundForm, type FoundFormState } from "./actions";

type FoundFormProps = {
  publicId: string;
  petName: string;
};

const initialState: FoundFormState = {
  status: "idle",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="brand-button brand-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Sending alert..." : "Send alert to owner"}
    </button>
  );
}

export function FoundForm({ publicId, petName }: FoundFormProps) {
  const [state, formAction] = useFormState(submitFoundForm, initialState);
  const [finderMessage, setFinderMessage] = useState(
    `Hi, I found your pet ${petName}. They are safe with me. Please contact me to arrange pickup.`,
  );
  const [finderPhone, setFinderPhone] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocation is not supported on this device.");
      return;
    }

    setLocationStatus("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationUrl(url);
        setLocationStatus("Location attached to your message.");
      },
      () => {
        setLocationStatus("We could not access your location. You can submit without it.");
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
      },
    );
  }

  if (state.status === "success") {
    return (
      <div className="brand-card p-6 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Alert sent</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Thank you for helping. You can contact {petName}&apos;s owner directly:
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {state.telLink && (
            <a href={state.telLink} className="brand-button brand-button-secondary border">
              Call owner
            </a>
          )}
          {state.smsLink && (
            <a href={state.smsLink} className="brand-button brand-button-primary">
              Send SMS
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="brand-card flex flex-col gap-5 p-5 md:p-6">
      <input type="hidden" name="publicId" value={publicId} />
      <input type="hidden" name="finder_location_url" value={locationUrl} />

      <div>
        <label htmlFor="finder_message" className="block text-sm font-semibold text-[var(--ink)]">
          Message for owner
        </label>
        <textarea
          id="finder_message"
          name="finder_message"
          required
          rows={5}
          value={finderMessage}
          onChange={(e) => setFinderMessage(e.target.value)}
          className="brand-input mt-1"
          placeholder="Share where the pet is and best way to reach you."
        />
        <p className="mt-1 text-[11px] text-[var(--ink-soft)]">
          Keep the message practical and short so the owner can act quickly.
        </p>
      </div>

      <div>
        <label htmlFor="finder_phone" className="block text-sm font-semibold text-[var(--ink)]">
          Your phone number (optional)
        </label>
        <input
          id="finder_phone"
          name="finder_phone"
          type="tel"
          inputMode="tel"
          value={finderPhone}
          onChange={(e) => setFinderPhone(e.target.value)}
          className="brand-input mt-1"
          placeholder="Add a number if you want a callback"
        />
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3">
        <button
          type="button"
          onClick={handleUseLocation}
          className="brand-button brand-button-secondary w-full border"
        >
          Share approximate location (optional)
        </button>
        {locationStatus && <p className="mt-2 text-xs text-[var(--ink-soft)]">{locationStatus}</p>}
        {locationUrl && (
          <a
            href={locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm font-semibold text-[var(--brand-strong)] hover:underline"
          >
            View shared location
          </a>
        )}
      </div>

      {state.status === "error" && state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
