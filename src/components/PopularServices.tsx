"use client";

import { siteConfig } from '@/config/site-config';
import Link from 'next/link';

export default function PopularServices() {
  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular Services Near You
          </h2>
          <p className="text-lg text-muted-foreground">
            Quick access to our most requested services
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {siteConfig.popularServices.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.category}/${service.id}`}
              className="group bg-card hover:bg-primary/5 border border-border hover:border-primary/30 rounded-lg p-6 text-center transition-all duration-300"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="font-semibold text-sm">{service.name}</h3>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors font-semibold"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}
