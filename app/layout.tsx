import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Narehat — Jurnal Jerawat Cerdas",
  description: "Pahami pemicu jerawatmu, lacak progresmu, dan temukan rutinitas yang benar-benar cocok.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
