"use client";

import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/gradient-button";
import { CATEGORIES, type Category, type Vacancy } from "@/types";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";

const DEPARTMENTS = [
  "School Education",
  "Health & Family Welfare",
  "Public Works (PWD)",
  "PWD (R&B)",
  "Power Department",
  "Agriculture",
  "Home Police",
  "P & AR",
  "Finance",
  "Rural Development",
];

const qualSchema = z.object({
  degree: z.string().min(1, "Required"),
  stream: z.string().min(1, "Required"),
  minPercentage: z.number().min(0).max(100),
});

const schema = z
  .object({
    postName: z.string().min(2, "Required"),
    department: z.string().min(1, "Required"),
    totalSeats: z.number().int().min(1, "At least 1 seat"),
    categories: z.array(z.enum(CATEGORIES)).min(1, "Pick at least one category"),
    ageRequirement: z.string().min(1, "Required"),
    status: z.enum(["Draft", "Active", "Closed"]),
    qualifications: z.array(qualSchema).min(1, "At least one qualification"),
    seatsByCategory: z.record(z.enum(CATEGORIES), z.number().min(0)),
  })
  .refine(
    (v) => {
      if (v.categories.length <= 1) return true;
      const sum = v.categories.reduce(
        (n, c) => n + (v.seatsByCategory[c] ?? 0),
        0
      );
      return sum === v.totalSeats;
    },
    { message: "Category seats must sum to total seats", path: ["seatsByCategory"] }
  );

type FormValues = z.infer<typeof schema>;

