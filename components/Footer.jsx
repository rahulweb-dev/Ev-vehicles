import Link from "next/link";
import { BatteryCharging, Mail, MapPin } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM10 15.5v-7l6 3.5z" />
  </svg>
);

const footerLinks = {
  "News Categories": [
    { name: "Electric Cars News",       href: "/news?category=cars"       },
    { name: "Electric Bikes News",      href: "/news?category=bikes"      },
    { name: "Commercial EVs News",      href: "/news?category=commercial" },
    { name: "EV Charging News",         href: "/news?category=charging"   },
    { name: "All Latest News",          href: "/news"                     },
  ],
  "Resources": [
    { name: "EV Buying Guide", href: "/blogs/complete-guide-buying-electric-vehicle-india-2026" },
    { name: "Charging Guide", href: "/blogs/ev-charging-types-india-guide-ac-dc-fast-charging" },
    { name: "Best EVs Under ₹15L", href: "/blogs/top-10-electric-cars-india-under-15-lakh-2026" },
    { name: "EV vs Petrol Analysis", href: "/blogs/ev-vs-petrol-car-total-cost-ownership-india-2026" },
    { name: "All Blogs", href: "/blogs" },
  ],
  "Company": [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Advertise With Us", href: "/contact" },
  ],
};

const socialLinks = [
  { icon: FacebookIcon,  href: "https://www.facebook.com/profile.php?id=61588864517346",   label: "Facebook"  },
  { icon: TwitterIcon,   href: "https://twitter.com/evradar_in",         label: "Twitter"   },
  { icon: InstagramIcon, href: "https://www.instagram.com/evradar.in",   label: "Instagram" },
  { icon: YoutubeIcon,   href: "https://www.youtube.com/@evradar",        label: "YouTube"   },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Newsletter Banner */}
      <div className="bg-linear-to-r from-green-600 to-green-700">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h3 className="text-xl font-bold text-white">Get Daily EV News In Your Inbox</h3>
              <p className="mt-1 text-green-100 text-sm">Be the first to know about EV launches, prices &amp; reviews in India</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600">
                <BatteryCharging size={22} className="text-white" />
              </div>
              <span className="text-xl font-black text-white">EV News India</span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              India&apos;s most trusted electric vehicle news and information platform. We cover EV launches,
              reviews, charging infrastructure, government policies, and everything that matters to
              India&apos;s growing EV community.
            </p>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-green-500" />
                <a href="mailto:contact@evradar.in" className="hover:text-white">
                  contact@evradar.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-500" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-400 transition hover:bg-green-600 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition hover:text-green-400"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-gray-500">
          <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p>© {currentYear} EV News India. All rights reserved.</p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <a href="mailto:contact@evradar.in" className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
                <Mail size={13} />
                contact@evradar.in
              </a>
              <Link href="/faq" className="hover:text-gray-300">FAQ</Link>
              <Link href="/privacy-policy" className="hover:text-gray-300">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
              <Link href="/sitemap.xml" className="hover:text-gray-300">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
