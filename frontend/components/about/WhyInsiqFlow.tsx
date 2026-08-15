"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  BrainCircuit,
  Building2,
  Factory,
  Lightbulb,
  TrendingUp,
  Truck,
} from "lucide-react";

const stages = [
  { title: "Market signals", detail: "Demand cycles, macroeconomic shifts, and policy changes", icon: Activity },
  { title: "Financial data", detail: "Revenue, margins, investment, and capacity commitments", icon: TrendingUp },
  { title: "Technology trends", detail: "Node transitions, AI adoption, and product roadmaps", icon: Building2 },
  { title: "Supply chain", detail: "Lead times, inventory buffers, and material availability", icon: Truck },
  { title: "Manufacturing", detail: "Utilization, yields, and wafer production telemetry", icon: Factory },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function WhyInsiqFlow() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative border-b border-black/[0.07] py-24 sm:py-32 md:py-40">
      <div className="grid gap-14 lg:grid-cols-12 lg:items-start lg:gap-16">
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.6, ease }}
            className="text-[0.6875rem] font-semibold tracking-[0.18em] text-[#0078FF] uppercase"
          >
            02 — Why INSIQ exists
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.75, delay: 0.08, ease }}
            className="mt-5 text-[2.75rem] font-semibold leading-[1.03] tracking-[-0.045em] text-[#111111] sm:text-[3.75rem] lg:text-[4.25rem]"
          >
            Planning cannot wait for certainty.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
            className="mt-6 max-w-md text-[1.0625rem] leading-[1.72] text-[#666666]"
          >
            Semiconductor demand changes across markets, fabs, and supply chains long before it appears in a conventional forecast. INSIQ turns those disconnected signals into a decision-ready view.
          </motion.p>
        </div>

        <div className="lg:col-span-7">
          <div className="relative overflow-hidden rounded-[2rem] border border-black/[0.08] bg-white p-5 shadow-[0_18px_50px_rgba(17,17,17,0.045)] sm:p-8">
            <div className="absolute left-[2.85rem] top-14 bottom-14 hidden w-px bg-black/[0.08] sm:block" />
            <div className="relative space-y-3">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <motion.div
                    key={stage.title}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.55, delay: index * 0.07, ease }}
                    className="group relative flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-[#F7F7F5]/70 p-4 transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[#0078FF]/30 hover:bg-white sm:gap-5 sm:p-5"
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0078FF] shadow-[0_2px_8px_rgba(17,17,17,0.05)] transition-colors duration-300 group-hover:bg-[#0078FF] group-hover:text-white">
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.9375rem] font-semibold tracking-[-0.015em] text-[#111111]">{stage.title}</p>
                      <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-[#666666]">{stage.detail}</p>
                    </div>
                    <span className="ml-auto text-[0.6875rem] font-semibold tracking-[0.12em] text-black/25">0{index + 1}</span>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.65, delay: 0.28, ease }}
              className="relative mt-5 rounded-2xl bg-[#111111] p-5 text-white sm:p-6"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4DA3FF] to-transparent" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#82bcff]"><BrainCircuit size={20} /></div>
                <div><p className="text-[0.6875rem] font-semibold tracking-[0.15em] text-[#82bcff] uppercase">INSIQ intelligence engine</p><p className="mt-0.5 font-semibold">Signals synthesized in context</p></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: 0.38, ease }}
              className="mt-3 grid gap-3 sm:grid-cols-2"
            >
              <div className="rounded-2xl border border-[#0078FF]/20 bg-[#0078FF]/[0.045] p-4"><p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-[#0078FF] uppercase">Output 01</p><p className="mt-1 text-[0.9375rem] font-semibold text-[#111111]">Demand forecast</p></div>
              <div className="rounded-2xl border border-black/[0.07] bg-white p-4"><p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-[#0078FF] uppercase">Output 02</p><p className="mt-1 text-[0.9375rem] font-semibold text-[#111111]">Strategic decisions</p></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
