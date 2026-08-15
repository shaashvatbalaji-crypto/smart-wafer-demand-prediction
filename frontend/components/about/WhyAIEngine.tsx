"use client";

import { motion } from "framer-motion";
import { Cpu, Sparkles, TrendingUp, Compass, Factory, Layers, ShieldCheck, Activity } from "lucide-react";

export default function WhyAIEngine() {
  const orbitingNodes = [
    "Revenue Velocity", "Gross Margin", "Operating Cash",
    "R&D Pacing", "3nm/2nm Transition", "AI GPU Demand",
    "Fab Line Loading", "Yield Curves", "Scanner Uptime",
    "Lead Times", "Channel Buffer", "Ingot Supply",
    "Macro TAM", "Consumer Units", "Automotive EV",
    "Regional GDP", "Export Rules", "Geopolitical Risk"
  ];

  const outputs = [
    { title: "Demand Prediction", sub: "Granular monthly wafer units by node & fab", icon: TrendingUp },
    { title: "Business Insights", sub: "Early warning risk flags & margin sensitivities", icon: Compass },
    { title: "Capacity Planning", sub: "Cleanroom allocation & substrate reservations", icon: Factory },
    { title: "Executive Decisions", sub: "5-year CapEx timing & competitive positioning", icon: ShieldCheck },
  ];

  return (
    <div className="relative border-b border-black/[0.06] py-28 md:py-36 overflow-hidden">
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
          08 — THE VISUAL CENTERPIECE
        </span>
      </motion.div>

      {/* ── Headline & Narrative ── */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 items-start mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <h2 className="text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.038em] text-[#111111] sm:text-[3.25rem] md:text-[4rem]">
            Semiconductor demand is becoming too complex for static forecasting.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 flex flex-col gap-4 text-[1.0625rem] leading-[1.75] text-[#555555]"
        >
          <p>
            Artificial Intelligence is transforming semiconductor manufacturing. As AI chips become the foundation of modern computing, demand forecasting has become non-linear.
          </p>
          <p>
            INSIQ leverages neural regressors to continuously synthesize 18 multi-source variables, identify hidden correlations, and generate reliable demand forecasts that traditional statistical methods cannot achieve.
          </p>
        </motion.div>
      </div>

      {/* ── Visual Centerpiece: 18 Nodes Orbiting Neural AI Core ── */}
      <div className="relative mx-auto max-w-6xl rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-10 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.04),0_0_40px_rgba(0,120,255,0.03)] backdrop-blur-2xl overflow-hidden">
        
        {/* Soft background ambient gradient */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,120,255,0.04)_0%,transparent_65%)]" />

        <div className="relative z-10">
          
          {/* Top Banner */}
          <div className="text-center max-w-md mx-auto mb-10">
            <span className="text-[0.6875rem] font-semibold tracking-widest uppercase text-[#0078FF]">
              NEURAL SIGNAL SYNTHESIS
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#111111] mt-1">
              18 Vector Feeds Continuous Processing
            </h3>
          </div>

          {/* Central AI Core + Orbiting Chips Visualization */}
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            
            {/* Left 9 Telemetry Signals */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <span className="text-[0.625rem] font-bold tracking-widest uppercase text-[#888888] mb-1 block">
                INPUT VECTORS (1–9)
              </span>
              {orbitingNodes.slice(0, 9).map((node, i) => (
                <motion.div
                  key={node}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  whileHover={{ x: 3 }}
                  className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-[#F7F7F5]/80 px-3 py-2 text-[0.75rem] font-medium text-[#222222]"
                >
                  <span>{node}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0078FF]" />
                </motion.div>
              ))}
            </div>

            {/* Center: Pulsing Obsidian INSIQ AI Core */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center py-6 lg:py-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative w-full rounded-3xl border border-black/[0.12] bg-[#111111] p-8 text-center text-white shadow-[0_20px_50px_rgba(0,0,0,0.22)] overflow-hidden"
              >
                {/* Top accent light beam */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0078FF] via-[#4DA3FF] to-[#0078FF]" />

                {/* Pulsing Core Icon */}
                <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#4DA3FF] shadow-[0_0_30px_rgba(0,120,255,0.4)]">
                  <Cpu size={32} strokeWidth={1.75} />
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-2xl border border-[#4DA3FF]/40"
                  />
                </div>

                <span className="inline-flex items-center gap-1 text-[0.6875rem] font-semibold tracking-widest uppercase text-[#4DA3FF] mb-1">
                  <Sparkles size={11} />
                  NEURAL SYNTHESIS ENGINE
                </span>

                <h4 className="text-xl font-bold tracking-tight text-white">
                  INSIQ AI Core
                </h4>

                <p className="mt-2 text-[0.8125rem] text-white/70 leading-relaxed">
                  Deep non-linear feature extraction, multi-node cross-correlation &amp; probabilistic volume modeling.
                </p>

                <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[0.6875rem] font-medium text-white/90">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00C896] shadow-[0_0_6px_#00C896]" />
                  <span>18 Inputs Ingested Real-Time</span>
                </div>
              </motion.div>
            </div>

            {/* Right 9 Telemetry Signals */}
            <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <span className="text-[0.625rem] font-bold tracking-widest uppercase text-[#888888] mb-1 block">
                INPUT VECTORS (10–18)
              </span>
              {orbitingNodes.slice(9, 18).map((node, i) => (
                <motion.div
                  key={node}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  whileHover={{ x: -3 }}
                  className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-[#F7F7F5]/80 px-3 py-2 text-[0.75rem] font-medium text-[#222222]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0078FF]" />
                  <span>{node}</span>
                </motion.div>
              ))}
            </div>

          </div>

          {/* Bottom Outputs: 4 Synthesized Outcomes */}
          <div className="mt-12 pt-8 border-t border-black/[0.06]">
            <span className="text-[0.6875rem] font-semibold tracking-widest uppercase text-[#0078FF] block text-center mb-6">
              SYNTHESIZED EXECUTIVE OUTCOMES
            </span>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {outputs.map((out) => {
                const Icon = out.icon;
                return (
                  <div
                    key={out.title}
                    className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon size={16} className="text-[#0078FF]" />
                      <span className="text-[0.8125rem] font-bold text-[#111111]">
                        {out.title}
                      </span>
                    </div>
                    <p className="text-[0.75rem] leading-relaxed text-[#666666]">
                      {out.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
