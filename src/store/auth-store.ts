"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ADMIN_EMAIL = "admin@gmail.com";
export const ADMIN_PASSWORD = "admin@123";

type State = {
  isAuthed: boolean;
  email: string | null;
};

type Actions = {
  signIn: (email: string, password: string) => { ok: true } | { ok: false; message: string };
  signOut: () => void;
};

export const useAuthStore = create<State & Actions>()(
  persist(
    (set) => ({
      isAuthed: false,
      email: null,
      signIn: (email, password) => {
        if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
          return { ok: false, message: "No account found for that email" };
        }
        if (password !== ADMIN_PASSWORD) {
          return { ok: false, message: "Incorrect password" };
        }
        set({ isAuthed: true, email: email.trim().toLowerCase() });
        return { ok: true };
      },
      signOut: () => set({ isAuthed: false, email: null }),
    }),
    { name: "nssb-auth" }
  )
);
