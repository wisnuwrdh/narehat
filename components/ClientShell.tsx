"use client";

import { ToastProvider } from "@/contexts/ToastContext";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
