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
    <div className="min-h-screen bg-white">
      <div className={!hideNav ? "pb-32 md:pb-0 md:ml-[72px]" : ""}>
        {children}
      </div>
      {!hideNav && (
        <>
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t border-border-subtle px-2 z-50"
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
          <nav
            className="hidden md:flex fixed left-0 top-0 h-full w-[72px] bg-white/90 backdrop-blur-xl border-r border-border-subtle flex-col items-center py-5 gap-1 z-50"
            style={{
              paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              boxShadow: "4px 0 20px rgba(0,0,0,0.03)",
            }}
          >
            <div className="mb-3 mt-1">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-white text-lg">spa</span>
              </div>
            </div>
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`btn-press flex flex-col items-center gap-0.5 py-1.5 px-1.5 rounded-xl transition-colors w-full relative ${
                    isActive
                      ? "text-primary hover:bg-primary-light/50"
                      : "text-muted hover:bg-slate-50"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span
                    className={`text-[9px] leading-tight ${
                      isActive ? "font-bold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.href === "/ai-consult" && !isPremium && (
                    <span className="absolute -top-0.5 right-1 px-1 py-0.5 bg-primary text-white text-[7px] font-bold rounded-md leading-none">
                      PRO
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </>
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
