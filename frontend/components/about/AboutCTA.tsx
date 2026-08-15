"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function AboutCTA() {
  return (
    <div className="relative pt-32 md:pt-44 text-center overflow-hidden">
      {/* ── Soft Ambient Radial Light ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none" aria-hidden="true">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="h-[500px] w-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.07)_0%,transparent_60%)] blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-4 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#0078FF]" />
          <span className="text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-[#111111]">
            THE FUTURE OF SEMICONDUCTOR PLANNING
          </span>
        </motion.div>

        {/* Large Keynote Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[3rem] font-semibold leading-[1.03] tracking-[-0.04em] text-[#111111] sm:text-[4.25rem] md:text-[5.25rem] lg:text-[6rem]"
        >
          Don&apos;t React.
          <br />
          <span className="bg-gradient-to-r from-[#0078FF] via-[#0055c4] to-[#111111] bg-clip-text text-transparent">
            Anticipate.
          </span>
        </motion.h2>

        {/* Subheading Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-8 max-w-2xl text-[1.125rem] leading-[1.8] font-normal text-[#555555] sm:text-[1.25rem]"
        >
          Predict tomorrow&apos;s semiconductor demand before the market does. INSIQ brings forecasting, semiconductor intelligence, and production planning together in one decision-support platform.
        </motion.p>

        {/* Large Premium Magnetic Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex justify-center"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              href="#parameters"
              className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-[#111111] px-10 text-[1rem] font-semibold tracking-tight text-white shadow-[0_10px_35px_rgba(0,0,0,0.18)] transition-all duration-300 hover:bg-black hover:shadow-[0_16px_50px_rgba(0,120,255,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0078FF]"
            >
              {/* Internal Glass Shimmer Sweep */}
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <Sparkles size={16} className="text-[#4DA3FF]" />
              <span>Explore the Intelligence Platform</span>
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
