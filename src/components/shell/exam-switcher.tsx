"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useExamStore } from "@/store/exam-store";
import { useSettingsStore } from "@/store/settings-store";

export function ExamSwitcher() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const exams = useExamStore((s) => s.exams);
  const activeExamId = useSettingsStore((s) => s.settings.examSettings.activeExamId);
  const setActiveExamId = useSettingsStore((s) => s.setActiveExamId);

  useEffect(() => setMounted(true), []);

  // sorted newest year first
  const sorted = [...exams].sort((a, b) => b.year - a.year);
  const active = sorted.find((e) => e.id === activeExamId) ?? sorted[0];

  const label = mounted && active ? active.shortLabel : "Loading…";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="surface-glass inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-sm font-medium text-[color:var(--text-primary)] shadow-sm-3d hover:shadow-md-3d transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=open]:shadow-md-3d"
      >
        <span className="truncate max-w-[220px]">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[color:var(--text-muted)] transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[320px] p-1.5 rounded-2xl shadow-lg-3d border surface-glass"
      >
        {sorted.map((exam) => {
          const isActive = exam.id === activeExamId;
          return (
            <DropdownMenuItem
              key={exam.id}
              onSelect={() => {
                setActiveExamId(exam.id);
                toast.success(`Switched to ${exam.shortLabel}`);
              }}
              className={cn(
                "relative h-12 px-3.5 rounded-xl text-sm cursor-pointer flex items-center justify-between gap-2",
                "focus:bg-[oklch(0.6_0.2_275_/_0.08)]",
                isActive && "bg-[oklch(0.6_0.2_275_/_0.12)] font-semibold"
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                  style={{ background: "var(--grad-indigo)" }}
                />
              )}
              <span>{exam.shortLabel}</span>
              {isActive && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
