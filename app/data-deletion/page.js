import Link from "next/link";
import { SITE_URL } from "@/app/layout";

export const metadata = {
  title:       "Data Deletion Instructions | EVRadar",
  description: "How to request deletion of your personal data from EVRadar.",
  alternates:  { canonical: `${SITE_URL}/data-deletion` },
  robots:      { index: false, follow: false },
  openGraph: {
    title: "Data Deletion Instructions | EVRadar",
    description: "How to request deletion of your personal data from EVRadar.",
    url: `${SITE_URL}/data-deletion`,
    type: "website",
    images: [{ url: `${SITE_URL}/api/og?title=Data Deletion&subtitle=EVRadar India&tag=default&type=page`, width: 1200, height: 630, alt: "Data Deletion – EVRadar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Data Deletion Instructions | EVRadar",
    description: "How to request deletion of your personal data from EVRadar.",
    images: [`${SITE_URL}/api/og?title=Data Deletion&subtitle=EVRadar India&tag=default&type=page`],
  },
};

export default function DataDeletionPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">

      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-700 transition">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Data Deletion</span>
      </nav>

      {/* Icon + Heading */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-3xl">
          🗑️
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
            User Data Deletion Instructions
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your privacy matters — we make deletion easy.
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8 space-y-6">

        {/* Intro */}
        <p className="text-sm leading-relaxed text-gray-600">
          If you wish to delete your personal data associated with <strong className="text-gray-900">EVRadar</strong>,
          please send us a deletion request by email using the details below. We will permanently
          remove your data from our systems within <strong className="text-gray-900">30 days</strong> of receiving your request.
        </p>

        {/* Email block */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Send an email to</p>
            <a
              href="mailto:contact@evradar.in?subject=Delete%20My%20Data"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition"
            >
              📧 contact@evradar.in
            </a>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Email subject</p>
            <p className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 font-mono text-sm text-gray-800">
              Delete My Data
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Include in your message</p>
            <ul className="ml-4 list-disc space-y-1 text-sm text-gray-600">
              <li>Your name</li>
              <li>Email address associated with your account</li>
              <li>Any other identifying information (optional)</li>
            </ul>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3.5">
          <span className="mt-0.5 text-lg">⏱️</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">Processing time</p>
            <p className="text-xs text-blue-700 mt-0.5">
              We will acknowledge your request within <strong>3 business days</strong> and
              complete the deletion within <strong>30 days</strong>.
            </p>
          </div>
        </div>

        {/* What gets deleted */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">What data we delete</p>
          <ul className="ml-4 list-disc space-y-1.5 text-sm text-gray-600">
            <li>Account information (name, email)</li>
            <li>Comments and reviews you submitted</li>
            <li>Lead / enquiry forms you submitted</li>
            <li>Newsletter subscription</li>
            <li>Any other personal data linked to your identity</li>
          </ul>
        </div>

        {/* Legal note */}
        <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-4">
          Some data may be retained for legal, fraud-prevention, or regulatory compliance
          purposes as permitted under applicable law. We will inform you if this applies.
        </p>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition">
          ← Back to EVRadar
        </Link>
      </div>

    </main>
  );
}
