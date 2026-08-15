"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";

const inputs = [
  ["Financial performance", "Business health and investment capacity."],
  ["Revenue growth", "Demand momentum and order velocity."],
  ["Gross margin", "Pricing resilience through market cycles."],
  ["Operating cash flow", "Capital available for capacity commitments."],
  ["R&D investment", "Product pipeline intensity and future demand."],
  ["Capital expenditure", "Fab expansion and equipment investment."],
  ["Technology node transition", "Migration across leading and mature nodes."],
  ["Manufacturing utilization", "Current line loading and capacity pressure."],
  ["Yield rate", "Effective output from each wafer start."],
  ["Supply chain signals", "Lead times, logistics, and supplier health."],
  ["Inventory trends", "Channel buffers and replenishment dynamics."],
  ["Market growth", "Macro semiconductor demand trajectory."],
  ["Regional economy", "Local demand, incentives, and exposure."],
  ["AI accelerator demand", "Advanced compute and HBM consumption."],
  ["Consumer electronics demand", "Device-cycle demand signals."],
  ["Automotive semiconductor demand", "EV, ADAS, and power-device demand."],
  ["Export policies", "Trade constraints and technology access."],
  ["Geopolitical risk", "Regional concentration and disruption risk."],
] as const;

const ease = [0.16, 1, 0.3, 1] as const;

export default function IntelligenceInputs() {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const [title, description] = inputs[active];

  return (
    <section className="relative border-b border-black/[0.07] py-24 sm:py-32 md:py-40">
      <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-12%" }} transition={{ duration: 0.65, ease }}>
        <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-[#0078FF] uppercase">04 — Intelligence input network</p>
        <div className="mt-5 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 className="max-w-4xl text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.045em] text-[#111111] sm:text-[3.75rem] lg:col-span-8 lg:text-[4.5rem]">Eighteen signals. One intelligence layer.</h2>
          <p className="max-w-md text-[1.0625rem] leading-[1.72] text-[#666666] lg:col-span-4">Each parameter is interpreted in relation to every other signal—not modeled in isolation.</p>
        </div>
      </motion.div>

      <div className="relative mt-14 overflow-hidden rounded-[2rem] border border-black/[0.08] bg-white p-4 shadow-[0_20px_60px_rgba(17,17,17,0.045)] sm:mt-16 sm:p-7 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,120,255,0.08),transparent_42%)]" />
        <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inputs.map(([name, detail], index) => {
            const isActive = active === index;
            return (
              <motion.button
                key={name}
                type="button"
                onClick={() => setActive(index)}
                onFocus={() => setActive(index)}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-8%" }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.025, 0.3), ease }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                className={`relative rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 focus-visible:outline-none ${isActive ? "border-[#0078FF]/45 bg-[#0078FF]/[0.055] shadow-[0_10px_24px_rgba(0,120,255,0.1)]" : "border-black/[0.06] bg-[#F7F7F5]/65 hover:border-[#0078FF]/25 hover:bg-white"}`}
                aria-pressed={isActive}
              >
                <span className="flex items-start justify-between gap-3"><span className="text-[0.875rem] font-semibold tracking-[-0.012em] text-[#111111]">{name}</span><span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "bg-[#0078FF] shadow-[0_0_8px_#4DA3FF]" : "bg-black/15"}`} /></span>
                <span className={`mt-2 block text-[0.75rem] leading-relaxed transition-all duration-300 ${isActive ? "max-h-16 opacity-100 text-[#555555]" : "max-h-0 overflow-hidden opacity-0"}`}>{detail}</span>
              </motion.button>
            );
          })}
        </div>

        <motion.div layout className="relative mx-auto mt-6 max-w-xl rounded-[1.5rem] bg-[#111111] p-6 text-center text-white sm:mt-8 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4DA3FF] to-transparent" />
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#82bcff]"><BrainCircuit size={23} /></div>
          <p className="mt-4 text-[0.6875rem] font-semibold tracking-[0.16em] text-[#82bcff] uppercase">INSIQ intelligence engine</p>
          <p className="mt-1 text-lg font-semibold">{title}</p>
          <p className="mx-auto mt-2 max-w-sm text-[0.8125rem] leading-relaxed text-white/65">{description}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[0.6875rem] font-medium text-white/80"><Sparkles size={11} className="text-[#82bcff]" /> Contextualized across 18 inputs</span>
        </motion.div>
      </div>
    </section>
  );
}
