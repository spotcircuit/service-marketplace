"use client";

import React from 'react';
import Script from 'next/script';
import { useConfig } from '@/contexts/ConfigContext';

export default function OrganizationSchemaClient() {
  const { config } = useConfig();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://dumpquote.co/#organization',
    name: config?.siteName || 'Hometown Dumpster Rental',
    url: 'https://dumpquote.co',
    logo: 'https://dumpquote.co/logo.png',
    description:
      config?.siteTagline ||
      "America's #1 source for dumpster rentals and junk removal services",
    telephone: config?.contactPhoneDisplay || config?.contactPhone || undefined,
    email: config?.contactEmail || undefined,
    sameAs: [
      'https://www.facebook.com/hometowndumpster',
      'https://twitter.com/hometowndumpster',
      'https://www.linkedin.com/company/hometown-dumpster',
    ],
    priceRange: '$$',
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
  } as Record<string, any>;

  // Remove undefined properties for clean JSON-LD
  Object.keys(schema).forEach((k) => schema[k] === undefined && delete schema[k]);

  return (
    <Script
      id="organization-schema-dynamic"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
