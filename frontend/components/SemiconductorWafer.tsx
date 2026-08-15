"use client";

import { useEffect, useRef, useState, useId } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function SemiconductorWafer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Generate unique IDs for SVG gradients and filters
  const id = useId().replace(/:/g, "");

  // Mouse tilt motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 150, mass: 0.7 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D perspective tilts derived from mouse offset
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const sheenTranslateX = useTransform(smoothX, [-0.5, 0.5], [-35, 35]);
  const sheenTranslateY = useTransform(smoothY, [-0.5, 0.5], [-25, 25]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  // Grid configuration for 14x14 photolithographic die matrix
  const GRID_SIZE = 14;
  const dies = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const col = i % GRID_SIZE;
    const row = Math.floor(i / GRID_SIZE);
    const dx = (col - (GRID_SIZE - 1) / 2) / ((GRID_SIZE - 1) / 2);
    const dy = (row - (GRID_SIZE - 1) / 2) / ((GRID_SIZE - 1) / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isInside = dist <= 0.94;
    const isCore = dist < 0.45;
    const isAccelerated = isCore && (col + row) % 3 === 0;
    const isMemory = !isCore && dist < 0.8;
    return { id: i, col, row, isInside, isCore, isAccelerated, isMemory, dist };
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center select-none"
      style={{ perspective: 1100 }}
    >
      {/* ── Soft Studio Contact Shadow & Ambient Rim Lighting ── */}
      <motion.div
        animate={
          reducedMotion
            ? {}
            : {
                scale: [1, 1.04, 1],
                opacity: [0.35, 0.45, 0.35],
              }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.14)_0%,rgba(0,113,227,0.06)_40%,transparent_70%)] blur-[40px]"
      />

      {/* ── 3D Interactive Spring Container ── */}
      <motion.div
        style={{
          rotateX: reducedMotion ? 0 : rotateX,
          rotateY: reducedMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={
          reducedMotion
            ? {}
            : {
                y: [0, -8, 0],
              }
        }
        transition={{
          y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative flex items-center justify-center"
      >
        {/* ── Orbital Analysis Rings (Light Theme: delicate graphite & subtle blue-gray) ── */}
        <div className="pointer-events-none absolute inset-[-55px] sm:inset-[-70px] md:inset-[-85px] lg:inset-[-100px] flex items-center justify-center">
          {/* Ring 1: Defect & Yield Boundary Ring */}
          <motion.div
            animate={reducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-black/[0.12]"
          >
            {/* Tracking marker node */}
            <div className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#0071e3] shadow-[0_0_6px_#0071e3]" />
          </motion.div>

          {/* Ring 2: Counter-rotating Forecasting Orbit */}
          <motion.div
            animate={reducedMotion ? {} : { rotate: -360 }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[20px] sm:inset-[28px] md:inset-[34px] rounded-full border border-dotted border-[#0071e3]/20"
          >
            <div className="absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#0071e3] opacity-80" />
            <div className="absolute top-1/2 -left-1 h-1 w-1 -translate-y-1/2 rounded-full bg-[#111111] opacity-50" />
          </motion.div>

          {/* Ring 3: Precision Scan Ring */}
          <motion.div
            animate={reducedMotion ? {} : { rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[40px] sm:inset-[54px] md:inset-[65px] rounded-full border border-black/[0.08]"
          >
            <div className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-black/60" />
          </motion.div>
        </div>

        {/* ── Main Dark Silicon Semiconductor Wafer Body (High contrast against light canvas) ── */}
        <motion.div
          animate={
            reducedMotion
              ? {}
              : {
                  rotate: 360,
                }
          }
          transition={{
            rotate: { duration: 150, repeat: Infinity, ease: "linear" },
          }}
          className="relative h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] md:h-[360px] md:w-[360px] lg:h-[400px] lg:w-[400px] xl:h-[430px] xl:w-[430px] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.18),0_4px_16px_rgba(0,0,0,0.08)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Outer Wafer Chamfer & Bevel Rim (Engineered metallic finish) */}
          <div className="absolute -inset-[2.5px] rounded-full border border-black/30 bg-gradient-to-tr from-[#111622] via-[#283244] to-[#151c2c] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.15)]" />

          {/* Silicon Substrate Base */}
          <div className="absolute inset-0 overflow-hidden rounded-full border border-white/10 bg-[#080d16] shadow-[inset_0_0_40px_rgba(0,0,0,0.95)]">
            
            {/* SVG Silicon Circuit Architecture & Die Interconnects */}
            <svg
              className="absolute inset-0 h-full w-full opacity-95"
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Silicon Metallic Radial Gradient */}
                <radialGradient id={`siliconGrad-${id}`} cx="45%" cy="38%" r="62%">
                  <stop offset="0%" stopColor="#162238" />
                  <stop offset="40%" stopColor="#0e1726" />
                  <stop offset="75%" stopColor="#070b13" />
                  <stop offset="100%" stopColor="#030509" />
                </radialGradient>

                {/* Active Die Gradient */}
                <linearGradient id={`dieActive-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.25" />
                </linearGradient>

                {/* Memory Die Gradient */}
                <linearGradient id={`dieMemory-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity="0.15" />
                </linearGradient>

                {/* Standard Die Gradient */}
                <linearGradient id={`dieStandard-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Silicon Mirror Backing */}
              <circle cx="250" cy="250" r="248" fill={`url(#siliconGrad-${id})`} />

              {/* Micro-Die Photolithographic Matrix */}
              <g className="die-grid">
                {dies.map((die) => {
                  if (!die.isInside) return null;
                  const size = 30;
                  const gap = 3;
                  const x = 36 + die.col * (size + gap);
                  const y = 36 + die.row * (size + gap);

                  let fill = `url(#dieStandard-${id})`;
                  let strokeColor = "rgba(255, 255, 255, 0.07)";

                  if (die.isAccelerated) {
                    fill = `url(#dieActive-${id})`;
                    strokeColor = "rgba(56, 189, 248, 0.4)";
                  } else if (die.isMemory) {
                    fill = `url(#dieMemory-${id})`;
                    strokeColor = "rgba(129, 140, 248, 0.25)";
                  }

                  return (
                    <g key={die.id}>
                      <rect
                        x={x}
                        y={y}
                        width={size}
                        height={size}
                        rx="2"
                        fill={fill}
                        stroke={strokeColor}
                        strokeWidth="0.75"
                      />
                      {/* Internal Die Circuitry */}
                      {die.isCore && (
                        <>
                          <rect
                            x={x + 4}
                            y={y + 4}
                            width={size - 8}
                            height={size - 8}
                            rx="1"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.12)"
                            strokeWidth="0.5"
                          />
                          <circle
                            cx={x + size / 2}
                            cy={y + size / 2}
                            r="1.8"
                            fill={die.isAccelerated ? "#38bdf8" : "#0071e3"}
                            opacity={0.85}
                          />
                        </>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Dicing Streets / Scribe Grid Lines */}
              <g stroke="rgba(255, 255, 255, 0.06)" strokeWidth="0.6">
                {Array.from({ length: 15 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={36 + i * 33}
                    y1="10"
                    x2={36 + i * 33}
                    y2="490"
                    strokeDasharray="2 6"
                  />
                ))}
                {Array.from({ length: 15 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="10"
                    y1={36 + i * 33}
                    x2="490"
                    y2={36 + i * 33}
                    strokeDasharray="2 6"
                  />
                ))}
              </g>

              {/* Geometric Bus Interconnect Traces */}
              <g fill="none" stroke="rgba(0, 113, 227, 0.35)" strokeWidth="1.1">
                <path d="M 120 250 H 380 M 250 120 V 380" />
                <path d="M 170 170 L 330 330 M 330 170 L 170 330" opacity="0.35" />
                <circle cx="250" cy="250" r="45" stroke="#38bdf8" strokeWidth="0.9" strokeDasharray="3 4" opacity="0.55" />
                <circle cx="250" cy="250" r="110" stroke="#818cf8" strokeWidth="0.75" strokeDasharray="4 6" opacity="0.35" />
                <circle cx="250" cy="250" r="185" stroke="#0071e3" strokeWidth="0.7" opacity="0.25" />
              </g>

              {/* Wafer Alignment Notch at 12 O'Clock */}
              <path
                d="M 244 2 Q 250 10 256 2"
                fill="#000000"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.5"
              />
            </svg>

            {/* Specular Light Reflection */}
            <motion.div
              style={{
                x: reducedMotion ? 0 : sheenTranslateX,
                y: reducedMotion ? 0 : sheenTranslateY,
              }}
              className="pointer-events-none absolute inset-[-50%] bg-[linear-gradient(115deg,transparent_38%,rgba(255,255,255,0.10)_48%,rgba(0,242,254,0.12)_50%,rgba(129,140,248,0.10)_52%,transparent_62%)] mix-blend-screen opacity-65"
            />

            {/* Realtime 360-degree Conic Radar Inspection Scan */}
            {!reducedMotion && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 113, 227, 0.12) 35deg, rgba(56, 189, 248, 0.2) 45deg, transparent 48deg)",
                }}
              />
            )}

            {/* Inner Edge Bevel Shadow */}
            <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.25)]" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
