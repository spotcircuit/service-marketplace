'use client';

import { useEffect } from 'react';

interface HeaderToneSetterProps {
  tone: 'primary' | 'secondary' | 'default';
}

export default function HeaderToneSetter({ tone }: HeaderToneSetterProps): null {
  useEffect(() => {
    const root = document.documentElement;
    const prev = root.getAttribute('data-header-tone');
    if (tone === 'default') {
      root.removeAttribute('data-header-tone');
    } else {
      root.setAttribute('data-header-tone', tone);
    }
    return () => {
      if (prev) {
        root.setAttribute('data-header-tone', prev);
      } else {
        root.removeAttribute('data-header-tone');
      }
    };
  }, [tone]);

  return null;
}
