"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Plus, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Beranda" },
  { href: "/tracker", icon: CalendarDays, label: "Tracker" },
  { href: "/tracker", icon: Plus, label: "", isFab: true },
  { href: "/progress", icon: TrendingUp, label: "Progress" },
  { href: "/settings", icon: User, label: "Akun" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-border-subtle px-2 z-50" style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
      <div className="flex items-center justify-between px-4 py-2">
        {navItems.map((item, index) => {
          if (item.isFab) {
            return (
              <div key={index} className="relative -top-5">
                <Link
                  href={item.href}
                  className="btn-press w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow ring-4 ring-white"
                >
                  <Plus className="w-6 h-6" />
                </Link>
              </div>
            );
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "btn-press flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors",
                isActive
                  ? "text-primary hover:bg-primary-light/50"
                  : "text-muted hover:bg-slate-50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-center pb-1">
        <div className="w-28 h-1 bg-slate-300 rounded-full" />
      </div>
    </nav>
  );
}
