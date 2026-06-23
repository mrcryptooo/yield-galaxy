'use client';

import { useEffect, useState } from 'react';

interface Props {
  message: string;
  actions?: { label: string; onClick: () => void }[];
  duration?: number;
  onDismiss?: () => void;
}

export function CaptainSpeech({ message, actions, duration = 12000, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 100);
    const hideTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss?.(), 300);
    }, duration);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [duration, onDismiss]);

  return (
    <div
      className="glass max-w-xs transition-all duration-300"
      style={{
        opacity: exiting ? 0 : visible ? 1 : 0,
        transform: exiting ? 'translateY(8px)' : visible ? 'translateY(0)' : 'translateY(8px)',
        padding: '10px 14px',
      }}
    >
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-warm)' }}>
        {message}
      </p>
      {actions && actions.length > 0 && (
        <div className="flex gap-2 mt-2">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="text-xs px-3 py-1 rounded-lg transition-colors"
              style={{
                border: '1px solid rgba(246,160,77,0.25)',
                color: 'var(--solar)',
                background: 'rgba(246,160,77,0.06)',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(246,160,77,0.15)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'rgba(246,160,77,0.06)'; }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
      {/* Speech tail */}
      <div
        className="absolute -bottom-1.5 left-5 w-3 h-3 rotate-45"
        style={{ background: 'rgba(10,14,26,0.75)', borderRight: '1px solid var(--border-warm)', borderBottom: '1px solid var(--border-warm)' }}
      />
    </div>
  );
}
