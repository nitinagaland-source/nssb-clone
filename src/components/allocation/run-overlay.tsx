"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pipeline } from "./pipeline";

export function RunOverlay({
  open,
  onDone,
}: {
  open: boolean;
  onDone: () => void;
}) {
  const [stage, setStage] = useState(-1);

  useEffect(() => {
    if (!open) {
      setStage(-1);
      return;
    }
    let i = 0;
    setStage(0);
    const int = setInterval(() => {
      i += 1;
      if (i > 3) {
        clearInterval(int);
        setTimeout(onDone, 200);
      } else {
        setStage(i);
      }
    }, 420);
    return () => clearInterval(int);
  }, [open, onDone]);

  const pct = stage < 0 ? 0 : ((stage + 1) / 4) * 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--bg-page)]/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="surface-elevated w-[560px] max-w-[92vw] px-10 py-10 text-center"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            <div className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Running Allocation
            </div>
            <h2 className="text-display text-2xl font-bold mt-1">
              Matching candidates to posts…
            </h2>
            <Pipeline activeIndex={stage} />
            <div className="h-2 rounded-full bg-[color:var(--bg-sunken)] overflow-hidden mt-2">
              <motion.div
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3 }}
                className="h-full grad-indigo"
              />
            </div>
            <div className="mt-2 text-xs text-[color:var(--text-muted)]">
              {Math.round(pct)}% complete
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
