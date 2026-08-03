import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan Privasi Narehat — bagaimana kami mengelola data pribadi, foto, dan privasi pengguna platform jurnal jerawat berbasis AI.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
