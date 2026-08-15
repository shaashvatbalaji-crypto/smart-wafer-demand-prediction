"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const metrics = [
  { value: "18+", label: "Enterprise Signals" },
  { value: "AI", label: "Prediction Engine" },
  { value: "Live", label: "Enterprise Analytics" },
];

export default function PredictHero() {
  return (
    <section className="workspace hero-space hero-full relative overflow-hidden">
      {/* Background */}
      <div className="hero-grid" />
      <div className="hero-glow" />

      <div className="relative z-10">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16 flex items-center justify-between"
        >
          <Link href="/" className="badge hover:scale-105 transition-all duration-300">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="badge enterprise-badge">
            <span className="status-dot" />
            Enterprise Workspace
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid items-center gap-20 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT COLUMN */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="eyebrow"
            >
              INSIQ Intelligence Platform
            </motion.div>

            <motion.h1
              className="hero-title mt-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              Forecast
              <br />
              Tomorrow's
              <br />
              <span className="hero-gradient">Demand.</span>
            </motion.h1>

            <motion.p
              className="hero-body"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
            >
              Configure financial, manufacturing,
              technology and geopolitical signals.
              <br />
              <br />
              Generate enterprise-grade wafer demand
              forecasts powered by explainable AI.
            </motion.p>

            {/* Metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-16 grid grid-cols-3 gap-8"
            >
              {metrics.map((item) => (
                <div key={item.label}>
                  <h3 className="metric-value">{item.value}</h3>
                  <p className="metric-label">{item.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-16"
            >
              <button className="primary-button">
                Generate Forecast
                <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Background Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute h-[560px] w-[560px] rounded-full border border-gray-200/70"
            />

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
              className="absolute h-[430px] w-[430px] rounded-full border border-gray-200/70"
            />

            {/* Connection Lines */}
            <div className="absolute h-[340px] w-[340px] rounded-full border border-dashed border-blue-100 opacity-60" />

            {/* Center Core */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="surface flex h-48 w-48 flex-col items-center justify-center rounded-full text-center"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Core</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">INSIQ</h2>
              <p className="mt-2 text-sm text-gray-500">Intelligence Engine</p>
            </motion.div>

            {/* Floating Nodes */}
            {[
              { title: "Financial", top: "6%", left: "42%" },
              { title: "Manufacturing", top: "28%", left: "82%" },
              { title: "Technology", top: "72%", left: "72%" },
              { title: "Supply Chain", top: "82%", left: "18%" },
              { title: "Market", top: "28%", left: "-2%" },
              { title: "AI", top: "58%", left: "0%" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                transition={{
                  delay: 0.6 + index * 0.08,
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ top: item.top, left: item.left }}
                className="absolute"
              >
                <div className="surface rounded-full px-5 py-3 text-sm font-medium shadow-sm">
                  {item.title}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}