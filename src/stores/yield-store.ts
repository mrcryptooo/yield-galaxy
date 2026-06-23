import { create } from 'zustand';
import type { Opportunity, SortField, SortOrder } from '@/lib/types';

interface YieldState {
  opportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedId: string | null;
  sortField: SortField;
  sortOrder: SortOrder;

  filterType: string;
  filterStrategy: string;
  filterRisk: string;
  searchQuery: string;

  fetchYields: () => Promise<void>;
  setSelected: (id: string | null) => void;
  setSort: (field: SortField) => void;
  setFilterType: (type: string) => void;
  setFilterStrategy: (strategy: string) => void;
  setFilterRisk: (risk: string) => void;
  setSearch: (query: string) => void;
  clearFilters: () => void;
}

export const useYieldStore = create<YieldState>((set, get) => ({
  opportunities: [],
  loading: false,
  error: null,
  lastUpdated: null,
  selectedId: null,
  sortField: 'score',
  sortOrder: 'desc',
  filterType: '',
  filterStrategy: '',
  filterRisk: '',
  searchQuery: '',

  fetchYields: async () => {
    set({ loading: true, error: null });
    try {
      const { sortField, sortOrder, filterType, filterStrategy, filterRisk, searchQuery } = get();
      const params = new URLSearchParams();
      params.set('sort', sortField);
      params.set('order', sortOrder);
      if (filterType) params.set('type', filterType);
      if (filterStrategy) params.set('strategy', filterStrategy);
      if (filterRisk) params.set('risk', filterRisk);
      if (searchQuery) params.set('q', searchQuery);

      const res = await globalThis.fetch(`/api/yields?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `API error: ${res.status}`);
      }
      const json = await res.json();
      set({
        opportunities: json.data,
        lastUpdated: json.meta.updated_at,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setSelected: (id) => set({ selectedId: id }),

  setSort: (field) => {
    const { sortField, sortOrder } = get();
    const newOrder = field === sortField && sortOrder === 'desc' ? 'asc' : 'desc';
    set({ sortField: field, sortOrder: newOrder });
    get().fetchYields();
  },

  setFilterType: (type) => { set({ filterType: type }); get().fetchYields(); },
  setFilterStrategy: (strategy) => { set({ filterStrategy: strategy }); get().fetchYields(); },
  setFilterRisk: (risk) => { set({ filterRisk: risk }); get().fetchYields(); },
  setSearch: (query) => { set({ searchQuery: query }); get().fetchYields(); },

  clearFilters: () => {
    set({ filterType: '', filterStrategy: '', filterRisk: '', searchQuery: '' });
    get().fetchYields();
  },
}));
