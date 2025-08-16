'use client';

import { useState } from 'react';
import { TrendingUp, Users, Shield, Clock, DollarSign, MapPin, Phone, CheckCircle, Award, Truck, Calendar, ChartBar, Zap, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProsPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    yearsInBusiness: '',
    fleetSize: '',
    servicesOffered: [] as string[],
    coverage: '',
    message: ''
  });

  const benefits = [
    {
      icon: DollarSign,
      title: 'No Upfront Costs',
      description: 'Join our network free. No membership fees, no hidden charges. We only succeed when you do.'
    },
    {
      icon: TrendingUp,
      title: 'Guaranteed Orders',
      description: 'We send you confirmed orders, not leads. No more chasing quotes or competing on price.'
    },
    {
      icon: Clock,
      title: 'Get Paid Fast',
      description: 'Reliable, on-time payments for all completed orders. No chasing invoices or late payments.'
    },
    {
      icon: Users,
      title: 'We Handle Sales',
      description: 'Our team manages all customer interactions, from initial contact to final billing.'
    },
    {
      icon: Shield,
      title: 'Protected Territory',
      description: 'Exclusive service areas mean more consistent business without oversaturation.'
    },
    {
      icon: ChartBar,
      title: 'Growth Support',
      description: 'Marketing, technology, and operational support to help scale your business.'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Apply to Join',
      description: 'Quick application process. We review your credentials and service capabilities.'
    },
    {
      step: '2',
      title: 'Get Approved',
      description: 'Once approved, set your service areas and availability preferences.'
    },
    {
      step: '3',
      title: 'Receive Orders',
      description: 'Get confirmed orders directly to your dashboard or phone. No bidding required.'
    },
    {
      step: '4',
      title: 'Complete Service',
      description: 'Deliver and pick up containers according to customer requirements.'
    },
    {
      step: '5',
      title: 'Get Paid',
      description: 'Submit completion confirmation and receive payment within 7 business days.'
    }
  ];

  const requirements = [
    'Valid business license and insurance',
    'Minimum 2 years in waste management',
    'Fleet of roll-off trucks and containers',
    'Professional, uniformed drivers',
    'GPS tracking capability',
    'Same-day/next-day availability',
    'Commitment to customer service',
    'Environmental compliance certification'
  ];

  const stats = [
    { value: '2,000+', label: 'Partner Network' },
    { value: '15,000+', label: 'Monthly Orders' },
    { value: '98%', label: 'Partner Retention' },
    { value: '$2.5M+', label: 'Monthly Payouts' }
  ];

  const testimonials = [
    {
      quote: "Joining this network was the best decision for our business. Consistent orders, reliable payments, and no marketing headaches.",
      author: "Mike Johnson",
      company: "Johnson Waste Solutions",
      location: "Richmond, VA"
    },
    {
      quote: "We've grown 40% since partnering. The technology and support have transformed how we operate.",
      author: "Sarah Chen",
      company: "Green Valley Disposal",
      location: "Charlotte, NC"
    },
    {
      quote: "Finally, a partner program that actually delivers. Real orders, real revenue, real growth.",
      author: "Tom Martinez",
      company: "Metro Dumpster Co",
      location: "Baltimore, MD"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Partner application:', formData);
  };

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.includes(service)
        ? prev.servicesOffered.filter(s => s !== service)
        : [...prev.servicesOffered, service]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">Join Our Growing Network</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Grow Your Dumpster Rental Business
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
              Partner with us to get guaranteed orders, reliable payments, and the technology to scale. 
              No upfront costs, no lead fees, just real business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#apply"
                className="px-8 py-4 bg-white text-primary rounded-lg font-semibold text-lg hover:bg-gray-50 transition shadow-lg"
              >
                Apply to Join
              </a>
              <a
                href="tel:1-888-PRO-LINE"
                className="px-8 py-4 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold text-lg hover:bg-primary-foreground/20 transition flex items-center justify-center gap-2"
              >
                <Phone className="h-5 w-5" />
                Call 1-888-PRO-LINE
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Why Partner With Us</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We handle the hard parts of growing a dumpster rental business so you can focus on what you do best.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-5 gap-6">
            {howItWorks.map((step, idx) => (
              <div key={step.step} className="text-center relative">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                {idx < howItWorks.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-6 h-5 w-5 text-gray-400" />
                )}
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Partners Say</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="bg-white rounded-lg p-6 shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Partner Requirements</h2>
          
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {requirements.map((req) => (
              <div key={req} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{req}</span>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">
              Don't meet all requirements? Let's talk - we may have solutions to help you qualify.
            </p>
            <a
              href="tel:1-888-PRO-LINE"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              <Phone className="h-5 w-5" />
              Call to Discuss
            </a>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Apply to Become a Partner</h2>
          <p className="text-center text-muted-foreground mb-8">
            Takes less than 5 minutes. We'll review and respond within 24 hours.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Years in Business *</label>
                <select
                  required
                  value={formData.yearsInBusiness}
                  onChange={(e) => setFormData({...formData, yearsInBusiness: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select...</option>
                  <option value="0-2">0-2 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Fleet Size *</label>
                <select
                  required
                  value={formData.fleetSize}
                  onChange={(e) => setFormData({...formData, fleetSize: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select...</option>
                  <option value="1-3">1-3 trucks</option>
                  <option value="4-10">4-10 trucks</option>
                  <option value="11-25">11-25 trucks</option>
                  <option value="25+">25+ trucks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Container Sizes Offered</label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {['10 Yard', '15 Yard', '20 Yard', '30 Yard', '40 Yard'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleService(size)}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium transition ${
                      formData.servicesOffered.includes(size)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Service Coverage Area</label>
              <input
                type="text"
                value={formData.coverage}
                onChange={(e) => setFormData({...formData, coverage: e.target.value})}
                placeholder="e.g., 50 mile radius from Richmond, VA"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Information</label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Tell us about your business, special capabilities, or questions"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Submit Application
            </button>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join 2,000+ successful partners nationwide. Start receiving orders within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#apply"
              className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Apply Now
            </a>
            <Link
              href="/commercial"
              className="px-8 py-3 bg-primary-foreground/10 backdrop-blur text-white rounded-lg font-semibold hover:bg-primary-foreground/20 transition"
            >
              Learn About Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}