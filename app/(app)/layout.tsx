"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "home", label: "Beranda" },
  { href: "/tracker", icon: "edit_calendar", label: "Tracker" },
  { href: "/progress", icon: "trending_up", label: "Progress" },
  { href: "/settings", icon: "person", label: "Akun" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white pb-32">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-border-subtle px-2 z-50" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))", boxShadow: "0 -4px 20px rgba(0,0,0,0.03)" }}>
        <div className="flex items-center justify-between px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn-press flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors ${isActive ? "text-primary hover:bg-primary-light/50" : "text-muted hover:bg-slate-50"}`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex justify-center pb-1">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </nav>
    </div>
  );
}
