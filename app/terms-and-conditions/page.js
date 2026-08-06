import Link from "next/link";
import { SITE_URL } from "../layout";

export const metadata = {
  title: "Terms of Service – EV News India",
  description: "Terms and conditions governing the use of EV News India (evradar.in).",
  alternates: { canonical: `${SITE_URL}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Terms of Service – EV News India",
    description: "Terms and conditions governing the use of EV News India (evradar.in).",
    url: `${SITE_URL}/terms`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Terms of Service&subtitle=EV News India&tag=default&type=page`, width: 1200, height: 630, alt: "Terms of Service – EV News India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service – EV News India",
    description: "Terms and conditions governing the use of EV News India.",
    images: [`${SITE_URL}/api/og?title=Terms of Service&subtitle=EV News India&tag=default&type=page`],
  },
};

const LAST_UPDATED = "June 1, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-950 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <nav className="mb-4 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Terms of Service</span>
          </nav>
          <h1 className="text-3xl font-black text-white md:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-gray-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using EV News India (<strong>evradar.in</strong>), you agree to be bound by these
            Terms of Service. If you do not agree, please discontinue use of the website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">2. Use of Content</h2>
          <p className="text-gray-600 leading-relaxed">
            All content published on EV News India — including articles, vehicle specifications, images, and
            guides — is for informational purposes only. Reproduction or redistribution of content without
            prior written permission is prohibited. Brief excerpts with attribution and a link back are
            permitted under fair use.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">3. Accuracy of Information</h2>
          <p className="text-gray-600 leading-relaxed">
            We strive to keep vehicle prices, specifications, and news accurate. However, EV prices and
            features change frequently. Always verify details with the manufacturer or authorised dealer
            before making a purchase decision. EV News India is not liable for any decisions made based on
            information published on this site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">4. Advertising & Sponsored Content</h2>
          <p className="text-gray-600 leading-relaxed">
            EV News India displays third-party advertisements via Google AdSense and may publish sponsored
            content. Sponsored articles are clearly labelled. We do not accept payment to alter editorial
            opinions or vehicle ratings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">5. Newsletter & Email Subscriptions</h2>
          <p className="text-gray-600 leading-relaxed">
            By subscribing to our newsletter, you consent to receiving periodic EV news updates via email.
            You may unsubscribe at any time by clicking the unsubscribe link in any email or by contacting
            us at <a href="mailto:contact@evradar.in" className="text-green-600 hover:underline">contact@evradar.in</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">6. User Conduct</h2>
          <p className="text-gray-600 leading-relaxed">
            You agree not to use this website to transmit harmful, abusive, or illegal content, scrape data
            in bulk, or attempt to gain unauthorised access to any part of the platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">7. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">
            The EV News India name, logo, and original content are the intellectual property of evradar.in.
            Vehicle manufacturer names and logos are trademarks of their respective owners and are used for
            informational purposes only.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">8. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">
            EV News India is provided &quot;as is&quot; without any warranties. We are not liable for any direct,
            indirect, or consequential damages arising from your use of the website or reliance on its content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">9. Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to update these terms at any time. Continued use of the website after
            changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-3">10. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            Questions about these terms?{" "}
            <Link href="/contact" className="text-green-600 hover:underline">Contact us</Link> or email{" "}
            <a href="mailto:contact@evradar.in" className="text-green-600 hover:underline">contact@evradar.in</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
