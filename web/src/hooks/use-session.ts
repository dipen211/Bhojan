"use client";

import { useEffect } from "react";

import { useSessionStore } from "@/stores";

export function useSession() {
  const store = useSessionStore();

  useEffect(() => {
    if (!useSessionStore.persist.hasHydrated()) {
      void useSessionStore.persist.rehydrate();
    } else if (!store.hydrated) {
      store.setHydrated(true);
    }
  }, []);

  return store;
}
