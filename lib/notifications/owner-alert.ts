type NotificationChannel = "email" | "sms";

export type OwnerAlertNotificationInput = {
  ownerDisplayName: string | null;
  ownerEmail: string | null;
  ownerPhone: string | null;
  petName: string;
  petBreed: string | null;
  petAgeYears: number | null;
  publicId: string;
  finderMessage: string;
  finderPhone: string | null;
  finderLocationUrl: string | null;
};

export type OwnerAlertNotificationResult = {
  attempted: NotificationChannel[];
  delivered: NotificationChannel[];
  errors: string[];
};

type NotificationContent = {
  subject: string;
  text: string;
  html: string;
  sms: string;
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function toE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = normalizePhone(phone);
  if (digits.length < 7 || digits.length > 15) return null;
  return `+${digits}`;
}

function getAppBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) return "http://localhost:3000";

  try {
    return new URL(configured).toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function petDescriptor(age: number | null, breed: string | null): string {
  const breedLabel = breed?.trim();
  const ageLabel =
    age == null
      ? null
      : `${age} year${age === 1 ? "" : "s"} old`;

  if (breedLabel && ageLabel) return `${ageLabel} ${breedLabel}`;
  if (breedLabel) return breedLabel;
  if (ageLabel) return ageLabel;
  return "pet";
}

function buildContent(input: OwnerAlertNotificationInput): NotificationContent {
  const ownerName = input.ownerDisplayName?.trim() || "there";
  const descriptor = petDescriptor(input.petAgeYears, input.petBreed);
  const baseUrl = getAppBaseUrl();
  const publicUrl = `${baseUrl}/p/${encodeURIComponent(input.publicId)}`;
  const alertsUrl = `${baseUrl}/dashboard/alerts`;
  const finderContact = input.finderPhone?.trim() || "Not provided";
  const finderLocation = input.finderLocationUrl || "Not shared";
  const safeMessage = input.finderMessage.trim();

  const subject = `PawPort alert: ${input.petName} may have been found`;

  const text = [
    `Hi ${ownerName},`,
    "",
    `A finder just submitted an alert for ${input.petName} (${descriptor}).`,
    "",
    `Finder contact: ${finderContact}`,
    `Finder location: ${finderLocation}`,
    "",
    "Finder message:",
    safeMessage,
    "",
    `Open alerts inbox: ${alertsUrl}`,
    `Public pet page: ${publicUrl}`,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1a1f1a">
      <p>Hi ${escapeHtml(ownerName)},</p>
      <p><strong>${escapeHtml(input.petName)}</strong> may have been found. A finder just submitted a new alert in PawPort.</p>
      <p><strong>Finder contact:</strong> ${escapeHtml(finderContact)}<br/>
      <strong>Finder location:</strong> ${escapeHtml(finderLocation)}</p>
      <p><strong>Finder message:</strong><br/>${escapeHtml(safeMessage).replaceAll("\n", "<br/>")}</p>
      <p>
        <a href="${escapeHtml(alertsUrl)}">Open alerts inbox</a><br/>
        <a href="${escapeHtml(publicUrl)}">Open public pet page</a>
      </p>
    </div>
  `.trim();

  const sms = [
    `PawPort alert: ${input.petName} may have been found.`,
    `Contact: ${finderContact}.`,
    `Location: ${finderLocation}.`,
    `Message: ${safeMessage}`,
    `Alerts: ${alertsUrl}`,
  ].join(" ");

  return { subject, text, html, sms };
}

async function sendEmail(ownerEmail: string, content: NotificationContent): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !fromEmail) {
    throw new Error("Resend is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [ownerEmail],
      subject: content.subject,
      text: content.text,
      html: content.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body.slice(0, 500)}`);
  }
}

async function sendSms(ownerPhone: string, content: NotificationContent): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber = process.env.TWILIO_FROM_NUMBER?.trim();

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio is not configured.");
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: ownerPhone,
        From: fromNumber,
        Body: content.sms,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Twilio error ${response.status}: ${body.slice(0, 500)}`);
  }
}

export async function notifyOwnerOfFinderAlert(
  input: OwnerAlertNotificationInput,
): Promise<OwnerAlertNotificationResult> {
  const result: OwnerAlertNotificationResult = {
    attempted: [],
    delivered: [],
    errors: [],
  };

  const content = buildContent(input);

  const email = input.ownerEmail?.trim();
  if (email && process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    result.attempted.push("email");
    try {
      await sendEmail(email, content);
      result.delivered.push("email");
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : "Unknown email notification error.",
      );
    }
  }

  const smsPhone = toE164(input.ownerPhone);
  if (
    smsPhone &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  ) {
    result.attempted.push("sms");
    try {
      await sendSms(smsPhone, content);
      result.delivered.push("sms");
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : "Unknown SMS notification error.",
      );
    }
  }

  return result;
}
