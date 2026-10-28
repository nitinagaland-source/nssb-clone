"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number;
  subtitle?: string;
  trend?: string;
  icon: LucideIcon;
  gradientClass: string;
  glowClass: string;
  href: string;
  delay?: number;
};

function useCountUp(target: number, enabled: boolean, duration = 400) {
  const [v, setV] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current == null) startRef.current = ts;
      const p = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, enabled, duration]);
  return v;
}

export function StatCard({
  label,
  value,
  subtitle,
  trend,
  icon: Icon,
  gradientClass,
  glowClass,
  href,
  delay = 0,
}: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => setVisible(true), []);
  const count = useCountUp(value, visible);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={href}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-2xl"
      >
        <div
          className="relative surface-elevated p-5 pr-4 h-[132px] border border-[color:var(--border)] transition-transform group-hover:-translate-y-0.5"
          style={{ borderRadius: "var(--radius-xl)" }}
        >
          <div className="flex items-start justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-secondary)]">
              {label}
            </div>
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center text-white",
                gradientClass,
                glowClass
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.4} />
            </div>
          </div>
          <div className="mt-2 text-display text-[36px] leading-none font-bold text-[color:var(--text-primary)]">
            {count.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[color:var(--text-muted)]">
            {trend && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <ArrowUpRight className="h-3 w-3" />
                {trend}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
