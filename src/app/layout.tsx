import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SolScout — Solstice Galaxy Explorer',
  description: 'Explore the Solstice Galaxy. Discover yield opportunities.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
