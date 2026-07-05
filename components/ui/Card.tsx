import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border-subtle rounded-3xl shadow-sm",
        { none: "", sm: "p-3", md: "p-5", lg: "p-8" }[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
