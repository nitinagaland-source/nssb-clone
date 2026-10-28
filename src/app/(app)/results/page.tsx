"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download, Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ResultsFilters,
  DEFAULT_RESULTS_FILTERS,
  type ResultsFiltersValue,
} from "@/components/results/results-filters";
import { ResultsTable } from "@/components/results/results-table";
import { useAllocationStore } from "@/store/allocation-store";
import { useCandidateStore } from "@/store/candidate-store";
import { useExamStore } from "@/store/exam-store";
import { useSettingsStore } from "@/store/settings-store";
import {
  asOfDate,
  makeExcelBlob,
  triggerDownload,
} from "@/lib/reports/shared";

export default function ResultsPage() {
  const [draft, setDraft] = useState<ResultsFiltersValue>(DEFAULT_RESULTS_FILTERS);
  const [applied, setApplied] = useState<ResultsFiltersValue>(DEFAULT_RESULTS_FILTERS);
  const [search, setSearch] = useState("");

  const allocations = useAllocationStore((s) => s.allocations);
  const candidates = useCandidateStore((s) => s.candidates);
  const runs = useAllocationStore((s) => s.runs);
  const exams = useExamStore((s) => s.exams);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);
  const exam = exams.find((e) => e.id === activeExamId);
  const run = runs.find((r) => r.examId === activeExamId);

  const canApply = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(applied),
    [draft, applied]
  );

  const exportExcel = async () => {
    const candMap = new Map(candidates.map((c) => [c.id, c]));
    const rows = allocations
      .filter((a) => a.examId === activeExamId)
      .sort((a, b) => a.rank - b.rank)
      .map((a) => {
        const c = candMap.get(a.candidateId);
        return {
          Rank: a.rank,
          "Roll No": c?.rollNo ?? "",
          Candidate: c?.name ?? "",
          Category: c?.category ?? "",
          Total: (c?.writtenMarks ?? 0) + (c?.practicalMarks ?? 0) + (c?.interviewMarks ?? 0),
          "Allocated Post": a.postName ?? "—",
          Department: a.department ?? "—",
          Status: a.status,
          Reason: a.reason ?? "",
        };
      });

    const summary = [
      { Field: "Examination", Value: exam?.name ?? "—" },
      { Field: "Code", Value: exam?.code ?? "—" },
      { Field: "As of", Value: asOfDate() },
      { Field: "Total ranked", Value: run?.totalCandidates ?? 0 },
      { Field: "Allocated", Value: run?.allocatedCount ?? 0 },
      { Field: "Waitlisted", Value: run?.waitlistedCount ?? 0 },
      { Field: "Unallocated", Value: run?.unallocatedCount ?? 0 },
      { Field: "Not Eligible", Value: run?.notEligibleCount ?? 0 },
    ];
    const blob = await makeExcelBlob([
      { name: "Summary", rows: summary },
      { name: "Results", rows },
    ]);
    triggerDownload(blob, `${exam?.code?.replace(/\//g, "-") ?? "nssb"}-results.xlsx`);
    toast.success("Downloaded Allocation Results (xlsx)");
  };

  return (
    <div className="space-y-6">
      <ResultsFilters
        draft={draft}
        onDraftChange={setDraft}
        onApply={() => {
          setApplied(draft);
          if (canApply) toast.success("Filters applied");
        }}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search results..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border)] text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shadow-sm-3d"
          />
        </div>
        <Button variant="outline" onClick={exportExcel}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <ResultsTable
        search={search}
        filters={applied}
        onEmpty={() => (
          <div
            className="surface-elevated p-12 text-center"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            <div className="h-14 w-14 mx-auto rounded-2xl grad-indigo shadow-glow-indigo text-white flex items-center justify-center">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-display text-xl font-bold mt-4">No allocation run yet</h3>
            <p className="text-sm text-[color:var(--text-secondary)] mt-1">
              Run the allocation engine to populate results for this exam.
            </p>
            <Link
              href="/allocation"
              className="mt-5 inline-flex items-center gap-1.5 h-10 px-5 rounded-xl grad-emerald shadow-glow-emerald text-white text-sm font-semibold"
            >
              Run allocation to see results →
            </Link>
          </div>
        )}
      />
    </div>
  );
}
