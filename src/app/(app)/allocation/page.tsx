"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pipeline } from "@/components/allocation/pipeline";
import { RunOverlay } from "@/components/allocation/run-overlay";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useAllocationStore } from "@/store/allocation-store";
import { useSettingsStore } from "@/store/settings-store";
import { computeMerit } from "@/lib/merit";
import { runAllocation } from "@/lib/allocate";

const RULES = [
  "Strict merit based ranking",
  "Required qualification matching",
  "Department / Post preferences",
  "Categorical reservation limits",
  "Vacancy availability checks",
];

export default function AllocationPage() {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const candidates = useCandidateStore((s) => s.candidates);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const settings = useSettingsStore((s) => s.settings);
  const setForExam = useAllocationStore((s) => s.setForExam);
  const activeExamId = settings.examSettings.activeExamId;

  const candCount = candidates.filter((c) => c.examId === activeExamId).length;
  const vacCount = vacancies
    .filter((v) => v.examId === activeExamId)
    .reduce((n, v) => n + v.totalSeats, 0);

  const start = () => {
    setConfirmOpen(false);
    setOverlayOpen(true);
    // Compute while the overlay animates (so UI stays smooth)
    requestAnimationFrame(() => {
      const merit = computeMerit(candidates, vacancies, settings);
      const { allocations, run } = runAllocation(
        candidates,
        vacancies,
        merit,
        settings.allocationPrefs,
        activeExamId
      );
      setForExam(activeExamId, allocations, run);
      // overlay closes itself via onDone -> then we redirect
    });
  };

  const onOverlayDone = () => {
    setOverlayOpen(false);
    toast.success(
      "Allocation complete — redirecting to results"
    );
    router.push("/results");
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold grad-indigo text-white shadow-glow-indigo">
          <Sparkles className="h-3.5 w-3.5" />
          Automated Process
        </div>
        <h1 className="text-display text-4xl font-bold text-[color:var(--text-primary)]">
          Automatic Merit-Based Allocation
        </h1>
        <p className="text-sm text-[color:var(--text-secondary)] max-w-xl mx-auto">
          Matches candidates to vacancies based on strict merit, categorical reservations, and
          candidate preferences.
        </p>
      </div>

      <div
        className="surface-elevated p-6"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        <Pipeline />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 mt-6 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-secondary)] mb-3">
              Allocation Rules Applied
            </div>
            <ul className="space-y-2.5">
              {RULES.map((r) => (
                <li key={r} className="flex items-center gap-2.5 text-sm">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[color:var(--text-primary)]">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="h-14 px-8 rounded-2xl grad-emerald shadow-glow-emerald text-white font-semibold text-base inline-flex items-center gap-2 hover:-translate-y-0.5 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            disabled={candCount === 0 || vacCount === 0}
          >
            <Play className="h-5 w-5" />
            Run Allocation
          </button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-display text-lg font-bold">
              Run allocation now?
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-[color:var(--text-secondary)]">
            This will match the <strong>{candCount.toLocaleString()}</strong> candidates
            against <strong>{vacCount.toLocaleString()}</strong> vacant seats using the current
            merit list and allocation preferences. Any existing allocation for this exam will be
            overwritten.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <button
              type="button"
              onClick={start}
              className="h-10 px-5 rounded-xl grad-emerald shadow-glow-emerald text-white font-semibold text-sm inline-flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Run Allocation
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RunOverlay open={overlayOpen} onDone={onOverlayDone} />
    </div>
  );
}
