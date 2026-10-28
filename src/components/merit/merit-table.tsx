"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";
import { computeMerit } from "@/lib/merit";
import { StatusChip } from "@/components/common/status-chip";
import type { MeritFiltersValue } from "./merit-filters";

function useDebounced<T>(value: T, delay: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setV(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return v;
}

export function MeritTable({
  search,
  filters,
}: {
  search: string;
  filters: MeritFiltersValue;
}) {
  const candidates = useCandidateStore((s) => s.candidates);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const settings = useSettingsStore((s) => s.settings);
  const debouncedSearch = useDebounced(search.trim().toLowerCase(), 180);

  const rows = useMemo(() => {
    const merit = computeMerit(candidates, vacancies, settings);
    return merit.filter((m) => {
      if (filters.categories.length && !filters.categories.includes(m.category)) return false;
      if (filters.eligibility === "eligible" && !m.eligible) return false;
      if (filters.eligibility === "not-eligible" && m.eligible) return false;
      if (
        filters.qualificationContains &&
        !m.qualificationLabel.toLowerCase().includes(filters.qualificationContains.toLowerCase())
      )
        return false;
      if (m.total < filters.minTotal || m.total > filters.maxTotal) return false;
      if (debouncedSearch) {
        if (
          !m.name.toLowerCase().includes(debouncedSearch) &&
          !m.rollNo.toLowerCase().includes(debouncedSearch) &&
          !`#${m.rank}`.includes(debouncedSearch)
        )
          return false;
      }
      return true;
    });
  }, [candidates, vacancies, settings, filters, debouncedSearch]);

  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10,
  });

  const cols =
    "grid grid-cols-[72px_120px_1fr_90px_90px_90px_90px_160px_120px] items-center px-4";

  return (
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
        <div>Written</div>
        <div>Practical</div>
        <div>Interview</div>
        <div>Total</div>
        <div>Qualification</div>
        <div>Status</div>
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
                  key={r.candidateId}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    transform: `translateY(${item.start}px)`,
                    height: item.size,
                  }}
                  className={`${cols} border-b border-[color:var(--border)] text-sm hover:bg-[color:var(--bg-sunken)]/60`}
                >
                  <div className="text-mono font-bold text-amber-600">#{r.rank}</div>
                  <div className="text-mono text-indigo-600 font-semibold">{r.rollNo}</div>
                  <div className="font-medium text-[color:var(--text-primary)] truncate pr-4">
                    {r.name}
                  </div>
                  <div className="text-mono">{r.written}</div>
                  <div className="text-mono">{r.practical}</div>
                  <div className="text-mono">{r.interview}</div>
                  <div className="text-display text-base font-bold text-indigo-600">
                    {r.total}
                  </div>
                  <div className="text-[color:var(--text-secondary)] truncate pr-2">
                    {r.qualificationLabel}
                  </div>
                  <div>
                    <StatusChip status={r.eligible ? "Eligible" : "Not Eligible"} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 text-xs text-[color:var(--text-muted)] border-t border-[color:var(--border)]">
        <span>
          {rows.length.toLocaleString()} ranked
        </span>
      </div>
    </div>
  );
}
