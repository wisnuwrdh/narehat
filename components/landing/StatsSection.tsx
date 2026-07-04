"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  delay?: number;
}

function StatItem({ value, suffix, label, delay = 0 }: StatItemProps) {
  const { ref, displayValue } = useCountUp(value, 1200, suffix);

  return (
    <div
      ref={ref}
      className="text-center transition-all duration-700"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="stat-number text-2xl lg:text-4xl font-extrabold text-primary">
        {displayValue}
      </p>
      <p className="text-[11px] lg:text-sm text-muted mt-1">{label}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-10 px-5 border-y border-border-subtle bg-slate-50/50 lg:py-14">
      <div className="container-narrow">
        <div className="grid grid-cols-3 gap-4 text-center lg:gap-8">
          <StatItem value={2.4} suffix="K+" label="User Aktif" delay={0} />
          <StatItem value={89} suffix="%" label="Lebih Paham Pola" delay={100} />
          <StatItem value={15} suffix="K+" label="Entri Jurnal" delay={200} />
        </div>
      </div>
    </section>
  );
}
