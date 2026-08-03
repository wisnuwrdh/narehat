import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Hubungi Narehat",
  description:
    "Punya pertanyaan, masukan, atau butuh bantuan? Hubungi tim Narehat di support@narehat.com, Senin–Jumat 09:00–18:00 WIB.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
