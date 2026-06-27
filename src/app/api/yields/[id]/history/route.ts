import type { NextRequest } from 'next/server';
import { fetchPoolHistory } from '@/lib/defillama';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || id.length < 10) {
    return Response.json(
      { error: { code: 'INVALID_ID', message: 'Pool ID must be a valid DefiLlama pool identifier' } },
      { status: 400 }
    );
  }

  try {
    const history = await fetchPoolHistory(id);
    return Response.json({
      data: history,
      meta: {
        pool_id: id,
        count: history.length,
      },
    });
  } catch {
    return Response.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Failed to fetch APY history from data source' } },
      { status: 502 }
    );
  }
}
