import Link from "next/link";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "About EV Radar – India's #1 Electric Vehicle News Platform",
  description:
    "EV Radar is India's most trusted source for electric vehicle news, reviews, and buying guides. Learn about our mission to accelerate EV adoption in India.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About EV Radar – India's #1 Electric Vehicle News Platform",
    description: "India's most trusted source for EV news, reviews, and buying guides. Our mission: accelerate EV adoption across India.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=About EV Radar&subtitle=India's %231 Electric Vehicle News Platform&tag=default&type=page`, width: 1200, height: 630, alt: "About EV Radar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About EV Radar",
    description: "India's most trusted source for EV news, reviews, and buying guides.",
    images: [`${SITE_URL}/api/og?title=About EV Radar&subtitle=India's %231 Electric Vehicle News Platform&tag=default&type=page`],
  },
};

const team = [
  {
    name: "Rahul Sharma",
    slug: "rahul-sharma",
    role: "Editor-in-Chief",
    bio: "10+ years covering the automotive industry. EV enthusiast and Tata Nexon EV owner.",
    initial: "R",
    color: "bg-green-600",
  },
  {
    name: "Priya Menon",
    slug: "priya-menon",
    role: "Senior Auto Journalist",
    bio: "Specializes in EV reviews and long-distance EV road trips across India.",
    initial: "P",
    color: "bg-blue-600",
  },
  {
    name: "Vikram Singh",
    slug: "vikram-singh",
    role: "Two-Wheeler Editor",
    bio: "Lifelong biker turned EV convert. Tests every electric scooter and motorcycle that launches in India.",
    initial: "V",
    color: "bg-orange-500",
  },
  {
    name: "Deepika Nair",
    slug: "deepika-nair",
    role: "Business & Policy Reporter",
    bio: "Covers EV industry news, government policies, and investment trends across India.",
    initial: "D",
    color: "bg-purple-600",
  },
];

const stats = [
  { value: "50,000+", label: "Monthly Readers" },
  { value: "500+", label: "Articles Published" },
  { value: "50+", label: "EVs Tested" },
  { value: "3+", label: "Years Covering EVs" },
];

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "EV Radar",
  alternateName: "EVRadar India",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png`, width: 200, height: 60 },
  description: "India's #1 Electric Vehicle News Platform — EV news, reviews, buying guides, and price comparisons.",
  foundingDate: "2022",
  email: "contact@evradar.in",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  sameAs: [
    "https://twitter.com/EVRadarIndia",
    "https://www.facebook.com/EVRadarIndia",
    "https://www.instagram.com/evradarindia",
    "https://www.youtube.com/@EVRadarIndia",
  ],
  member: team.map(m => ({
    "@type": "Person",
    name: m.name,
    jobTitle: m.role,
    url: `${SITE_URL}/authors/${m.slug}`,
  })),
};

export default function AboutPage() {
  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400">
            About Us
          </span>
          <h1 className="mt-4 text-5xl font-black text-white">
            India&apos;s #1 Electric Vehicle
            <br />
            <span className="text-green-400">News Platform</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-400">
            EV Radar was founded with a simple mission: to provide accurate, unbiased, and
            comprehensive electric vehicle information to help Indian consumers and businesses make
            informed decisions about the EV transition.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-green-600 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-black text-white">{stat.value}</p>
                <p className="mt-1 text-green-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-3xl font-black text-gray-900">Our Mission</h2>
        <div className="mt-6 space-y-4 text-lg text-gray-600 leading-relaxed">
          <p>
            Electric vehicles represent the most significant shift in transportation in over a century. At
            EV Radar, we believe that accurate, timely, and comprehensive information is key to
            accelerating EV adoption in India.
          </p>
          <p>
            We cover everything that matters to the Indian EV ecosystem — from the latest car and
            two-wheeler launches to government policies, charging infrastructure developments, battery
            technology advancements, and practical ownership tips.
          </p>
          <p>
            Our editorial team consists of experienced automotive journalists, technology writers, and
            industry analysts who test every vehicle we write about and verify every fact we publish.
          </p>
        </div>

        <h2 className="mt-16 text-3xl font-black text-gray-900">What We Cover</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            { title: "EV News & Launches", desc: "Breaking news on every EV launch in India as it happens" },
            { title: "In-Depth Reviews", desc: "Honest, detailed reviews after real-world testing" },
            { title: "Buying Guides", desc: "Unbiased guides to help you choose the right EV" },
            { title: "Charging Infrastructure", desc: "Track India's expanding charging network" },
            { title: "Government Policies", desc: "FAME scheme updates, subsidies, and EV regulations" },
            { title: "Cost Analysis", desc: "Real numbers on EV ownership costs vs petrol" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2 className="mt-16 text-3xl font-black text-gray-900">Our Team</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Link key={member.name} href={`/authors/${member.slug}`} className="group text-center block">
              <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${member.color} text-3xl font-black text-white`}>
                {member.initial}
              </div>
              <h3 className="mt-3 font-bold text-gray-900 group-hover:text-green-700 transition">{member.name}</h3>
              <p className="text-sm font-medium text-green-600">{member.role}</p>
              <p className="mt-2 text-sm text-gray-500">{member.bio}</p>
            </Link>
          ))}
        </div>

        {/* Editorial Standards */}
        <div className="mt-16 rounded-3xl bg-gray-50 p-8">
          <h2 className="text-2xl font-black text-gray-900">Our Editorial Standards</h2>
          <ul className="mt-4 space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 text-green-600">✓</span>
              <span><strong>No paid reviews:</strong> We never accept payment for coverage or positive reviews.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-green-600">✓</span>
              <span><strong>Real-world testing:</strong> All vehicle reviews are based on actual test drives, not press releases.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-green-600">✓</span>
              <span><strong>Corrections policy:</strong> We correct errors promptly and transparently.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 text-green-600">✓</span>
              <span><strong>Transparent disclosures:</strong> We clearly disclose when we receive test vehicles or attend press events.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    </>
  );
}
