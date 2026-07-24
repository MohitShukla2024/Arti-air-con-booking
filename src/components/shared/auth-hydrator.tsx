"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/use-auth-store";

export function AuthHydrator() {
  const setSessionUser = useAuthStore((state) => state.setSessionUser);

  useEffect(() => {
    const controller = new AbortController();

    const hydrate = async () => {
      try {
        const response = await fetch("/api/auth/me", { signal: controller.signal });

        if (!response.ok) {
          setSessionUser(null);
          return;
        }

        const data = await response.json();

        if (data?.success && data?.user) {
          setSessionUser(data.user);
        } else {
          setSessionUser(null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSessionUser(null);
        }
      }
    };

    void hydrate();

    return () => controller.abort();
  }, [setSessionUser]);

  return null;
}