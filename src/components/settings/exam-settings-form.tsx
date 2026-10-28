"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings-store";
import { useExamStore } from "@/store/exam-store";
import { SettingsCard, Field } from "./settings-card";

const schema = z.object({
  activeExamId: z.string().min(1, "Pick an exam"),
  passingPercentage: z.number().min(0).max(100),
  maxWrittenMarks: z.number().int().min(1),
  maxPracticalMarks: z.number().int().min(0),
  maxInterviewMarks: z.number().int().min(0),
});

type Values = z.infer<typeof schema>;

export function ExamSettingsForm() {
  const exams = useExamStore((s) => s.exams);
  const examSettings = useSettingsStore((s) => s.settings.examSettings);
  const updateExam = useSettingsStore((s) => s.updateExam);
  const setActiveExamId = useSettingsStore((s) => s.setActiveExamId);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: examSettings,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(examSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examSettings.activeExamId, examSettings.passingPercentage]);

  const onSubmit = form.handleSubmit((values) => {
    setActiveExamId(values.activeExamId);
    updateExam({
      passingPercentage: values.passingPercentage,
      maxWrittenMarks: values.maxWrittenMarks,
      maxPracticalMarks: values.maxPracticalMarks,
      maxInterviewMarks: values.maxInterviewMarks,
    });
    toast.success("Exam settings saved");
    form.reset(values);
  });

  return (
    <form onSubmit={onSubmit}>
      <SettingsCard
        title="Exam Settings"
        onSave={onSubmit}
        onCancel={() => form.reset()}
        dirty={form.formState.isDirty}
      >
        <div className="space-y-5">
          <Field label="Active Examination" error={form.formState.errors.activeExamId?.message}>
            <select {...form.register("activeExamId")} className="input-base">
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.shortLabel}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Passing Percentage"
            error={form.formState.errors.passingPercentage?.message}
          >
            <input
              type="number"
              min={0}
              max={100}
              {...form.register("passingPercentage", { valueAsNumber: true })}
              className="input-base text-mono"
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Max Written Marks">
              <input
                type="number"
                {...form.register("maxWrittenMarks", { valueAsNumber: true })}
                className="input-base text-mono"
              />
            </Field>
            <Field label="Max Practical Marks">
              <input
                type="number"
                {...form.register("maxPracticalMarks", { valueAsNumber: true })}
                className="input-base text-mono"
              />
            </Field>
            <Field label="Max Interview Marks">
              <input
                type="number"
                {...form.register("maxInterviewMarks", { valueAsNumber: true })}
                className="input-base text-mono"
              />
            </Field>
          </div>
        </div>
      </SettingsCard>
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
      `}</style>
    </form>
  );
}
