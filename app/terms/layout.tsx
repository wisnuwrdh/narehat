import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat & Ketentuan penggunaan layanan Narehat — platform jurnal dan analisis jerawat berbasis AI.",
  alternates: { canonical: "/terms" },
};

export default function TermsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
