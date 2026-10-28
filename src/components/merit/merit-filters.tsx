"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type Category } from "@/types";

export type MeritFiltersValue = {
  categories: Category[];
  eligibility: "all" | "eligible" | "not-eligible";
  qualificationContains: string;
  minTotal: number;
  maxTotal: number;
};

export const DEFAULT_MERIT_FILTERS: MeritFiltersValue = {
  categories: [],
  eligibility: "all",
  qualificationContains: "",
  minTotal: 0,
  maxTotal: 300,
};

export function MeritFilters({
  value,
  onChange,
}: {
  value: MeritFiltersValue;
  onChange: (v: MeritFiltersValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeCount =
    value.categories.length +
    (value.eligibility !== "all" ? 1 : 0) +
    (value.qualificationContains ? 1 : 0) +
    (value.minTotal > 0 || value.maxTotal < 300 ? 1 : 0);

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <>
      <Button variant="outline" className="relative" onClick={() => setOpen(true)}>
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold inline-flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[380px] p-0 flex flex-col">
          <SheetHeader className="px-6 py-5 border-b">
            <SheetTitle className="text-display text-lg font-bold">Filter merit list</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <Group label="Category">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const active = value.categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        onChange({ ...value, categories: toggle(value.categories, c) })
                      }
                      className={`h-7 px-2.5 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-indigo-100 text-indigo-900 border-indigo-200"
                          : "border-[color:var(--border)] text-[color:var(--text-secondary)]"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Group>

            <Group label="Eligibility">
              <div className="flex gap-1.5">
                {(["all", "eligible", "not-eligible"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onChange({ ...value, eligibility: v })}
                    className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${
                      value.eligibility === v
                        ? "bg-indigo-100 text-indigo-900 border-indigo-200"
                        : "border-[color:var(--border)] text-[color:var(--text-secondary)]"
                    }`}
                  >
                    {v === "all" ? "All" : v === "eligible" ? "Eligible" : "Not Eligible"}
                  </button>
                ))}
              </div>
            </Group>

            <Group label="Qualification contains">
              <input
                value={value.qualificationContains}
                onChange={(e) =>
                  onChange({ ...value, qualificationContains: e.target.value })
                }
                placeholder="e.g. B.Tech"
                className="w-full h-10 px-3 rounded-lg border border-[color:var(--border)] text-sm"
              />
            </Group>

            <Group label={`Total marks: ${value.minTotal} – ${value.maxTotal}`}>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={value.minTotal}
                  onChange={(e) =>
                    onChange({ ...value, minTotal: Math.max(0, Number(e.target.value) || 0) })
                  }
                  className="h-9 px-3 rounded-lg border border-[color:var(--border)] text-sm text-mono"
                />
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={value.maxTotal}
                  onChange={(e) =>
                    onChange({ ...value, maxTotal: Math.min(300, Number(e.target.value) || 0) })
                  }
                  className="h-9 px-3 rounded-lg border border-[color:var(--border)] text-sm text-mono"
                />
              </div>
            </Group>
          </div>
          <SheetFooter className="border-t px-6 py-4">
            <Button variant="ghost" onClick={() => onChange(DEFAULT_MERIT_FILTERS)}>
              Reset
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2">
        {label}
      </div>
      {children}
    </div>
  );
}
