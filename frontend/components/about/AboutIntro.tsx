"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Cpu, Sparkles } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

export default function AboutIntro() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(badgeRef, { once: true, margin: "-15%" });
  const reduceMotion = useReducedMotion();
  const [badgeCount, setBadgeCount] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    if (reduceMotion) {
      setBadgeCount("18+");
      return;
    }

    const steps = ["0", "6", "12", "18+"];
    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      if (step < steps.length) setBadgeCount(steps[step]);
      else window.clearInterval(interval);
    }, 380);

    return () => window.clearInterval(interval);
  }, [isInView, reduceMotion]);

  return (
    <section className="relative overflow-hidden border-b border-black/[0.07] py-24 sm:py-32 md:py-40">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-48 left-1/2 h-[42rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,120,255,0.11),rgba(232,240,252,0.38)_38%,transparent_70%)] blur-3xl" />
        <div className="absolute right-[-14rem] top-1/3 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(105,128,171,0.12),transparent_68%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/45 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.65, ease }}
          className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/85 px-3.5 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.035)] backdrop-blur-xl"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0078FF] shadow-[0_0_10px_rgba(0,120,255,0.75)]" />
          <span className="text-[0.625rem] font-semibold tracking-[0.18em] text-[#171717] uppercase">About INSIQ</span>
        </motion.div>

        <div className="mt-9 grid items-end gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <div className="lg:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="mb-5 text-[0.6875rem] font-semibold tracking-[0.18em] text-[#0078FF] uppercase"
            >
              Intelligent Semiconductor Quantification
            </motion.p>

            <h2 className="max-w-5xl text-[3.25rem] font-semibold leading-[0.98] tracking-[-0.055em] text-[#111111] sm:text-[4.4rem] md:text-[5.65rem] lg:text-[6.5rem] xl:text-[7.25rem]">
              <motion.span
                initial={{ opacity: 0, y: reduceMotion ? 0 : 32, filter: reduceMotion ? "none" : "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.85, delay: 0.12, ease }}
                className="block"
              >
                Know the market.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: reduceMotion ? 0 : 32, filter: reduceMotion ? "none" : "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.85, delay: 0.22, ease }}
                className="block bg-gradient-to-r from-[#111111] via-[#173666] to-[#0078FF] bg-clip-text text-transparent"
              >
                Shape what&apos;s next.
              </motion.span>
            </h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: reduceMotion ? 0 : 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.75, delay: 0.3, ease }}
            className="max-w-md text-[1.0625rem] leading-[1.7] tracking-[-0.012em] text-[#5d5d5d] sm:text-[1.125rem] lg:col-span-4 lg:pb-2"
          >
            INSIQ turns fragmented business, market, and manufacturing signals into the clarity semiconductor teams need to plan with confidence.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 border-t border-black/[0.08] pt-8 sm:mt-20 sm:pt-10 lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: 0.16, ease }}
            className="lg:col-span-7"
          >
            <p className="max-w-2xl text-[1.25rem] leading-[1.6] tracking-[-0.02em] text-[#262626] sm:text-[1.45rem]">
              <span className="font-semibold text-[#111111]">INSIQ</span> is an AI-powered decision-support platform for forecasting wafer demand before market shifts reach the production floor.
            </p>
            <p className="mt-5 max-w-2xl text-[0.975rem] leading-[1.75] text-[#6a6a6a] sm:text-[1.0625rem]">
              By connecting financial intelligence, technology trends, fab operations, and global market conditions, it gives teams a forward-looking view for capacity allocation, procurement, and long-term investment decisions.
            </p>
          </motion.div>

          <motion.div
            ref={badgeRef}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.75, delay: 0.28, ease }}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            className="group relative overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[#111111] p-6 text-white shadow-[0_20px_50px_rgba(17,17,17,0.16)] sm:p-7 lg:col-span-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(0,120,255,0.42),transparent_43%)] opacity-80" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

            <div className="relative flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-[#82bcff]">
                <Cpu size={21} strokeWidth={1.8} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[0.625rem] font-semibold tracking-[0.13em] text-white/85 uppercase">
                <Sparkles size={11} className="text-[#82bcff]" /> Live engine
              </span>
            </div>

            <div className="relative mt-10 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    key={badgeCount}
                    initial={reduceMotion ? false : { opacity: 0, y: -7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease }}
                    className="text-6xl font-semibold leading-none tracking-[-0.07em] sm:text-7xl"
                  >
                    {badgeCount}
                  </motion.span>
                  <span className="text-[0.6875rem] font-semibold tracking-[0.15em] text-[#82bcff] uppercase">signals</span>
                </div>
                <p className="mt-3 text-[0.9375rem] font-medium text-white">Connected intelligence streams</p>
              </div>
              <ArrowUpRight className="mb-1 shrink-0 text-white/45 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" size={21} />
            </div>

            <div className="relative mt-7 border-t border-white/10 pt-4 text-[0.75rem] leading-relaxed text-white/60">
              Financial, technology, supply-chain, and fab signals continuously contextualized for demand forecasting.
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
