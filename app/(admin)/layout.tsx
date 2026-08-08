import type { Viewport } from "next";
import { auth } from "@/auth";
import { createDBClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const supabase = createDBClient();
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/admin"
            className="btn-press flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Admin
          </Link>
          <span className="w-px h-4 bg-border-light" />
          <span className="text-sm font-bold text-slate-800">Panel Admin</span>
        </div>
      </div>
      {children}
    </>
  );
}