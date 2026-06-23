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
  description: 'Every yield opportunity in the Solstice ecosystem — scored, ranked, and explorable on a 3D galaxy map.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Yield Galaxy — Solstice Yield Intelligence',
    description: 'Scored, ranked yield opportunities across the Solstice ecosystem. USX, eUSX, SLX across Kamino, Orca, Raydium, Loopscale.',
    url: SITE_URL,
    siteName: 'Yield Galaxy',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Yield Galaxy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yield Galaxy — Solstice Yield Intelligence',
    description: 'Scored, ranked yield opportunities across the Solstice ecosystem.',
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
      <body className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
