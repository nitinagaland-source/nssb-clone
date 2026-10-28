import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "indigo" | "emerald" | "sky" | "amber" | "rose";

const grads: Record<Variant, { bg: string; glow: string }> = {
  indigo: { bg: "grad-indigo", glow: "shadow-glow-indigo" },
  emerald: { bg: "grad-emerald", glow: "shadow-glow-emerald" },
  sky: { bg: "grad-sky", glow: "shadow-glow-sky" },
  amber: { bg: "grad-amber", glow: "shadow-glow-amber" },
  rose: { bg: "grad-rose", glow: "shadow-glow-rose" },
};

export const GradientButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function GradientButton({ className, variant = "indigo", children, ...props }, ref) {
  const g = grads[variant];
  return (
    <button
      ref={ref}
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60 disabled:pointer-events-none",
        g.bg,
        g.glow,
        className
      )}
    >
      {children}
    </button>
  );
});
