import { Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "Contact EV News India – Get In Touch",
  description:
    "Contact the EV News India team for editorial inquiries, press releases, advertising partnerships, or general queries about electric vehicles in India.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "Contact EV News India – Get In Touch",
    description: "Reach the EV News India team for editorial inquiries, press releases, advertising, or general EV questions.",
    url: `${SITE_URL}/contact`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Contact EV News India&subtitle=Editorial, advertising %26 general inquiries&tag=default&type=page`, width: 1200, height: 630, alt: "Contact EV News India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact EV News India",
    description: "Reach the EV News India team for editorial inquiries, press releases or advertising partnerships.",
    images: [`${SITE_URL}/api/og?title=Contact EV News India&subtitle=Editorial, advertising %26 general inquiries&tag=default&type=page`],
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "EV News India",
  alternateName: "EVRadar India",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png` },
  email: "contact@evradar.in",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Mumbai",
    addressRegion: "Maharashtra",
    addressCountry: "IN",
  },
  contactPoint: [
    { "@type": "ContactPoint", contactType: "editorial",   email: "editorial@evradar.in" },
    { "@type": "ContactPoint", contactType: "advertising", email: "advertise@evradar.in" },
  ],
  sameAs: [
    "https://twitter.com/EVNewsIndia",
    "https://www.facebook.com/EVNewsIndia",
    "https://www.instagram.com/evnewsindia",
    "https://www.youtube.com/@EVNewsIndia",
  ],
};

export default function ContactPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
    <div className="bg-white">
      <div className="bg-gray-950 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="mb-4 text-sm text-gray-400">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white">Contact</span>
          </nav>
          <h1 className="text-4xl font-black text-white">Contact Us</h1>
          <p className="mt-2 text-gray-400">Get in touch with the EV News India team</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-black text-gray-900">Send Us a Message</h2>
            <p className="mt-2 text-gray-500">
              For press releases, story tips, advertising inquiries, or general questions.
            </p>
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-black text-gray-900">Contact Information</h2>
            <div className="mt-6 space-y-5">
              {[
                {
                  icon: Mail,
                  title: "Editorial",
                  detail: "editorial@evradar.in",
                  sub: "For press releases and story pitches",
                },
                {
                  icon: Mail,
                  title: "Advertising",
                  detail: "advertise@evradar.in",
                  sub: "For advertising and sponsorship inquiries",
                },
                {
                  icon: Mail,
                  title: "General",
                  detail: "contact@evradar.in",
                  sub: "For all other inquiries",
                },
                {
                  icon: MapPin,
                  title: "Office",
                  detail: "Mumbai, Maharashtra, India",
                  sub: "Visits by appointment only",
                },
                {
                  icon: Clock,
                  title: "Response Time",
                  detail: "Within 24-48 hours",
                  sub: "Monday to Saturday, 9 AM to 6 PM IST",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-gray-100 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50">
                      <Icon size={22} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{item.title}</p>
                      <p className="text-green-600 font-medium">{item.detail}</p>
                      <p className="text-sm text-gray-500">{item.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Advertising CTA */}
            <div className="mt-8 rounded-2xl bg-green-600 p-6 text-white">
              <h3 className="text-lg font-black">Advertise With EV News India</h3>
              <p className="mt-2 text-sm text-green-100">
                Reach 50,000+ monthly EV enthusiasts across India. We offer banner ads, sponsored
                content, and newsletter placements.
              </p>
              <a
                href="mailto:advertise@evradar.in"
                className="mt-4 inline-block rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-green-700 transition hover:bg-green-50"
              >
                Get Media Kit
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
