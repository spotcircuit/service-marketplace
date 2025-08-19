'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package, Truck, Weight } from 'lucide-react';

interface DumpsterSizeComparisonProps {
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
  showImage?: boolean;
  className?: string;
}

export default function DumpsterSizeComparison({ 
  selectedSize = '20-yard', 
  onSizeSelect,
  showImage = true,
  className = ''
}: DumpsterSizeComparisonProps) {
  const [hoveredSize, setHoveredSize] = useState<string | null>(null);

  const sizes = [
    {
      id: '10-yard',
      name: '10-Yard',
      height: 60,
      capacity: '4 Pickup Trucks',
      useCase: 'Small Projects',
      dimensions: '14\' L × 8\' W × 3.5\' H',
      weight: '2-3 tons',
      color: 'bg-primary/20',
    },
    {
      id: '20-yard',
      name: '20-Yard',
      height: 100,
      capacity: '8 Pickup Trucks',
      useCase: 'Home Remodels',
      dimensions: '16\' L × 8\' W × 5.5\' H',
      weight: '3-4 tons',
      color: 'bg-primary/30',
      popular: true,
    },
    {
      id: '30-yard',
      name: '30-Yard',
      height: 140,
      capacity: '12 Pickup Trucks',
      useCase: 'Large Projects',
      dimensions: '20\' L × 8\' W × 6\' H',
      weight: '4-5 tons',
      color: 'bg-primary/20',
    },
    {
      id: '40-yard',
      name: '40-Yard',
      height: 180,
      capacity: '16 Pickup Trucks',
      useCase: 'Commercial',
      dimensions: '22\' L × 8\' W × 8\' H',
      weight: '5-6 tons',
      color: 'bg-primary/20',
    },
  ];

  const selectedSizeData = sizes.find(s => s.id === selectedSize);

  const handleSizeClick = (sizeId: string) => {
    if (onSizeSelect) {
      onSizeSelect(sizeId);
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-8 ${className}`}>
      {/* Image if requested */}
      {showImage && (
        <div className="flex justify-center mb-8">
          <Image
            src="/images/DumpsterSizeComparisonChart.png"
            alt="Dumpster size comparison chart"
            width={800}
            height={400}
            className="max-w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Common Items Reference */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">🛋️</div>
          <p className="text-sm font-medium">Furniture</p>
          <p className="text-xs text-muted-foreground">10-yard: 2-3 rooms</p>
          <p className="text-xs text-muted-foreground">20-yard: Full house</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">🪵</div>
          <p className="text-sm font-medium">Renovation Debris</p>
          <p className="text-xs text-muted-foreground">20-yard: Kitchen/Bath</p>
          <p className="text-xs text-muted-foreground">30-yard: Multiple rooms</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">🏠</div>
          <p className="text-sm font-medium">Roofing</p>
          <p className="text-xs text-muted-foreground">20-yard: Up to 3,000 sq ft</p>
          <p className="text-xs text-muted-foreground">30-yard: Up to 5,000 sq ft</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl mb-2">🧱</div>
          <p className="text-sm font-medium">Heavy Materials</p>
          <p className="text-xs text-muted-foreground">10-yard: Best for concrete</p>
          <p className="text-xs text-muted-foreground">Weight limits apply</p>
        </div>
      </div>

    </div>
  );
}