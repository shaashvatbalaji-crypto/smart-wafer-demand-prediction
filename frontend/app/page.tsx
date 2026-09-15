import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingGlow from "@/components/FloatingGlow";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";

export default function Home() {
  return (
    <div className="animated-gradient-bg relative min-h-screen">
      <FloatingGlow />

      <div className="relative z-10">
        <Navbar />

        <main>
          <HeroSection />
          <AboutSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}
