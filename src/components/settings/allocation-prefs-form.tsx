"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings-store";
import { SettingsCard, Field } from "./settings-card";

const schema = z.object({
  strictMerit: z.boolean(),
  respectReservation: z.boolean(),
  respectPreferences: z.boolean(),
  tieBreaker: z.enum(["written", "age", "random"]),
});

type Values = z.infer<typeof schema>;

export function AllocationPrefsForm() {
  const prefs = useSettingsStore((s) => s.settings.allocationPrefs);
  const update = useSettingsStore((s) => s.updateAllocPrefs);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: prefs,
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset(prefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.strictMerit, prefs.respectReservation, prefs.respectPreferences, prefs.tieBreaker]);

  const onSubmit = form.handleSubmit((values) => {
    update(values);
    toast.success("Allocation preferences saved");
    form.reset(values);
  });

  const values = form.watch();

  return (
    <form onSubmit={onSubmit}>
      <SettingsCard
        title="Allocation Preferences"
        onSave={onSubmit}
        onCancel={() => form.reset()}
        dirty={form.formState.isDirty}
      >
        <div className="space-y-4">
          <Toggle
            label="Strict merit-based ranking"
            desc="Walk the merit list in order; higher ranks always get first pick."
            checked={values.strictMerit}
            onChange={(v) => form.setValue("strictMerit", v, { shouldDirty: true })}
          />
          <Toggle
            label="Respect reservation"
            desc="Consume seats from the candidate's own category first."
            checked={values.respectReservation}
            onChange={(v) =>
              form.setValue("respectReservation", v, { shouldDirty: true })
            }
          />
          <Toggle
            label="Respect candidate preferences"
            desc="Match in the order of the candidate's preferred vacancies."
            checked={values.respectPreferences}
            onChange={(v) =>
              form.setValue("respectPreferences", v, { shouldDirty: true })
            }
          />

          <Field label="Tie-breaker">
            <div className="flex gap-2">
              {(["written", "age", "random"] as const).map((v) => (
                <label
                  key={v}
                  className={`flex-1 h-10 rounded-xl border px-3 inline-flex items-center justify-center gap-2 text-sm cursor-pointer ${
                    values.tieBreaker === v
                      ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-semibold"
                      : "border-[color:var(--border)] text-[color:var(--text-secondary)]"
                  }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={values.tieBreaker === v}
                    onChange={() => form.setValue("tieBreaker", v, { shouldDirty: true })}
                  />
                  {v === "written" ? "Written marks" : v === "age" ? "Age" : "Random"}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </SettingsCard>
    </form>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[color:var(--border)] cursor-pointer hover:bg-[color:var(--bg-sunken)]/60">
      <div>
        <div className="text-sm font-semibold text-[color:var(--text-primary)]">{label}</div>
        <div className="text-xs text-[color:var(--text-muted)] mt-0.5">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-[color:var(--bg-sunken)] border border-[color:var(--border)]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
