"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "default" | "feminine" | "dark" | "nature";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const stored = localStorage.getItem("narehat-theme") as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  const changeTheme = useCallback((t: Theme) => {
    setTheme(t);
    localStorage.setItem("narehat-theme", t);
  }, []);

  return { theme, changeTheme };
}
