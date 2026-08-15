"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Factory, Briefcase, Microscope, Layers, Building2, ShieldCheck } from "lucide-react";

export default function EcosystemTree() {
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);

  const stakeholders = [
    { id: "foundries", name: "Foundries & Pure-Play Fabs", group: "Manufacturing", icon: Factory, desc: "Synchronizing production lot schedules with forward wafer demand curves." },
    { id: "idms", name: "Integrated Device Makers (IDMs)", group: "Manufacturing", icon: Building2, desc: "Aligning captive fab capacity with global competitive demand forecasts." },
    { id: "executives", name: "Executive & Strategy Teams", group: "Strategy", icon: Briefcase, desc: "Planning 5-year capital expenditure and technology node roadmap commitments." },
    { id: "supply", name: "Supply Chain & Procurement", group: "Operations", icon: Layers, desc: "Optimizing ingot, wafer substrate, and chemical buffer stock procurement." },
    { id: "investors", name: "Semiconductor Investors & VC", group: "Finance", icon: Briefcase, desc: "Benchmarking fabless startups and evaluating capacity expansion ROI." },
    { id: "analysts", name: "Market Research Analysts", group: "Analysis", icon: Microscope, desc: "Tracking technology node transitions and regional demand concentration." },
    { id: "government", name: "Government & Trade Bodies", group: "Policy", icon: ShieldCheck, desc: "Assessing national semiconductor resilience, supply safety, and export policies." },
    { id: "research", name: "Research Labs & Consortia", group: "Innovation", icon: Microscope, desc: "Anticipating advanced packaging and wafer substrate material shifts." },
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
          06 — ECOSYSTEM INTELLIGENCE
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
          One intelligence layer.
          <br />
          Many strategic decisions.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-[1.125rem] leading-[1.75] text-[#555555] max-w-3xl"
        >
          From pure-play foundries and fabless chipmakers to sovereign policy analysts and venture capital, INSIQ unifies diverse semiconductor stakeholders under a single source of forecasting truth.
        </motion.p>
      </div>

      {/* ── Modern Ecosystem Network Visualization ── */}
      <div className="relative mx-auto max-w-6xl rounded-3xl border border-black/[0.07] bg-white p-6 sm:p-10 md:p-14 shadow-[0_16px_50px_rgba(0,0,0,0.03),0_0_30px_rgba(0,120,255,0.02)] backdrop-blur-2xl">
        
        {/* Central INSIQ Core Node */}
        <div className="mx-auto mb-10 max-w-md rounded-2xl border border-black/[0.1] bg-[#111111] p-5 text-center text-white shadow-[0_12px_36px_rgba(0,0,0,0.14)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0078FF] to-transparent" />
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#0078FF] shadow-[0_0_8px_#0078FF]" />
            <span className="text-[0.6875rem] font-semibold tracking-widest uppercase text-[#4DA3FF]">
              CENTRAL DECISION ENGINE
            </span>
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-white">
            INSIQ Unified Intelligence Hub
          </h3>
        </div>

        {/* 8 Connected Ecosystem Nodes */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stakeholders.map((s, index) => {
            const Icon = s.icon;
            const isHovered = hoveredStakeholder === s.id;
            return (
              <motion.button
                key={s.id}
                type="button"
                onMouseEnter={() => setHoveredStakeholder(s.id)}
                onMouseLeave={() => setHoveredStakeholder(null)}
                onFocus={() => setHoveredStakeholder(s.id)}
                onBlur={() => setHoveredStakeholder(null)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group flex min-h-52 w-full flex-col justify-between rounded-2xl border p-5 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 focus-visible:outline-none ${
                  isHovered
                    ? "border-[#0078FF] bg-white shadow-[0_12px_30px_rgba(0,120,255,0.1)]"
                    : "border-black/[0.06] bg-[#F7F7F5]/70 hover:border-black/[0.12] hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                      isHovered ? "bg-[#0078FF] text-white" : "bg-white text-[#0078FF] shadow-xs"
                    }`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-[#888888]">
                      {s.group}
                    </span>
                  </div>

                  <h4 className="mt-4 text-[0.9375rem] font-semibold text-[#111111] group-hover:text-[#0078FF] transition-colors">
                    {s.name}
                  </h4>
                </div>

                <p className="mt-2 text-[0.75rem] leading-relaxed text-[#666666]">
                  {s.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
