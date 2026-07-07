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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400;700&display=block" rel="stylesheet" />
      </head>
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
