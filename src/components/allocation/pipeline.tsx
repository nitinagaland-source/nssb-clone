"use client";

import { motion } from "framer-motion";
import { Users, FileCheck2, Database, Award } from "lucide-react";

const STAGES = [
  { icon: Users, label: "Candidates", grad: "grad-sky", glow: "shadow-glow-sky" },
  { icon: FileCheck2, label: "Eligibility", grad: "grad-amber", glow: "shadow-glow-amber" },
  { icon: Database, label: "Vacancies", grad: "grad-emerald", glow: "shadow-glow-emerald" },
  { icon: Award, label: "Final Results", grad: "grad-indigo", glow: "shadow-glow-indigo" },
];

export function Pipeline({ activeIndex = -1 }: { activeIndex?: number }) {
  return (
    <div className="flex items-center justify-center gap-6 py-6">
      {STAGES.map((s, i) => {
        const Icon = s.icon;
        const active = activeIndex >= i;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={
                  active && activeIndex === i
                    ? { scale: [1, 1.1, 1] }
                    : active
                    ? { scale: 1, opacity: 1 }
                    : { scale: 1, opacity: 0.6 }
                }
                transition={{ duration: 0.6 }}
                className={`h-14 w-14 rounded-2xl ${s.grad} ${
                  active ? s.glow : ""
                } flex items-center justify-center text-white`}
              >
                <Icon className="h-6 w-6" />
              </motion.div>
              <div className="text-xs font-semibold text-[color:var(--text-primary)]">
                {s.label}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div className="w-16 h-[2px] mx-2 rounded-full bg-[color:var(--border)] overflow-hidden">
                <motion.div
                  animate={{ width: active && activeIndex > i ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                  className="h-full grad-indigo"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
