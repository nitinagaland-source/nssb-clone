"use client";

import { Briefcase } from "lucide-react";
import { useMemo } from "react";
import { useVacancyStore } from "@/store/vacancy-store";
import { useSettingsStore } from "@/store/settings-store";

const BAR_GRADS = [
  "from-indigo-500 to-fuchsia-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-indigo-500",
  "from-lime-500 to-emerald-500",
  "from-rose-500 to-pink-500",
];

export function DeptBars() {
  const vacancies = useVacancyStore((s) => s.vacancies);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);

  const data = useMemo(() => {
    const rows = vacancies.filter((v) => v.examId === activeExamId);
    const map = new Map<string, number>();
    for (const v of rows) {
      map.set(v.department, (map.get(v.department) ?? 0) + v.totalSeats);
    }
    return [...map.entries()]
      .map(([dept, seats]) => ({ dept, seats }))
      .sort((a, b) => b.seats - a.seats);
  }, [vacancies, activeExamId]);

  const max = Math.max(1, ...data.map((d) => d.seats));

  return (
    <div className="surface-elevated p-6" style={{ borderRadius: "var(--radius-xl)" }}>
      <div className="flex items-center gap-2 mb-5">
        <Briefcase className="h-4 w-4 text-sky-600" />
        <h2 className="text-display text-lg font-bold text-[color:var(--text-primary)]">
          Department-wise Vacancies
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="py-10 text-center text-sm text-[color:var(--text-muted)]">
          No vacancies in the active exam yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {data.map((d, i) => (
            <li key={d.dept}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-medium text-[color:var(--text-primary)]">{d.dept}</span>
                <span className="font-semibold text-[color:var(--text-primary)]">
                  {d.seats.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-[color:var(--bg-sunken)] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${BAR_GRADS[i % BAR_GRADS.length]}`}
                  style={{ width: `${(d.seats / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
