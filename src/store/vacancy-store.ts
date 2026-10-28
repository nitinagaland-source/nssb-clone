"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vacancy } from "@/types";

type State = {
  vacancies: Vacancy[];
};

type Actions = {
  setAll: (vacancies: Vacancy[]) => void;
  add: (v: Vacancy) => void;
  update: (id: string, patch: Partial<Vacancy>) => void;
  remove: (id: string) => void;
};

export const useVacancyStore = create<State & Actions>()(
  persist(
    (set) => ({
      vacancies: [],
      setAll: (vacancies) => set({ vacancies }),
      add: (v) => set((s) => ({ vacancies: [v, ...s.vacancies] })),
      update: (id, patch) =>
        set((s) => ({
          vacancies: s.vacancies.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      remove: (id) => set((s) => ({ vacancies: s.vacancies.filter((v) => v.id !== id) })),
    }),
    { name: "nssb-vacancies" }
  )
);
