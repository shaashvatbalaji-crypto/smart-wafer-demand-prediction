"use client";

import { motion } from "framer-motion";

export default function WaferBackground() {
  const gridSize = 12;
  const dies = Array.from({ length: gridSize * gridSize }, (_, i) => i);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Hero ambient glow */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute h-[700px] w-[700px] rounded-full bg-accent/[0.07] blur-[150px]"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute h-[500px] w-[500px] translate-x-32 translate-y-16 rounded-full bg-accent-secondary/[0.06] blur-[120px]"
      />

      {/* Wafer disc */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="relative opacity-90"
      >
        <div className="relative h-[380px] w-[380px] rounded-full md:h-[520px] md:w-[520px] lg:h-[600px] lg:w-[600px]">
          {/* Outer glow ring */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -inset-4 rounded-full bg-gradient-to-br from-accent/20 via-transparent to-accent-secondary/15 blur-xl"
          />

          {/* Wafer body */}
          <div className="absolute inset-[2px] overflow-hidden rounded-full border border-white/[0.08] bg-gradient-to-br from-zinc-900/60 via-zinc-950/80 to-black/90 shadow-[0_0_80px_rgba(0,113,227,0.15),0_0_120px_rgba(0,0,0,0.8)] backdrop-blur-md">
            {/* Die grid */}
            <div className="absolute inset-[8%] grid grid-cols-12 grid-rows-12 gap-[2px] rounded-full p-2">
              {dies.map((die) => (
                <motion.div
                  key={die}
                  animate={{ opacity: [0.1, 0.35, 0.1] }}
                  transition={{
                    duration: 3 + (die % 5),
                    repeat: Infinity,
                    delay: die * 0.04,
                  }}
                  className="rounded-[2px] bg-gradient-to-br from-accent/25 to-accent-secondary/15"
                />
              ))}
            </div>

            {/* Notch */}
            <div className="absolute top-[4%] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black/70 ring-1 ring-white/15" />
          </div>

          {/* Scan line */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(0,113,227,0.12) 25deg, transparent 50deg)",
            }}
          />
        </div>
      </motion.div>

      {/* Floating light particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            x: [0, i % 2 === 0 ? 15 : -15, 0],
            opacity: [0.15, 0.5, 0.15],
          }}
          transition={{
            duration: 5 + i * 0.7,
            repeat: Infinity,
            delay: i * 0.6,
          }}
          className="absolute rounded-full bg-accent"
          style={{
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            top: `${15 + i * 10}%`,
            left: `${8 + i * 11}%`,
            boxShadow: "0 0 8px rgba(0,113,227,0.6)",
          }}
        />
      ))}
    </div>
  );
}
