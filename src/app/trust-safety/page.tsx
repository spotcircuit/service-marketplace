'use client';

import { Shield, CheckCircle, Lock, AlertCircle, Users, FileCheck, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function TrustSafetyPage() {
  const verificationSteps = [
    {
      icon: FileCheck,
      title: 'Business License Verification',
      description: 'We verify active business licenses with state and local authorities'
    },
    {
      icon: Shield,
      title: 'Insurance Validation',
      description: 'Proof of general liability and professional insurance required'
    },
    {
      icon: Users,
      title: 'Background Checks',
      description: 'Criminal background checks for service providers when applicable'
    },
    {
      icon: CheckCircle,
      title: 'Performance Monitoring',
      description: 'Continuous monitoring of ratings, reviews, and customer feedback'
    }
  ];

  const safetyFeatures = [
    {
      title: 'Secure Messaging',
      description: 'All communications are encrypted and monitored for safety',
      features: ['End-to-end encryption', 'Spam filtering', 'Inappropriate content detection']
    },
    {
      title: 'Payment Protection',
      description: 'Secure payment processing with fraud protection',
      features: ['PCI compliant processing', 'Dispute resolution', 'Money-back guarantee']
    },
    {
      title: 'Data Privacy',
      description: 'Your personal information is protected and never sold',
      features: ['GDPR compliant', 'Secure data storage', 'Transparent privacy policy']
    },
    {
      title: 'Review Authenticity',
      description: 'All reviews are from verified customers',
      features: ['Purchase verification', 'Review moderation', 'Fake review detection']
    }
  ];

  const reportingProcess = [
    { step: 1, title: 'Report Issue', description: 'Use our online form or contact support' },
    { step: 2, title: 'Investigation', description: 'Our team reviews the issue within 24 hours' },
    { step: 3, title: 'Resolution', description: 'We work with both parties to resolve the issue' },
    { step: 4, title: 'Follow-up', description: 'We ensure satisfaction and prevent future issues' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Shield className="h-16 w-16 text-white mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trust & Safety
          </h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Your safety is our top priority. Learn how we verify providers,
            protect your data, and ensure a secure experience for everyone.
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 px-4 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="font-semibold">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Verified Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">100% Screened</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <span className="font-semibold">50,000+ Happy Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How We Verify Service Providers</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Every service provider goes through our comprehensive verification process
            before being listed on our platform
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {verificationSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Safety Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reporting Process */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Report an Issue</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    We Take All Reports Seriously
                  </h3>
                  <p className="text-yellow-800">
                    If you experience any issues with a service provider or notice suspicious activity,
                    please report it immediately. We investigate all reports within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {reportingProcess.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold">{item.step}</span>
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Contact Our Trust & Safety Team</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:safety@example.com"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Mail className="h-5 w-5" />
                  Email Support
                </a>
                <a
                  href="tel:1-800-SAFETY"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition border"
                >
                  <Phone className="h-5 w-5" />
                  Call 1-800-SAFETY
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Policies</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/privacy" className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
              <p className="text-gray-600 text-sm mb-4">
                Learn how we collect, use, and protect your personal information
              </p>
              <span className="text-green-600 font-medium text-sm">Read Policy →</span>
            </Link>
            <Link href="/terms" className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">Terms of Service</h3>
              <p className="text-gray-600 text-sm mb-4">
                Understand the rules and guidelines for using our platform
              </p>
              <span className="text-green-600 font-medium text-sm">Read Terms →</span>
            </Link>
            <Link href="/community" className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-2">Community Guidelines</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our standards for respectful and professional interactions
              </p>
              <span className="text-green-600 font-medium text-sm">Read Guidelines →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Guarantee */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Our Trust Guarantee
          </h2>
          <p className="text-xl text-green-100 mb-8">
            If you&apos;re not satisfied with a verified provider, we&apos;ll make it right
            or refund your money. That&apos;s our promise to you.
          </p>
          <Link
            href="/guarantee"
            className="inline-block px-8 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
          >
            Learn About Our Guarantee
          </Link>
        </div>
      </section>
    </div>
  );
}
