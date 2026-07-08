import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyNarehat from "@/components/landing/WhyNarehat";
import PricingSection from "@/components/landing/PricingSection";
import AhaMoment from "@/components/landing/AhaMoment";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <WhyNarehat />
        <PricingSection />
        <AhaMoment />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
