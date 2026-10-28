"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";
import { useExamStore } from "@/store/exam-store";
import { computeMerit } from "@/lib/merit";
import {
  asOfDate,
  makeExcelBlob,
  makePdfWithTable,
  reportTitle,
  triggerDownload,
} from "@/lib/reports/shared";

export function MeritExportModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [busy, setBusy] = useState<"xlsx" | "pdf" | null>(null);
  const candidates = useCandidateStore((s) => s.candidates);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const settings = useSettingsStore((s) => s.settings);
  const exams = useExamStore((s) => s.exams);
  const exam = exams.find((e) => e.id === settings.examSettings.activeExamId);

  const buildRows = () =>
    computeMerit(candidates, vacancies, settings).map((m) => ({
      Rank: m.rank,
      "Roll No": m.rollNo,
      Candidate: m.name,
      Category: m.category,
      Written: m.written,
      Practical: m.practical,
      Interview: m.interview,
      Total: m.total,
      Qualification: m.qualificationLabel,
      Status: m.eligible ? "Eligible" : "Not Eligible",
    }));

  const exportExcel = async () => {
    setBusy("xlsx");
    try {
      const rows = buildRows();
      const summary = [
        { Field: "Examination", Value: exam?.name ?? "—" },
        { Field: "Code", Value: exam?.code ?? "—" },
        { Field: "As of", Value: asOfDate() },
        { Field: "Total ranked", Value: rows.length },
        { Field: "Eligible", Value: rows.filter((r) => r.Status === "Eligible").length },
      ];
      const blob = await makeExcelBlob([
        { name: "Summary", rows: summary },
        { name: "Merit List", rows },
      ]);
      triggerDownload(blob, `${exam?.code?.replace(/\//g, "-") ?? "nssb"}-merit-list.xlsx`);
      toast.success("Downloaded Merit List Report (xlsx)");
      onOpenChange(false);
    } catch (e) {
      toast.error("Export failed: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const exportPdf = async () => {
    setBusy("pdf");
    try {
      const rows = buildRows();
      const pdfRows = rows.map((r) => [
        r.Rank,
        r["Roll No"],
        r.Candidate,
        r.Category,
        r.Written,
        r.Practical,
        r.Interview,
        r.Total,
        r.Qualification,
        r.Status,
      ]);
      const blob = await makePdfWithTable({
        title: "Official Merit Standing",
        subtitle: `${reportTitle(exam)} · As of ${asOfDate()}`,
        columns: [
          "Rank",
          "Roll No",
          "Candidate",
          "Cat",
          "Written",
          "Practical",
          "Interview",
          "Total",
          "Qualification",
          "Status",
        ],
        rows: pdfRows,
      });
      triggerDownload(blob, `${exam?.code?.replace(/\//g, "-") ?? "nssb"}-merit-list.pdf`);
      toast.success("Downloaded Merit List Report (pdf)");
      onOpenChange(false);
    } catch (e) {
      toast.error("Export failed: " + (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-display text-lg font-bold">
            Export Merit List
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[color:var(--text-secondary)]">
          Choose the format you want to download. Both files use the current rank order.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={busy != null}
            onClick={exportExcel}
            className="surface-card p-4 text-left hover:shadow-lg-3d transition-shadow disabled:opacity-60"
          >
            <div className="h-10 w-10 rounded-xl grad-emerald shadow-glow-emerald text-white flex items-center justify-center mb-3">
              {busy === "xlsx" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSpreadsheet className="h-5 w-5" />}
            </div>
            <div className="text-sm font-semibold">Excel (.xlsx)</div>
            <div className="text-xs text-[color:var(--text-muted)]">
              Summary cover sheet + full data.
            </div>
          </button>
          <button
            type="button"
            disabled={busy != null}
            onClick={exportPdf}
            className="surface-card p-4 text-left hover:shadow-lg-3d transition-shadow disabled:opacity-60"
          >
            <div className="h-10 w-10 rounded-xl grad-rose shadow-glow-rose text-white flex items-center justify-center mb-3">
              {busy === "pdf" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="text-sm font-semibold">PDF (.pdf)</div>
            <div className="text-xs text-[color:var(--text-muted)]">
              Gradient title bar + printable table.
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
