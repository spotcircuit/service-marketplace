import { Metadata } from 'next';
import { generateMetadata as generateSEO } from '@/lib/seo-engine';

export const dynamic = 'force-static';

export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'about',
    title: 'Terms of Service - Terms & Conditions',
    description: 'Terms of service and conditions for using our dumpster rental platform. Review our usage policies and user agreements.',
    keywords: ['terms of service', 'terms and conditions', 'user agreement'],
    noindex: false
  });
}

export default function TermsPage() {
  return (
    <main className="px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-gray max-w-none">
          <p>
            Welcome to our website. By accessing or using our services, you agree to be bound by these Terms of
            Service. If you do not agree, do not use the site.
          </p>

          <h2>Use of Service</h2>
          <ul>
            <li>You must be 18 years or older to request quotes.</li>
            <li>You agree to provide accurate information to receive service.</li>
            <li>We may modify or discontinue features at any time.</li>
          </ul>

          <h2>Quotes and Providers</h2>
          <p>
            We connect you with independent service providers. We are not responsible for the performance,
            pricing, or availability of third-party providers. Any agreements you enter with providers are solely
            between you and the provider.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential
            damages arising from your use of the site or services.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms? Contact us at <a href="mailto:support@dumpquote.co">support@dumpquote.co</a>
            {' '}or call <a href="tel:+14342076559">(434) 207-6559</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
