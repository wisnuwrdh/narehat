import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Tentang Narehat",
  description:
    "Narehat lahir dari frustrasi jutaan orang yang terus berganti produk tanpa pernah tahu pemicu jerawatnya. AI berbasis jurnal dermatologi peer-reviewed menghubungkan kebiasaan harianmu dengan kondisi kulitmu.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
