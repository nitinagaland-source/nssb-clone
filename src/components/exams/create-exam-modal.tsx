"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/common/gradient-button";
import { useExamStore } from "@/store/exam-store";
import type { ExamCategory } from "@/types";

const CATEGORIES: ExamCategory[] = [
  "Staff Recruitment",
  "Edu & Tech",
  "Clerical & Allied",
  "Technical",
  "Others",
];

const schema = z.object({
  name: z.string().min(5, "Name is required (5+ chars)"),
  code: z
    .string()
    .regex(/^NSSB\/[A-Z]+\/\d{4}$/, "Format: NSSB/<CODE>/<YEAR>"),
  year: z.number().int().min(2000).max(2100),
  category: z.enum(CATEGORIES),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const currentYear = new Date().getFullYear();
const YEARS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

function deriveShortLabel(code: string, year: number, category: ExamCategory): string {
  const parts = code.split("/");
  const short = parts[1] ?? "EXAM";
  return `${short} ${year} (${category})`;
}

export function CreateExamModal() {
  const [open, setOpen] = useState(false);
  const add = useExamStore((s) => s.add);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      year: currentYear,
      category: "Staff Recruitment",
      description: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    add({
      id: `exam-${nanoid(10)}`,
      name: values.name,
      code: values.code,
      year: values.year,
      category: values.category,
      shortLabel: deriveShortLabel(values.code, values.year, values.category),
      description: values.description ?? "",
      status: "Upcoming",
      createdAt: new Date().toISOString(),
    });
    toast.success("Examination created");
    form.reset();
    setOpen(false);
  };

  return (
    <>
      <GradientButton onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Create Examination
      </GradientButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[640px] p-0 rounded-2xl overflow-hidden">
        <div
          className="px-6 pt-6 pb-4 border-b"
          style={{ background: "linear-gradient(135deg, oklch(0.65 0.17 230 / 0.04), oklch(0.6 0.2 275 / 0.04))" }}
        >
          <DialogHeader>
            <DialogTitle className="text-display text-xl font-bold">
              Create New Examination
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
          <Field label="Examination Name" error={form.formState.errors.name?.message}>
            <input
              {...form.register("name")}
              placeholder="e.g. Combined Graduate Level 2025"
              className="input-base"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Exam Code" error={form.formState.errors.code?.message}>
              <input
                {...form.register("code")}
                placeholder="e.g. NSSB/CGL/2025"
                className="input-base text-mono"
              />
            </Field>
            <Field label="Year" error={form.formState.errors.year?.message}>
              <select {...form.register("year", { valueAsNumber: true })} className="input-base">
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Category" error={form.formState.errors.category?.message}>
            <select {...form.register("category")} className="input-base">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description / Guidelines">
            <textarea
              {...form.register("description")}
              rows={4}
              placeholder="Enter examination guidelines..."
              className="input-base resize-none"
            />
          </Field>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <GradientButton type="submit">Create Examination</GradientButton>
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
          textarea.input-base {
            height: auto;
            padding: 10px 12px;
          }
        `}</style>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5">
        {label}
      </label>
      {children}
      {error && <div className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  );
}
