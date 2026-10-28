"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Examination } from "@/types";

type State = {
  exams: Examination[];
};

type Actions = {
  setAll: (exams: Examination[]) => void;
  add: (exam: Examination) => void;
  update: (id: string, patch: Partial<Examination>) => void;
  remove: (id: string) => void;
};

export const useExamStore = create<State & Actions>()(
  persist(
    (set) => ({
      exams: [],
      setAll: (exams) => set({ exams }),
      add: (exam) => set((s) => ({ exams: [exam, ...s.exams] })),
      update: (id, patch) =>
        set((s) => ({ exams: s.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      remove: (id) => set((s) => ({ exams: s.exams.filter((e) => e.id !== id) })),
    }),
    { name: "nssb-exams" }
  )
);
