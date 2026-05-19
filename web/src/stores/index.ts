"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Role, SessionUser } from "@/types/auth";

interface SessionState {
  hydrated: boolean;
  token: string | null;
  user: SessionUser | null;
  rolePreview: Role | null;
  setSession: (token: string, user: SessionUser) => void;
  logout: () => void;
  setRolePreview: (role: Role | null) => void;
  setHydrated: (value: boolean) => void;
}

function createSessionStorage(): Storage {
  if (typeof window === "undefined") {
    return {
      length: 0,
      clear: () => undefined,
      getItem: () => null,
      key: () => null,
      removeItem: () => undefined,
      setItem: () => undefined,
    };
  }

  return localStorage;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      hydrated: false,
      token: null,
      user: null,
      rolePreview: null,
      setSession: (token, user) =>
        set({
          token,
          user,
          rolePreview: null,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          rolePreview: null,
        }),
      setRolePreview: (rolePreview) =>
        set({
          rolePreview,
        }),
      setHydrated: (hydrated) =>
        set({
          hydrated,
        }),
    }),
    {
      name: "bhojan-session",
      storage: createJSONStorage(createSessionStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
