"use client";

import { motion } from "framer-motion";

export default function FloatingGlow() {
  const orbs = [
    { top: "5%", left: "10%", size: 600, color: "rgba(0,113,227,0.12)", delay: 0 },
    { top: "40%", right: "5%", size: 500, color: "rgba(191,90,242,0.1)", delay: 2 },
    { bottom: "10%", left: "30%", size: 700, color: "rgba(0,113,227,0.08)", delay: 4 },
    { top: "60%", left: "60%", size: 400, color: "rgba(48,209,88,0.06)", delay: 1 },
    { top: "20%", right: "25%", size: 350, color: "rgba(255,159,10,0.05)", delay: 3 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[120px] ${i % 2 === 0 ? "glow-orb" : "glow-orb-delayed"}`}
          style={{
            top: orb.top,
            left: orb.left,
            right: orb.right,
            bottom: orb.bottom,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            animationDelay: `${orb.delay}s`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
