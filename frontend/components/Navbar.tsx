"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { navigationLinks } from "@/data/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed top-3 sm:top-4 md:top-5 inset-x-0 z-50 flex justify-center px-4 sm:px-6 pointer-events-none">
      <motion.header
        initial={{ y: -20, opacity: 0, filter: "blur(8px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto w-full max-w-5xl rounded-full border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? "border-black/[0.08] bg-white/85 py-2 px-5 md:px-6 backdrop-blur-[36px] backdrop-saturate-[180%] shadow-[0_8px_30px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)]"
            : "border-black/[0.06] bg-white/70 py-2.5 px-6 md:px-7 backdrop-blur-[24px] backdrop-saturate-[160%] shadow-[0_4px_20px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.02)]"
        }`}
      >
        <nav className="flex items-center justify-between" aria-label="Main Navigation">
          {/* Brand Logo */}
          <Link
            href="#"
            className="group flex items-center gap-2 text-[0.9375rem] font-semibold tracking-[-0.02em] text-[#111111] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] rounded-full py-0.5 px-1.5"
          >
            <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-[#111111] shadow-[0_1px_4px_rgba(0,0,0,0.2)]">
              <div className="h-1.5 w-1.5 rounded-[1px] bg-white" />
            </div>
            <span className="font-semibold tracking-tight text-[#111111]">INSIQ</span>
          </Link>

          {/* Centered Desktop Navigation */}
          <ul className="hidden items-center gap-6 lg:gap-8 md:flex">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative text-[0.8125rem] font-medium text-[#666666] transition-colors duration-200 hover:text-[#111111] focus-visible:outline-none focus-visible:text-[#111111]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Action Button: Start Prediction */}
          <div className="hidden items-center gap-3 md:flex">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/predict"
                className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-[#111111] px-4 py-1.5 text-[0.8125rem] font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-black hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
              >
                <span>Start Prediction</span>
                <ArrowUpRight size={13} className="opacity-70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-black/[0.04] text-[#111111] backdrop-blur-md transition-colors hover:bg-black/[0.08] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </nav>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-black/[0.06] mt-2.5 pt-2.5 md:hidden"
            >
              <ul className="flex flex-col gap-1 pb-2">
                {navigationLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-xl px-4 py-2 text-[0.875rem] font-medium text-[#666666] transition-colors hover:bg-black/[0.04] hover:text-[#111111]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-2">
                  <Link
                    href="/predict"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 py-2.5 text-[0.875rem] font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                  >
                    <span>Start Prediction</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </div>
  );
}
