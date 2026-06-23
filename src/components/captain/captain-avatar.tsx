'use client';

import { useState } from 'react';

interface Props {
  onClick?: () => void;
  size?: number;
}

export function CaptainAvatar({ onClick, size = 56 }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0 transition-transform duration-300"
      style={{
        width: size,
        height: size,
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}
      aria-label="Captain Whiskers"
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(246,160,77,0.25) 0%, transparent 70%)',
          opacity: hovered ? 1 : 0.6,
          transform: 'scale(1.4)',
        }}
      />
      {/* Avatar circle */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a1520 0%, #0A0E1A 100%)',
          border: '1.5px solid rgba(246,160,77,0.3)',
          fontSize: size * 0.45,
        }}
      >
        <span role="img" aria-hidden="true">🐱</span>
      </div>
    </button>
  );
}
