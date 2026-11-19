import Link from "next/link";
import { SITE_URL } from "../layout";
import { SOCIAL_PROFILES } from "@/lib/siteProfiles";

export const revalidate = 86400;

const DESCRIPTION = "EV Radar is an independent electric vehicle news and data site from Hyderabad, started in 2026. We cover EV launches, prices, sales data, charging and policy in India, sourced from official announcements and government data.";

export const metadata = {
  title: "About EV Radar – Independent EV News and Data for India",
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About EV Radar",
    description: DESCRIPTION,
    url: `${SITE_URL}/about`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=About EV Radar&subtitle=Independent EV news and data for India&tag=default&type=page`, width: 1200, height: 630, alt: "About EV Radar" }],
  },
  twitter: { card: "summary_large_image", title: "About EV Radar", description: DESCRIPTION },
};

const team = [
  { name: "Rahul Reddy", role: "Founder & Editor", bio: "Started EV Radar in 2026. Edits and fact-checks what we publish and looks after the site's EV price and sales data." },
  { name: "Rakesh", slug: "rakesh", role: "EV Writer", bio: "Writes news and buyer's guides on electric cars and two-wheelers." },
  { name: "Manikanta", slug: "manikanta", role: "Writer", bio: "Writes EV news and explainers." },
];

async function getCounts() {
  try {
    const dbConnect = (await import("@/lib/mongodb")).default;
    const Article = (await import("@/lib/models/Article")).default;
    const Blog = (await import("@/lib/models/Blog")).default;
    const Vehicle = (await import("@/lib/models/Vehicle")).default;
    await dbConnect();
    const [news, guides, vehicles] = await Promise.all([
      Article.countDocuments({ status: "published" }), Blog.countDocuments({ status: "published" }), Vehicle.countDocuments({ status: "published" }),
    ]);
    return { news, guides, vehicles };
  } catch { return null; }
}

export default async function AboutPage() {
  const counts = await getCounts();
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "EV Radar",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
    description: DESCRIPTION,
    foundingDate: "2026",
    founder: { "@type": "Person", name: "Rahul Reddy" },
    email: "contact@evradar.in",
    address: { "@type": "PostalAddress", addressLocality: "Hyderabad", addressRegion: "Telangana", addressCountry: "IN" },
    sameAs: SOCIAL_PROFILES.map((p) => p.url),
    publishingPrinciples: `${SITE_URL}/about#editorial-standards`,
    correctionsPolicy: `${SITE_URL}/about#corrections`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
      <div className="bg-white">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <span className="inline-block rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400">About us</span>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">Independent EV news and data <span className="text-green-400">for India</span></h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              EV Radar is a small, independent team in Hyderabad. We started in 2026 to give Indian buyers clear, checked information on electric
              vehicles: what has launched, what it really costs, how far it goes, and where the market is heading.
            </p>
          </div>
        </div>

        {counts && (
          <div className="bg-green-600 py-10">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 text-center md:grid-cols-4">
              {[[counts.news, "News stories"], [counts.guides, "Buyer's guides"], [counts.vehicles, "EVs in our database"], ["2026", "Started in Hyderabad"]].map(([v, l]) => (
                <div key={l}><p className="text-3xl font-black text-white sm:text-4xl">{typeof v === "number" ? v.toLocaleString("en-IN") : v}</p><p className="mt-1 text-sm text-green-100">{l}</p></div>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-4xl px-4 py-14">
          <h2 className="text-3xl font-black text-gray-900">What we do</h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-gray-600">
            <p>We report EV news from India — car, two-wheeler and commercial vehicle launches, prices, charging networks and government policy — and keep a database of
              electric vehicles with variant-wise prices, battery and range figures.</p>
            <p>Alongside the news we publish tools built on that data: <Link href="/compare" className="font-semibold text-green-700 hover:underline">EV comparisons</Link>,
              {" "}<Link href="/electric-cars-under-15-lakh" className="font-semibold text-green-700 hover:underline">budget guides</Link>,
              {" "}city-wise on-road price estimates, a <Link href="/charging-stations" className="font-semibold text-green-700 hover:underline">charging station map</Link>
              {" "}and <Link href="/ev-sales" className="font-semibold text-green-700 hover:underline">monthly EV sales data</Link> going back to 2020.</p>
          </div>

          <h2 className="mt-14 text-3xl font-black text-gray-900">Our team</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {team.map((m) => {
              const card = (
                <div className="h-full rounded-2xl border border-gray-100 p-5 text-center transition hover:border-green-200">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-black text-white">{m.name[0]}</div>
                  <h3 className="mt-3 font-bold text-gray-900">{m.name}</h3>
                  <p className="text-sm font-medium text-green-600">{m.role}</p>
                  <p className="mt-2 text-sm text-gray-500">{m.bio}</p>
                </div>
              );
              return m.slug ? <Link key={m.name} href={`/authors/${m.slug}`}>{card}</Link> : <div key={m.name}>{card}</div>;
            })}
          </div>

          <div id="editorial-standards" className="mt-14 scroll-mt-24 rounded-3xl bg-gray-50 p-6 sm:p-8">
            <h2 className="text-2xl font-black text-gray-900">How we check what we publish</h2>
            <ul className="mt-4 space-y-3 text-gray-600">
              {[
                ["Official sources first", "Prices, specifications and launch dates come from the manufacturer's own announcements, websites or press releases. Sales figures come from Vahan registration data and FADA; policy news from government notifications."],
                ["No invented numbers", "If a price hasn't been announced we say \"Price not announced\" rather than guess. Estimates, such as on-road prices, are labelled as estimates and show how they're worked out."],
                ["Sources are named", "Data pages link to where each figure came from, and news stories name their source."],
                ["Images", "We use official photos from manufacturers and companies, credited under the image. Where we use an illustration made with AI, it is labelled \"Illustration (AI-generated)\"."],
                ["Use of AI", "We use AI tools to help with research and first drafts. Every story is checked against the original sources and edited by a person before it's published."],
                ["Independence", "We don't accept payment for coverage. Advertising on the site is shown by Google and doesn't affect what we write."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3"><span className="mt-1 text-green-600">✓</span><span><strong>{t}:</strong> {d}</span></li>
              ))}
            </ul>
          </div>

          <div id="corrections" className="mt-8 scroll-mt-24 rounded-3xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl font-black text-gray-900">Corrections</h2>
            <p className="mt-3 text-gray-600">If you spot a mistake, email <a href="mailto:contact@evradar.in" className="font-semibold text-green-700 hover:underline">contact@evradar.in</a> or use our
              {" "}<Link href="/contact" className="font-semibold text-green-700 hover:underline">contact page</Link>. We fix errors as soon as we&apos;ve confirmed them, and note significant updates in the story.</p>
          </div>

          <div className="mt-8 rounded-3xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-2xl font-black text-gray-900">Find us</h2>
            <p className="mt-3 text-gray-600">EV Radar, Hyderabad, Telangana, India · <a href="mailto:contact@evradar.in" className="font-semibold text-green-700 hover:underline">contact@evradar.in</a></p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_PROFILES.map((p) => (
                <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green-300 hover:text-green-700">{p.label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
