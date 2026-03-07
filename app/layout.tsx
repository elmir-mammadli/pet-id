import type { Metadata } from "next";
import Script from "next/script";

import "./globals.css";

function getMetadataBase() {
  const fallback = "http://localhost:3000";
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured) {
    return new URL(fallback);
  }

  try {
    return new URL(configured);
  } catch {
    return new URL(fallback);
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "PawPort by Tigo",
    template: "%s | PawPort by Tigo",
  },
  description:
    "PawPort by Tigo helps reunite lost pets faster with NFC tags, private contact flows, and instant finder alerts.",
  applicationName: "PawPort by Tigo",
  keywords: [
    "nfc pet tag",
    "lost pet alert system",
    "dog nfc collar tag",
    "cat nfc id tag",
    "digital pet profile",
    "finder to owner contact",
    "pet reunification",
    "pet safety app",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PawPort by Tigo",
    description:
      "PawPort by Tigo is a modern pet safety platform: activate tags, share profiles, and receive finder alerts instantly.",
    siteName: "PawPort by Tigo",
    images: [
      {
        url: "/images/hero-nfc.png",
        width: 1200,
        height: 630,
        alt: "PawPort by Tigo digital tag and pet safety experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PawPort by Tigo",
    description:
      "Protect your dog or cat with PawPort by Tigo and instant finder contact.",
    images: ["/images/hero-nfc.png"],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "pets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
