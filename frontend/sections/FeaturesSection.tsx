"use client";

import SectionHeader from "@/components/SectionHeader";
import FeatureCard from "@/components/FeatureCard";
import { features } from "@/data/features";

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.03] via-transparent to-accent-secondary/[0.03]" />
      <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/[0.04] blur-[150px]" />

      <div className="relative container-premium">
        <SectionHeader
          eyebrow="Features"
          title="Everything you need.\nNothing you don't."
          description="A complete suite of tools for wafer demand forecasting, analysis, and strategic decision support."
        />

        <div className="grid gap-6 sm:grid-cols-2 md:gap-7 lg:grid-cols-4">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
