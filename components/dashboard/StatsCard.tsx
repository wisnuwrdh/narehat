import { Card } from "@/components/ui/Card";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ label, value, trend, trendUp }: StatsCardProps) {
  return (
    <Card padding="sm">
      <p className="text-[10px] text-muted">{label}</p>
      <p className="text-lg font-bold text-slate-900 stat-number">{value}</p>
      {trend && (
        <p
          className={`text-[10px] font-semibold ${
            trendUp ? "text-green-600" : "text-red-500"
          }`}
        >
          {trendUp ? "↑" : "↓"} {trend}
        </p>
      )}
    </Card>
  );
}
