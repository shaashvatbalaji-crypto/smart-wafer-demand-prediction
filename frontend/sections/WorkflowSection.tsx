"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import { workflowSteps } from "@/data/workflow";
import { fadeUp, viewportOnce } from "@/lib/animations";

export default function WorkflowSection() {
  return (
    <section id="workflow" className="section-padding overflow-hidden">
      <div className="section-divider absolute inset-x-0 top-0" />

      <div className="container-premium">
        <SectionHeader
          eyebrow="Workflow"
          title="From input to\ndecision."
          description="A streamlined pipeline that transforms raw parameters into actionable business intelligence."
        />

        {/* Desktop timeline */}
        <div className="hidden lg:block">
          <div className="relative px-8">
            <div className="absolute top-[3rem] right-[8%] left-[8%] h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            <div className="grid grid-cols-5 gap-6">
              {workflowSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    custom={i * 0.15}
                    variants={fadeUp}
                    className="group relative flex flex-col items-center text-center"
                  >
                    <div className="relative z-10 mb-6 flex h-[6rem] w-[6rem] items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.04] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-[40px] transition-all duration-500 group-hover:border-accent/30 group-hover:bg-white/[0.06] group-hover:shadow-[0_12px_48px_rgba(0,113,227,0.15)]">
                      <Icon size={30} className="text-accent" strokeWidth={1.5} />
                      <span className="absolute -top-2.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[0.6875rem] font-semibold text-white shadow-[0_4px_12px_rgba(0,113,227,0.4)]">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-white">
                      {step.title}
                    </h3>
                    <p className="max-w-[200px] text-[0.8125rem] leading-[1.6] text-muted">
                      {step.description}
                    </p>

                    {i < workflowSteps.length - 1 && (
                      <div className="absolute top-[3rem] -right-3 text-accent/30">
                        →
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile timeline */}
        <div className="lg:hidden">
          <div className="relative ml-8 border-l border-white/[0.08] pl-10">
            {workflowSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  custom={i * 0.1}
                  variants={fadeUp}
                  className="relative pb-12 last:pb-0"
                >
                  <div className="absolute -left-[2.85rem] flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[40px]">
                    <Icon size={20} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-[-0.02em] text-white">
                    {step.title}
                  </h3>
                  <p className="text-[0.9375rem] leading-[1.65] text-muted">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
