"use client";

import { motion, type Variants } from "framer-motion";
import { fadeUp, viewportOnce } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      custom={delay}
      variants={variants}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
