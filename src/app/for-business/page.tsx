"use client";

import { CheckCircle, Star, TrendingUp, Users, Award, Shield, BarChart, Phone, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForBusinessPage() {
  const pricingTiers = [
    {
      name: 'Free Listing',
      price: 0,
      period: 'forever',
      description: 'Basic presence in our directory',
      features: [
        'Basic business information',
        'Contact details',
        'Service area listing',
        'Customer reviews',
      ],
      notIncluded: [
        'Featured placement',
        'Priority in search results',
        'Lead notifications',
        'Analytics dashboard',
      ],
      cta: 'Claim Your Listing',
      popular: false,
    },
    {
      name: 'Professional',
      price: 99,
      period: 'month',
      description: 'Stand out and get more leads',
      features: [
        'Everything in Free',
        'Featured badge',
        'Priority in search results',
        'Up to 50 leads/month',
        'Email lead notifications',
        'Basic analytics',
        'Photo gallery (10 photos)',
        'Verified business badge',
      ],
      notIncluded: [
        'Top placement guarantee',
        'Unlimited leads',
      ],
      cta: 'Start 14-Day Trial',
      popular: true,
    },
    {
      name: 'Premium',
      price: 249,
      period: 'month',
      description: 'Maximum visibility and leads',
      features: [
        'Everything in Professional',
        'Top placement in category',
        'Unlimited leads',
        'Priority phone support',
        'Advanced analytics',
        'Competitor insights',
        'Custom landing page',
        'Video showcase',
        'API access',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Increase Visibility',
      description: 'Get found by thousands of customers actively searching for your services',
    },
    {
      icon: Users,
      title: 'Quality Leads',
      description: 'Receive pre-qualified leads from customers ready to hire',
    },
    {
      icon: Star,
      title: 'Build Reputation',
      description: 'Showcase reviews and build trust with verified business status',
    },
    {
      icon: BarChart,
      title: 'Track Performance',
      description: 'Monitor views, leads, and conversions with detailed analytics',
    },
  ];

  const testimonials = [
    {
      name: 'Ricardo Romero',
      business: 'R&L Dumpsters',
      image: 'https://ext.same-assets.com/1079325698/1963887577.webp',
      quote: 'Since upgrading to featured listing, our leads have increased by 300%. The ROI is incredible!',
      rating: 5,
    },
    {
      name: 'Sarah Johnson',
      business: 'Quick Disposal Services',
      image: 'https://ext.same-assets.com/1079325698/1963887577.webp',
      quote: 'The platform has been a game-changer for our business. We get quality leads every day.',
      rating: 5,
    },
    {
      name: 'Mike Chen',
      business: 'EcoWaste Solutions',
      image: 'https://ext.same-assets.com/1079325698/1963887577.webp',
      quote: 'Best investment we\'ve made in marketing. The leads are high quality and ready to book.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Grow Your Business with Qualified Leads
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Join thousands of service providers getting customers from our directory
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/claim" className="px-8 py-4 bg-white text-primary rounded-lg hover:bg-white/90 font-semibold text-lg">
                Get Started Free
              </Link>
              <Link href="/claim" className="px-8 py-4 bg-white/20 text-white rounded-lg hover:bg-white/30 backdrop-blur font-semibold text-lg border border-white/30">
                Claim Your Free Listing
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-white/80">Monthly Visitors</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">2,500+</div>
                <div className="text-white/80">Active Businesses</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">15,000+</div>
                <div className="text-white/80">Leads Generated</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Service Providers Choose Us</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We help you connect with customers actively searching for your services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Get started in 3 simple steps</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Claim Your Listing</h3>
                <p className="text-muted-foreground">
                  Search for your business and claim your free listing or create a new one
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Complete Your Profile</h3>
                <p className="text-muted-foreground">
                  Add photos, services, and business details to attract more customers
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Leads</h3>
                <p className="text-muted-foreground">
                  Start receiving qualified leads from customers in your service area
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Grow</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get all the tools and features to maximize your visibility and convert more leads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-card rounded-lg border p-6">
            <Shield className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Verified Business Badge</h3>
            <p className="text-muted-foreground">Build trust with customers through our verification process</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <Star className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Featured Placement</h3>
            <p className="text-muted-foreground">Get priority placement in search results and category pages</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <Users className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lead Management</h3>
            <p className="text-muted-foreground">Receive and manage leads directly from your dashboard</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <BarChart className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-muted-foreground">Track views, clicks, and conversion rates in real-time</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <Award className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
            <p className="text-muted-foreground">Showcase your ratings and build social proof</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <Phone className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Priority Support</h3>
            <p className="text-muted-foreground">Get dedicated support to help you succeed</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold text-lg"
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Partners Say</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of successful businesses growing with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-card rounded-lg p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <span className="font-bold text-lg">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">How do I claim my business listing?</h3>
              <p className="text-muted-foreground">
                Search for your business in our directory. If it exists, click &quot;Claim This Business&quot; and verify ownership. If not, you can create a new listing for free.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">What&apos;s included in the free listing?</h3>
              <p className="text-muted-foreground">
                Free listings include basic business information, contact details, service areas, and customer reviews. You&apos;ll appear in search results but without priority placement.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">How do featured listings work?</h3>
              <p className="text-muted-foreground">
                Featured listings appear at the top of search results with a special badge. They receive more visibility, leading to 3-5x more leads than free listings.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6">
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join thousands of service providers already benefiting from our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/claim"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary rounded-lg hover:bg-white/90 font-semibold text-lg"
              >
                Join as a Pro
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/claim"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-foreground/20 text-primary-foreground rounded-lg hover:bg-primary-foreground/30 font-semibold text-lg border border-primary-foreground/30"
              >
                <Shield className="h-5 w-5" />
                Claim Existing Listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
