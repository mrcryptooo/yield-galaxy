import { PLANET_POSITIONS, STATION_POSITIONS, MOON_ORBITS } from '@/components/galaxy/positions';

export type NodeType = 'planet' | 'station' | 'moon' | 'action';

export interface RouteNode {
  id: string;
  label: string;
  type: NodeType;
  celestialKey: string;
  action: string;
  position: [number, number, number];
}

export interface RouteTemplate {
  id: string;
  name: string;
  description: string;
  steps: RouteStepDef[];
  _captainLines?: Record<string, string>;
  // Route-wide stats from the optimizer (APY/risk/score), carried alongside
  // the template so Mission Control can display them without recomputing.
  _meta?: { apy: number; risk: string; score: number };
}

export interface RouteStepDef {
  label: string;
  type: NodeType;
  celestialKey: string;
  action: string;
}

export interface ActiveRoute {
  template: RouteTemplate;
  nodes: RouteNode[];
  currentStep: number;
}

export function resolveNodePosition(type: NodeType, key: string): [number, number, number] {
  if (type === 'planet' && key in PLANET_POSITIONS) {
    return [...PLANET_POSITIONS[key as keyof typeof PLANET_POSITIONS].pos];
  }
  if (type === 'station' && key in STATION_POSITIONS) {
    return [...STATION_POSITIONS[key as keyof typeof STATION_POSITIONS].pos];
  }
  if (type === 'moon' && key in MOON_ORBITS) {
    const moon = MOON_ORBITS[key as keyof typeof MOON_ORBITS];
    const parent = PLANET_POSITIONS[moon.parent];
    return [
      parent.pos[0] + Math.cos(moon.orbitAngle) * moon.orbitRadius,
      parent.pos[1] + 0.3,
      parent.pos[2] + Math.sin(moon.orbitAngle) * moon.orbitRadius,
    ];
  }
  if (type === 'action') {
    if (key in PLANET_POSITIONS) {
      const p = PLANET_POSITIONS[key as keyof typeof PLANET_POSITIONS].pos;
      return [p[0] + 2, p[1] + 1, p[2]];
    }
    if (key in STATION_POSITIONS) {
      const s = STATION_POSITIONS[key as keyof typeof STATION_POSITIONS].pos;
      return [s[0] + 1.5, s[1] + 0.8, s[2]];
    }
  }
  return [0, 0, 0];
}

export function buildRoute(template: RouteTemplate): ActiveRoute {
  const nodes: RouteNode[] = template.steps.map((step, i) => ({
    id: `${template.id}-${i}`,
    label: step.label,
    type: step.type,
    celestialKey: step.celestialKey,
    action: step.action,
    position: resolveNodePosition(step.type, step.celestialKey),
  }));

  return { template, nodes, currentStep: 0 };
}

export function getCameraForNode(node: RouteNode): {
  position: [number, number, number];
  target: [number, number, number];
} {
  const [x, y, z] = node.position;
  return {
    position: [x + 3, y + 2, z + 4],
    target: [x, y, z],
  };
}
