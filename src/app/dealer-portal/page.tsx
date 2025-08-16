'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DealerPortalPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard as the default view
    router.push('/dealer-portal/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to dealer portal...</p>
      </div>
    </div>
  );
}