"use client";

import { useConfig } from '@/contexts/ConfigContext';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ServicesSection() {
  const { config, loading } = useConfig();

  if (loading || !config || !config.serviceCategories) {
    return (
      <section className="section-padding bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-10 w-96 bg-muted rounded-lg mx-auto mb-4"></div>
              <div className="h-6 w-64 bg-muted rounded-lg mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Service Do You Need?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our wide range of professional services tailored to meet your specific needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {config.serviceCategories.map((category: any) => (
            <Link
              key={category.id}
              href={`/services/${category.id}`}
              className="group relative overflow-hidden rounded-xl shadow-lg card-hover"
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-white/80 mb-4">{category.description}</p>

                  <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all">
                    <span className="font-semibold">Learn More</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
