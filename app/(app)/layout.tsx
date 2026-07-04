"use client";

import BottomNav from "@/components/app/BottomNav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white pb-32">
      <main className="max-w-md mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
