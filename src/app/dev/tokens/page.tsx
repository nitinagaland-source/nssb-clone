"use client";

import { useState } from "react";

const brandGradients = [
  { name: "--grad-indigo", cls: "grad-indigo", glow: "shadow-glow-indigo" },
  { name: "--grad-emerald", cls: "grad-emerald", glow: "shadow-glow-emerald" },
  { name: "--grad-amber", cls: "grad-amber", glow: "shadow-glow-amber" },
  { name: "--grad-rose", cls: "grad-rose", glow: "shadow-glow-rose" },
  { name: "--grad-sky", cls: "grad-sky", glow: "shadow-glow-sky" },
];

const chips = [
  { name: "Active", cls: "chip-active" },
  { name: "Draft", cls: "chip-draft" },
  { name: "Upcoming", cls: "chip-upcoming" },
  { name: "Waitlisted", cls: "chip-waitlisted" },
  { name: "Not Eligible", cls: "chip-not-eligible" },
  { name: "Allocated", cls: "chip-allocated" },
  { name: "Unallocated", cls: "chip-unallocated" },
];

const shadows = [
  { name: "--shadow-sm", cls: "shadow-sm-3d" },
  { name: "--shadow-md", cls: "shadow-md-3d" },
  { name: "--shadow-lg", cls: "shadow-lg-3d" },
];

const radii = [
  { name: "sm 8px", v: "var(--radius-sm)" },
  { name: "md 12px", v: "var(--radius-md)" },
  { name: "lg 16px", v: "var(--radius-lg)" },
  { name: "xl 24px", v: "var(--radius-xl)" },
];

const typeScale = [11, 12, 13, 14, 16, 18, 22, 28, 36, 48];

export default function TokensPreviewPage() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground p-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-display text-4xl font-bold">Design tokens</h1>
            <p className="text-[color:var(--text-secondary)] mt-2">
              Preview of every token wired for the NSSB build.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="surface-card px-4 py-2 text-sm font-medium hover:shadow-lg-3d transition-shadow"
          >
            Toggle {dark ? "light" : "dark"}
          </button>
        </header>

        <Section title="Sidebar gradient">
          <div className="sidebar-grad h-32 rounded-2xl p-6 text-white">
            <div className="text-xs uppercase tracking-widest opacity-70">Sidebar</div>
            <div className="text-display text-2xl font-semibold mt-2">NSSB</div>
            <div className="text-sm opacity-60">Govt. of Nagaland</div>
          </div>
        </Section>

        <Section title="Brand gradients + glows">
          <div className="grid grid-cols-5 gap-4">
            {brandGradients.map((g) => (
              <div key={g.name} className="space-y-2">
                <div className={`${g.cls} ${g.glow} h-24 rounded-2xl`} />
                <div className="text-mono text-xs text-[color:var(--text-muted)]">{g.name}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Status chips">
          <div className="flex flex-wrap gap-3">
            {chips.map((c) => (
              <span
                key={c.name}
                className={`${c.cls} inline-flex items-center h-6 px-3 rounded-full text-xs font-medium text-[color:var(--text-primary)] shadow-sm-3d`}
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.06)" }}
              >
                {c.name}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Elevation">
          <div className="grid grid-cols-3 gap-6">
            {shadows.map((s) => (
              <div key={s.name} className={`${s.cls} bg-[color:var(--bg-surface)] p-6 rounded-2xl`}>
                <div className="text-mono text-xs text-[color:var(--text-muted)]">{s.name}</div>
                <div className="mt-2 text-sm">Elevated surface</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radii">
          <div className="grid grid-cols-4 gap-6">
            {radii.map((r) => (
              <div
                key={r.name}
                className="bg-[color:var(--bg-surface)] shadow-md-3d h-24 flex items-center justify-center text-sm text-[color:var(--text-secondary)]"
                style={{ borderRadius: r.v }}
              >
                {r.name}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Glass surface">
          <div className="grad-sky rounded-2xl p-8">
            <div className="surface-glass rounded-xl p-6">
              <div className="text-sm uppercase tracking-widest text-[color:var(--text-secondary)]">
                Glass panel
              </div>
              <div className="text-display text-2xl font-semibold mt-2">
                Backdrop blur + translucent surface
              </div>
            </div>
          </div>
        </Section>

        <Section title="Typography">
          <div className="space-y-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-2">
                Display · Inter Tight
              </div>
              <div className="text-display text-5xl font-semibold">
                Nagaland Staff Selection Board
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-2">
                Body · Inter
              </div>
              <div className="text-base">
                The quick brown fox jumps over the lazy dog. 1234567890
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-2">
                Mono · JetBrains Mono
              </div>
              <div className="text-mono text-sm">NSSB24001 · VAC-2024-001 · NSSB/CSRE/2025</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-2">
                Scale
              </div>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                {typeScale.map((s) => (
                  <div key={s} style={{ fontSize: s }} className="text-display font-medium">
                    {s}px
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Text colors">
          <div className="space-y-2">
            <div className="text-[color:var(--text-primary)]">Primary text — oklch(0.2 0.02 250)</div>
            <div className="text-[color:var(--text-secondary)]">Secondary text — oklch(0.45 0.015 250)</div>
            <div className="text-[color:var(--text-muted)]">Muted text — oklch(0.6 0.012 250)</div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-display text-xl font-semibold mb-4 text-[color:var(--text-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
