"use client";

import { siteConfig } from '@/config/site-config';

export default function HowItWorks() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How {siteConfig.businessName} Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting started is easy. Follow these simple steps to connect with the right professional for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {siteConfig.howItWorks.map((step, index) => (
            <div key={step.step} className="relative">
              {/* Connection Line */}
              {index < siteConfig.howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-24 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
              )}

              <div className="text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary mb-4">
                  <span className="text-3xl">{step.icon}</span>
                </div>

                {/* Step Content */}
                <h3 className="text-xl font-bold mb-2">
                  Step {step.step}: {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
