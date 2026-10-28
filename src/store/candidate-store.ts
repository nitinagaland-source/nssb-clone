"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Candidate } from "@/types";

type State = {
  candidates: Candidate[];
  recentImportIds: string[];
};

type Actions = {
  setAll: (candidates: Candidate[]) => void;
  add: (c: Candidate) => void;
  addMany: (cs: Candidate[]) => void;
  update: (id: string, patch: Partial<Candidate>) => void;
  remove: (id: string) => void;
  setRecentImport: (ids: string[]) => void;
};

export const useCandidateStore = create<State & Actions>()(
  persist(
    (set) => ({
      candidates: [],
      recentImportIds: [],
      setAll: (candidates) => set({ candidates }),
      add: (c) => set((s) => ({ candidates: [c, ...s.candidates] })),
      addMany: (cs) =>
        set((s) => ({
          candidates: [...cs, ...s.candidates],
          recentImportIds: cs.map((c) => c.id),
        })),
      update: (id, patch) =>
        set((s) => ({
          candidates: s.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      remove: (id) => set((s) => ({ candidates: s.candidates.filter((c) => c.id !== id) })),
      setRecentImport: (ids) => set({ recentImportIds: ids }),
    }),
    { name: "nssb-candidates" }
  )
);
