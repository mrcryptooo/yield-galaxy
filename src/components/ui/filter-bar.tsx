'use client';

import { useRef, useCallback } from 'react';
import { useYieldStore } from '@/stores/yield-store';

export function FilterBar() {
  const {
    filterType, filterStrategy, filterRisk, searchQuery,
    setFilterType, setFilterStrategy, setFilterRisk, setSearch, clearFilters,
  } = useYieldStore();

  const hasFilters = filterType || filterStrategy || filterRisk || searchQuery;

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const handleSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(value), 300);
  }, [setSearch]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <input
        type="text"
        placeholder="Search symbol, asset..."
        defaultValue={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-9 w-full sm:w-56 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50"
      />

      {/* Celestial type */}
      <Select
        value={filterType}
        onChange={setFilterType}
        placeholder="All types"
        options={[
          { value: 'planet', label: '◉ Planets' },
          { value: 'moon', label: '◎ Moons' },
          { value: 'station', label: '▣ Stations' },
        ]}
      />

      {/* Strategy */}
      <Select
        value={filterStrategy}
        onChange={setFilterStrategy}
        placeholder="All strategies"
        options={[
          { value: 'lending', label: 'Lending' },
          { value: 'lp', label: 'LP' },
          { value: 'vault', label: 'Vault' },
          { value: 'pt', label: 'PT' },
          { value: 'yt', label: 'YT' },
        ]}
      />

      {/* Risk grade */}
      <Select
        value={filterRisk}
        onChange={setFilterRisk}
        placeholder="All risk"
        options={[
          { value: 'A', label: 'Risk A' },
          { value: 'B', label: 'Risk B' },
          { value: 'C', label: 'Risk C' },
          { value: 'D', label: 'Risk D' },
          { value: 'F', label: 'Risk F' },
        ]}
      />

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="h-9 px-3 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 border border-white/10 hover:border-white/20"
        >
          Clear
        </button>
      )}
    </div>
  );
}

function Select({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-white/10 bg-white/[0.02] px-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
