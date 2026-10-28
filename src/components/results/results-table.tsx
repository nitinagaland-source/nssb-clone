"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAllocationStore } from "@/store/allocation-store";
import { useCandidateStore } from "@/store/candidate-store";
import { useSettingsStore } from "@/store/settings-store";
import { StatusChip } from "@/components/common/status-chip";
import { CandidateDrawer } from "@/components/candidates/candidate-drawer";
import type { AllocationStatus, Category } from "@/types";
import type { ResultsFiltersValue } from "./results-filters";

type Row = {
  rank: number;
  candidateId: string;
  rollNo: string;
  name: string;
  category: Category;
  total: number;
  postName: string;
  department: string;
  status: AllocationStatus;
  reason?: string;
};

function useDebounced<T>(value: T, delay: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setV(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return v;
}

export function ResultsTable({
  search,
  filters,
  onEmpty,
}: {
  search: string;
  filters: ResultsFiltersValue;
  onEmpty: () => React.ReactNode;
}) {
  const allocations = useAllocationStore((s) => s.allocations);
  const candidates = useCandidateStore((s) => s.candidates);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);
  const debouncedSearch = useDebounced(search.trim().toLowerCase(), 180);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const examAllocs = useMemo(
    () => allocations.filter((a) => a.examId === activeExamId),
    [allocations, activeExamId]
  );

  const rows: Row[] = useMemo(() => {
    const candMap = new Map(candidates.map((c) => [c.id, c]));
    const base: Row[] = [];
    for (const a of examAllocs) {
      const c = candMap.get(a.candidateId);
      if (!c) continue;
      base.push({
        rank: a.rank,
        candidateId: a.candidateId,
        rollNo: c.rollNo,
        name: c.name,
        category: c.category,
        total: c.writtenMarks + c.practicalMarks + c.interviewMarks,
        postName: a.postName ?? "—",
        department: a.department ?? "—",
        status: a.status,
        reason: a.reason,
      });
    }
    return base
      .filter((r) => {
        if (filters.department !== "all" && r.department !== filters.department) return false;
        if (filters.post !== "all" && r.postName !== filters.post) return false;
        if (filters.category !== "all" && r.category !== filters.category) return false;
        if (filters.status !== "all" && r.status !== filters.status) return false;
        if (debouncedSearch) {
          if (
            !r.name.toLowerCase().includes(debouncedSearch) &&
            !r.rollNo.toLowerCase().includes(debouncedSearch)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [examAllocs, candidates, filters, debouncedSearch]);

  useEffect(() => setPage(1), [debouncedSearch, filters]);

  if (examAllocs.length === 0) return <>{onEmpty()}</>;

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cols =
    "grid grid-cols-[72px_120px_1fr_90px_1.2fr_1fr_120px] items-center px-4";

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: pageRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  return (
    <>
      <div
        className="surface-elevated overflow-hidden"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        <div
          className={`${cols} text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-semibold py-3 border-b border-[color:var(--border)]`}
        >
          <div>Rank</div>
          <div>Roll No</div>
          <div>Candidate</div>
          <div>Total</div>
          <div>Allocated Post</div>
          <div>Department</div>
          <div>Status</div>
        </div>

        {pageRows.length === 0 ? (
          <div className="py-16 text-center text-sm text-[color:var(--text-muted)]">
            No results match the current filters.
          </div>
        ) : (
          <div
            ref={parentRef}
            style={{
              height: Math.min(560, pageRows.length * 56 + 4),
              overflow: "auto",
            }}
          >
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((item) => {
                const r = pageRows[item.index];
                const dim = r.postName === "—";
                return (
                  <button
                    key={`${r.candidateId}-${r.rank}`}
                    onClick={() => setSelectedId(r.candidateId)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      transform: `translateY(${item.start}px)`,
                      height: item.size,
                    }}
                    className={`${cols} border-b border-[color:var(--border)] text-sm text-left hover:bg-[color:var(--bg-sunken)]/60 w-full focus-visible:outline-none focus-visible:bg-indigo-50/60`}
                  >
                    <div className="text-mono font-bold text-amber-600">#{r.rank}</div>
                    <div className="text-mono text-indigo-600 font-semibold">{r.rollNo}</div>
                    <div className="font-medium text-[color:var(--text-primary)] truncate pr-4">
                      {r.name}
                    </div>
                    <div className="text-display font-bold text-[color:var(--text-primary)]">
                      {r.total}
                    </div>
                    <div className={dim ? "text-[color:var(--text-muted)]" : ""}>{r.postName}</div>
                    <div className={dim ? "text-[color:var(--text-muted)]" : ""}>
                      {r.department}
                    </div>
                    <div>
                      <StatusChip status={r.status} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-4 py-3 text-xs text-[color:var(--text-muted)] border-t border-[color:var(--border)]">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, rows.length)} of {rows.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-3 rounded-lg border border-[color:var(--border)] disabled:opacity-40 disabled:pointer-events-none hover:bg-[color:var(--bg-sunken)]"
            >
              Prev
            </button>
            <span className="text-mono">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 px-3 rounded-lg border border-[color:var(--border)] disabled:opacity-40 disabled:pointer-events-none hover:bg-[color:var(--bg-sunken)]"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <CandidateDrawer
        candidateId={selectedId}
        onOpenChange={(o) => !o && setSelectedId(null)}
      />
    </>
  );
}
