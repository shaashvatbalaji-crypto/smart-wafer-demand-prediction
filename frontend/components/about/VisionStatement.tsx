"use client";

import { motion } from "framer-motion";

export default function VisionStatement() {
  const words = [
    "Building",
    "the",
    "Intelligence",
    "Layer",
    "for",
    "the",
    "Global",
    "Semiconductor",
    "Industry.",
  ];

  return (
    <div className="relative border-b border-black/[0.06] py-32 md:py-48 text-center overflow-hidden">
      {/* Soft atmospheric radial bloom */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" aria-hidden="true">
        <div className="h-[500px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,120,255,0.05)_0%,rgba(77,163,255,0.02)_40%,transparent_70%)] blur-[100px]" />
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
            09 — OUR VISION
          </span>
        </motion.div>

        {/* Huge Keynote Typography with Word Stagger Reveal */}
        <h2 className="text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.04em] text-[#111111] sm:text-[3.75rem] md:text-[4.75rem] lg:text-[5.5rem] flex flex-wrap justify-center gap-x-3 sm:gap-x-4">
          {words.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.75,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={
                word === "Intelligence" || word === "Semiconductor"
                  ? "bg-gradient-to-r from-[#111111] via-[#0055c4] to-[#0078FF] bg-clip-text text-transparent"
                  : "text-[#111111]"
              }
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-2xl text-[1.125rem] leading-[1.8] font-normal text-[#555555] sm:text-[1.25rem]"
        >
          To become a comprehensive AI-powered semiconductor business intelligence platform that enables organizations worldwide to make faster, smarter, and more profitable manufacturing decisions.
        </motion.p>
      </div>
    </div>
  );
}
