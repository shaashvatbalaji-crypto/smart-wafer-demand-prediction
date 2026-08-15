"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Compass, Sparkles } from "lucide-react";

export default function FutureRoadmap() {
  const roadmapStages = [
    {
      phase: "NOW",
      subtitle: "Current Core Engine",
      icon: CheckCircle2,
      accent: "#0078FF",
      active: true,
      items: [
        "Real-time market data integration",
        "Live semiconductor industry analytics",
        "Global wafer demand heatmaps",
        "Predictive supply chain intelligence",
      ],
    },
    {
      phase: "NEXT",
      subtitle: "Upcoming Capabilities",
      icon: Clock,
      accent: "#111111",
      active: false,
      items: [
        "AI-powered investment recommendations",
        "Interactive executive dashboards",
        "Multi-region demand forecasting",
        "Scenario simulation and what-if analysis",
      ],
    },
    {
      phase: "FUTURE",
      subtitle: "Long-term Horizon",
      icon: Compass,
      accent: "#666666",
      active: false,
      items: [
        "Automated PDF and Excel report generation",
        "API integration with enterprise ERP and MES systems",
      ],
    },
  ];

  return (
    <div className="relative border-b border-black/[0.06] py-28 md:py-36">
      {/* ── Eyebrow Label ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-md"
      >
        <span className="flex h-2 w-2 rounded-full bg-[#0078FF]" />
        <span className="text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-[#111111]">
          10 — FUTURE ROADMAP
        </span>
      </motion.div>

      {/* ── Headline ── */}
      <div className="max-w-4xl mb-16 md:mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.038em] text-[#111111] sm:text-[3.25rem] md:text-[4rem]"
        >
          Built to evolve with the industry.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[1.125rem] leading-[1.75] text-[#555555] max-w-3xl"
        >
          A continuous engineering roadmap scaling from standalone neural regressors to enterprise-wide manufacturing ERP and MES integrations.
        </motion.p>
      </div>

      {/* ── 3-Stage Roadmap Grid with Travelling Light Beam Track ── */}
      <div className="relative mx-auto max-w-6xl">
        {/* Horizontal Travelling Light Beam on Desktop */}
        <div className="hidden lg:block absolute top-7 inset-x-12 h-1 bg-black/[0.06] rounded-full z-0 overflow-hidden">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-1/3 h-full bg-gradient-to-r from-transparent via-[#0078FF] to-transparent shadow-[0_0_12px_#4DA3FF]"
          />
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 relative z-10">
          {roadmapStages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.phase}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -6, scale: 1.015 }}
                className={`flex flex-col justify-between rounded-3xl border p-8 sm:p-10 backdrop-blur-2xl transition-all duration-300 ${
                  stage.active
                    ? "border-[#0078FF]/50 bg-white shadow-[0_20px_50px_rgba(0,120,255,0.08),0_0_30px_rgba(0,120,255,0.03)]"
                    : "border-black/[0.07] bg-white hover:border-[#0078FF]/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.03)]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[0.6875rem] font-bold tracking-widest uppercase ${
                        stage.active
                          ? "bg-[#0078FF] text-white shadow-[0_0_12px_rgba(0,120,255,0.4)]"
                          : "border border-black/[0.08] bg-[#F7F7F5] text-[#111111]"
                      }`}
                    >
                      {stage.active && <Sparkles size={11} />}
                      {stage.phase}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7F7F5] text-[#0078FF]">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-[#111111]">
                    {stage.subtitle}
                  </h3>

                  <ul className="mt-6 flex flex-col gap-3.5">
                    {stage.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-[#444444]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0078FF]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
