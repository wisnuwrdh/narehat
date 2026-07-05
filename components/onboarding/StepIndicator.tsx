import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-300",
            i < current
              ? "bg-primary"
              : i === current
                ? "bg-primary w-8"
                : "bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}
