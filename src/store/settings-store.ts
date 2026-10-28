"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Settings } from "@/types";

type State = {
  settings: Settings;
};

type Actions = {
  setActiveExamId: (id: string) => void;
  updateUser: (patch: Partial<Settings["user"]>) => void;
  updateExam: (patch: Partial<Settings["examSettings"]>) => void;
  updateAllocPrefs: (patch: Partial<Settings["allocationPrefs"]>) => void;
  updateNotifications: (patch: Partial<Settings["notifications"]>) => void;
  reset: (defaults: Settings) => void;
};

const DEFAULTS: Settings = {
  user: {
    firstName: "Admin",
    lastName: "User",
    email: "admin@gmail.com",
    role: "System Administrator",
  },
  examSettings: {
    activeExamId: "",
    passingPercentage: 35,
    maxWrittenMarks: 200,
    maxPracticalMarks: 50,
    maxInterviewMarks: 50,
  },
  allocationPrefs: {
    strictMerit: true,
    respectReservation: true,
    respectPreferences: true,
    tieBreaker: "written",
  },
  notifications: {
    emailOnRun: true,
    emailOnPublish: true,
  },
};

export const useSettingsStore = create<State & Actions>()(
  persist(
    (set) => ({
      settings: DEFAULTS,
      setActiveExamId: (id) =>
        set((s) => ({
          settings: { ...s.settings, examSettings: { ...s.settings.examSettings, activeExamId: id } },
        })),
      updateUser: (patch) =>
        set((s) => ({ settings: { ...s.settings, user: { ...s.settings.user, ...patch } } })),
      updateExam: (patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            examSettings: { ...s.settings.examSettings, ...patch },
          },
        })),
      updateAllocPrefs: (patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            allocationPrefs: { ...s.settings.allocationPrefs, ...patch },
          },
        })),
      updateNotifications: (patch) =>
        set((s) => ({
          settings: {
            ...s.settings,
            notifications: { ...s.settings.notifications, ...patch },
          },
        })),
      reset: (defaults) => set({ settings: defaults }),
    }),
    { name: "nssb-settings" }
  )
);
