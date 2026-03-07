This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## SEO Launch Setup

This project ships with:

- `robots.txt` at `/robots.txt`
- XML sitemap at `/sitemap.xml`
- Open Graph and Twitter metadata in `app/layout.tsx`
- Optional Google Search Console verification meta tag
- Optional Google Analytics 4 (GA4) script injection
- Page-level canonical tags for indexable pages
- `noindex` metadata on private/auth/dashboard routes

Set these environment variables:

```bash
NEXT_PUBLIC_APP_URL=https://your-domain.com
GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

After deploy:

1. Open [Google Search Console](https://search.google.com/search-console) and verify your domain.
2. Submit `https://your-domain.com/sitemap.xml` in Search Console.
3. Confirm crawl access at `https://your-domain.com/robots.txt`.
4. Validate GA4 events in DebugView / Realtime reports.

### Target keyword cluster (MVP)

- nfc pet tag
- lost pet alert system
- dog nfc collar tag
- cat nfc id tag
- digital pet profile
- finder to owner contact
- pet reunification
- pet safety app

### Pre-launch SEO checks

1. Enforce HTTPS at hosting/CDN level (redirect all HTTP to HTTPS).
2. Validate social previews (Open Graph/Twitter) with share debuggers.
3. If migrating URLs, add 301 redirects for old paths to new canonical paths.
4. Run a broken-link crawl (for example with Screaming Frog) and fix 404/chain redirects.

## Owner Notifications For Found Alerts

When a finder submits an alert, the app stores it in `alerts` and can also notify the owner automatically.

### Email notifications (Resend)

Set these environment variables:

```bash
RESEND_API_KEY=...
RESEND_FROM_EMAIL=alerts@your-domain.com
```

Notes:

- In production, `RESEND_FROM_EMAIL` must be on a verified Resend domain (not `@resend.dev`).
- In non-production, the app falls back to `onboarding@resend.dev` if `RESEND_FROM_EMAIL` is not set.

### SMS notifications (Twilio)

Set these environment variables:

```bash
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+15551234567
```

If neither provider is configured, alerts still appear in the owner dashboard inbox.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
