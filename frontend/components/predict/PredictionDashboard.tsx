"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Factory,
  Globe,
  Cpu,
  TrendingUp,
  DollarSign,
} from "lucide-react";

const intelligence = [
  {
    title: "Financial Intelligence",
    desc: "Revenue, operating margin, R&D investment, CapEx and profitability trends.",
    icon: DollarSign,
  },
  {
    title: "Manufacturing",
    desc: "Fab capacity, utilization, wafer yield and production efficiency.",
    icon: Factory,
  },
  {
    title: "Technology",
    desc: "Technology node migration, AI adoption and innovation roadmap.",
    icon: Cpu,
  },
  {
    title: "Market Intelligence",
    desc: "Demand cycles, semiconductor index and consumer market growth.",
    icon: TrendingUp,
  },
  {
    title: "Supply Chain",
    desc: "Inventory, logistics, lead time and raw material availability.",
    icon: BarChart3,
  },
  {
    title: "Macroeconomics",
    desc: "GDP, inflation, exchange rates and geopolitical indicators.",
    icon: Globe,
  },
];

const outcomes = [
  {
    title: "Demand Forecast",
    value: "Quarterly & Annual",
    desc: "Accurate wafer demand predictions with AI confidence intervals.",
  },
  {
    title: "Risk Assessment",
    value: "Supply Chain",
    desc: "Identify geopolitical, logistics and inventory risks before they occur.",
  },
  {
    title: "Capacity Planning",
    value: "Production Ready",
    desc: "Optimize fab utilization and production planning using AI insights.",
  },
  {
    title: "Executive Insights",
    value: "AI Powered",
    desc: "Natural-language explanations highlighting the key demand drivers.",
  },
];

const trustStats = [
  {
    number: "18+",
    title: "Enterprise Signals",
    desc: "Financial, manufacturing, market and technology indicators",
  },
  {
    number: "92%",
    title: "Prediction Confidence",
    desc: "High-confidence AI forecasting for business planning",
  },
  {
    number: "AI",
    title: "CatBoost Engine",
    desc: "Machine learning model trained on semiconductor data",
  },
  {
    number: "24/7",
    title: "Decision Support",
    desc: "Always available for planning and executive insights",
  },
];

export default function PredictionDashboard() {
  return (
    <section className="mx-auto mt-28 max-w-7xl px-6">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
          Enterprise Intelligence
        </p>

        <h2 className="mt-5 text-5xl font-bold tracking-tight">
          <span className="text-[#111827]">What Our AI</span>{" "}
          <span className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#93C5FD] bg-clip-text text-transparent">
            Understands
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-500">
          Before predicting semiconductor wafer demand, INSIQ combines
          financial, manufacturing, technology, supply-chain and market
          intelligence into one enterprise AI engine.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {intelligence.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group rounded-[32px] border border-gray-200 bg-white/80 p-8 backdrop-blur-xl shadow-sm transition-all duration-500 hover:border-blue-300 hover:shadow-2xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white">
                <Icon size={30} />
              </div>

              <h3 className="mt-8 text-2xl font-semibold text-gray-900">
                {item.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-500">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ================================================= */}
      {/* BUSINESS OUTCOMES */}
      {/* ================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-36"
      >
        <p className="text-center text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
          Business Outcomes
        </p>

        <h2 className="mt-5 text-center text-5xl font-bold tracking-tight">
          <span className="text-[#111827]">What You&apos;ll</span>{" "}
          <span className="bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#BFDBFE] bg-clip-text text-transparent">
            Receive
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-gray-500">
          INSIQ doesn&apos;t simply predict numbers—it delivers actionable
          intelligence that helps executives make smarter manufacturing,
          procurement and investment decisions.
        </p>

        <div className="mt-20 grid gap-8 md:grid-cols-2">
          {outcomes.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="rounded-[32px] border border-gray-200 bg-gradient-to-br from-white to-blue-50/40 p-8 shadow-sm transition-all duration-500 hover:border-blue-300 hover:shadow-2xl"
            >
              <p className="text-sm uppercase tracking-[0.25em] text-blue-600 font-semibold">
                {card.value}
              </p>

              <h3 className="mt-4 text-3xl font-bold text-gray-900">
                {card.title}
              </h3>

              <p className="mt-5 leading-8 text-gray-500">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ================================================= */}
      {/* WHY ENTERPRISES TRUST INSIQ */}
      {/* ================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mt-36"
      >
        <p className="text-center text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
          Enterprise Confidence
        </p>

        <h2 className="mt-5 text-center text-5xl font-bold tracking-tight">
          <span className="text-[#111827]">Why Enterprises Trust</span>{" "}
          <span className="bg-gradient-to-r from-[#1D4ED8] via-[#3B82F6] to-[#BFDBFE] bg-clip-text text-transparent">
            INSIQ
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-center text-lg leading-8 text-gray-500">
          Designed for semiconductor manufacturers, foundries and supply-chain
          planners who require explainable, reliable and enterprise-ready AI
          forecasting.
        </p>

        <div className="mt-20 grid gap-8 md:grid-cols-4">
          {trustStats.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.7 }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="relative overflow-hidden rounded-[30px] border border-gray-200 bg-white p-8 shadow-sm transition-all duration-500 hover:border-blue-300 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />

              <p className="relative text-6xl font-bold bg-gradient-to-r from-[#2563EB] to-[#60A5FA] bg-clip-text text-transparent">
                {item.number}
              </p>

              <h3 className="relative mt-5 text-xl font-semibold text-gray-900">
                {item.title}
              </h3>

              <p className="relative mt-4 leading-7 text-gray-500">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ================================================= */}
      {/* CTA */}
      {/* ================================================= */}
      <div className="mt-20 flex justify-center pb-28">
        <Link
          href="/predict/company"
          className="rounded-full bg-[#2563EB] px-8 py-4 text-white font-semibold hover:bg-blue-700 transition-all duration-300"
        >
          Predict Your Company
        </Link>
      </div>
    </section>
  );
}