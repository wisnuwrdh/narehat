"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/contexts/ToastContext";
import { UserProvider, useUser } from "@/contexts/UserContext";

const navItems = [
  { href: "/dashboard", icon: "home", label: "Beranda" },
  { href: "/tracker", icon: "edit_calendar", label: "Tracker" },
  { href: "/progress", icon: "trending_up", label: "Progress" },
  { href: "/ai-consult", icon: "smart_toy", label: "AI" },
  { href: "/settings", icon: "person", label: "Akun" },
];

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/recommendations") || pathname.startsWith("/ai-consult") || pathname.startsWith("/routine") || pathname.startsWith("/subscription") || pathname.startsWith("/profile");
  const { user } = useUser();
  const isPremium = user.plan !== "free";

  return (
    <div className={`min-h-screen bg-white ${hideNav ? "" : "pb-32"}`}>
      {children}
      {!hideNav && (
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-border-subtle px-2 z-50"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn-press flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-colors relative ${
                  isActive
                    ? "text-primary hover:bg-primary-light/50"
                    : "text-muted hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span
                  className={`text-[10px] ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
                {item.href === "/ai-consult" && !isPremium && (
                  <span className="absolute -top-0.5 -right-0.5 px-1 py-0.5 bg-primary text-white text-[7px] font-bold rounded-md leading-none">
                    PREMIUM
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="flex justify-center pb-1">
          <div className="w-28 h-1 bg-slate-300 rounded-full" />
        </div>
      </nav>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <UserProvider>
        <AppShell>{children}</AppShell>
      </UserProvider>
    </ToastProvider>
  );
}
