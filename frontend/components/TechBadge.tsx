"use client";

import { motion } from "framer-motion";
import { scaleIn, viewportOnce } from "@/lib/animations";

interface TechBadgeProps {
  name: string;
  category: string;
  color: string;
  index: number;
}

export default function TechBadge({
  name,
  category,
  color,
  index,
}: TechBadgeProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      custom={index * 0.08}
      variants={scaleIn}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className="group flex flex-col items-center gap-4 rounded-3xl border border-white/[0.06] bg-white/[0.03] px-5 py-7 backdrop-blur-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out hover:border-white/[0.12] hover:bg-white/[0.05] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_40px_rgba(0,113,227,0.06)]"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold transition-transform duration-500 group-hover:scale-110"
        style={{
          background: `${color}15`,
          color,
          boxShadow: `0 4px 20px ${color}20`,
        }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div className="text-center">
        <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-white">
          {name}
        </p>
        <p className="mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-muted-light">
          {category}
        </p>
      </div>
    </motion.div>
  );
}
