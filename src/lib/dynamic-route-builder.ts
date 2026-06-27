import type { RouteTemplate, RouteStepDef, NodeType } from './route-engine';
import type { OptimizedRoute } from './optimizer/optimizer';
import type { GraphNode, OpportunityGraph } from './optimizer/opportunity-graph';

export function optimizedRouteToTemplate(
  route: OptimizedRoute,
  graph: OpportunityGraph,
): RouteTemplate {
  const steps: RouteStepDef[] = [];

  for (let i = 0; i < route.path.length; i++) {
    const nodeId = route.path[i];
    const graphNode = graph.nodes.get(nodeId);
    const edge = i > 0 ? route.edges[i - 1] : null;

    const action = edge?.action ?? 'acquire';
    const nodeType = resolveNodeType(graphNode);
    const celestialKey = graphNode?.celestialKey ?? nodeId;

    steps.push({
      label: deriveStepLabel(nodeId, action),
      type: nodeType,
      celestialKey,
      action,
    });
  }

  return {
    id: route.id,
    name: route.name,
    description: route.description,
    steps,
  };
}

function resolveNodeType(node: GraphNode | undefined): NodeType {
  if (!node) return 'action';
  switch (node.celestialType) {
    case 'planet': return 'planet';
    case 'station': return 'station';
    case 'moon': return 'moon';
    default: return 'action';
  }
}

function deriveStepLabel(nodeId: string, action: string): string {
  const labels: Record<string, string> = {
    swap: `Swap to ${nodeId}`,
    convert: `Convert to ${nodeId}`,
    stake: `Stake ${nodeId}`,
    deposit: `Deposit into ${nodeId}`,
    borrow: `Borrow from ${nodeId}`,
    lp: `Provide liquidity on ${nodeId}`,
    mint: `Mint ${nodeId}`,
    hold: `Hold ${nodeId}`,
    navigate: `Navigate to ${nodeId}`,
    loop: `Loop at ${nodeId}`,
    harvest: `Harvest from ${nodeId}`,
    acquire: `Acquire ${nodeId}`,
  };
  return labels[action] ?? `${action} at ${nodeId}`;
}

export function generateCaptainLines(
  route: OptimizedRoute,
  _graph: OpportunityGraph,
): Record<string, string> {
  const lines: Record<string, string> = {};

  for (let i = 0; i < route.path.length; i++) {
    const nodeId = route.path[i];
    const edge = i > 0 ? route.edges[i - 1] : null;
    const action = edge?.action ?? 'acquire';

    if (action === 'acquire' || action === 'swap') {
      lines[action] = `Acquiring ${nodeId}. ${route.explanation[0] ?? ''}`.trim();
    } else if (action === 'deposit') {
      const apyText = edge && edge.apy > 0 ? ` Current yield: ${edge.apy.toFixed(2)}%.` : '';
      lines[action] = `Depositing into ${nodeId}.${apyText}`;
    } else if (action === 'lp') {
      lines[action] = `Providing liquidity on ${nodeId}. Watch for impermanent loss.`;
    } else if (action === 'mint') {
      lines[action] = `Minting ${nodeId}. Fixed yield locked.`;
    } else if (action === 'stake') {
      lines[action] = `Staking into ${nodeId}. The patient path.`;
    } else if (action === 'convert') {
      lines[action] = `Converting to ${nodeId}. Delta-neutral position.`;
    } else if (action === 'navigate') {
      lines[action] = `Setting course for ${nodeId}.`;
    } else {
      lines[action] = `Processing ${action} at ${nodeId}.`;
    }
  }

  return lines;
}
