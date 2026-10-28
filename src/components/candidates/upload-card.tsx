"use client";

import { useRef, useState } from "react";
import { CloudUpload, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadTemplate, parseCandidateFile, type ImportError } from "@/lib/excel";
import { useCandidateStore } from "@/store/candidate-store";
import { useSettingsStore } from "@/store/settings-store";

export function UploadCard() {
  const addMany = useCandidateStore((s) => s.addMany);
  const existing = useCandidateStore((s) => s.candidates);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<ImportError[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!/\.xlsx?$/i.test(file.name)) {
      toast.error("Only .xlsx files are supported");
      return;
    }
    const existingRolls = new Set(existing.map((c) => c.rollNo));
    try {
      const { candidates, errors } = await parseCandidateFile(file, activeExamId, existingRolls);
      if (errors.length) {
        setErrors(errors);
        return;
      }
      if (candidates.length === 0) {
        toast.error("No candidate rows found");
        return;
      }
      addMany(candidates);
      toast.success(`Imported ${candidates.length} candidate${candidates.length === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error("Failed to parse file: " + (e as Error).message);
    }
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`surface-elevated p-10 flex flex-col items-center text-center transition-colors ${
          dragOver ? "ring-2 ring-indigo-400 bg-indigo-50/40" : ""
        }`}
        style={{ borderRadius: "var(--radius-xl)", border: "2px dashed var(--border)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
        <div
          className="h-14 w-14 rounded-2xl flex items-center justify-center text-white mb-4 grad-sky shadow-glow-sky"
        >
          <CloudUpload className="h-7 w-7" />
        </div>
        <h3 className="text-display text-lg font-bold text-[color:var(--text-primary)]">
          Upload Candidate Excel File
        </h3>
        <p className="text-sm text-[color:var(--text-muted)] mt-1">
          Drag &amp; drop XLSX file here, or click to browse
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            Browse file
          </Button>
          <Button variant="ghost" onClick={downloadTemplate}>
            <Download className="h-4 w-4" />
            Download Template
          </Button>
        </div>
      </div>

      <Dialog open={errors != null} onOpenChange={(o) => !o && setErrors(null)}>
        <DialogContent className="sm:max-w-[560px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-display text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Import failed — {errors?.length ?? 0} issue{errors?.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[320px] overflow-y-auto border border-[color:var(--border)] rounded-xl divide-y">
            {errors?.map((e, i) => (
              <div key={i} className="px-4 py-2.5 text-sm">
                <span className="text-mono text-xs text-[color:var(--text-muted)] mr-3">
                  Row {e.row}
                </span>
                <span className="text-[color:var(--text-primary)]">{e.message}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[color:var(--text-muted)]">
            Fix the file and upload again. No candidates were imported.
          </p>
          <DialogFooter>
            <Button onClick={() => setErrors(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
