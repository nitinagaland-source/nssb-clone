"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useAllocationStore } from "@/store/allocation-store";
import { useSettingsStore } from "@/store/settings-store";
import { computeMerit } from "@/lib/merit";
import { StatusChip } from "@/components/common/status-chip";
import type { AllocationStatus, Category } from "@/types";
import type { CandidateFiltersValue } from "./candidate-filters";
import { CandidateDrawer } from "./candidate-drawer";

type Row = {
  rank: number;
  id: string;
  rollNo: string;
  name: string;
  category: Category;
  total: number;
  eligible: boolean;
  reason?: string;
  status: AllocationStatus | "Unallocated";
  isNew: boolean;
};

function useDebounced<T>(value: T, delay: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setV(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return v;
}

export function CandidateTable({
  search,
  sortBy,
  filters,
}: {
  search: string;
  sortBy: "merit-desc" | "merit-asc" | "name" | "roll";
  filters: CandidateFiltersValue;
}) {
  const candidates = useCandidateStore((s) => s.candidates);
  const recentImportIds = useCandidateStore((s) => s.recentImportIds);
  const setRecentImport = useCandidateStore((s) => s.setRecentImport);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const allocations = useAllocationStore((s) => s.allocations);
  const settings = useSettingsStore((s) => s.settings);
  const activeExamId = settings.examSettings.activeExamId;

  const debouncedSearch = useDebounced(search.trim().toLowerCase(), 180);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Clear the "new row" highlight after 2 seconds
  useEffect(() => {
    if (recentImportIds.length === 0) return;
    const t = setTimeout(() => setRecentImport([]), 2000);
    return () => clearTimeout(t);
  }, [recentImportIds, setRecentImport]);

  const rows: Row[] = useMemo(() => {
    const merit = computeMerit(candidates, vacancies, settings);
    const recentSet = new Set(recentImportIds);
    const base: Row[] = merit.map((m) => {
      const alloc = allocations.find(
        (a) => a.candidateId === m.candidateId && a.examId === activeExamId
      );
      return {
        rank: m.rank,
        id: m.candidateId,
        rollNo: m.rollNo,
        name: m.name,
        category: m.category,
        total: m.total,
        eligible: m.eligible,
        reason: m.eligibilityReason,
        status: !m.eligible
          ? "Not Eligible"
          : (alloc?.status as AllocationStatus) ?? "Unallocated",
        isNew: recentSet.has(m.candidateId),
      };
    });

    let filtered = base.filter((r) => {
      if (filters.categories.length && !filters.categories.includes(r.category)) return false;
      if (filters.eligibility === "eligible" && !r.eligible) return false;
      if (filters.eligibility === "not-eligible" && r.eligible) return false;
      if (filters.statuses.length && !filters.statuses.includes(r.status as "Allocated")) return false;
      if (r.total < filters.minTotal || r.total > filters.maxTotal) return false;
      if (debouncedSearch) {
        if (
          !r.name.toLowerCase().includes(debouncedSearch) &&
          !r.rollNo.toLowerCase().includes(debouncedSearch)
        )
          return false;
      }
      return true;
    });

    if (sortBy === "merit-asc") filtered = [...filtered].reverse();
    if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "roll")
      filtered = [...filtered].sort((a, b) => a.rollNo.localeCompare(b.rollNo));

    return filtered;
  }, [
    candidates,
    vacancies,
    allocations,
    settings,
    activeExamId,
    debouncedSearch,
    filters,
    sortBy,
    recentImportIds,
  ]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const selectedRank = selectedId ? rows.find((r) => r.id === selectedId)?.rank : undefined;
  const selectedRow = selectedId ? rows.find((r) => r.id === selectedId) : undefined;

  return (
    <>
      <div
        className="surface-elevated overflow-hidden"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        <div className="grid grid-cols-[72px_120px_1fr_80px_80px_120px_120px_40px] text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-semibold px-4 py-3 border-b border-[color:var(--border)]">
          <div>Rank</div>
          <div>Roll No</div>
          <div>Candidate</div>
          <div>Category</div>
          <div>Total</div>
          <div>Eligibility</div>
          <div>Status</div>
          <div />
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-[color:var(--text-muted)]">
            No candidates match the current filters.
          </div>
        ) : (
          <div
            ref={parentRef}
            style={{ height: Math.min(640, rows.length * 56 + 4), overflow: "auto" }}
          >
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((item) => {
                const r = rows[item.index];
                return (
                  <div
                    key={r.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      transform: `translateY(${item.start}px)`,
                      height: item.size,
                    }}
                    className={`grid grid-cols-[72px_120px_1fr_80px_80px_120px_120px_40px] items-center px-4 border-b border-[color:var(--border)] text-sm transition-colors ${
                      r.isNew
                        ? "bg-indigo-50/60"
                        : "hover:bg-[color:var(--bg-sunken)]/60"
                    }`}
                  >
                    <div className="text-mono font-bold text-amber-600">#{r.rank}</div>
                    <div className="text-mono text-indigo-600 font-semibold">{r.rollNo}</div>
                    <div className="font-medium text-[color:var(--text-primary)] truncate pr-4">
                      {r.name}
                    </div>
                    <div>
                      <span className="inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {r.category}
                      </span>
                    </div>
                    <div className="text-display font-bold text-[color:var(--text-primary)]">
                      {r.total}
                    </div>
                    <div>
                      <StatusChip status={r.eligible ? "Eligible" : "Not Eligible"} />
                    </div>
                    <div>
                      <StatusChip status={r.status} />
                    </div>
                    <button
                      onClick={() => setSelectedId(r.id)}
                      className="h-8 w-8 rounded-lg text-[color:var(--text-muted)] hover:text-indigo-700 hover:bg-indigo-50 inline-flex items-center justify-center"
                      aria-label="Open candidate details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 text-xs text-[color:var(--text-muted)] border-t border-[color:var(--border)]">
          <span>
            {rows.length.toLocaleString()} candidate{rows.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <CandidateDrawer
        candidateId={selectedId}
        onOpenChange={(o) => !o && setSelectedId(null)}
        rank={selectedRank}
        eligible={selectedRow?.eligible}
        reason={selectedRow?.reason}
      />
    </>
  );
}
