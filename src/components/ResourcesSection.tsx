"use client";

import Link from 'next/link';
import { BookOpen, Clock, TrendingUp, Users, FileText, HelpCircle } from 'lucide-react';

const resources = [
  {
    id: 1,
    title: "Complete Pricing Guide",
    description: "Learn how to get the best value and save money on professional services",
    image: "https://ext.same-assets.com/1079325698/1749791546.webp",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "Pricing",
  },
  {
    id: 2,
    title: "Service Size & Scope Guide",
    description: "Find the perfect service package for your specific needs",
    image: "https://ext.same-assets.com/1079325698/4127811034.webp",
    icon: <FileText className="h-5 w-5" />,
    category: "Planning",
  },
  {
    id: 3,
    title: "Getting Started 101",
    description: "Everything you need to know before booking your first service",
    image: "https://ext.same-assets.com/1079325698/26879381.webp",
    icon: <BookOpen className="h-5 w-5" />,
    category: "Basics",
  },
  {
    id: 4,
    title: "Terms & Conditions Guide",
    description: "Understanding contracts and agreements for peace of mind",
    image: "https://ext.same-assets.com/1079325698/2150289772.webp",
    icon: <FileText className="h-5 w-5" />,
    category: "Legal",
  },
  {
    id: 5,
    title: "DIY vs Professional Services",
    description: "When to DIY and when to hire a professional for best results",
    image: "https://ext.same-assets.com/1079325698/3976872569.webp",
    icon: <Users className="h-5 w-5" />,
    category: "Comparison",
  },
  {
    id: 6,
    title: "Business Solutions Guide",
    description: "Comprehensive guide for commercial and enterprise clients",
    image: "https://ext.same-assets.com/1079325698/1663704582.webp",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "Business",
  },
];

export default function ResourcesSection() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Resources & Guides
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert advice and helpful guides to make informed decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={`/resources/${resource.id}`}
              className="group bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full">
                    {resource.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {resource.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {resource.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    5 min read
                  </span>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-3 w-3" />
                    Expert Tips
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Resources */}
        <div className="text-center mt-10">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <BookOpen className="h-5 w-5" />
            View All Resources
          </Link>
        </div>
      </div>
    </section>
  );
}
