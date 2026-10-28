"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/common/status-chip";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useAllocationStore } from "@/store/allocation-store";
import type { Candidate } from "@/types";

export function CandidateDrawer({
  candidateId,
  onOpenChange,
  rank,
  eligible,
  reason,
}: {
  candidateId: string | null;
  onOpenChange: (open: boolean) => void;
  rank?: number;
  eligible?: boolean;
  reason?: string;
}) {
  const candidates = useCandidateStore((s) => s.candidates);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const allocations = useAllocationStore((s) => s.allocations);

  const cand = useMemo(
    () => candidates.find((c) => c.id === candidateId) ?? null,
    [candidateId, candidates]
  );
  const alloc = useMemo(
    () => allocations.find((a) => a.candidateId === candidateId),
    [allocations, candidateId]
  );

  if (!cand) {
    return (
      <Sheet open={candidateId != null} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[440px]" />
      </Sheet>
    );
  }

  const total = cand.writtenMarks + cand.practicalMarks + cand.interviewMarks;
  const initials = cand.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const status: Candidate["category"] | string =
    alloc?.status ?? (eligible === false ? "Not Eligible" : "Unallocated");

  return (
    <Sheet open={candidateId != null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[440px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b flex-row items-center gap-4 space-y-0">
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center text-white font-bold grad-indigo shadow-glow-indigo"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-display text-lg font-bold truncate">{cand.name}</SheetTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-mono text-xs text-[color:var(--text-muted)]">{cand.rollNo}</span>
              <StatusChip status={status as "Allocated"} />
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <Section title="Personal">
            <KV label="Category" value={cand.category} />
            <KV label="Age" value={String(cand.age)} />
            <KV label="PwD" value={cand.isPwD ? "Yes" : "No"} />
            {rank && <KV label="Merit rank" value={`#${rank}`} />}
          </Section>

          <Section title="Qualifications">
            {cand.qualifications.map((q, i) => (
              <div
                key={i}
                className="rounded-xl border border-[color:var(--border)] p-3 bg-[color:var(--bg-sunken)]/50"
              >
                <div className="text-sm font-semibold">
                  {q.degree} — {q.stream}
                </div>
                <div className="text-xs text-[color:var(--text-muted)] text-mono mt-0.5">
                  {q.percentage}%
                </div>
              </div>
            ))}
          </Section>

          <Section title="Marks">
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Written" value={cand.writtenMarks} max={200} />
              <Metric label="Practical" value={cand.practicalMarks} max={50} />
              <Metric label="Interview" value={cand.interviewMarks} max={50} />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-[color:var(--text-secondary)]">Total</span>
              <span className="text-display text-xl font-bold text-indigo-600">{total}</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-[color:var(--bg-sunken)] overflow-hidden">
              <div
                className="h-full grad-indigo"
                style={{ width: `${Math.min(100, (total / 300) * 100)}%` }}
              />
            </div>
          </Section>

          <Section title="Preferences">
            {cand.preferences.length === 0 ? (
              <div className="text-sm text-[color:var(--text-muted)]">No preferences set.</div>
            ) : (
              <ol className="space-y-1.5">
                {cand.preferences.map((vId, i) => {
                  const v = vacancies.find((x) => x.id === vId);
                  return (
                    <li
                      key={vId}
                      className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-[color:var(--bg-sunken)]/50"
                    >
                      <span>
                        <span className="text-mono text-xs text-[color:var(--text-muted)] mr-2">
                          #{i + 1}
                        </span>
                        {v ? v.postName : vId}
                      </span>
                      {v && (
                        <span className="text-xs text-[color:var(--text-muted)]">
                          {v.department}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>

          <Section title="Allocation outcome">
            {alloc ? (
              <>
                <KV label="Post" value={alloc.postName ?? "—"} />
                <KV label="Department" value={alloc.department ?? "—"} />
                <KV label="Status" value={alloc.status} />
                {alloc.reason && (
                  <KV label="Reason" value={alloc.reason} />
                )}
              </>
            ) : (
              <div className="text-sm text-[color:var(--text-muted)]">
                {reason ?? "Allocation has not been run yet for this exam."}
              </div>
            )}
          </Section>
        </div>

        <div className="border-t px-6 py-4 flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              toast.info("Reassign flow — coming with M9 (allocation engine).");
            }}
          >
            Reassign
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast.success("Marked ineligible");
              onOpenChange(false);
            }}
          >
            Mark Ineligible
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[color:var(--text-muted)]">{label}</span>
      <span className="font-medium text-[color:var(--text-primary)]">{value}</span>
    </div>
  );
}

function Metric({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="rounded-xl border border-[color:var(--border)] p-3">
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)]">
        {label}
      </div>
      <div className="text-display text-lg font-bold mt-0.5">{value}</div>
      <div className="mt-1 h-1 rounded-full bg-[color:var(--bg-sunken)] overflow-hidden">
        <div className="h-full grad-emerald" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
