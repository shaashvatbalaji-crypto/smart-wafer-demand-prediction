"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface ParameterCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export default function ParameterCard({
  icon: Icon,
  title,
  description,
  index,
}: ParameterCardProps) {
  return (
    <GlassCard delay={index * 0.05} className="group h-full">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 text-accent shadow-[0_4px_16px_rgba(0,113,227,0.15)] transition-[background,box-shadow,transform] duration-300 group-hover:scale-[1.03] group-hover:from-accent/25 group-hover:to-accent/10 group-hover:shadow-[0_4px_24px_rgba(0,113,227,0.25)]">
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <h3 className="mb-2.5 text-[1.0625rem] font-semibold tracking-[-0.02em] text-white">
        {title}
      </h3>
      <p className="text-[0.875rem] leading-[1.65] text-muted">{description}</p>
    </GlassCard>
  );
}
