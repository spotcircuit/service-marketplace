'use client';

import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useRouter } from 'next/navigation';

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

type GeoFeature = {
  rsmKey: string;
  properties: {
    name?: string;
    [key: string]: unknown;
  };
};

interface USStatesMapProps {
  served: Set<string>;
  onStateClick?: (slug: string) => void;
}

export default function USStatesMap({ served, onStateClick }: USStatesMapProps) {
  const router = useRouter();

  return (
    <div className="w-full h-[520px] bg-gray-50 rounded-xl border">
      <ComposableMap
        projection="geoAlbersUsa"
        width={980}
        height={520}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: GeoFeature[] }) =>
            geographies.map((geo: GeoFeature) => {
              const name = (geo.properties?.name || '').toString();
              if (!name) return null;
              const slug = slugify(name);
              const isServed = served.has(slug);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo as unknown as any}
                  title={name}
                  role="button"
                  tabIndex={isServed ? 0 : -1}
                  onClick={() => {
                    if (!isServed) return;
                    if (onStateClick) return onStateClick(slug);
                    router.push(`/${slug}`);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<SVGPathElement>) => {
                    if (!isServed) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onStateClick) return onStateClick(slug);
                      router.push(`/${slug}`);
                    }
                  }}
                  style={{
                    default: {
                      fill: isServed ? '#fde9e1' : '#f3f4f6',
                      stroke: isServed ? '#fb923c' : '#9ca3af',
                      strokeWidth: isServed ? 1 : 0.75,
                      outline: 'none',
                    },
                    hover: {
                      fill: isServed ? '#ff6b35' : '#e5e7eb',
                      stroke: isServed ? '#1f2937' : '#9ca3af',
                      strokeWidth: 1,
                      outline: 'none',
                      cursor: isServed ? 'pointer' : 'not-allowed',
                    },
                    pressed: {
                      fill: isServed ? '#fb923c' : '#e5e7eb',
                      stroke: '#1f2937',
                      strokeWidth: 1,
                      outline: 'none',
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}
