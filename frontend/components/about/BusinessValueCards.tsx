"use client";

import { motion } from "framer-motion";
import { Compass, Factory, LineChart, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

export default function BusinessValueCards() {
  const cards = [
    {
      id: "01",
      title: "Smarter Business Decisions",
      description:
        "INSIQ helps organizations make confident business decisions by transforming complex semiconductor data into understandable predictions and actionable recommendations.\n\nThe platform assists analysts in identifying production opportunities, anticipating market fluctuations, and planning manufacturing capacity more efficiently.",
      metric: "Real-time Confidence Calibration",
      icon: Compass,
      accent: "#0078FF",
    },
    {
      id: "02",
      title: "Production Optimization",
      description:
        "Forecast wafer demand before production begins to reduce excess inventory, optimize fab utilization, and improve manufacturing efficiency across multiple technology nodes.",
      metric: "Multi-Node Allocation Planning",
      icon: Factory,
      accent: "#111111",
    },
    {
      id: "03",
      title: "Investment Intelligence",
      description:
        "Evaluate how revenue growth, capital expenditure, AI investments, and R&D spending influence future wafer demand, enabling better investment planning and long-term business strategies.",
      metric: "Long-term CapEx Synchronization",
      icon: LineChart,
      accent: "#0078FF",
    },
    {
      id: "04",
      title: "Risk Assessment",
      description:
        "Analyze the impact of supply chain disruptions, geopolitical uncertainties, export regulations, and regional manufacturing trends to minimize operational risks.",
      metric: "Geopolitical Exposure Modeling",
      icon: ShieldAlert,
      accent: "#111111",
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
          05 — BUSINESS VALUE
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
          A forecast is only useful when it changes a decision.
        </motion.h2>
      </div>

      {/* ── 2x2 Floating Panels with Glass Reflections & Metrics ── */}
      <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.75,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -6, scale: 1.015 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-black/[0.07] bg-white p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.03),0_0_24px_rgba(0,120,255,0.02)] backdrop-blur-2xl transition-all duration-300 hover:border-[#0078FF]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06),0_0_30px_rgba(0,120,255,0.06)]"
            >
              <div>
                {/* Header: Icon & Large Numerals */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/[0.08] bg-[#F7F7F5] text-[#0078FF] transition-colors duration-300 group-hover:bg-[#0078FF] group-hover:text-white">
                    <Icon size={22} strokeWidth={2} />
                  </div>
                  <span className="text-4xl font-bold tracking-tight text-black/10 transition-colors duration-300 group-hover:text-[#0078FF]/20">
                    {card.id}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#111111] sm:text-2xl group-hover:text-[#0078FF] transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="mt-4 whitespace-pre-line text-[0.9375rem] leading-[1.75] text-[#555555] sm:text-[1rem]">
                  {card.description}
                </p>
              </div>

              {/* Bottom Animated Metric Badge */}
              <div className="mt-8 pt-5 border-t border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#0078FF]" />
                  <span className="text-[0.75rem] font-semibold text-[#111111]">
                    {card.metric}
                  </span>
                </div>
                <TrendingUp size={14} className="text-[#888888] group-hover:text-[#0078FF] transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
