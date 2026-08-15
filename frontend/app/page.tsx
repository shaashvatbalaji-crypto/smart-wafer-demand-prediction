import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingGlow from "@/components/FloatingGlow";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import WhySection from "@/sections/WhySection";
import BusinessInsightsSection from "@/sections/BusinessInsightsSection";
import InputParametersSection from "@/sections/InputParametersSection";
import FeaturesSection from "@/sections/FeaturesSection";
import WorkflowSection from "@/sections/WorkflowSection";
import TechStackSection from "@/sections/TechStackSection";

export default function Home() {
  return (
    <div className="animated-gradient-bg relative min-h-screen">
      <FloatingGlow />
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <AboutSection />
          <WhySection />
          <BusinessInsightsSection />
          <InputParametersSection />
          <FeaturesSection />
          <WorkflowSection />
          <TechStackSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
