'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on homepage
  if (pathname === '/') return null;
  
  // Parse the pathname into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Generate breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    // Format the label (replace hyphens with spaces and capitalize)
    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Special handling for known segments
    if (segment === 'services') label = 'Services';
    if (segment === 'dealer-portal') label = 'Dealer Portal';
    if (segment === 'dashboard') label = 'Dashboard';
    if (segment === 'admin') label = 'Admin';
    if (segment === 'resources') label = 'Resources';
    
    // State abbreviations to full names
    const stateNames: Record<string, string> = {
      'texas': 'Texas',
      'california': 'California',
      'florida': 'Florida',
      'new-york': 'New York',
      'illinois': 'Illinois',
      'pennsylvania': 'Pennsylvania',
      'georgia': 'Georgia',
      'ohio': 'Ohio',
    };
    
    if (stateNames[segment]) {
      label = stateNames[segment];
    }
    
    return {
      label,
      href,
      isLast: index === segments.length - 1
    };
  });
  
  return (
    <nav className="bg-gray-50 border-b">
      <div className="container mx-auto px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {/* Home link */}
          <li>
            <Link 
              href="/" 
              className="text-gray-500 hover:text-primary transition flex items-center"
            >
              <Home className="h-4 w-4" />
              <span className="ml-1">Home</span>
            </Link>
          </li>
          
          {/* Breadcrumb items */}
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              {crumb.isLast ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link 
                  href={crumb.href}
                  className="text-gray-500 hover:text-primary transition"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}