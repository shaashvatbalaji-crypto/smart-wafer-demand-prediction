"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, LayoutDashboard, HelpCircle, History, Search, Cpu, Sliders, ArrowUpRight, Sparkles } from "lucide-react";

export default function CoreCapabilities() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const capabilities = [
    {
      id: "01",
      title: "AI-Powered Demand Forecasting",
      desc: "Predict monthly wafer demand using advanced machine learning algorithms trained on semiconductor business indicators.",
      detail: "Leverages ensemble gradient boosting and neural regression models trained on multi-decade wafer fabrication cycles, wafer diameters (300mm/200mm), and macroeconomic demand indicators.",
      icon: BrainCircuit,
    },
    {
      id: "02",
      title: "Business Intelligence",
      desc: "Visualize prediction results, market trends, confidence scores, and business recommendations through interactive dashboards.",
      detail: "Executive telemetry providing granular breakdown across foundries, technology nodes (2nm through 28nm), gross margin impact, and quarterly run rates.",
      icon: LayoutDashboard,
    },
    {
      id: "03",
      title: "Explainable AI (XAI)",
      desc: "Understand why a prediction was generated through AI-generated explanations based on influential business factors.",
      detail: "SHAP-driven attribution scoring identifying the primary market, CapEx, and supply chain drivers influencing each specific wafer volume projection.",
      icon: HelpCircle,
    },
    {
      id: "04",
      title: "Scenario Simulation",
      desc: "Conduct what-if stress tests against trade policy shifts, CapEx delays, and AI compute acceleration waves.",
      detail: "Simulate custom macroeconomic shocks, supply bottlenecks, and accelerated node transitions to quantify risk before committing capital.",
      icon: Sliders,
    },
    {
      id: "05",
      title: "Intelligent Semantic Search",
      desc: "Quickly search companies, retrieve historical forecasts, and review business insights from previous analyses.",
      detail: "Instant natural language indexing across thousands of forecast scenarios, parameter vectors, and industry whitepapers.",
      icon: Search,
    },
    {
      id: "06",
      title: "Prediction History & Comparison",
      desc: "Maintain and compare predictions across different time periods to analyze growth patterns and accuracy revisions.",
      detail: "Longitudinal tracking of model forecasts vs actualized foundry wafer output, continuously refining forward confidence intervals.",
      icon: History,
    },
    {
      id: "07",
      title: "Interactive Dashboard Telemetry",
      desc: "Real-time wafer mix allocation and equipment utilization telemetry across leading and mature nodes.",
      detail: "Live integration with cleanroom scanner throughput models and substrate procurement schedules.",
      icon: Cpu,
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
          07 — CORE CAPABILITIES
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
          From prediction to decision.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[1.125rem] leading-[1.75] text-[#555555] max-w-3xl"
        >
          Seven enterprise capability modules bridging complex machine learning regressions into crisp executive clarity.
        </motion.p>
      </div>

      {/* ── Expandable Interactive Cards Grid ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap, index) => {
          const Icon = cap.icon;
          const isExpanded = expandedIndex === index;
          return (
            <motion.button
              key={cap.id}
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              aria-expanded={isExpanded}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.6,
                delay: (index % 3) * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4, scale: 1.015 }}
              className={`group flex min-h-[18rem] w-full cursor-pointer flex-col justify-between rounded-3xl border p-7 text-left backdrop-blur-2xl transition-[background-color,border-color,box-shadow,transform] duration-300 focus-visible:outline-none ${
                isExpanded
                  ? "border-[#0078FF] bg-white shadow-[0_20px_50px_rgba(0,120,255,0.08),0_0_24px_rgba(0,120,255,0.03)]"
                  : "border-black/[0.07] bg-white hover:border-[#0078FF]/30 hover:shadow-[0_12px_32px_rgba(0,0,0,0.04)]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-300 ${
                    isExpanded ? "bg-[#0078FF] text-white" : "bg-[#F7F7F5] text-[#0078FF] group-hover:bg-[#0078FF] group-hover:text-white"
                  }`}>
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-sm font-bold tracking-wider text-black/20 group-hover:text-[#0078FF] transition-colors">
                    {cap.id}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#111111] group-hover:text-[#0078FF] transition-colors">
                  {cap.title}
                </h3>

                <p className="mt-3 text-[0.875rem] leading-relaxed text-[#555555]">
                  {cap.desc}
                </p>

                {/* Expanded Deep Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t border-black/[0.06] text-[0.8125rem] leading-relaxed text-[#0078FF] font-medium"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles size={14} className="shrink-0 mt-0.5" />
                      <span>{cap.detail}</span>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 pt-4 flex items-center justify-between text-[0.75rem] font-semibold text-[#888888] group-hover:text-[#0078FF] transition-colors border-t border-black/[0.04]">
                <span>{isExpanded ? "Click to collapse" : "Explore module"}</span>
                <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
