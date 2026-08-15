"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cpu, Activity, ShieldCheck, Zap } from "lucide-react";

function CounterItem({
  value,
  suffix = "",
  decimals = 0,
  label,
  sublabel,
  icon: Icon,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
  sublabel: string;
  icon: typeof Cpu;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1800; // ms
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
      }
    };

    const timeout = setTimeout(() => {
      requestAnimationFrame(update);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative flex flex-col justify-between rounded-3xl border border-black/[0.07] bg-white p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03),0_0_20px_rgba(0,120,255,0.02)] backdrop-blur-2xl transition-all duration-300 hover:border-[#0078FF]/30 hover:shadow-[0_16px_40px_rgba(0,120,255,0.08)]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F7F7F5] text-[#0078FF] transition-colors duration-300 group-hover:bg-[#0078FF] group-hover:text-white">
          <Icon size={18} strokeWidth={2} />
        </div>
        <span className="flex h-2 w-2 rounded-full bg-[#00C896] shadow-[0_0_6px_#00C896]" />
      </div>

      <div className="mt-5">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            {decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue)}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-[#0078FF]">
            {suffix}
          </span>
        </div>
        <h4 className="mt-1.5 text-sm font-semibold tracking-tight text-[#111111] group-hover:text-[#0078FF] transition-colors">
          {label}
        </h4>
        <p className="mt-1 text-[0.75rem] leading-relaxed text-[#666666]">
          {sublabel}
        </p>
      </div>
    </motion.div>
  );
}

export default function IntelligenceSnapshot() {
  const metrics = [
    {
      value: 18,
      suffix: "+",
      label: "Connected Streams",
      sublabel: "Multi-dimensional telemetry inputs",
      icon: Cpu,
      delay: 0,
    },
    {
      value: 150,
      suffix: "+",
      label: "Market & Fab Signals",
      sublabel: "Cross-correlated predictive factors",
      icon: Activity,
      delay: 0.1,
    },
    {
      value: 98.2,
      suffix: "%",
      decimals: 1,
      label: "Confidence Precision",
      sublabel: "Calibrated probabilistic scoring",
      icon: ShieldCheck,
      delay: 0.2,
    },
    {
      value: 24,
      suffix: "/7",
      label: "AI Decision Engine",
      sublabel: "Continuous real-time optimization",
      icon: Zap,
      delay: 0.3,
    },
  ];

  return (
    <div className="relative mb-20 md:mb-28">
      {/* Subtle top banner label */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#0078FF]">
          LIVE TELEMETRY SNAPSHOT
        </span>
        <div className="flex items-center gap-1.5 text-[0.75rem] font-medium text-[#666666]">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#00C896] animate-pulse" />
          <span>Active Forecast Pipeline</span>
        </div>
      </div>

      {/* 4-Item Metric Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <CounterItem
            key={m.label}
            value={m.value}
            suffix={m.suffix}
            decimals={m.decimals}
            label={m.label}
            sublabel={m.sublabel}
            icon={m.icon}
            delay={m.delay}
          />
        ))}
      </div>
    </div>
  );
}
