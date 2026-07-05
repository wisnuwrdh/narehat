import { Card } from "@/components/ui/Card";
import type { ReactNode } from "react";

interface InsightCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function InsightCard({ title, description, icon }: InsightCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xs font-bold text-slate-900">{title}</h3>
          <p className="text-[10px] text-muted mt-0.5">{description}</p>
        </div>
      </div>
    </Card>
  );
}
