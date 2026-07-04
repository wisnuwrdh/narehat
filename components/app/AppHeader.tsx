"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  rightContent?: React.ReactNode;
}

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  backHref = "/dashboard",
  rightContent,
}: AppHeaderProps) {
  return (
    <header className="px-6 pt-6 pb-4 flex items-center gap-3 bg-white sticky top-0 z-10">
      {showBack && (
        <Link
          href={backHref}
          className="btn-press p-2 -ml-2 text-muted hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      )}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {rightContent}
    </header>
  );
}
