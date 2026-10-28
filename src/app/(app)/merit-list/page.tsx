"use client";

import { useState } from "react";
import { Search, RefreshCw, Download, ListOrdered } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/gradient-button";
import { MeritTable } from "@/components/merit/merit-table";
import {
  MeritFilters,
  DEFAULT_MERIT_FILTERS,
  type MeritFiltersValue,
} from "@/components/merit/merit-filters";
import { MeritExportModal } from "@/components/merit/export-modal";
import { useCandidateStore } from "@/store/candidate-store";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";
import { computeMerit } from "@/lib/merit";

export default function MeritListPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<MeritFiltersValue>(DEFAULT_MERIT_FILTERS);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const candidates = useCandidateStore((s) => s.candidates);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const settings = useSettingsStore((s) => s.settings);

  const runGenerate = () => {
    const t = toast.loading("Regenerating merit list...");
    // merit is derived live; simulate a quick compute pass for user feedback
    requestAnimationFrame(() => {
      const m = computeMerit(candidates, vacancies, settings);
      setGeneratedAt(new Date().toLocaleTimeString());
      toast.success(`Merit list regenerated — ${m.length} ranked`, { id: t });
    });
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <div
        className="surface-elevated p-6 flex items-center justify-between"
        style={{
          borderRadius: "var(--radius-xl)",
          background:
            "linear-gradient(135deg, var(--bg-surface), oklch(0.6 0.2 275 / 0.03))",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl grad-indigo shadow-glow-indigo text-white flex items-center justify-center">
            <ListOrdered className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-display text-lg font-bold text-[color:var(--text-primary)]">
              Official Merit Standing
            </h2>
            <p className="text-sm text-[color:var(--text-secondary)]">
              Ranked by written, practical, and interview marks.
              {generatedAt && (
                <span className="ml-2 text-xs text-[color:var(--text-muted)]">
                  Last regenerated at {generatedAt}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <GradientButton onClick={() => setConfirmOpen(true)}>
            <RefreshCw className="h-4 w-4" />
            Generate
          </GradientButton>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rank, roll no, name..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border)] text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 shadow-sm-3d"
          />
        </div>
        <MeritFilters value={filters} onChange={setFilters} />
      </div>

      <MeritTable search={search} filters={filters} />

      <MeritExportModal open={exportOpen} onOpenChange={setExportOpen} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-display text-lg font-bold">
              Regenerate merit list?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[color:var(--text-secondary)]">
            This recomputes every candidate's rank from their current written, practical and
            interview marks and overwrites the ranking. Any ongoing allocation remains until
            you run allocation again.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <GradientButton onClick={runGenerate}>Regenerate</GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
