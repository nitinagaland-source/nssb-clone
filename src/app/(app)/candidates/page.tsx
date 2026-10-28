"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { UploadCard } from "@/components/candidates/upload-card";
import { CandidateTable } from "@/components/candidates/candidate-table";
import {
  CandidateFilters,
  DEFAULT_FILTERS,
  type CandidateFiltersValue,
} from "@/components/candidates/candidate-filters";

type SortBy = "merit-desc" | "merit-asc" | "name" | "roll";

export default function CandidatesPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("merit-desc");
  const [filters, setFilters] = useState<CandidateFiltersValue>(DEFAULT_FILTERS);

  return (
    <div className="space-y-6">
      <UploadCard />

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roll no, name..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border)] text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shadow-sm-3d"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CandidateFilters value={filters} onChange={setFilters} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-10 px-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)] text-sm font-medium text-[color:var(--text-primary)] shadow-sm-3d focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="merit-desc">Sort by Merit (Desc)</option>
            <option value="merit-asc">Sort by Merit (Asc)</option>
            <option value="name">Sort by Name</option>
            <option value="roll">Sort by Roll No</option>
          </select>
        </div>
      </div>

      <CandidateTable search={search} sortBy={sortBy} filters={filters} />
    </div>
  );
}
