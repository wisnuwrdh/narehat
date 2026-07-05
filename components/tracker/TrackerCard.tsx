import { Card } from "@/components/ui/Card";
import type { ReactNode } from "react";

interface TrackerCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function TrackerCard({
  icon,
  title,
  subtitle,
  children,
}: TrackerCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-[10px] text-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}
