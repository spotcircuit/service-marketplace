'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function ClaimByTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinessByToken = async () => {
      try {
        // Fetch business details using the token
        const response = await fetch(`/api/claim/token/${resolvedParams.token}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Invalid or expired token');
        }

        const data = await response.json();
        
        // Track that the link was clicked
        await fetch(`/api/claim/token/${resolvedParams.token}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'link_clicked' })
        });

        // Redirect to the full claim page with all the business details
        const queryParams = new URLSearchParams({
          businessId: data.business.id,
          businessName: data.business.name,
          email: data.business.email || '',
          phone: data.business.phone || '',
          address: data.business.address || '',
          city: data.business.city || '',
          state: data.business.state || '',
          zipcode: data.business.zipcode || '',
          category: data.business.category || '',
          website: data.business.website || '',
          token: resolvedParams.token // Include token for tracking
        });

        router.replace(`/claim?${queryParams.toString()}`);
      } catch (err) {
        console.error('Error fetching business by token:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchBusinessByToken();
  }, [resolvedParams.token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying claim link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Invalid Claim Link</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact support or request a new claim link.
          </p>
        </div>
      </div>
    );
  }

  return null;
}