'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator } from 'lucide-react';
import SizeCalculator from '@/components/SizeCalculator';
import DumpsterSizeComparison from '@/components/DumpsterSizeComparison';

export default function SizeCalculatorClient() {
  const [selectedSize, setSelectedSize] = useState<string>('20-yard');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/tools-guides" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary/90 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Dumpster Size Calculator
          </h1>
          <p className="text-xl text-white/90">
            Find the perfect dumpster size for your project in just a few clicks
          </p>
        </div>
      </section>

      {/* Calculator Component */}
      <SizeCalculator embedded={false} />

      {/* Visual Size Comparison Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            See how different dumpster sizes compare to help you make the best choice
          </p>
          
          <DumpsterSizeComparison 
            selectedSize={selectedSize}
            onSizeSelect={setSelectedSize}
            showImage={true}
          />
        </div>
      </section>
    </div>
  );
}