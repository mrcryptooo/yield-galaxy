'use client';

import { useQuery } from '@tanstack/react-query';
import type { Opportunity, ApiResponse } from '@/lib/types';

async function fetchYields(): Promise<Opportunity[]> {
  const res = await fetch('/api/yields');
  if (!res.ok) throw new Error(`API returned ${res.status}`);
  const json: ApiResponse<Opportunity[]> = await res.json();
  return json.data;
}

export function useYields() {
  return useQuery({
    queryKey: ['yields'],
    queryFn: fetchYields,
    staleTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });
}
