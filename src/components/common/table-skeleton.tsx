export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="surface-elevated p-4" style={{ borderRadius: "var(--radius-xl)" }}>
      <div className="h-6 w-40 rounded-lg bg-[color:var(--bg-sunken)] animate-pulse mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-lg bg-[color:var(--bg-sunken)] animate-pulse mb-2"
        />
      ))}
    </div>
  );
}

export function CardsSkeleton({ cards = 5 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="h-[132px] rounded-2xl bg-[color:var(--bg-sunken)] animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}
