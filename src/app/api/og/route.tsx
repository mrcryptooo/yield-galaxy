import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const symbol = params.get('symbol') ?? 'Yield Galaxy';
  const apy = params.get('apy') ?? '';
  const score = params.get('score') ?? '';
  const risk = params.get('risk') ?? '';
  const protocol = params.get('protocol') ?? '';
  const tvl = params.get('tvl') ?? '';
  const type = params.get('type') ?? 'planet';

  const typeIcon = type === 'planet' ? '◉' : type === 'moon' ? '◎' : '▣';
  const riskColor = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444' }[risk] ?? '#94a3b8';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #050510 0%, #0a0a2e 50%, #050510 100%)',
          fontFamily: 'system-ui, sans-serif',
          color: '#f8fafc',
        }}
      >
        {/* Top: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#7c3aed', fontSize: '28px' }}>✦</span>
          <span style={{ fontSize: '24px', fontWeight: 700 }}>Yield Galaxy</span>
          <span style={{ fontSize: '16px', color: '#71717a', marginLeft: '8px' }}>Solstice Intelligence</span>
        </div>

        {/* Center: opportunity data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '20px', color: '#7c3aed' }}>{typeIcon}</span>
            <span style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-1px' }}>{symbol}</span>
          </div>

          {apy && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', color: '#71717a' }}>APY</span>
                <span style={{ fontSize: '56px', fontWeight: 800, fontFamily: 'monospace' }}>{apy}</span>
              </div>
              {score && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#71717a' }}>Score</span>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: '#7c3aed' }}>{score}</span>
                </div>
              )}
              {risk && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#71717a' }}>Risk</span>
                  <span style={{ fontSize: '36px', fontWeight: 800, color: riskColor }}>{risk}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom: metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '32px', color: '#71717a', fontSize: '18px' }}>
            {protocol && <span>{protocol}</span>}
            {tvl && <span>TVL: {tvl}</span>}
          </div>
          <span style={{ fontSize: '16px', color: '#4c1d95' }}>yieldgalaxy.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
