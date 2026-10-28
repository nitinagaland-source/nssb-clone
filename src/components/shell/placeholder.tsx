export function Placeholder({ name }: { name: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="surface-card p-10 text-center">
        <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-2">
          Coming next
        </div>
        <h2 className="text-display text-3xl font-bold text-[color:var(--text-primary)]">
          {name}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
          This page is wired in a later milestone.
        </p>
      </div>
    </div>
  );
}
