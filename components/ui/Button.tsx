import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "btn-press inline-flex items-center justify-center gap-2 font-bold rounded-2xl transition-colors",
        {
          primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90",
          secondary: "bg-white border border-border-light text-slate-700 hover:bg-slate-50",
          ghost: "text-muted hover:text-slate-700 hover:bg-slate-50",
        }[variant],
        {
          sm: "px-3 py-1.5 text-xs",
          md: "px-5 py-3 text-sm",
          lg: "px-8 py-4 text-base",
        }[size],
        className
      )}
      {...props}
    />
  );
}
