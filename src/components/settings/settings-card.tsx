import { cn } from "@/lib/utils";

export function SettingsCard({
  title,
  children,
  onSave,
  onCancel,
  saveLabel = "Save Changes",
  dirty,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  dirty: boolean;
}) {
  return (
    <div
      className="surface-elevated"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      <div className="px-6 py-5 border-b border-[color:var(--border)]">
        <h2 className="text-display text-lg font-bold text-[color:var(--text-primary)]">
          {title}
        </h2>
      </div>
      <div className="px-6 py-6">{children}</div>
      <div className="sticky bottom-0 px-6 py-4 border-t border-[color:var(--border)] bg-[color:var(--bg-surface)] rounded-b-2xl flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={!dirty}
          className="h-10 px-4 rounded-xl text-sm font-semibold text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-sunken)] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={onSave}
          disabled={!dirty}
          className={cn(
            "inline-flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold text-white grad-indigo shadow-glow-indigo disabled:opacity-50 disabled:shadow-none"
          )}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  readOnly,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[color:var(--text-secondary)] mb-1.5">
        {label}
      </label>
      <div className={readOnly ? "opacity-70" : ""}>{children}</div>
      {error && <div className="mt-1 text-xs text-rose-600">{error}</div>}
    </div>
  );
}
