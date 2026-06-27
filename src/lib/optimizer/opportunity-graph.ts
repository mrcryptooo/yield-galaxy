import type { Opportunity, RiskGrade } from '../types';
import { SOURCE_DISPLAY_NAMES } from '../constants';

export interface GraphNode {
  id: string;
  label: string;
  kind: 'asset' | 'protocol' | 'product';
  celestialKey: string;
  celestialType: 'planet' | 'station' | 'moon' | 'action';
}

export interface GraphEdge {
  from: string;
  to: string;
  action: string;
  apy: number;
  tvl: number;
  riskGrade: RiskGrade;
  strategy: string;
  opportunity: Opportunity | null;
}

export interface OpportunityGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

const ENTRY_NODE: GraphNode = {
  id: 'USDC',
  label: 'USDC',
  kind: 'asset',
  celestialKey: 'USX',
  celestialType: 'action',
};

export function buildGraph(opportunities: Opportunity[]): OpportunityGraph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  nodes.set('USDC', ENTRY_NODE);

  const planets = new Set<string>();
  const protocols = new Set<string>();

  for (const opp of opportunities) {
    const body = opp.celestial_body;
    const protocol = SOURCE_DISPLAY_NAMES[opp.source_id] ?? opp.source_id;

    if (!planets.has(body) && opp.celestial_type === 'planet') {
      planets.add(body);
      nodes.set(body, {
        id: body,
        label: body,
        kind: 'asset',
        celestialKey: body,
        celestialType: 'planet',
      });
    }

    if (!protocols.has(protocol)) {
      protocols.add(protocol);
      const stationKey = protocol;
      nodes.set(protocol, {
        id: protocol,
        label: protocol,
        kind: 'protocol',
        celestialKey: stationKey,
        celestialType: 'station',
      });
    }

    if (opp.celestial_type === 'moon') {
      nodes.set(body, {
        id: body,
        label: body,
        kind: 'product',
        celestialKey: body,
        celestialType: 'moon',
      });
    }
  }

  nodes.set('stSLX', {
    id: 'stSLX',
    label: 'stSLX',
    kind: 'asset',
    celestialKey: 'stSLX',
    celestialType: 'planet',
  });

  edges.push({ from: 'USDC', to: 'USX', action: 'swap', apy: 0, tvl: 0, riskGrade: 'A', strategy: 'swap', opportunity: null });
  edges.push({ from: 'USDC', to: 'SLX', action: 'swap', apy: 0, tvl: 0, riskGrade: 'B', strategy: 'swap', opportunity: null });
  edges.push({ from: 'USX', to: 'eUSX', action: 'convert', apy: 0, tvl: 0, riskGrade: 'A', strategy: 'convert', opportunity: null });
  edges.push({ from: 'SLX', to: 'stSLX', action: 'stake', apy: 0, tvl: 0, riskGrade: 'B', strategy: 'staking', opportunity: null });

  for (const opp of opportunities) {
    const body = opp.celestial_body;
    const protocol = SOURCE_DISPLAY_NAMES[opp.source_id] ?? opp.source_id;

    if (opp.celestial_type === 'planet') {
      edges.push({
        from: body,
        to: protocol,
        action: opp.strategy === 'lp' ? 'lp' : 'deposit',
        apy: opp.total_apy,
        tvl: opp.tvl,
        riskGrade: opp.risk_grade,
        strategy: opp.strategy,
        opportunity: opp,
      });
    }

    if (opp.celestial_type === 'moon') {
      const parentAsset = body.replace(/^(PT|YT)-/, '');
      if (nodes.has(parentAsset)) {
        edges.push({
          from: parentAsset,
          to: protocol,
          action: 'navigate',
          apy: 0,
          tvl: opp.tvl,
          riskGrade: opp.risk_grade,
          strategy: 'navigate',
          opportunity: null,
        });
        edges.push({
          from: protocol,
          to: body,
          action: 'mint',
          apy: opp.total_apy,
          tvl: opp.tvl,
          riskGrade: opp.risk_grade,
          strategy: opp.strategy,
          opportunity: opp,
        });
      }
    }
  }

  return { nodes, edges };
}

export function findPaths(
  graph: OpportunityGraph,
  start: string,
  maxDepth: number = 5
): string[][] {
  const paths: string[][] = [];

  function dfs(current: string, visited: Set<string>, path: string[]) {
    if (path.length > 1 && path.length <= maxDepth + 1) {
      paths.push([...path]);
    }
    if (path.length >= maxDepth + 1) return;

    for (const edge of graph.edges) {
      if (edge.from === current && !visited.has(edge.to)) {
        visited.add(edge.to);
        path.push(edge.to);
        dfs(edge.to, visited, path);
        path.pop();
        visited.delete(edge.to);
      }
    }
  }

  const visited = new Set<string>([start]);
  dfs(start, visited, [start]);

  return paths;
}
