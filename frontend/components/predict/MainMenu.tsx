"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Factory,
  Rocket,
  LayoutDashboard,
  History,
  GitCompare,
  Search,
  Trash2,
  LogOut,
  ChevronRight,
  CircleDot,
  Activity,
} from "lucide-react";

/* ---------------- menu config ---------------- */

const menuSections = [
  {
    section: "Prediction",
    items: [
      {
        id: 1,
        label: "Existing Company Prediction",
        description:
          "Forecast wafer demand for a company already in coverage.",
        icon: Factory,
        href: "/predict/company",
        shortcut: "1",
      },
      {
        id: 2,
        label: "Startup Company Prediction",
        description:
          "Model demand for a new or pre-revenue fab / fabless entrant.",
        icon: Rocket,
        href: "/predict/startup/input",
        shortcut: "2",
      },
    ],
  },
  {
    section: "Analysis",
    items: [
      {
        id: 3,
        label: "Company Dashboard",
        description:
          "Screen the full coverage universe and drill into drivers.",
        icon: LayoutDashboard,
        href: "/predict/dashboard",
        shortcut: "3",
      },
      {
        id: 5,
        label: "Compare Predictions",
        description:
          "Set two or more forecasts side by side.",
        icon: GitCompare,
        href: "/predict/compare",
        shortcut: "5",
      },
      {
        id: 6,
        label: "Search Company",
        description:
          "Jump straight to a company by name or ticker.",
        icon: Search,
        href: "/predict/search",
        shortcut: "6",
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        id: 4,
        label: "Prediction History",
        description:
          "Review past forecasts, confidence, and model accuracy.",
        icon: History,
        href: "/predict/history",
        shortcut: "4",
      },
      {
        id: 7,
        label: "Delete Prediction",
        description:
          "Remove a saved forecast from your desk.",
        icon: Trash2,
        href: "/predict/delete",
        shortcut: "7",
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        id: 8,
        label: "Exit",
        description: "Close the session.",
        icon: LogOut,
        href: "/exit",
        shortcut: "Esc",
      },
    ],
  },
] as const;

const workspaceStats = [
  { label: "Companies covered", value: "8" },
  { label: "Forecasts generated", value: "1,204" },
  { label: "Average confidence", value: "84.5%" },
  { label: "Model version", value: "v2.3.1" },
  { label: "Database updated", value: "12 min ago" },
] as const;

const recentActivity = [
  { label: "TSM forecast refreshed", time: "12m ago" },
  { label: "New note added to INTC", time: "48m ago" },
  { label: "MU flagged for review", time: "1h ago" },
] as const;

