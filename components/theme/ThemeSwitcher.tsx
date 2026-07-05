"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const themes = [
  { key: "default" as const, label: "Default", desc: "Minimalis, informatif", color: "bg-slate-700" },
  { key: "feminine" as const, label: "Feminine", desc: "Supportif, encouraging", color: "bg-rose-400" },
  { key: "dark" as const, label: "Dark", desc: "To the point, data-driven", color: "bg-slate-900" },
  { key: "nature" as const, label: "Nature", desc: "Holistic, calming", color: "bg-emerald-500" },
];

export function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-3">
      {themes.map((t) => (
        <button
          key={t.key}
          onClick={() => changeTheme(t.key)}
          className={cn(
            "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
            theme === t.key
              ? "border-primary bg-primary-light/20"
              : "border-border-subtle hover:border-primary/30"
          )}
        >
          <div className={cn("w-8 h-8 rounded-full", t.color)} />
          <span className="text-xs font-bold text-slate-900">{t.label}</span>
          <span className="text-[10px] text-muted">{t.desc}</span>
          {theme === t.key && (
            <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <svg
                className="w-2.5 h-2.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
