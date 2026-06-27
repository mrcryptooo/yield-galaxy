import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yield Galaxy — Solstice Yield Explorer',
  description: 'Explore the Yield Galaxy. Discover DeFi yield opportunities across the Solstice ecosystem.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
