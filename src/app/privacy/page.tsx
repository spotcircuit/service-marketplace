import { Metadata } from 'next';
import { generateMetadata as generateSEO } from '@/lib/seo-engine';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'about',
    title: 'Privacy Policy - Data Protection & Privacy Information',
    description: 'Our privacy policy explains how we collect, use, and protect your personal information when using our dumpster rental platform.',
    keywords: ['privacy policy', 'data protection', 'personal information'],
    noindex: false
  });
}

export default function PrivacyPage() {
  return (
    <main className="px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-gray max-w-none">
          <p>
            We value your privacy. This Privacy Policy explains what information we collect, how we use it,
            and your choices regarding that information.
          </p>

          <h2>Information We Collect</h2>
          <ul>
            <li>Contact details you provide (name, email, phone, address)</li>
            <li>Project details needed to fulfill your quote request</li>
            <li>Usage data (pages visited, interactions) for improving our service</li>
          </ul>

          <h2>How We Use Information</h2>
          <ul>
            <li>To match you with relevant providers and generate quotes</li>
            <li>To communicate about your requests and customer support</li>
            <li>To improve site performance, reliability, and user experience</li>
          </ul>

          <h2>Sharing</h2>
          <p>
            We share necessary details with service providers solely to fulfill your quote requests. We do not
            sell your personal information.
          </p>

          <h2>Data Security</h2>
          <p>
            We use reasonable safeguards to protect your data. However, no method of transmission or storage is
            100% secure.
          </p>

          <h2>Your Choices</h2>
          <ul>
            <li>Request access, correction, or deletion of your data</li>
            <li>Opt out of non-essential communications at any time</li>
          </ul>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Contact us at <a href="mailto:support@dumpquote.co">support@dumpquote.co</a>
            {' '}or call <a href="tel:+14342076559">(434) 207-6559</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