export function VacancyModal({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing: Vacancy | null;
}) {
  const addVac = useVacancyStore((s) => s.add);
  const updateVac = useVacancyStore((s) => s.update);
  const vacancies = useVacancyStore((s) => s.vacancies);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);

  const defaults: FormValues = useMemo(
    () =>
      editing
        ? {
            postName: editing.postName,
            department: editing.department,
            totalSeats: editing.totalSeats,
            categories: editing.categories,
            ageRequirement: editing.ageRequirement,
            status: editing.status,
            qualifications: editing.qualifications.map((q) => ({
              degree: q.degree,
              stream: q.stream,
              minPercentage: q.minPercentage,
            })),
            seatsByCategory: editing.seatsByCategory as Record<Category, number>,
          }
        : {
            postName: "",
            department: DEPARTMENTS[0],
            totalSeats: 10,
            categories: ["UR"],
            ageRequirement: "21-35 Years",
            status: "Active",
            qualifications: [{ degree: "", stream: "", minPercentage: 50 }],
            seatsByCategory: { UR: 10 } as Record<Category, number>,
          },
    [editing]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) form.reset(defaults);
  }, [open, defaults, form]);

  const quals = useFieldArray({ control: form.control, name: "qualifications" });
  const categories = form.watch("categories");
  const totalSeats = form.watch("totalSeats");
  const seatsByCategory = form.watch("seatsByCategory");

  // Auto-split when categories or totalSeats change
  useEffect(() => {
    if (!categories || categories.length === 0) return;
    const even = Math.floor(totalSeats / categories.length);
    const rem = totalSeats - even * categories.length;
    const next = {} as Record<Category, number>;
    categories.forEach((c, i) => {
      next[c] = even + (i === 0 ? rem : 0);
    });
    form.setValue("seatsByCategory", next, { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.join(","), totalSeats]);

  const splitSum = categories.reduce((n, c) => n + (seatsByCategory?.[c] ?? 0), 0);

  const onSubmit = (values: FormValues) => {
    const code =
      editing?.vacancyCode ??
      `VAC-${new Date().getFullYear()}-${String(vacancies.length + 1).padStart(3, "0")}`;
    const payload: Vacancy = {
      id: editing?.id ?? `vac-${nanoid(10)}`,
      examId: editing?.examId ?? activeExamId,
      vacancyCode: code,
      postName: values.postName,
      department: values.department,
      totalSeats: values.totalSeats,
      categories: values.categories,
      seatsByCategory: values.seatsByCategory,
      ageRequirement: values.ageRequirement,
      qualifications: values.qualifications.map((q, i) => ({
        id: `q-${i + 1}-${nanoid(4)}`,
        degree: q.degree,
        stream: q.stream,
        minPercentage: q.minPercentage,
      })),
      status: values.status,
      createdAt: editing?.createdAt ?? new Date().toISOString(),
    };
    if (editing) {
      updateVac(editing.id, payload);
      toast.success("Vacancy updated");
    } else {
      addVac(payload);
      toast.success("Vacancy created");
    }
    onOpenChange(false);
  };

  const toggleCategory = (cat: Category) => {
    const current = form.getValues("categories");
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    form.setValue("categories", next.length === 0 ? [cat] : next, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px] p-0 rounded-2xl overflow-hidden">
        <div
          className="px-6 pt-6 pb-4 border-b"
          style={{ background: "linear-gradient(135deg, oklch(0.65 0.17 230 / 0.04), oklch(0.6 0.2 275 / 0.04))" }}
        >
          <DialogHeader>
            <DialogTitle className="text-display text-xl font-bold">
              {editing ? "Edit Vacancy" : "Add New Vacancy"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Post Name" error={form.formState.errors.postName?.message}>
              <input
                {...form.register("postName")}
                placeholder="e.g. LDA/Computer Assistant"
                className="input-base"
              />
            </Field>
            <Field label="Department" error={form.formState.errors.department?.message}>
              <select {...form.register("department")} className="input-base">
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="No. of Vacancies" error={form.formState.errors.totalSeats?.message}>
              <input
                type="number"
                min={1}
                {...form.register("totalSeats", { valueAsNumber: true })}
                placeholder="e.g. 50"
                className="input-base"
              />
            </Field>
            <Field label="Category" error={form.formState.errors.categories?.message as string}>
              <div className="flex flex-wrap gap-1.5 min-h-10 items-center p-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-surface)]">
                {CATEGORIES.map((c) => {
                  const active = categories.includes(c);
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => toggleCategory(c)}
                      className={`h-7 px-2.5 rounded-full text-xs font-medium transition-colors ${
                        active
                          ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                          : "text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-sunken)]"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Age Requirement" error={form.formState.errors.ageRequirement?.message}>
              <input
                {...form.register("ageRequirement")}
                placeholder="e.g. 21-35 Years"
                className="input-base"
              />
            </Field>
          </div>

          {/* Reservation split */}
          {categories.length > 1 && (
            <div className="rounded-xl border border-[color:var(--border)] p-4 bg-[color:var(--bg-sunken)]/60">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-secondary)]">
                  Reservation split
                </div>
                <div
                  className={`text-xs font-semibold ${
                    splitSum === totalSeats ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {splitSum} / {totalSeats}
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {categories.map((c) => (
                  <div key={c}>
                    <div className="text-[10px] uppercase tracking-wider text-[color:var(--text-muted)] mb-1">
                      {c}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={seatsByCategory?.[c] ?? 0}
                      onChange={(e) => {
                        const n = Math.max(0, Number(e.target.value) || 0);
                        form.setValue(
                          "seatsByCategory",
                          { ...seatsByCategory, [c]: n } as Record<Category, number>,
                          { shouldValidate: true }
                        );
                      }}
                      className="input-base h-9 text-center text-mono"
                    />
                  </div>
                ))}
              </div>
              {form.formState.errors.seatsByCategory && (
                <div className="mt-2 text-xs text-rose-600">
                  Seats must sum to {totalSeats}.
                </div>
              )}
            </div>
          )}

          {/* Qualifications */}
          <div className="rounded-xl border border-[color:var(--border)] p-4 bg-[color:var(--bg-sunken)]/40">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-[color:var(--text-primary)]">
                Qualifications Required
              </div>
              <button
                type="button"
                onClick={() =>
                  quals.append({ degree: "", stream: "", minPercentage: 50 })
                }
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Qualification
              </button>
            </div>
            <div className="space-y-3">
              {quals.fields.map((f, idx) => (
                <div key={f.id} className="grid grid-cols-[1fr_1fr_140px_auto] gap-3 items-end">
                  <Field label="Degree / Certificate" compact>
                    <input
                      {...form.register(`qualifications.${idx}.degree`)}
                      placeholder="e.g. Bachelor's Degree"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Subject / Stream" compact>
                    <input
                      {...form.register(`qualifications.${idx}.stream`)}
                      placeholder="e.g. Any Discipline"
                      className="input-base"
                    />
                  </Field>
                  <Field label="Min %" compact>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      {...form.register(`qualifications.${idx}.minPercentage`, {
                        valueAsNumber: true,
                      })}
                      placeholder="e.g. 45"
                      className="input-base text-mono"
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => quals.remove(idx)}
                    disabled={quals.fields.length === 1}
                    className="h-10 w-10 rounded-lg text-[color:var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
                    aria-label="Remove qualification"
                  >
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Field label="Status">
            <select {...form.register("status")} className="input-base">
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </Field>

          <DialogFooter className="pt-2 sticky bottom-0 bg-[color:var(--bg-surface)]">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <GradientButton type="submit">Save Vacancy</GradientButton>
          </DialogFooter>
        </form>

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
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .input-base:focus-visible {
            border-color: var(--ring);
            box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 25%, transparent);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  compact,
  children,
}: {
  label: string;
  error?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className={`block text-${compact ? "[10px] uppercase tracking-wider" : "xs font-semibold"} text-[color:var(--text-secondary)] mb-1.5`}
      >
        {label}
      </label>
      {children}
      {error && <div className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  );
}
