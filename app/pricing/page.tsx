import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Harga & Paket Narehat",
  description:
    "Mulai gratis. Premium Rp29.000/bulan dan Pro Rp49.000/bulan. AI deteksi jerawat, purging checker, analisis rutinitas, dan konsultasi kulit tanpa kartu kredit.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <h1 className="sr-only">Harga & Paket Narehat</h1>
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
