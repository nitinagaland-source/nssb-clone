import { cn } from "@/lib/utils";
import type { AllocationStatus, VacancyStatus, ExaminationStatus } from "@/types";

type Status =
  | AllocationStatus
  | VacancyStatus
  | ExaminationStatus
  | "Eligible"
  | "Not Eligible"
  | "Pending";

const map: Record<string, { cls: string; text: string }> = {
  Allocated: { cls: "chip-active", text: "text-emerald-900" },
  Active: { cls: "chip-active", text: "text-emerald-900" },
  Eligible: { cls: "chip-active", text: "text-emerald-900" },
  Upcoming: { cls: "chip-upcoming", text: "text-amber-900" },
  Waitlisted: { cls: "chip-waitlisted", text: "text-amber-900" },
  Draft: { cls: "chip-draft", text: "text-slate-700" },
  Completed: { cls: "chip-draft", text: "text-slate-700" },
  Closed: { cls: "chip-draft", text: "text-slate-700" },
  Pending: { cls: "chip-draft", text: "text-slate-700" },
  Unallocated: { cls: "chip-not-eligible", text: "text-rose-900" },
  "Not Eligible": { cls: "chip-not-eligible", text: "text-rose-900" },
};

export function StatusChip({ status, className }: { status: Status; className?: string }) {
  const entry = map[status] ?? map.Draft;
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-semibold whitespace-nowrap",
        entry.cls,
        entry.text,
        className
      )}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.04)" }}
    >
      {status}
    </span>
  );
}
