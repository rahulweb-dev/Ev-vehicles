import { SITE_URL } from "../layout";

export const metadata = {
  title: "Privacy Policy – EV News India",
  description:
    "Read EV News India's privacy policy to understand how we collect, use, and protect your personal information.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <div className="bg-gray-950 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <nav className="mb-4 text-sm text-gray-400">
            <a href="/" className="hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-white">Privacy Policy</span>
          </nav>
          <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
          <p className="mt-2 text-gray-400">Last updated: May 27, 2026</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-14">
        <div className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed">
          <p>
            EV News India (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit our website
            evnewsindia.com.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on
            the Site includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name,
              email address, that you voluntarily give to us when you subscribe to our newsletter or
              contact us via the contact form.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you
              access the Site, such as your IP address, browser type, operating system, access times,
              and the pages you have viewed directly before and after accessing the Site.
            </li>
            <li>
              <strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking
              technologies to track activity on our Site to improve your experience.
            </li>
          </ul>

          <h2>2. Use of Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Send you our newsletter if you have subscribed</li>
            <li>Respond to your inquiries and customer service requests</li>
            <li>Compile anonymous statistical data for analysis</li>
            <li>Deliver targeted advertising from Google AdSense</li>
            <li>Improve our website and user experience</li>
          </ul>

          <h2>3. Google AdSense</h2>
          <p>
            We use Google AdSense to display advertisements on our website. Google AdSense uses cookies
            to serve ads based on your prior visits to this website and other websites on the internet.
            Google&apos;s use of advertising cookies enables it and its partners to serve ads based on your
            visit to our sites and/or other sites on the Internet.
          </p>
          <p>
            You may opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
              Google Ads Settings
            </a>
            .
          </p>

          <h2>4. Google Analytics</h2>
          <p>
            We use Google Analytics to analyze usage of our website. Google Analytics uses cookies to
            collect information about how visitors use the site. We use the information to compile
            reports and to help us improve the site. The cookies collect information in an anonymous
            form, including the number of visitors to the site and blog, where visitors have come to the
            site from, and the pages they visited.
          </p>

          <h2>5. Third-Party Websites</h2>
          <p>
            Our Site may contain links to third-party websites and applications. We are not responsible
            for the privacy practices or the content of these third-party websites.
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use cookies to enhance your experience on our website. Cookies are small data files
            placed on your device. You can choose to disable cookies through your individual browser
            settings, but this may affect certain functionality of our website.
          </p>

          <h2>7. Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to protect your personal
            information. While we have taken reasonable steps to secure the personal information you
            provide to us, no security system is perfect.
          </p>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of your personal information</li>
            <li>Request deletion of your personal information</li>
            <li>Unsubscribe from our newsletter at any time</li>
          </ul>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            Our website is not directed at children under 13 years of age. We do not knowingly collect
            personal information from children under 13.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us at:{" "}
            <a href="mailto:privacy@evnewsindia.com">privacy@evnewsindia.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
