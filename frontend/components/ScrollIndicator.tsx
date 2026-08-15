"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-2 select-none"
    >
      <Link
        href="#about"
        className="group flex flex-col items-center gap-2 text-center transition-opacity hover:opacity-100"
        aria-label="Scroll to explore next section"
      >
        <span className="text-[0.6875rem] font-medium tracking-[0.2em] text-[#666666] uppercase transition-colors duration-200 group-hover:text-[#111111]">
          Scroll to Explore
        </span>

        <div className="relative flex h-7 w-3.5 items-start justify-center rounded-full border border-black/20 p-0.5 backdrop-blur-sm transition-colors group-hover:border-black/40">
          <motion.div
            animate={{
              y: [0, 8, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-1.5 w-1 rounded-full bg-[#111111]"
          />
        </div>
      </Link>
    </motion.div>
  );
}
