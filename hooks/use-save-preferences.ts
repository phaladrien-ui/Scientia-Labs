"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useSavePreferences() {
  const router = useRouter();

  const savePreferences = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences: data }),
        });
        router.refresh();
      } catch (err) {
        console.error("Save failed:", err);
      }
    },
    [router]
  );

  return savePreferences;
}
