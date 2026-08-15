"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import HeroBackground from "@/components/HeroBackground";
import SemiconductorWafer from "@/components/SemiconductorWafer";
import ScrollIndicator from "@/components/ScrollIndicator";

export default function HeroSection() {
  const headlineLines = [
    { text: "Predict", delay: 0.25 },
    { text: "Tomorrow's", delay: 0.4 },
    { text: "Semiconductor Demand.", delay: 0.55 },
  ];

  return (
    <section
      className="relative flex min-h-[100svh] min-h-screen w-full flex-col justify-between overflow-hidden bg-[#F7F7F5] pt-20 pb-6 sm:pt-24 sm:pb-8 md:pt-28 md:pb-10"
      aria-label="Hero Introduction"
    >
      {/* ── Apple Studio Lighting & Atmospheric Off-White Background ── */}
      <HeroBackground />

      {/* ── Main Hero Content Composition ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 sm:px-6 text-center">
        
        {/* Eyebrow / Product Label */}
        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-black/[0.03] px-3.5 py-1 backdrop-blur-md"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
          <span className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-[#666666]">
            Next-Gen Semiconductor Intelligence
          </span>
        </motion.div>

        {/* ── Headline: Editorial Three-Line Independent Staggered Animation ── */}
        <h1 className="flex flex-col items-center font-semibold tracking-[-0.036em] text-[#111111]">
          <span className="sr-only">
            Predict Tomorrow&apos;s Semiconductor Demand.
          </span>

          {headlineLines.map((line, index) => (
            <motion.span
              key={index}
              initial={{
                opacity: 0,
                y: 26,
                filter: "blur(8px)",
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                scale: 1,
              }}
              transition={{
                duration: 0.85,
                delay: line.delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              aria-hidden="true"
              className={`block text-[2.5rem] leading-[1.03] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.25rem] xl:text-[5.75rem] ${
                index === 2
                  ? "bg-gradient-to-r from-[#111111] via-[#1c1c1e] to-[#3a4454] bg-clip-text text-transparent"
                  : "text-[#111111]"
              }`}
            >
              {line.text}
            </motion.span>
          ))}
        </h1>

        {/* ── Subtitle ── */}
        <motion.p
          initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-4 max-w-[620px] text-[1rem] leading-relaxed font-normal text-[#666666] sm:text-[1.0625rem] md:mt-5 md:text-[1.125rem]"
        >
          Transform wafer planning into intelligent business decisions using AI-driven forecasting and semiconductor analytics.
        </motion.p>

        {/* ── CTA Action Buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-col items-center justify-center gap-3.5 sm:flex-row sm:gap-4 md:mt-7"
        >
          {/* Primary CTA: Start Prediction (Apple Dark Solid) */}
          <motion.div
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              href="/predict"
              className="group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#111111] px-7 text-[0.875rem] font-medium tracking-tight text-white shadow-[0_4px_14px_rgba(0,0,0,0.14)] transition-all duration-300 hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span>Start Prediction</span>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Secondary CTA: Watch Demo (Apple Frosted Light Glass) */}
          <motion.div
            whileHover={{ scale: 1.025 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              href="#workflow"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 text-[0.875rem] font-medium tracking-tight text-[#111111] backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:border-black/20 hover:bg-white hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            >
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-black/[0.06] transition-transform duration-300 group-hover:scale-110">
                <Play size={8} className="fill-[#111111] text-[#111111] ml-0.5" />
              </div>
              <span>Watch Demo</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Futuristic Dark Silicon Semiconductor Wafer Centerpiece ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 md:mt-8 w-full flex justify-center"
        >
          <SemiconductorWafer />
        </motion.div>
      </div>

      {/* ── Scroll Indicator ── */}
      <div className="relative z-10 mt-6 md:mt-8 w-full">
        <ScrollIndicator />
      </div>
    </section>
  );
}
