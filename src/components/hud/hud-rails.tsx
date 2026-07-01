'use client';

import type { ReactNode } from 'react';

// Safe layout system (architectural, not cosmetic): the screen is divided
// into three protected HUD regions plus the center, which belongs to the
// galaxy alone. Every HUD element is a normal-flow child of exactly one
// rail — never independently `position: fixed` — so the rail's flex column
// stacks children and its fixed width/height bounds them. Two elements in
// the same rail physically cannot overlap; elements in different rails
// occupy disjoint screen regions by construction.
//
// LEFT  — Branding, Captain, Planet Info
// RIGHT — Comms, Routes/Optimizer, Telemetry
// BOTTOM — Mission / Journey
// CENTER — galaxy only, owned by no rail

export function LeftRail({ children }: { children: ReactNode }) {
  return <div className="hud-rail hud-rail-left" style={{ animation: 'fadeIn 0.8s ease-out' }}>{children}</div>;
}

export function RightRail({ children }: { children: ReactNode }) {
  return <div className="hud-rail hud-rail-right" style={{ animation: 'fadeIn 0.8s ease-out' }}>{children}</div>;
}

export function BottomRail({ children }: { children: ReactNode }) {
  return <div className="hud-rail hud-rail-bottom" style={{ animation: 'fadeIn 0.8s ease-out' }}>{children}</div>;
}
