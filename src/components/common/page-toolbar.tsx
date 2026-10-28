"use client";

import { Search } from "lucide-react";

export function PageToolbar({
  searchValue,
  onSearchChange,
  placeholder,
  right,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-muted)]" />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-3 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border)] text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shadow-sm-3d"
        />
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}
