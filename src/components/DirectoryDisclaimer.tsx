import React from 'react';

export default function DirectoryDisclaimer(): JSX.Element {
  return (
    <div className="mt-8 text-xs text-muted-foreground bg-muted/40 border rounded-md p-4">
      <p className="mb-2">
        Marketplace and directory notice: We connect customers with independent local providers. We do not provide
        services directly and do not guarantee pricing, availability, licensing, insurance, or quality of work.
      </p>
      <p>
        Before hiring, please verify provider credentials (e.g., licensing, insurance, permits) and confirm pricing
        and service details that fit your project and location.
      </p>
    </div>
  );
}
