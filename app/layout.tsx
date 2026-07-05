import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Narehat — Jurnal Jerawat Cerdas",
  description: "Pahami pemicu jerawatmu, lacak progresmu, dan temukan rutinitas yang benar-benar cocok.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
