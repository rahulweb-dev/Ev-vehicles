import Link from "next/link";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "Sitemap – EV News India | All Pages & Categories",
  description: "Complete sitemap of EV News India — news, electric cars, bikes, guides, tools and more. Browse all sections of India's #1 EV platform.",
  alternates: { canonical: `${SITE_URL}/sitemap-page` },
  openGraph: {
    title: "Sitemap – EV News India",
    description: "Browse all sections of India's #1 EV platform.",
    url: `${SITE_URL}/sitemap-page`,
    type: "website",
  },
  robots: { index: true, follow: true },
};

const sections = [
  {
    heading: "News & Articles",
    links: [
      { href: "/news",           label: "All EV News" },
      { href: "/news?category=cars",   label: "Electric Car News" },
      { href: "/news?category=bikes",  label: "Electric Bike News" },
      { href: "/news?category=policy", label: "EV Policy News" },
      { href: "/blogs",          label: "EV Blogs" },
    ],
  },
  {
    heading: "Electric Vehicles",
    links: [
      { href: "/cars",           label: "Electric Cars in India" },
      { href: "/bikes",          label: "Electric Bikes & Scooters" },
      { href: "/compare",        label: "Compare EVs" },
      { href: "/upcoming-electric-cars-india", label: "Upcoming Electric Cars" },
      { href: "/best-electric-cars-india-2026", label: "Best Electric Cars 2026" },
      { href: "/best-electric-bikes-india-2026", label: "Best Electric Bikes 2026" },
    ],
  },
  {
    heading: "EV Guides",
    links: [
      { href: "/electric-vehicles",          label: "Electric Vehicles Guide" },
      { href: "/ev-charging-guide",          label: "EV Charging Guide" },
      { href: "/government-ev-policy-india", label: "Government EV Policy India" },
      { href: "/ev-glossary",                label: "EV Glossary" },
      { href: "/faq",                        label: "Frequently Asked Questions" },
    ],
  },
  {
    heading: "Tools & Calculators",
    links: [
      { href: "/ev-savings-calculator",  label: "EV Savings Calculator" },
      { href: "/range-calculator",       label: "Range Calculator" },
      { href: "/subsidy-calculator",     label: "Subsidy Calculator" },
      { href: "/resale-calculator",      label: "Resale Value Calculator" },
      { href: "/ev-quiz",                label: "EV Quiz" },
    ],
  },
  {
    heading: "Research",
    links: [
      { href: "/brands",             label: "EV Brands" },
      { href: "/charging-stations",  label: "Charging Stations" },
      { href: "/ev-subsidy",         label: "EV Subsidies" },
      { href: "/subsidies",          label: "State Subsidies" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about",               label: "About Us" },
      { href: "/contact",             label: "Contact" },
      { href: "/privacy-policy",      label: "Privacy Policy" },
      { href: "/terms-and-conditions", label: "Terms & Conditions" },
      { href: "/data-deletion",       label: "Data Deletion" },
    ],
  },
  {
    heading: "XML Sitemaps",
    links: [
      { href: "/sitemap.xml",        label: "Main Sitemap (XML)" },
      { href: "/news-sitemap.xml",   label: "News Sitemap (XML)" },
      { href: "/image-sitemap.xml",  label: "Image Sitemap (XML)" },
    ],
  },
];

export default function SitemapPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Sitemap", item: `${SITE_URL}/sitemap-page` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-linear-to-br from-green-900 to-green-950 py-14">
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-4xl font-black text-white md:text-5xl">Sitemap</h1>
            <p className="mt-2 text-green-300">All pages on EV News India</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <div key={section.heading}>
                <h2 className="mb-4 text-lg font-black text-gray-900 border-b border-green-200 pb-2">
                  {section.heading}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-green-700 hover:text-green-900 hover:underline text-sm transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
