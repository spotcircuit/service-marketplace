import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "@/contexts/ConfigContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from 'next/script';
import OrganizationSchemaClient from '@/components/OrganizationSchemaClient';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://dumpquote.co'),
  title: {
    default: 'Dumpster Rental Near Me | Same Day Delivery | Hometown Dumpster',
    template: '%s | Hometown Dumpster Rental'
  },
  // Phone number removed to avoid hardcoding; dynamic phone is exposed via components
  description: 'Find affordable dumpster rental services near you. Same-day delivery, transparent pricing, no hidden fees. Sizes from 10-40 yards. Licensed & insured.',
  keywords: 'dumpster rental, roll off dumpster, waste management, junk removal, debris removal, dumpster rental near me, same day dumpster rental, construction dumpster',
  authors: [{ name: 'Hometown Dumpster Rental' }],
  creator: 'Hometown Dumpster Rental',
  publisher: 'Hometown Dumpster Rental',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dumpquote.co',
    siteName: 'Hometown Dumpster Rental',
    title: 'Dumpster Rental Near Me | Same Day Delivery',
    description: 'Find affordable dumpster rental services near you. Same-day delivery, transparent pricing, no hidden fees.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hometown Dumpster Rental - Roll Off Dumpsters'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dumpster Rental Near Me | Hometown Dumpster',
    description: 'Find affordable dumpster rental services. Same-day delivery available!',
    images: ['/twitter-card.jpg'],
    creator: '@hometowndumpster'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://dumpquote.co',
  },
  category: 'business',
  other: {
    'apple-mobile-web-app-title': 'Hometown Dumpster',
    'application-name': 'Hometown Dumpster Rental',
    'msapplication-TileColor': '#FF8C00',
    'theme-color': '#FF8C00'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* OrganizationSchemaClient must be rendered within providers; injected in body below */}
      </head>
      <body className={inter.className}>
        <ConfigProvider>
          <ThemeProvider>
            <AuthProvider>
              <OrganizationSchemaClient />
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
