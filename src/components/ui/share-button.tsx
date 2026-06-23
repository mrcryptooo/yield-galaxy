'use client';

import { useState } from 'react';
import type { Opportunity } from '@/lib/types';
import { formatApy, formatTvl } from '@/lib/format';

interface Props {
  opportunity: Opportunity;
}

export function ShareButton({ opportunity }: Props) {
  const [copied, setCopied] = useState(false);
  const o = opportunity;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yieldgalaxy.app';

  const ogUrl = `${siteUrl}/api/og?symbol=${enc(o.symbol)}&apy=${enc(formatApy(o.total_apy))}&score=${o.score}&risk=${o.risk_grade}&protocol=${enc(o.source?.name ?? o.source_id)}&tvl=${enc(formatTvl(o.tvl))}&type=${o.celestial_type}`;

  const tweetText = `${typeIcon(o.celestial_type)} ${o.symbol} on ${o.source?.name ?? o.source_id}\n\n` +
    `APY: ${formatApy(o.total_apy)}\n` +
    `Score: ${o.score}/100 · Risk: ${o.risk_grade}\n` +
    `TVL: ${formatTvl(o.tvl)}\n\n` +
    `Explore the Solstice galaxy ▸ ${siteUrl}\n\n` +
    `#YieldGalaxy #Solstice #DeFi`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${siteUrl}?opp=${o.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyImage = () => {
    window.open(ogUrl, '_blank');
  };

  return (
    <div className="flex gap-2">
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 text-center py-2 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
      >
        Share on 𝕏
      </a>
      <button
        onClick={handleCopyLink}
        className="flex-1 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
      >
        {copied ? '✓ Copied' : 'Copy Link'}
      </button>
      <button
        onClick={handleCopyImage}
        className="py-2 px-3 rounded-lg border border-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-800 transition-colors"
        title="Open share card image"
      >
        🖼
      </button>
    </div>
  );
}

function enc(s: string): string {
  return encodeURIComponent(s);
}

function typeIcon(type: string): string {
  return type === 'planet' ? '◉' : type === 'moon' ? '◎' : '▣';
}
