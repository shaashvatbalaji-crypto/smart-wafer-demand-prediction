"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Cpu, Radio } from "lucide-react";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;
const coreRows = [
  ["Status", "Ready"],
  ["Connected Signals", "0 / 18"],
  ["Forecast Engine", "XGBoost Ensemble"],
  ["Prediction Confidence", "--"],
];

const intelligenceModules = [
  {
    title: "Financial Signals",
    desc: "Revenue • Profit • Capital Expenditure",
    selected: "3 Signals",
  },
  {
    title: "Manufacturing",
    desc: "Capacity • Yield • Inventory",
    selected: "3 Signals",
  },
  {
    title: "Technology",
    desc: "Node • AI Demand • R&D",
    selected: "3 Signals",
  },
  {
    title: "Market Conditions",
    desc: "GDP • Automotive • Consumer Electronics",
    selected: "3 Signals",
  },
  {
    title: "Supply Chain",
    desc: "Raw Materials • Logistics • Lead Time",
    selected: "3 Signals",
  },
  {
    title: "External Factors",
    desc: "Exports • Geopolitics • Regional Economy",
    selected: "3 Signals",
  },
];

export default function PredictionWorkspace() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-[#F6F5F3] text-[#111111]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.012]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17,17,17,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,.6) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <motion.header
          initial={{
            opacity: 0,
            y: reduceMotion ? 0 : -12,
            filter: reduceMotion ? "none" : "blur(6px)",
          }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease }}
          className="grid grid-cols-[1fr_auto_1fr] items-center rounded-2xl border border-black/[0.08] bg-white/80 px-3 py-2.5 shadow-[0_6px_24px_rgba(17,17,17,0.035)] backdrop-blur-2xl sm:px-4"
        >
          <Link
            href="/"
            className="flex w-fit items-center gap-2 rounded-xl px-2 py-1.5 text-[0.8125rem] font-medium text-[#666666] transition-colors duration-200 hover:bg-black/[0.04] hover:text-[#111111] focus-visible:outline-none"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
          </Link>

          <p className="text-center text-[0.8125rem] font-semibold tracking-[-0.015em] text-[#111111] sm:text-[0.9375rem]">
            INSIQ Enterprise Workspace
          </p>

          <div className="justify-self-end rounded-full border border-black/[0.07] bg-[#F6F5F3] px-2.5 py-1.5 text-[0.6875rem] font-medium text-[#666666] sm:px-3">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#0A84FF] shadow-[0_0_8px_rgba(10,132,255,.7)]" />
            Ready
          </div>
        </motion.header>

        <section className="mx-auto w-full max-w-[700px] pt-20 text-center sm:pt-28 lg:pt-36">
          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            className="text-[0.6875rem] font-semibold tracking-[0.18em] text-[#0A84FF] uppercase"
          >
            Enterprise demand intelligence
          </motion.p>

          <motion.h1
            initial={{
              opacity: 0,
              y: reduceMotion ? 0 : 26,
              filter: reduceMotion ? "none" : "blur(8px)",
            }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.14, ease }}
            className="mt-5 text-[3rem] font-semibold leading-[1.01] tracking-[-0.055em] text-[#111111] sm:text-[4.5rem] lg:text-[5.5rem]"
          >
            Generate Semiconductor Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="mx-auto mt-6 max-w-[620px] text-[1rem] leading-[1.7] tracking-[-0.012em] text-[#666666] sm:text-[1.125rem]"
          >
            Configure enterprise demand forecasting using financial intelligence,
            manufacturing signals, technology evolution, supply-chain analytics,
            and global market indicators.
          </motion.p>
        </section>

        <section className="mx-auto mt-16 grid w-full max-w-[1400px] gap-5 lg:mt-20 lg:grid-cols-[minmax(0,72fr)_minmax(19rem,28fr)] lg:gap-7">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, ease }}
            className="min-h-[25rem] rounded-[1.75rem] border border-dashed border-black/[0.14] bg-white/40 p-6 sm:min-h-[31rem] sm:p-8"
          >
            <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-[#666666] uppercase">
              Enterprise input workspace
            </p>

            <div className="flex h-[calc(100%-2rem)] min-h-[20rem] items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-black/[0.07] bg-white text-[#0A84FF]">
                  <Cpu size={21} strokeWidth={1.7} />
                </div>
                <p className="mt-5 text-[1.0625rem] font-medium tracking-[-0.02em] text-[#111111]">
                  Enterprise Intelligence Modules will appear here.
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-[#666666]">
                  A focused configuration environment is being prepared for your
                  forecasting workflow.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="h-fit rounded-[1.75rem] border border-black/[0.08] bg-white p-6 shadow-[0_18px_55px_rgba(17,17,17,0.07)] lg:sticky lg:top-6 sm:p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A84FF]/10 text-[#0A84FF]">
              <Radio size={20} strokeWidth={1.8} />
            </div>

            <p className="mt-5 text-[0.6875rem] font-semibold tracking-[0.16em] text-[#0A84FF] uppercase">
              INSIQ Intelligence Core
            </p>

            <div className="mt-6 divide-y divide-black/[0.07] border-y border-black/[0.07]">
              {coreRows.map(([label, value], index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: reduceMotion ? 0 : 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.2 + index * 0.06, ease }}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <span className="text-[0.8125rem] text-[#666666]">{label}</span>
                  <span
                    className={`text-right text-[0.8125rem] font-semibold tracking-[-0.015em] ${
                      label === "Status" ? "text-[#0A84FF]" : "text-[#111111]"
                    }`}
                  >
                    {label === "Status" && (
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#0A84FF]" />
                    )}
                    {value}
                  </span>
                </motion.div>
              ))}
            </div>

            <p className="mt-5 text-[0.75rem] leading-relaxed text-[#666666]">
              The intelligence core is ready to connect the signals that define
              your next demand outlook.
            </p>
          </motion.aside>
        </section>

        <section className="mx-auto mt-16 w-full max-w-[1400px] pb-20 lg:mt-20">
          <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-[#0A84FF]">
            Configure Forecast
          </p>

          <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em]">
            Enterprise Intelligence Sources
          </h2>

          <p className="mt-3 max-w-xl text-[0.95rem] leading-7 text-[#666666]">
            Configure the intelligence modules used by the INSIQ AI engine.
            Every module contributes to the final semiconductor demand forecast.
          </p>

          <div className="mt-10 space-y-5">
            {intelligenceModules.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-6 py-5 shadow-sm cursor-pointer hover:border-[#0A84FF]/20 hover:shadow-lg transition-all"
              >
                <div>
                  <h3 className="text-[1rem] font-semibold tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[0.85rem] text-[#666666]">{item.desc}</p>
                </div>

                <div className="text-right">
                  <div className="text-[0.82rem] font-medium text-[#0A84FF]">
                    {item.selected}
                  </div>
                  <div className="mt-2 text-xl text-[#999]">→</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}