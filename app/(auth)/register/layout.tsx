import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Daftar",
  description:
    "Daftar gratis di Narehat. Mulai lacak pemicu jerawatmu, upload foto progress, dan dapatkan analisis AI berbasis jurnal dermatologi.",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
