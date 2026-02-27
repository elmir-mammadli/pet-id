type NotificationChannel = "email" | "sms";
type NotificationSkipReason =
  | "owner_email_missing"
  | "email_not_configured"
  | "owner_phone_missing"
  | "owner_phone_invalid"
  | "sms_not_configured";

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
  skipped: NotificationSkipReason[];
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
  const reportedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = `Urgent: ${input.petName} may have been found`;

  const text = [
    `Hi ${ownerName},`,
    "",
    `A finder just submitted an alert for ${input.petName} (${descriptor}) at ${reportedAt}.`,
    "Stay calm and respond quickly for the best chance of reunion.",
    "",
    `Finder contact: ${finderContact}`,
    `Finder location: ${finderLocation}`,
    "",
    "Finder message:",
    safeMessage,
    "",
    "Recommended next steps:",
    "1) Open alerts inbox and review details.",
    "2) Call or text the finder as soon as possible.",
    "3) Coordinate pickup in a safe public location.",
    "",
    `Open alerts inbox: ${alertsUrl}`,
    `Public pet page: ${publicUrl}`,
  ].join("\n");

  const html = `
    <div style="margin:0;padding:20px 0;background:#f4f8f5;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#1a1f1a;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td align="center" style="padding:0 12px;">
            <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 10px 0;font-size:12px;color:#3f5748;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                  PawPort by Tigo
                </td>
              </tr>
              <tr>
                <td style="background:#ffffff;border:1px solid #d7ddd2;border-radius:16px;padding:0;">
                  <div style="padding:20px 20px 8px 20px;">
                    <div style="display:inline-block;padding:6px 10px;background:#fff3e8;border:1px solid #f1d6bb;border-radius:999px;color:#9a3412;font-size:12px;font-weight:700;">
                      Action recommended
                    </div>
                    <h1 style="margin:12px 0 6px 0;font-size:24px;line-height:1.25;color:#1a1f1a;">
                      ${escapeHtml(input.petName)} may have been found
                    </h1>
                    <p style="margin:0 0 6px 0;font-size:15px;line-height:1.6;color:#4f6253;">
                      Hi ${escapeHtml(ownerName)}, a finder submitted a new report for your ${escapeHtml(descriptor)} at ${escapeHtml(reportedAt)}.
                    </p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#236d44;font-weight:600;">
                      Stay calm and respond quickly. Fast, clear replies improve reunion chances.
                    </p>
                  </div>

                  <div style="padding:16px 20px 0 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f7f9f6;border:1px solid #dde3d9;border-radius:12px;">
                      <tr>
                        <td style="padding:14px 14px 0 14px;font-size:12px;font-weight:700;letter-spacing:0.06em;color:#556a5b;text-transform:uppercase;">
                          Finder details
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 14px 0 14px;font-size:14px;line-height:1.6;color:#1f2a20;">
                          <strong>Contact:</strong> ${escapeHtml(finderContact)}<br/>
                          <strong>Location:</strong> ${escapeHtml(finderLocation)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 14px 14px 14px;font-size:14px;line-height:1.6;color:#1f2a20;">
                          <strong>Finder message:</strong><br/>
                          <span style="display:block;margin-top:6px;padding:10px 12px;background:#ffffff;border:1px solid #dce3d8;border-radius:10px;">
                            ${escapeHtml(safeMessage).replaceAll("\n", "<br/>")}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <div style="padding:16px 20px 0 20px;">
                    <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#304236;letter-spacing:0.04em;text-transform:uppercase;">
                      What to do now
                    </p>
                    <ol style="margin:0;padding:0 0 0 20px;color:#495d4e;font-size:14px;line-height:1.65;">
                      <li>Open your alerts inbox and review the full report.</li>
                      <li>Call or text the finder as soon as possible.</li>
                      <li>Arrange pickup in a safe public location.</li>
                    </ol>
                  </div>

                  <div style="padding:18px 20px 22px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="padding:0 10px 10px 0;">
                          <a href="${escapeHtml(alertsUrl)}" style="display:inline-block;padding:12px 18px;background:#2f8a57;border:1px solid #2f8a57;border-radius:999px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
                            Open alerts inbox
                          </a>
                        </td>
                        <td style="padding:0 0 10px 0;">
                          <a href="${escapeHtml(publicUrl)}" style="display:inline-block;padding:12px 18px;background:#ffffff;border:1px solid #c9d2c6;border-radius:999px;color:#1f2a20;text-decoration:none;font-size:14px;font-weight:700;">
                            Open public pet page
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:4px 0 0 0;font-size:12px;line-height:1.5;color:#6c7a70;">
                      If a button does not work, copy this link:<br/>
                      <a href="${escapeHtml(alertsUrl)}" style="color:#236d44;text-decoration:underline;">${escapeHtml(alertsUrl)}</a>
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
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
    skipped: [],
  };

  const content = buildContent(input);

  const email = input.ownerEmail?.trim();
  if (!email) {
    result.skipped.push("owner_email_missing");
  } else if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    result.skipped.push("email_not_configured");
  } else {
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
  if (!input.ownerPhone?.trim()) {
    result.skipped.push("owner_phone_missing");
  } else if (!smsPhone) {
    result.skipped.push("owner_phone_invalid");
  } else if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !process.env.TWILIO_FROM_NUMBER
  ) {
    result.skipped.push("sms_not_configured");
  } else {
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
