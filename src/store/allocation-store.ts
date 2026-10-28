"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Allocation, AllocationRun } from "@/types";

type State = {
  allocations: Allocation[];
  runs: AllocationRun[];
};

type Actions = {
  setForExam: (examId: string, allocations: Allocation[], run: AllocationRun) => void;
  clearExam: (examId: string) => void;
};

export const useAllocationStore = create<State & Actions>()(
  persist(
    (set) => ({
      allocations: [],
      runs: [],
      setForExam: (examId, allocations, run) =>
        set((s) => ({
          allocations: [
            ...s.allocations.filter((a) => a.examId !== examId),
            ...allocations,
          ],
          runs: [...s.runs.filter((r) => r.examId !== examId), run],
        })),
      clearExam: (examId) =>
        set((s) => ({
          allocations: s.allocations.filter((a) => a.examId !== examId),
          runs: s.runs.filter((r) => r.examId !== examId),
        })),
    }),
    { name: "nssb-allocations" }
  )
);
