"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "default" | "feminine" | "dark" | "nature";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const stored = localStorage.getItem("narehat-theme") as Theme | null;
    if (stored && stored !== "default") {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    }
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.theme) {
          setTheme(data.user.theme);
          document.documentElement.dataset.theme = data.user.theme;
          localStorage.setItem("narehat-theme", data.user.theme);
        }
      })
      .catch(() => {});
  }, []);

  const changeTheme = useCallback(async (t: Theme) => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    localStorage.setItem("narehat-theme", t);
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: t }),
      });
    } catch {}
  }, []);

  return { theme, changeTheme };
}
