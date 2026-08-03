import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Blog Narehat",
  description:
    "Konten edukasi seputar jerawat, skincare, ingredients, dan kesehatan kulit berbasis jurnal dermatologi peer-reviewed.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/blog" },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
