"use client";

import { motion } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className,
  delay = 0,
  glow = false,
}: GlassCardProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      custom={delay}
      variants={fadeUp}
      whileHover={{
        y: -4,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className={cn(
        "group card-shine relative rounded-3xl p-6 sm:p-7",
        "border border-white/[0.06] bg-white/[0.03]",
        "backdrop-blur-[40px] backdrop-saturate-[180%]",
        "shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.03)]",
        "transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out",
        "hover:border-white/[0.12] hover:bg-white/[0.05]",
        "hover:shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_48px_rgba(0,113,227,0.06)]",
        glow && "hover:shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_60px_rgba(0,113,227,0.12)]",
        className
      )}
    >
      {/* Top edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
}
