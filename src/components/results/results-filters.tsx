"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/gradient-button";
import { CATEGORIES, type Category, type AllocationStatus } from "@/types";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";

export type ResultsFiltersValue = {
  department: string;
  post: string;
  category: Category | "all";
  status: AllocationStatus | "all";
};

export const DEFAULT_RESULTS_FILTERS: ResultsFiltersValue = {
  department: "all",
  post: "all",
  category: "all",
  status: "all",
};

export function ResultsFilters({
  draft,
  onDraftChange,
  onApply,
}: {
  draft: ResultsFiltersValue;
  onDraftChange: (v: ResultsFiltersValue) => void;
  onApply: () => void;
}) {
  const vacancies = useVacancyStore((s) => s.vacancies);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);

  const { departments, posts } = useMemo(() => {
    const vacs = vacancies.filter((v) => v.examId === activeExamId);
    const deps = Array.from(new Set(vacs.map((v) => v.department))).sort();
    const ps = Array.from(
      new Set(
        vacs
          .filter((v) => draft.department === "all" || v.department === draft.department)
          .map((v) => v.postName)
      )
    ).sort();
    return { departments: deps, posts: ps };
  }, [vacancies, activeExamId, draft.department]);

  return (
    <div
      className="surface-elevated p-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      <Field label="Department">
        <select
          value={draft.department}
          onChange={(e) => onDraftChange({ ...draft, department: e.target.value, post: "all" })}
          className="input-base"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="Post">
        <select
          value={draft.post}
          onChange={(e) => onDraftChange({ ...draft, post: e.target.value })}
          className="input-base"
        >
          <option value="all">All Posts</option>
          {posts.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </Field>
      <Field label="Category">
        <select
          value={draft.category}
          onChange={(e) =>
            onDraftChange({ ...draft, category: e.target.value as Category | "all" })
          }
          className="input-base"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select
          value={draft.status}
          onChange={(e) =>
            onDraftChange({ ...draft, status: e.target.value as AllocationStatus | "all" })
          }
          className="input-base"
        >
          <option value="all">All Statuses</option>
          <option value="Allocated">Allocated</option>
          <option value="Waitlisted">Waitlisted</option>
          <option value="Unallocated">Unallocated</option>
          <option value="Not Eligible">Not Eligible</option>
        </select>
      </Field>
      <GradientButton onClick={onApply}>Apply</GradientButton>

      <style jsx>{`
        .input-base {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border-radius: 10px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
        }
        .input-base:focus-visible {
          border-color: var(--ring);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[color:var(--text-muted)] font-semibold mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}
