"use client";

import { useEffect, useRef, useState } from "react";

const valueProps = [
  {
    icon: "quiz",
    label: "1 Menit",
    detail: "kenali tipe kulitmu",
  },
  {
    icon: "edit_calendar",
    label: "30 Detik",
    detail: "isi tracker harian",
  },
  {
    icon: "smart_toy",
    label: "24/7",
    detail: "tanya AI kapan saja",
  },
];

export default function StatsBar() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-10 px-5 border-y border-border-subtle bg-slate-50/50 lg:py-14">
      <div className="container-narrow">
        <div className="grid grid-cols-3 gap-4 text-center lg:gap-8">
          {valueProps.map((item, i) => (
            <div
              key={i}
              className={visible ? "reveal visible" : "reveal"}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <span className="material-symbols-outlined text-2xl lg:text-3xl text-primary mb-2 block">
                {item.icon}
              </span>
              <p className="text-sm lg:text-base font-bold text-slate-800">{item.label}</p>
              <p className="text-[10px] lg:text-xs text-muted-light mt-0.5">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
