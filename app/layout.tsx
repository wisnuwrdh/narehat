import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Narehat — Pahami Pemicu Jerawatmu",
  description:
    "Catat kebiasaan harian, lacak progres kulit, dan temukan pola yang sebenarnya memicu jerawatmu — bukan sekadar tebak-tebakan produk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
