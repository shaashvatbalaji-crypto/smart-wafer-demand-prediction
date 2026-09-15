"use client";

import IntelligenceSnapshot from "@/components/about/IntelligenceSnapshot";
import AboutIntro from "@/components/about/AboutIntro";
import MissionStatement from "@/components/about/MissionStatement";
import IntelligenceInputs from "@/components/about/IntelligenceInputs";
import BusinessValueCards from "@/components/about/BusinessValueCards";
import EcosystemTree from "@/components/about/EcosystemTree";
import CoreCapabilities from "@/components/about/CoreCapabilities";
import WhyAIEngine from "@/components/about/WhyAIEngine";
import VisionStatement from "@/components/about/VisionStatement";
import FutureRoadmap from "@/components/about/FutureRoadmap";
import AboutCTA from "@/components/about/AboutCTA";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-[#F7F7F5] pt-16 pb-28 sm:pt-20 sm:pb-32 md:pt-28 md:pb-36"
      aria-label="About INSIQ Product Story"
    >
      {/* ── 1. Unified Studio Atmospheric Canvas (Hero → About Continuity) ── */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
        {/* Soft top-centered ambient light bloom continuing seamlessly from Hero */}
        <div className="absolute -top-20 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.04)_0%,rgba(224,236,252,0.2)_45%,transparent_70%)] blur-[100px]" />
        
        {/* Subtle right atmospheric glow */}
        <div className="absolute top-1/4 -right-24 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(240,232,250,0.3)_0%,transparent_70%)] blur-[140px]" />

        {/* Subtle left atmospheric glow */}
        <div className="absolute top-2/3 -left-24 h-[650px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(229,236,246,0.3)_0%,transparent_70%)] blur-[140px]" />

        {/* Tactile micro-noise matching Hero canvas */}
        <div
          className="absolute inset-0 opacity-[0.022] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Bottom subtle 80px transition into subsequent dark section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-[#000000]/40 to-[#000000]" />
      </div>

      {/* ── 2. Sequential Product Keynote Storytelling Modules ── */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Pre-About: AI Intelligence Snapshot Strip */}
        <IntelligenceSnapshot />

        {/* 01 — Introduction */}
        <AboutIntro />

        {/* 03 — Our Mission */}
        <MissionStatement />

        {/* 04 — 18 Connected Intelligence Streams */}
        <IntelligenceInputs />

        {/* 05 — Business Value */}
        <BusinessValueCards />

        {/* 06 — Who Uses INSIQ */}
        <EcosystemTree />

        {/* 07 — Core Capabilities */}
        <CoreCapabilities />

        {/* 08 — Why AI Matters (Visual Centerpiece) */}
        <WhyAIEngine />

        {/* 09 — Our Vision */}
        <VisionStatement />

        {/* 10 — Future Roadmap */}
        <FutureRoadmap />

        {/* Final About CTA */}
        <AboutCTA />
      </div>
    </section>
  );
}