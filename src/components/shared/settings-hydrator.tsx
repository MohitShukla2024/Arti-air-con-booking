"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/store/use-settings-store";
import { normalizeSiteSettings } from "@/lib/site-settings";

export function SettingsHydrator() {
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  useEffect(() => {
    let cancelled = false;

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled && data.success && data.settings) {
          updateSettings(normalizeSiteSettings(data.settings));
        }
      } catch {
        // Keep local defaults if the API is unavailable.
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [updateSettings]);

  return null;
}