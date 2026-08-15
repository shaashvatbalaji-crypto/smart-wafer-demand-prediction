"use client";

import { motion } from "framer-motion";

export default function MissionStatement() {
  const words = [
    "Our",
    "mission",
    "is",
    "to",
    "eliminate",
    "uncertainty",
    "from",
    "semiconductor",
    "planning.",
  ];

  return (
    <div className="relative border-b border-black/[0.06] py-32 md:py-44 text-center overflow-hidden">
      {/* ── Soft Animated Background Glow ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" aria-hidden="true">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.55, 0.35],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="h-[500px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.08)_0%,rgba(77,163,255,0.03)_50%,transparent_70%)] blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#0078FF]" />
          <span className="text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-[#111111]">
            03 — OUR MISSION
          </span>
        </motion.div>

        {/* Large Keynote Editorial Statement with Word Stagger Reveal & Animated Underline */}
        <h2 className="text-[2.75rem] font-semibold leading-[1.06] tracking-[-0.04em] text-[#111111] sm:text-[3.75rem] md:text-[4.75rem] lg:text-[5.5rem] flex flex-wrap justify-center gap-x-3 sm:gap-x-4">
          {words.map((word, index) => {
            const isHighlight = word === "eliminate" || word === "uncertainty";
            return (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.75,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative ${
                  isHighlight
                    ? "bg-gradient-to-r from-[#0078FF] via-[#0055c4] to-[#111111] bg-clip-text text-transparent"
                    : "text-[#111111]"
                }`}
              >
                {word}
              </motion.span>
            );
          })}
        </h2>

        {/* Animated Glowing Underline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 h-1 w-32 rounded-full bg-gradient-to-r from-transparent via-[#0078FF] to-transparent shadow-[0_0_12px_#4DA3FF]"
        />

        {/* Supporting Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-2xl text-[1.125rem] leading-[1.8] font-normal text-[#555555] sm:text-[1.25rem]"
        >
          By combining advanced AI with real-world semiconductor market intelligence, INSIQ transforms complex business telemetry into meaningful insights that drive operational excellence.
        </motion.p>
      </div>
    </div>
  );
}
