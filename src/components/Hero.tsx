"use client";

import React from 'react';
import { useConfig } from '@/contexts/ConfigContext';

interface HeroProps {
  title?: string;
  subtitle?: string;
  cta?: React.ReactNode;
  gradient?: 'primary' | 'secondary' | 'accent' | 'mixed';
  center?: boolean;
  children?: React.ReactNode;
  className?: string;
  paddingClassName?: string;
}

const gradientClassMap: Record<NonNullable<HeroProps['gradient']>, string> = {
  primary: 'hero-gradient-primary',
  secondary: 'hero-gradient-secondary',
  accent: 'hero-gradient-accent',
  mixed: 'hero-gradient-mixed',
};

export default function Hero({
  title,
  subtitle,
  cta,
  gradient = 'primary',
  center = true,
  children,
  className = '',
  paddingClassName = 'py-16',
}: HeroProps) {
  const { config } = useConfig();

  const fallbackTitle = config?.hero?.headline || config?.businessName || 'Welcome';
  const fallbackSubtitle = config?.hero?.subheadline || config?.tagline || '';

  const align = center ? 'text-center' : '';
  const gradientClass = gradientClassMap[gradient] || gradientClassMap.primary;

  return (
    <div className={`${gradientClass} text-white ${paddingClassName}`}>
      <div className="container">
        <div className={`max-w-3xl mx-auto ${align} ${className}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {title || fallbackTitle}
          </h1>
          {(subtitle || fallbackSubtitle) && (
            <p className="text-xl text-white/90">
              {subtitle || fallbackSubtitle}
            </p>
          )}
          {cta && (
            <div className="mt-6">
              {cta}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
