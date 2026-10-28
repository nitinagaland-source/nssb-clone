"use client";

import { useState } from "react";
import { Download, FileText, Loader2, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useAllocationStore } from "@/store/allocation-store";
import { useSettingsStore } from "@/store/settings-store";
import { useExamStore } from "@/store/exam-store";
import { computeMerit } from "@/lib/merit";
import {
  buildReport,
  reportFilename,
  type ReportKey,
} from "@/lib/reports/generators";
import { triggerDownload } from "@/lib/reports/shared";

type Variant = "indigo" | "amber" | "rose" | "emerald" | "sky";

const gradMap: Record<Variant, { bg: string; glow: string }> = {
  indigo: { bg: "grad-indigo", glow: "shadow-glow-indigo" },
  amber: { bg: "grad-amber", glow: "shadow-glow-amber" },
  rose: { bg: "grad-rose", glow: "shadow-glow-rose" },
  emerald: { bg: "grad-emerald", glow: "shadow-glow-emerald" },
  sky: { bg: "grad-sky", glow: "shadow-glow-sky" },
};

export function ReportCard({
  reportKey,
  title,
  description,
  icon: Icon,
  variant,
}: {
  reportKey: ReportKey;
  title: string;
  description: string;
  icon: LucideIcon;
  variant: Variant;
}) {
  const [busy, setBusy] = useState<"pdf" | "xlsx" | null>(null);
  const candidates = useCandidateStore((s) => s.candidates);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const allocations = useAllocationStore((s) => s.allocations);
  const runs = useAllocationStore((s) => s.runs);
  const settings = useSettingsStore((s) => s.settings);
  const exams = useExamStore((s) => s.exams);
  const exam = exams.find((e) => e.id === settings.examSettings.activeExamId);

  const run = async (format: "pdf" | "xlsx") => {
    setBusy(format);
    try {
      const merit = computeMerit(candidates, vacancies, settings);
      const blob = await buildReport(reportKey, format, {
        exam,
        candidates,
        vacancies,
        merit,
        allocations: allocations.filter((a) => a.examId === exam?.id),
        run: runs.find((r) => r.examId === exam?.id),
      });
      const name = `${reportFilename(reportKey, exam)}.${format}`;
      triggerDownload(blob, name);
      toast.success(`Downloaded ${title} (${format})`);
    } catch (e) {
      toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const g = gradMap[variant];
  return (
    <div
      className="surface-elevated p-5 flex flex-col"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      <div
        className={`h-11 w-11 rounded-xl ${g.bg} ${g.glow} text-white flex items-center justify-center`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-display text-lg font-bold text-[color:var(--text-primary)] mt-4">
        {title}
      </h3>
      <p className="text-sm text-[color:var(--text-secondary)] mt-1 flex-1">{description}</p>

      <div className="mt-5 flex items-stretch gap-2">
        <button
          onClick={() => run("pdf")}
          disabled={busy != null}
          className="flex-1 h-10 rounded-xl border border-[color:var(--border)] text-sm font-semibold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-sunken)] inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          PDF
        </button>
        <button
          onClick={() => run("xlsx")}
          disabled={busy != null}
          className="flex-1 h-10 rounded-xl border border-[color:var(--border)] text-sm font-semibold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-sunken)] inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy === "xlsx" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Excel
        </button>
      </div>
    </div>
  );
}
