'use client';

import { useEffect, useState } from "react";
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
      className="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-emerald-400"
      disabled={pending}
    >
      {pending ? "Sending..." : "Send alert to the owner"}
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

  useEffect(() => {
    // Если сабмит был успешным — можно сбросить часть локального состояния.
    if (state.status === "success") {
      setLocationStatus(null);
    }
  }, [state.status]);

  async function handleUseLocation() {
    if (!("geolocation" in navigator)) {
      setLocationStatus("Geolocation is not supported on this device.");
      return;
    }

    setLocationStatus("Requesting your location…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationUrl(url);
        setLocationStatus("Location attached to your message.");
      },
      () => {
        setLocationStatus(
          "We couldn’t access your location. You can still submit the form without it.",
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
      },
    );
  }

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 text-center shadow-sm">
        <h2 className="text-xl font-semibold">Thank you for helping!</h2>
        <p className="text-sm text-zinc-600">
          Your message has been sent to {petName}&apos;s human. They&apos;ll
          reach out to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="publicId" value={publicId} />
      <input type="hidden" name="finder_location_url" value={locationUrl} />

      <div className="space-y-2">
        <label
          htmlFor="finder_message"
          className="block text-sm font-medium text-zinc-800"
        >
          Message to the pet&apos;s owner
        </label>
        <textarea
          id="finder_message"
          name="finder_message"
          required
          rows={5}
          value={finderMessage}
          onChange={(e) => setFinderMessage(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          placeholder="Briefly describe where the pet is and how they can contact you."
        />
        <p className="text-[11px] text-zinc-500">
          Please avoid sharing very sensitive personal information. A phone
          number is usually enough.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="finder_phone"
          className="block text-sm font-medium text-zinc-800"
        >
          Your phone number (optional)
        </label>
        <input
          id="finder_phone"
          name="finder_phone"
          type="tel"
          inputMode="tel"
          value={finderPhone}
          onChange={(e) => setFinderPhone(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500"
          placeholder="Include if you’d like the owner to call you"
        />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleUseLocation}
          className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Share my approximate location (optional)
        </button>
        {locationStatus && (
          <p className="text-[11px] text-zinc-500">{locationStatus}</p>
        )}
        {locationUrl && (
          <a
            href={locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wrap-break-word text-[15px] font-semibold text-emerald-700 underline hover:text-emerald-800 transition-colors"
          >
            📍 View shared location
          </a>
        )}
      </div>

      {state.status === "error" && state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

