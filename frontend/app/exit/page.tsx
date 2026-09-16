"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowLeft,
  Play,
  History,
  ShieldCheck,
  Building2,
  BarChart3,
  LogOut,
  Sparkles
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

async function safeApiFetch(endpoint: string, options?: RequestInit) {
  const baseUrls = [
    API_BASE_URL,
    "http://127.0.0.1:8001",
    "http://localhost:8001",
    "",
  ];

  for (const base of baseUrls) {
    try {
      const url = base ? `${base.replace(/\/$/, "")}${endpoint}` : endpoint;
      const res = await fetch(url, options);
      if (res.ok) return res;
    } catch {
      // Continue trying next candidate
    }
  }

  try {
    const fallbackUrl = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, "")}${endpoint}` : endpoint;
    return await fetch(fallbackUrl, options);
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Offline" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

export default function ExitPage() {
  const [sessionStats, setSessionStats] = useState<{
    predictionsCount?: number;
    companiesCount?: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const [historyRes, companyRes] = await Promise.all([
          safeApiFetch("/api/predictions/history"),
          safeApiFetch("/api/company/search"),
        ]);

        let pCount: number | undefined = undefined;
        let cCount: number | undefined = undefined;

        if (historyRes.ok) {
          const hJson = await historyRes.json();
          if (hJson.success && (Array.isArray(hJson.predictions) || Array.isArray(hJson.history))) {
            pCount = (hJson.predictions || hJson.history || []).length;
          }
        }

        if (companyRes.ok) {
          const cJson = await companyRes.json();
          if (cJson.success && Array.isArray(cJson.companies)) {
            cCount = cJson.companies.length;
          }
        }

        if (isMounted && (pCount !== undefined || cCount !== undefined)) {
          setSessionStats({
            predictionsCount: pCount,
            companiesCount: cCount,
          });
        }
      } catch (err) {
        console.error("Failed to load session summary stats:", err);
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans">
      
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700 tracking-wider uppercase">
            Smart Wafer Demand Analyst Desk
          </span>
        </div>
        <Link
          href="/predict"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workspace
        </Link>
      </header>

      {/* Main Centered Content */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-6"
        >
          
          {/* Header Title */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              <LogOut className="w-3.5 h-3.5" />
              EXIT ANALYST WORKSPACE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Session Complete
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your Smart Wafer Demand Prediction analyst session is complete. You can return to the analyst workspace whenever you are ready.
            </p>
          </div>

          {/* Success Checkmark Badge */}
          <div className="flex justify-center my-2">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>

          {/* Optional Real Data Summary */}
          {sessionStats && (sessionStats.predictionsCount !== undefined || sessionStats.companiesCount !== undefined) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3 text-left">
              {sessionStats.predictionsCount !== undefined && (
                <div className="space-y-0.5">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    Saved Forecasts
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {sessionStats.predictionsCount}
                  </div>
                </div>
              )}
              {sessionStats.companiesCount !== undefined && (
                <div className="space-y-0.5">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    Coverage Universe
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {sessionStats.companiesCount} Fabs
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preservation & Safety Guarantee Banner */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 text-left flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-blue-950">Database Preserved</div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                All saved predictions, ML model states, and company parameters remain safely stored in the database repository.
              </p>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-2.5 pt-2">
            <Link
              href="/predict"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              Return to Analyst Workspace
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Link
                href="/predict/company"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors border border-slate-300 flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-slate-600" />
                Start New Prediction
              </Link>

              <Link
                href="/predict/history"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors border border-slate-300 flex items-center justify-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-slate-600" />
                View Prediction History
              </Link>
            </div>
          </div>

        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-2 text-xs text-slate-400">
        Smart Wafer Demand Prediction System • Semiconductor Analyst Terminal
      </footer>

    </div>
  );
}
