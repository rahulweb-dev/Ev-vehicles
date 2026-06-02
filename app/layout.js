import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import ConditionalShell from "@/components/ConditionalShell";
import CookieConsent from "@/components/CookieConsent";
import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-XXXXXXXXXXXXXXXXX";

// IMPORTANT: Replace with your actual website URL when you go live
export const SITE_URL = "https://www.evradar.in/";
export const SITE_NAME = "EV News India";
export const SITE_TAGLINE = "India's #1 Electric Vehicle News Platform";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Stay updated with the latest electric vehicle news, reviews, launches, and EV prices in India. Coverage of electric cars, bikes, scooters, trucks, and charging infrastructure.",
  keywords: [
    "electric vehicle news India",
    "EV news",
    "electric car India",
    "electric bike India",
    "EV launch India",
    "Tata EV",
    "Mahindra EV",
    "electric scooter India",
    "EV charging India",
    "best electric cars India 2026",
    "EV price India",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} – ${SITE_TAGLINE}`,
    description:
      "Stay updated with the latest electric vehicle news, reviews, launches, and EV prices in India.",
    images: [
      {
        url: `${SITE_URL}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} – India's #1 EV News Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@EVNewsIndia",
    creator: "@EVNewsIndia",
    title: `${SITE_NAME} – ${SITE_TAGLINE}`,
    description:
      "Stay updated with the latest electric vehicle news, reviews, and launches in India.",
    images: [`${SITE_URL}/images/og-default.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.GOOGLE_SEARCH_CONSOLE_TOKEN,
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`,
        width: 180,
        height: 60,
      },
      sameAs: [
        "https://twitter.com/EVNewsIndia",
        "https://www.facebook.com/EVNewsIndia",
        "https://www.instagram.com/evnewsindia",
        "https://www.youtube.com/@EVNewsIndia",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_TAGLINE,
      publisher: { "@id": `${SITE_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />

        {/* JSON-LD: Organization + WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        {/* Google AdSense — must be outside <head> to avoid data-nscript warning */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <GoogleAnalytics />
        <ConditionalShell>{children}</ConditionalShell>
        <CookieConsent />
        <PushNotificationPrompt />
      </body>
    </html>
  );
}
