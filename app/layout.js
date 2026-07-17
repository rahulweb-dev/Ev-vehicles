import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import ConditionalShell from "@/components/ConditionalShell";
import CookieConsent from "@/components/CookieConsent";
// import PushNotificationPrompt from "@/components/PushNotificationPrompt";
import { GoogleAnalytics } from "@next/third-parties/google";
import ChatWidgetLoader from "@/components/chatbot/ChatWidgetLoader";
import ScrollRestorer from "@/components/ScrollRestorer";
import BackToTop from "@/components/BackToTop";
import { ThemeProvider } from "@/components/ThemeProvider";
import ContentProtection from "@/components/ContentProtection";
import WebVitals from "@/components/WebVitals";
import PWAInstallBanner from "@/components/PWAInstallBanner";
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-XXXXXXXXXXXXXXXXX";

export const SITE_URL = "https://www.evradar.in";
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
        url: `${SITE_URL.replace(/\/$/, "")}/images/og-default.jpg`,
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
    images: [{ url: `${SITE_URL.replace(/\/$/, "")}/images/og-default.jpg`, alt: `${SITE_NAME} – India's #1 EV News Platform` }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.GOOGLE_SEARCH_CONSOLE_TOKEN,
  },
  other: {
    "p:domain_verify": "07cbf55529a481771ddbbd2ddbbeae9f",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "EVRadar",
    "msapplication-TileColor": "#16a34a",
    "msapplication-tap-highlight": "no",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16a34a",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "NewsMediaOrganization"],
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "EV Radar India",
      url: SITE_URL,
      description: "India's most trusted electric vehicle news platform publishing daily EV news, in-depth reviews, prices, specifications, and buying guides for electric cars, bikes, scooters, and commercial vehicles in India.",
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/images/logo.png`,
        width: 180,
        height: 60,
        caption: SITE_NAME,
      },
      sameAs: [
        "https://twitter.com/EVNewsIndia",
        "https://www.facebook.com/EVNewsIndia",
        "https://www.instagram.com/evnewsindia",
        "https://www.youtube.com/@EVNewsIndia",
      ],
      knowsAbout: [
        "Electric Vehicles India",
        "Electric Cars India",
        "Electric Bikes India",
        "EV Charging Infrastructure India",
        "FAME Scheme India",
        "PM E-Drive Policy",
        "Tata Electric Cars",
        "Mahindra Electric Vehicles",
        "Ola Electric Scooters",
        "Ather Energy",
        "EV Battery Technology",
        "EV Subsidies India",
        "Electric Vehicle Reviews",
        "ARAI Range Testing",
        "EV Buying Guide India",
      ],
      areaServed: {
        "@type": "Country",
        name: "India",
        sameAs: "https://www.wikidata.org/wiki/Q668",
      },
      publishingPrinciples: `${SITE_URL}/about`,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "editorial",
        url: `${SITE_URL}/contact`,
        areaServed: "IN",
        availableLanguage: "English",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_TAGLINE,
      inLanguage: "en-IN",
      publisher: { "@id": `${SITE_URL}/#organization` },
      copyrightHolder: { "@id": `${SITE_URL}/#organization` },
      audience: {
        "@type": "Audience",
        geographicArea: { "@type": "Country", name: "India" },
        audienceType: "EV buyers, enthusiasts, and researchers in India",
      },
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
    <html lang="en-IN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Hreflang — geo-targets India English */}
        <link rel="alternate" hrefLang="en-IN" href={SITE_URL} />
        <link rel="alternate" hrefLang="x-default" href={SITE_URL} />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />

        {/* Pinterest domain verification — must be in <head> JSX to appear on all pages */}
        <meta name="p:domain_verify" content="07cbf55529a481771ddbbd2ddbbeae9f" />

        {/* RSS feed — enables Google News discovery and feed readers */}
        <link rel="alternate" type="application/rss+xml" title="EV News India – Latest EV News Feed" href="/feed.xml" />

        {/* llms.txt — AI/LLM site description for generative engine optimization (GEO) */}
        <link rel="llms" href="/llms.txt" type="text/plain" />
        {/* OKF bundle — structured machine-readable site index for AI agents */}
        <link rel="okf" href="/okf/index.md" type="text/markdown" />

        {/* Preconnect to speed up third-party resource loading */}
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />

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

        <WebVitals />
        <ThemeProvider>
        <ContentProtection />
        {/* <ExitIntentPopup />
        <WhatsAppChannelCTA /> */}
        <ScrollRestorer />
        <ConditionalShell>{children}</ConditionalShell>
        <CookieConsent />
        {/* <PushNotificationPrompt /> */}
        {/* <PWAInstallBanner /> */}
        <ChatWidgetLoader />
        <BackToTop />
        </ThemeProvider>
        <GoogleAnalytics gaId="G-2QJL966SVB" />

        {/* Subscribe with Google Basic — enables Google News free-access badge */}
        <Script
          async
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
        />
        <Script
          id="swg-basic-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(self.SWG_BASIC = self.SWG_BASIC || []).push(basicSubscriptions => {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAowyvbGDA:openaccess",
                clientOptions: { theme: "light", lang: "en" },
              });
            });`,
          }}
        />

        {/* Accessibility widget — acsbapp.com */}
        <Script
          id="acsb-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.createElement('script');var h=document.querySelector('head')||document.body;s.src='https://acsbapp.com/apps/app/dist/js/app.js';s.async=true;s.onload=function(){acsbJS.init();};h.appendChild(s);})();`,
          }}
        />
      </body>
    </html>
  );
}
