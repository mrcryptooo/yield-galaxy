import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yieldgalaxy.app';

export const metadata: Metadata = {
  title: 'Yield Galaxy — Solstice Yield Intelligence',
  description: 'Explore the Solstice Galaxy. Discover yield opportunities. Maximize your fuel.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Yield Galaxy — Explore. Discover. Yield.',
    description: 'An immersive yield exploration experience for the Solstice ecosystem.',
    url: SITE_URL,
    siteName: 'Yield Galaxy',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Yield Galaxy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yield Galaxy — Explore. Discover. Yield.',
    description: 'An immersive yield exploration experience for the Solstice ecosystem.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body style={{ background: '#0A0E1A', color: '#F5F0EB' }} className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
