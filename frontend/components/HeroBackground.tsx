"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function HeroBackground() {
  const [canHover, setCanHover] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Mouse position motion values for smooth 60fps tracking
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { damping: 32, stiffness: 160, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const finePointerQuery = window.matchMedia("(pointer: fine) and (hover: hover)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setCanHover(finePointerQuery.matches);
    setPrefersReducedMotion(reducedMotionQuery.matches);

    const handlePointerChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);

    finePointerQuery.addEventListener("change", handlePointerChange);
    reducedMotionQuery.addEventListener("change", handleMotionChange);

    const handleMouseMove = (e: MouseEvent) => {
      if (!finePointerQuery.matches) return;
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      finePointerQuery.removeEventListener("change", handlePointerChange);
      reducedMotionQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none bg-[#F7F7F5]" aria-hidden="true">
      {/* 1. Subtle Apple-Style Studio Gradient Canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,#ffffff_0%,#F7F7F5_60%,#ECECE8_100%)]" />

      {/* 2. Extremely Subtle Atmospheric Lighting Fields (Restrained, low opacity) */}
      {!prefersReducedMotion ? (
        <>
          {/* Top-center pale blue illumination */}
          <motion.div
            animate={{
              opacity: [0.35, 0.5, 0.35],
              scale: [1, 1.05, 1],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#e0ecfc]/60 via-[#eef5fc]/30 to-transparent blur-[120px]"
          />

          {/* Right faint violet hue */}
          <motion.div
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1.04, 0.96, 1.04],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-1/4 -right-20 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-[#f0e8fa]/50 via-[#f5effd]/20 to-transparent blur-[130px]"
          />

          {/* Left subtle cool-gray atmospheric field */}
          <motion.div
            animate={{
              opacity: [0.25, 0.4, 0.25],
              scale: [0.96, 1.04, 0.96],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 16,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute top-1/3 -left-20 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-[#e5ecf6]/40 via-[#f0f4f9]/20 to-transparent blur-[120px]"
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(0,113,227,0.04),transparent_70%)]" />
      )}

      {/* 3. Mouse-reactive Soft Light Aura (Light Theme: very soft cool gray-blue) */}
      {canHover && !prefersReducedMotion && (
        <motion.div
          style={{
            x: smoothX,
            y: smoothY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          className="absolute h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,113,227,0.06)_0%,rgba(100,116,139,0.03)_45%,transparent_70%)] blur-[100px]"
        />
      )}

      {/* 4. Tactile Micro-Noise Texture Layer (Ultra-subtle 1.8% opacity) */}
      <div
        className="absolute inset-0 opacity-[0.022] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* 5. Bottom seamless transition */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent opacity-0" />
    </div>
  );
}
