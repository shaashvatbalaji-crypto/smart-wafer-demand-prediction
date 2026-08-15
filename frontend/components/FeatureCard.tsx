"use client";

import { type LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: FeatureCardProps) {
  return (
    <GlassCard delay={index * 0.07} glow className="group">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 via-accent/10 to-accent-secondary/15 text-accent shadow-[0_8px_24px_rgba(0,113,227,0.12)] transition-[box-shadow,transform] duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_8px_32px_rgba(0,113,227,0.22)]">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3 className="mb-2.5 text-xl font-semibold tracking-[-0.025em] text-white">
        {title}
      </h3>
      <p className="text-[0.9375rem] leading-[1.65] text-muted">{description}</p>
    </GlassCard>
  );
}
