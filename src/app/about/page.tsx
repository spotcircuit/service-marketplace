'use client';

import { useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { Target, Users, Award, Globe, Heart, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  const { config } = useConfig();

  useEffect(() => {
    const root = document.documentElement;
    const previousTone = root.getAttribute('data-header-tone');
    root.setAttribute('data-header-tone', 'secondary');
    return () => {
      if (previousTone) {
        root.setAttribute('data-header-tone', previousTone);
      } else {
        root.removeAttribute('data-header-tone');
      }
    };
  }, []);

  const stats = [
    { label: 'Service Providers', value: '3,200+', icon: Users },
    { label: 'Cities Covered', value: '150+', icon: Globe },
    { label: 'Customers Served', value: '50,000+', icon: Heart },
    { label: 'Years in Business', value: '5+', icon: Award }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'We verify every service provider and protect your information'
    },
    {
      icon: Zap,
      title: 'Speed & Efficiency',
      description: 'Get quotes in minutes, not days. Save time on every project'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We&apos;re here to help 24/7'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Improvement',
      description: 'We constantly evolve based on your feedback and needs'
    }
  ];

  const timeline = [
    { year: '2019', event: 'Founded with a mission to simplify service discovery' },
    { year: '2020', event: 'Expanded to 25 cities across 5 states' },
    { year: '2021', event: 'Launched mobile app and reached 10,000 users' },
    { year: '2022', event: 'Introduced AI-powered matching and instant quotes' },
    { year: '2023', event: 'Expanded nationwide with 100+ cities' },
    { year: '2024', event: 'Reached 50,000 satisfied customers' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-primary to-primary/90">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-hero-foreground mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About {config?.siteName || 'Our Platform'}
            </h1>
            <p className="text-xl text-hero-foreground/90 max-w-3xl mx-auto">
              We&apos;re on a mission to connect customers with trusted service providers,
              making it easier than ever to get things done.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-orange-600 mr-3" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-gray-600 mb-6">
                We believe finding reliable service providers shouldn&apos;t be a hassle.
                Our platform eliminates the guesswork by connecting you with verified,
                rated professionals in your area.
              </p>
              <p className="text-gray-600 mb-6">
                Whether you need a dumpster rental, home repairs, or any other service,
                we make the process simple, transparent, and stress-free.
              </p>
              <p className="text-gray-600">
                Every day, we help thousands of customers save time and money while
                supporting local businesses in growing their customer base.
              </p>
            </div>
            <div className="bg-orange-100 rounded-lg p-8">
              <blockquote className="text-lg italic text-gray-700">
                "Our vision is to become the most trusted platform for connecting
                customers with service providers, fostering local economic growth
                while delivering exceptional user experiences."
              </blockquote>
              <p className="mt-4 font-semibold">- Brian, Founder & CEO</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-orange-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">In the Field</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/row-1-column-1.png"
                alt="Team delivering on-site dumpster service"
                fill
                sizes="(min-width: 1024px) 600px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/row-1-column-2.png"
                alt="Customer receiving a quick quote"
                fill
                sizes="(min-width: 1024px) 600px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/row-2-column-1.png"
                alt="Professional service provider at work"
                fill
                sizes="(min-width: 1024px) 600px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/row-2-column-2.png"
                alt="Completed project with satisfied customer"
                fill
                sizes="(min-width: 1024px) 600px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story Timeline */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start mb-8">
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <span className="text-orange-600 font-bold">{item.year}</span>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-orange-600 rounded-full mt-1.5 mr-8 relative">
                  {index < timeline.length - 1 && (
                    <div className="absolute top-4 left-1.5 w-0.5 h-16 bg-orange-200"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Join Our Growing Community
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Whether you&apos;re looking for services or providing them, we&apos;re here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/directory"
              className="px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition"
            >
              Find Services
            </Link>
            <Link
              href="/for-business"
              className="px-8 py-3 bg-orange-700 text-white rounded-lg font-semibold hover:bg-orange-800 transition"
            >
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
