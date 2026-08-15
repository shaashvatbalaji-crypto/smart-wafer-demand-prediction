"use client";

import SectionHeader from "@/components/SectionHeader";
import ParameterCard from "@/components/ParameterCard";
import { parameters } from "@/data/parameters";

export default function InputParametersSection() {
  return (
    <section id="parameters" className="section-padding relative">
      <div className="section-divider absolute inset-x-0 top-0" />

      <div className="container-premium">
        <SectionHeader
          eyebrow="Input Parameters"
          title="18 parameters.\nOne prediction engine."
          description="Every input is carefully modeled to capture the full spectrum of factors driving wafer demand in the semiconductor ecosystem."
        />

        <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {parameters.map((param, i) => (
            <ParameterCard
              key={param.title}
              icon={param.icon}
              title={param.title}
              description={param.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
