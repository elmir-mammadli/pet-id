import type { Metadata } from "next";

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
    default: "Pet ID | Digital Lost & Found Tag for Pets",
    template: "%s | Pet ID",
  },
  description:
    "Pet ID helps families reunite with lost dogs and cats faster through smart digital tags, private contact flows, and instant finder alerts.",
  applicationName: "Pet ID",
  keywords: [
    "pet id tag",
    "lost pet recovery",
    "dog qr tag",
    "cat id tag",
    "digital pet profile",
    "pet owner alert",
    "pet safety app",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Pet ID | Digital Lost & Found Tag for Pets",
    description:
      "A modern pet safety platform: activate tags, share profiles, and receive finder alerts instantly.",
    siteName: "Pet ID",
    images: [
      {
        url: "/images/hero-pet.png",
        width: 1200,
        height: 630,
        alt: "Pet ID digital tag and pet safety experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pet ID | Digital Lost & Found Tag for Pets",
    description:
      "Protect your dog or cat with a smart digital ID and instant finder contact.",
    images: ["/images/hero-pet.png"],
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
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
