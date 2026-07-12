import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const SITE_URL = "https://narehat.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3525cd",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  applicationName: "Narehat",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Narehat",
  },
  title: {
    default: "Narehat — Deteksi & Pahami Pemicu Jerawatmu",
    template: "%s | Narehat",
  },
  description:
    "Upload foto atau tanya langsung — AI kami analisis pemicu jerawatmu, deteksi purging vs breakout, dan bangun rutinitas yang beneran cocok. Berbasis jurnal dermatologi peer-reviewed.",
  keywords: [
    "jurnal jerawat",
    "pemicu jerawat",
    "deteksi jerawat AI",
    "skincare tracker",
    "konsultasi kulit",
    "purging vs breakout",
    "Narehat",
    "analisis rutinitas skincare",
  ],
  authors: [{ name: "Narehat" }],
  creator: "Narehat",
  publisher: "Narehat",
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "Narehat",
    title: "Narehat — Deteksi & Pahami Pemicu Jerawatmu",
    description:
      "Upload foto atau tanya langsung — AI deteksi jerawat, purging checker, analisis rutinitas, semua dalam 1 app. Berbasis jurnal dermatologi.",
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Narehat — Pahami Pemicu Jerawatmu" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Narehat — Deteksi & Pahami Pemicu Jerawatmu",
    description:
      "Upload foto atau tanya langsung — AI deteksi jerawat, purging checker, analisis rutinitas, semua dalam 1 app.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400;700&display=block" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Narehat",
              url: "https://narehat.vercel.app",
              description:
                "Platform AI untuk mendeteksi pemicu jerawat, analisis rutinitas skincare, dan konsultasi berbasis jurnal dermatologi peer-reviewed.",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
              },
            }),
          }}
        />
      </head>
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
