"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSettingsStore } from "@/store/settings-store";
import { SettingsCard } from "./settings-card";

type Values = {
  emailOnRun: boolean;
  emailOnPublish: boolean;
};

export function NotificationsForm() {
  const prefs = useSettingsStore((s) => s.settings.notifications);
  const update = useSettingsStore((s) => s.updateNotifications);

  const form = useForm<Values>({
    defaultValues: prefs,
  });

  useEffect(() => {
    form.reset(prefs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.emailOnRun, prefs.emailOnPublish]);

  const onSubmit = form.handleSubmit((values) => {
    update(values);
    toast.success("Notification preferences saved");
    form.reset(values);
  });

  const values = form.watch();

  return (
    <form onSubmit={onSubmit}>
      <SettingsCard
        title="Notifications"
        onSave={onSubmit}
        onCancel={() => form.reset()}
        dirty={form.formState.isDirty}
      >
        <div className="space-y-3">
          <Toggle
            label="Email me when a run completes"
            checked={values.emailOnRun}
            onChange={(v) => form.setValue("emailOnRun", v, { shouldDirty: true })}
          />
          <Toggle
            label="Email me when results are published"
            checked={values.emailOnPublish}
            onChange={(v) => form.setValue("emailOnPublish", v, { shouldDirty: true })}
          />
        </div>
      </SettingsCard>
    </form>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[color:var(--border)] cursor-pointer hover:bg-[color:var(--bg-sunken)]/60">
      <div className="text-sm font-semibold text-[color:var(--text-primary)]">{label}</div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 rounded-full transition-colors ${
          checked
            ? "bg-indigo-600"
            : "bg-[color:var(--bg-sunken)] border border-[color:var(--border)]"
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
