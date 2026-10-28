"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  ListOrdered,
  Award,
  BarChart3,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/examinations", label: "Examinations", icon: FileText },
  { href: "/vacancies", label: "Vacancies", icon: Briefcase },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/merit-list", label: "Merit List", icon: ListOrdered },
  { href: "/allocation", label: "Allocation", icon: Award },
  { href: "/results", label: "Results", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-grad fixed inset-y-0 left-0 w-60 flex flex-col text-white z-30">
      {/* Brand */}
      <div className="px-5 pt-6 pb-8 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shadow-glow-indigo">
          <span className="text-display text-[10px] leading-tight font-bold text-center">
            STAFF
            <br />
            SEL
          </span>
        </div>
        <div className="leading-tight">
          <div className="text-display text-lg font-bold tracking-tight">NSSB</div>
          <div className="text-[11px] text-white/60">Govt. of Nagaland</div>
        </div>
      </div>

      {/* Main menu header */}
      <div className="px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-2">
        Main Menu
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                active
                  ? "text-white bg-white/[0.08] border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  : "text-white/65 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {active && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full"
                  style={{ background: "var(--grad-indigo)" }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          type="button"
          className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-white/65 hover:text-white hover:bg-white/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
