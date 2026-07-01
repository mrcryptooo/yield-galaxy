'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Wraps all HUD elements. Applies microscopic transform
 * that follows a slow drift, making the HUD feel attached
 * to a visor rather than pinned to the browser window.
 */
export function VisorLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    let t = 0;
    const animate = () => {
      t += 0.008;
      if (ref.current) {
        // Very tiny movement — subconscious, not visible
        const dx = Math.sin(t * 0.7) * 0.4 + Math.sin(t * 1.1) * 0.2;
        const dy = Math.cos(t * 0.5) * 0.25 + Math.cos(t * 0.9) * 0.1;
        ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // VisorLayer establishes its own stacking context (position:fixed + z-index),
  // so any z-index set on its children (e.g. NavBar) only matters relative to
  // its OTHER children — the whole subtree still competes against siblings
  // like ListView using THIS z-index. Must stay above ListView's z-index (15)
  // so the Galaxy/List switch is never covered while scrolling list content.
  return (
    <div ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 16, pointerEvents: 'none' }}>
      {children}
    </div>
  );
}