export default function MainMenu() {
  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#1A1A1A]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-8 py-16">
        <div className="mx-auto max-w-[1100px] text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-sm font-semibold uppercase tracking-[0.45em] text-[#2563EB]"
          >
            INSIQ ANALYST DESK
          </motion.p>

          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-[-0.06em] md:text-8xl">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                delay: 0.1,
              }}
              className="block"
            >
              <span className="text-[#111]">
                Forecasting{" "}
              </span>

              <span className="bg-gradient-to-r from-[#2C4E9E] via-[#5D8FF5] to-[#B7D3FF] bg-clip-text text-transparent">
                Desk
              </span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: 0.3,
            }}
            className="mt-8 max-w-3xl text-xl leading-9 text-[#6B7280]"
          >
            Turn financial performance, manufacturing metrics, and market
            dynamics into actionable semiconductor demand intelligence.
          </motion.p>
        </div>
      </div>

      {/* Main Menu Area */}
      <div className="mx-auto max-w-[1100px] px-8 py-10">
        <div className="grid grid-cols-1 rounded-lg border border-gray-200 bg-white lg:grid-cols-[1fr_300px]">

          {/* Menu column */}
          <div className="lg:border-r lg:border-gray-200">
            <div className="border-b border-gray-200 px-5 py-4">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
                className="text-[28px] font-bold tracking-[-0.02em] text-gray-900"
              >
                Main menu
              </motion.h2>
            </div>

            <MenuColumn />
          </div>

          {/* Workspace status */}
          <div className="flex flex-col">
            <div className="border-b border-gray-200 px-5 py-3">
              <h2 className="text-[13px] font-semibold text-gray-800">
                Workspace status
              </h2>
            </div>

            <div className="px-5 py-4">
              <ul>
                {workspaceStats.map((stat, idx) => (
                  <li
                    key={stat.label}
                    className={`flex items-center justify-between py-2 text-[12.5px] ${
                      idx !== workspaceStats.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <span className="text-gray-500">
                      {stat.label}
                    </span>

                    <span className="font-medium tabular-nums text-gray-900">
                      {stat.value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                <CircleDot
                  size={12}
                  className="shrink-0 text-emerald-600"
                />

                <span className="text-[12px] font-medium text-emerald-700">
                  System status: All models operational
                </span>
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-auto border-t border-gray-100 px-5 py-4">
              <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                <Activity size={12} />
                Recent activity
              </p>

              <ul className="mt-2.5 space-y-2.5">
                {recentActivity.map((a) => (
                  <li
                    key={a.label}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="text-[12px] text-gray-700">
                      {a.label}
                    </span>

                    <span className="shrink-0 text-[11px] text-gray-400">
                      {a.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11.5px] text-gray-400">
          Select an option above to continue
        </p>
      </div>
    </main>
  );
}

/* ---------------- menu column ---------------- */

const MotionLink = motion(Link);

function MenuColumn() {
  const [selectedId, setSelectedId] = useState<number | null>(
    null
  );

  let rowIndex = 0;

  return (
    <div className="pb-2">
      {menuSections.map((group, groupIdx) => (
        <div key={group.section}>
          <div
            className={`px-5 ${
              groupIdx === 0 ? "pt-4" : "pt-5"
            } pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-gray-400`}
          >
            {group.section}
          </div>

          <ul>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isExit = item.id === 8;
              const isSelected =
                selectedId === item.id;

              const currentIndex = rowIndex++;

              return (
                <motion.li
                  key={item.id}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.35,
                    ease: "easeOut",
                    delay: currentIndex * 0.04,
                  }}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <MotionLink
                    href={item.href}
                    onClick={() =>
                      setSelectedId(item.id)
                    }
                    whileHover={{ x: 3 }}
                    whileTap={{
                      scale: 0.985,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 28,
                    }}
                    className={`group flex items-center gap-3.5 px-5 py-3 transition-colors duration-200 ${
                      isSelected
                        ? "bg-blue-50/70"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <motion.span
                      whileHover={{
                        scale: 1.08,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 ${
                        isExit
                          ? "border-red-200 bg-red-50 text-red-600"
                          : isSelected
                          ? "border-[#2563EB]/30 bg-[#2563EB]/10 text-[#2563EB]"
                          : "border-gray-200 bg-gray-50 text-gray-500 group-hover:border-gray-300 group-hover:bg-white group-hover:text-gray-700"
                      }`}
                    >
                      <Icon size={15} />
                    </motion.span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[13.5px] font-medium ${
                          isExit
                            ? "text-red-700"
                            : isSelected
                            ? "text-[#1E3A8A]"
                            : "text-gray-900"
                        }`}
                      >
                        {item.label}
                      </span>

                      <span className="mt-0.5 block truncate text-[11.5px] text-gray-500">
                        {item.description}
                      </span>
                    </span>

                    <span className="hidden shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 sm:inline-block">
                      {item.shortcut}
                    </span>

                    <motion.span
                      className="shrink-0"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 28,
                      }}
                    >
                      <ChevronRight
                        size={15}
                        className={`transition-colors ${
                          isSelected
                            ? "text-[#2563EB]"
                            : "text-gray-300 group-hover:text-gray-500"
                        }`}
                      />
                    </motion.span>
                  </MotionLink>
                </motion.li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}