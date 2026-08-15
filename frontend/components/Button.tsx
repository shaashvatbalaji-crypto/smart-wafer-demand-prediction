"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  href,
  variant = "primary",
  children,
  className,
}: ButtonProps) {
  if (variant === "primary") {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Link
          href={href}
          className={cn(
            "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-9 py-4 text-[0.9375rem] font-medium tracking-[-0.01em] text-white",
            "bg-accent shadow-[0_4px_20px_rgba(0,113,227,0.35)]",
            "transition-[background-color,box-shadow,transform] duration-300 ease-out",
            "hover:bg-accent-hover hover:shadow-[0_8px_32px_rgba(0,113,227,0.5)]",
            className
          )}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative">{children}</span>
        </Link>
      </motion.div>
    );
  }

  if (variant === "secondary") {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <Link
          href={href}
          className={cn(
            "group relative inline-flex items-center justify-center overflow-hidden rounded-full px-9 py-4 text-[0.9375rem] font-medium tracking-[-0.01em] text-white",
            "border border-white/20 bg-white/[0.06] backdrop-blur-2xl",
            "shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
            "transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out",
            "hover:border-white/30 hover:bg-white/[0.1] hover:shadow-[0_8px_32px_rgba(255,255,255,0.06)]",
            className
          )}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative">{children}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400 }}>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 text-[0.9375rem] font-medium text-accent transition-colors hover:text-white",
          className
        )}
      >
        {children}
        <span aria-hidden="true">→</span>
      </Link>
    </motion.div>
  );
}
