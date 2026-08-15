"use client";

import SectionHeader from "@/components/SectionHeader";
import TechBadge from "@/components/TechBadge";
import { techStack } from "@/data/techStack";

export default function TechStackSection() {
  return (
    <section id="technology" className="section-padding relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-accent/[0.04] blur-[150px]" />

      <div className="relative container-premium">
        <SectionHeader
          eyebrow="Technology Stack"
          title="Built with the\nbest tools."
          description="A modern, production-grade stack combining machine learning excellence with a premium web experience."
        />

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 md:gap-6 lg:grid-cols-7">
          {techStack.map((tech, i) => (
            <TechBadge
              key={tech.name}
              name={tech.name}
              category={tech.category}
              color={tech.color}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
