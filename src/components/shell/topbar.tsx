"use client";

import { Bell } from "lucide-react";
import { ExamSwitcher } from "./exam-switcher";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/examinations": "Examinations",
  "/vacancies": "Vacancies",
  "/candidates": "Candidates",
  "/merit-list": "Merit List",
  "/allocation": "Allocation",
  "/results": "Results",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const title =
    titles[pathname] ??
    titles[Object.keys(titles).find((k) => pathname.startsWith(k)) ?? "/dashboard"] ??
    "Dashboard";

  return (
    <header className="surface-glass sticky top-0 z-20 h-20 flex items-center justify-between px-8 border-b border-[color:var(--glass-border)]">
      <h1 className="text-display text-2xl font-bold text-[color:var(--text-primary)]">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        <ExamSwitcher />

        <button
          type="button"
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-full surface-glass flex items-center justify-center text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] shadow-sm-3d focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-glow-emerald"
            style={{ background: "var(--grad-emerald)" }}
          >
            AU
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-[color:var(--text-primary)]">
              Admin User
            </div>
            <div className="text-[11px] text-[color:var(--text-muted)]">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
