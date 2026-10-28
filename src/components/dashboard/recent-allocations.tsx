"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, FileCheck2 } from "lucide-react";
import { useAllocationStore } from "@/store/allocation-store";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";
import { computeMerit } from "@/lib/merit";
import { StatusChip } from "@/components/common/status-chip";

export function RecentAllocations() {
  const allocations = useAllocationStore((s) => s.allocations);
  const candidates = useCandidateStore((s) => s.candidates);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const settings = useSettingsStore((s) => s.settings);
  const activeExamId = settings.examSettings.activeExamId;

  const rows = useMemo(() => {
    const current = allocations
      .filter((a) => a.examId === activeExamId)
      .sort((a, b) => (a.allocatedAt < b.allocatedAt ? 1 : -1))
      .slice(0, 5);

    if (current.length > 0) {
      return current.map((a) => {
        const c = candidates.find((x) => x.id === a.candidateId);
        return {
          id: a.id,
          rollNo: c?.rollNo ?? "—",
          name: c?.name ?? "—",
          department: a.department ?? "—",
          status: a.status,
        };
      });
    }

    // Fallback: show first 5 merit candidates as Pending preview
    const merit = computeMerit(candidates, vacancies, settings).slice(0, 5);
    return merit.map((m) => ({
      id: m.candidateId,
      rollNo: m.rollNo,
      name: m.name,
      department: "—",
      status: "Unallocated" as const,
    }));
  }, [allocations, candidates, vacancies, settings, activeExamId]);

  return (
    <div className="surface-elevated p-6" style={{ borderRadius: "var(--radius-xl)" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-indigo-600" />
          <h2 className="text-display text-lg font-bold text-[color:var(--text-primary)]">
            Recent Allocations
          </h2>
        </div>
        <Link
          href="/results"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
        >
          View All <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-2 pb-2 border-b border-[color:var(--border)]">
        <div>Roll No</div>
        <div>Candidate</div>
        <div>Department</div>
        <div>Status</div>
      </div>

      <ul className="divide-y divide-[color:var(--border)]">
        {rows.map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center px-2 py-3 text-sm"
          >
            <Link
              href={`/candidates`}
              className="text-mono text-indigo-600 hover:underline font-medium"
            >
              {r.rollNo}
            </Link>
            <div className="text-[color:var(--text-primary)] font-medium">{r.name}</div>
            <div className="text-[color:var(--text-secondary)] truncate">{r.department}</div>
            <StatusChip status={r.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}
