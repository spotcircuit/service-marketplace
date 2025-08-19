"use client";

import React from 'react';
import { Phone } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';

interface CallCtaProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'md' | 'lg';
}

export default function CallCta({ className = '', variant = 'light', size = 'md' }: CallCtaProps) {
  const { config } = useConfig();

  const phoneHref = config?.contactPhoneE164 || config?.contactPhone || '';
  const phoneLabel = config?.contactPhoneDisplay || config?.contactPhone || '';

  if (!phoneHref || !phoneLabel) return null;

  const base = 'rounded-lg font-semibold transition inline-flex items-center justify-center gap-2';
  const sizes = size === 'lg' ? 'px-8 py-4 text-lg' : 'px-6 py-3';
  const styles =
    variant === 'light'
      ? 'bg-white text-primary hover:bg-gray-50'
      : 'bg-primary-foreground/10 backdrop-blur text-white hover:bg-primary-foreground/20 border-2 border-white/50';

  return (
    <a href={`tel:${phoneHref}`} className={`${base} ${sizes} ${styles} ${className}`.trim()}>
      <Phone className="h-5 w-5" />
      {`Call ${phoneLabel}`}
    </a>
  );
}
