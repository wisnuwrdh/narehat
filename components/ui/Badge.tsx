import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "muted" | "success";
}

export function Badge({
  variant = "primary",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md",
        {
          primary: "bg-primary-light text-primary",
          muted: "bg-slate-100 text-muted",
          success: "bg-green-100 text-green-700",
        }[variant],
        className
      )}
      {...props}
    />
  );
}
