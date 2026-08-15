"use client";

import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import { insightsContent } from "@/data/content";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";

export default function BusinessInsightsSection() {
  return (
    <section id="insights" className="section-padding relative overflow-hidden">
      <div className="absolute top-1/2 right-0 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-accent-secondary/[0.04] blur-[150px]" />

      <div className="relative container-premium">
        <SectionHeader
          eyebrow={insightsContent.eyebrow}
          title={insightsContent.title}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="grid gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
        >
          {insightsContent.insights.map((insight, i) => (
            <motion.div
              key={insight.metric}
              custom={i * 0.08}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
              className="group card-shine relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] p-6 sm:p-7 backdrop-blur-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out hover:border-accent/20 hover:bg-white/[0.05] hover:shadow-[0_16px_56px_rgba(0,0,0,0.5),0_0_40px_rgba(0,113,227,0.08)]"
            >
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-accent/[0.06] blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-accent/[0.1]" />
              <h3 className="relative mb-3 text-xl font-semibold tracking-[-0.02em] text-white">
                {insight.metric}
              </h3>
              <p className="relative text-[0.9375rem] leading-[1.65] text-muted">
                {insight.detail}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
