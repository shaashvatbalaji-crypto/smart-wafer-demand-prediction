"use client";

import SectionHeader from "@/components/SectionHeader";
import GlassCard from "@/components/GlassCard";
import { whyContent } from "@/data/content";

export default function WhySection() {
  return (
    <section id="why" className="section-padding relative">
      <div className="section-divider absolute inset-x-0 top-0" />

      <div className="container-premium">
        <SectionHeader
          eyebrow={whyContent.eyebrow}
          title={whyContent.title}
        />

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {whyContent.problems.map((problem, i) => (
            <GlassCard key={problem.title} delay={i * 0.12} glow>
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 text-sm font-semibold text-accent shadow-[0_4px_16px_rgba(0,113,227,0.15)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">
                  {problem.title}
                </h3>
              </div>
              <p className="text-[0.9375rem] leading-[1.7] text-muted">
                {problem.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
