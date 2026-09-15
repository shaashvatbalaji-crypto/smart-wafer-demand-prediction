"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Cpu,
  TrendingUp,
  DollarSign,
  FileDown,
  Save,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Factory,
  Tag,
} from "lucide-react";
import { generatePdfReport, saveStartupPrediction } from "@/lib/api";

export default function StartupResultPage() {
  const router = useRouter();

  const [inputData, setInputData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [pdfExporting, setPdfExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Active benchmark metric tab
  const [benchmarkMetric, setBenchmarkMetric] = useState<
    "wafers" | "revenue" | "rd" | "capex"
  >("wafers");

  useEffect(() => {
    try {
      const storedInput = sessionStorage.getItem("startup_prediction_input");
      const storedResult = sessionStorage.getItem("startup_prediction_result");

      if (!storedResult) {
        // Fallback or redirection if no result found
        router.push("/predict/startup/input");
        return;
      }

      if (storedInput) setInputData(JSON.parse(storedInput));
      setResultData(JSON.parse(storedResult));
    } catch (err) {
      console.error("Error reading startup prediction from session:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // ==========================================================
  // PDF REPORT EXPORT
  // ==========================================================
  const handleExportPDF = async () => {
    if (!resultData) return;
    setPdfExporting(true);

    try {
      const companyName = inputData?.company || resultData?.startup?.company || "Startup";
      const payload = {
        company_name: companyName,
        company: companyName,
        company_data: inputData || resultData?.startup || {},
        prediction: resultData.prediction || resultData.predicted_wafer_demand || 0,
        predicted_wafers: resultData.prediction || resultData.predicted_wafer_demand || 0,
        confidence: resultData.confidence || 90,
        model_version: "Startup Hybrid CatBoost v1.0",
        benchmark: resultData.benchmark || {},
        recommendations: resultData.recommendations || [],
        explanation: resultData.explanation || [],
        startup_stage: resultData.startup_stage,
        investment_rating: resultData.investment_rating,
        ai_prediction: resultData.ai_prediction,
        business_prediction: resultData.business_prediction,
      };

      const blob = await generatePdfReport(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${companyName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Wafer_Demand_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to generate PDF report. Make sure backend is running.");
    } finally {
      setPdfExporting(false);
    }
  };

  // ==========================================================
  // SAVE PREDICTION TO HISTORY
  // ==========================================================
  const handleSavePrediction = async () => {
    if (!resultData) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const companyName = inputData?.company || resultData?.startup?.company || "Startup";
      const res = await saveStartupPrediction({
        prediction_name: `${companyName} Startup Analysis`,
        company_id: inputData?.company_id,
        startup: inputData || resultData.startup,
        prediction: resultData,
        confidence: resultData.confidence || 90,
      });

      if (res.success) {
        setSaveMessage("✓ Prediction successfully saved to history!");
      } else {
        setSaveMessage(`Notice: ${res.error || "Could not save prediction."}`);
      }
    } catch (err: any) {
      console.error("Save prediction error:", err);
      setSaveMessage("Saved locally in session.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-500">Loading Analyst Workspace...</p>
        </div>
      </main>
    );
  }

  if (!resultData) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-gray-200 p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-950">No Prediction Result Found</h2>
          <p className="text-xs text-gray-500">
            Please run a startup wafer demand prediction first.
          </p>
          <Link
            href="/predict/startup/input"
            className="inline-flex items-center gap-2 bg-gray-950 text-white font-semibold text-xs px-6 py-3 hover:bg-blue-600 transition-colors"
          >
            Go to Startup Input
          </Link>
        </div>
      </main>
    );
  }

  // Helper variables from backend response
  const startup = inputData || resultData.startup || {};
  const companyName = startup.company || resultData.company || "Startup Company";
  const country = startup.country || "USA";
  const processNode = startup.process_node_nm || 3;
  const fabType = startup.fab_type || "logic_leading";
  const companyId = inputData?.company_id || resultData?.company_id || null;

  const finalPrediction = Math.round(
    resultData.final_prediction ?? resultData.prediction ?? resultData.predicted_wafer_demand ?? 0
  );
  const confidence = Math.round(resultData.confidence ?? 90);

  const aiPrediction = Math.round(resultData.ai_prediction ?? finalPrediction);
  const businessPrediction = Math.round(resultData.business_prediction ?? finalPrediction);

  const startupStage = resultData.startup_stage || "Growth Stage (Series B/C)";
  const investmentRating = resultData.investment_rating || "High Potential";

  // Benchmarks & Leaders
  const benchmark = resultData.benchmark || {};
  const companiesList: any[] = benchmark.companies || [];
  const avgDemand = benchmark.avg_demand || 100000;
  const avgRevenue = benchmark.avg_revenue || 50;
  const avgRd = benchmark.avg_rd || 8;
  const avgCapex = benchmark.avg_capex || 15;

  const explanationList: string[] = Array.isArray(resultData.explanation)
    ? resultData.explanation
    : typeof resultData.explanation === "string"
    ? [resultData.explanation]
    : [];

  const recommendationsList: string[] = Array.isArray(resultData.recommendations)
    ? resultData.recommendations
    : typeof resultData.recommendations === "string"
    ? [resultData.recommendations]
    : [];

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans pb-24">
      <div className="mx-auto max-w-6xl px-8 py-12 space-y-8">
        {/* Top Header & Actions matching Existing Company Page typography */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <Link
              href="/predict/startup/input"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Startup Input
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              INSIQ ANALYST DESK
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950">
              {companyName} — Startup Forecast Result
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-600">
              {companyId && (
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 font-mono font-semibold text-xs">
                  Company ID: {companyId}
                </span>
              )}
              <span className="bg-white border border-gray-200 px-3 py-1 font-medium text-gray-700">
                Country: <strong className="text-gray-950 font-semibold">{country}</strong>
              </span>
              <span className="bg-white border border-gray-200 px-3 py-1 font-medium text-gray-700">
                Process Node: <strong className="text-gray-950 font-semibold">{processNode} nm</strong>
              </span>
              <span className="bg-white border border-gray-200 px-3 py-1 font-medium text-gray-700">
                Fab Architecture: <strong className="text-gray-950 font-semibold">{fabType}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons matching Existing Company Prediction */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              disabled={pdfExporting}
              className="h-12 bg-gray-950 px-6 text-xs font-semibold text-white transition-colors hover:bg-blue-600 flex items-center gap-2 disabled:opacity-60"
            >
              <FileDown className="w-4 h-4" />
              {pdfExporting ? "Exporting PDF..." : "Export PDF Report"}
            </button>

            <button
              onClick={handleSavePrediction}
              disabled={saving}
              className="h-12 border border-gray-300 bg-white px-6 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-blue-600" />
              {saving ? "Saving..." : "Save to History"}
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {saveMessage}
          </div>
        )}

        {/* EXECUTIVE KPI SNAPSHOT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* PREDICTED WAFER DEMAND */}
          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                PREDICTED WAFER DEMAND
              </span>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 font-semibold border border-blue-100">
                Monthly Wafers
              </span>
            </div>

            <div className="text-4xl font-semibold tracking-tight text-gray-950 mb-1">
              {finalPrediction.toLocaleString()}
            </div>

            <p className="text-xs text-gray-500 font-medium">
              wafers / month · CatBoost Hybrid Ensemble
            </p>
          </div>

          {/* PREDICTION CONFIDENCE */}
          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                PREDICTION CONFIDENCE
              </span>
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100">
                High Maturity
              </span>
            </div>

            <div className="text-4xl font-semibold tracking-tight text-gray-950 mb-2">
              {confidence}%
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-none overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(confidence, 100)}%` }}
              />
            </div>
          </div>

          {/* STARTUP CLASSIFICATION */}
          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                STARTUP CLASSIFICATION
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">
                  Venture Stage
                </span>
                <span className="text-base font-semibold text-gray-950">
                  {startupStage}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-0.5">
                  Investment Rating
                </span>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 inline-block">
                  {investmentRating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BUSINESS & HYBRID ML ENGINE BREAKDOWN */}
        <section className="border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 mb-1">
              ENGINE ANALYSIS
            </p>
            <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Business & Hybrid ML Engine Breakdown
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 border border-gray-200 p-5">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block mb-1">
                AI Accelerators Engine
              </span>
              <div className="text-2xl font-semibold text-gray-950">
                {aiPrediction.toLocaleString()} <span className="text-xs font-normal text-gray-500">wafers</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Forecast derived from AI chip product launches and shipment volume.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-5">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                Financial Revenue Engine
              </span>
              <div className="text-2xl font-semibold text-gray-950">
                {businessPrediction.toLocaleString()} <span className="text-xs font-normal text-gray-500">wafers</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Forecast based on expected revenue, R&D spend, and CapEx intensity.
              </p>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 p-5">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">
                Final Weighted Output
              </span>
              <div className="text-2xl font-bold text-blue-950">
                {finalPrediction.toLocaleString()} <span className="text-xs font-medium text-blue-700">wafers/mo</span>
              </div>
              <p className="text-xs text-blue-800 mt-2 leading-relaxed">
                Ensemble weighted prediction combining non-linear CatBoost models with capacity limits.
              </p>
            </div>
          </div>
        </section>

        {/* BENCHMARK ANALYSIS vs TOP LEADERS */}
        <section className="border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 mb-1">
                INDUSTRY POSITIONING
              </p>
              <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Benchmark Analysis vs Industry Leaders
              </h2>
            </div>

            {/* Metric Selector Tabs */}
            <div className="flex items-center bg-gray-100 p-1 border border-gray-200">
              {(
                [
                  { id: "wafers", label: "Monthly Wafers" },
                  { id: "revenue", label: "Revenue ($B)" },
                  { id: "rd", label: "R&D ($B)" },
                  { id: "capex", label: "CapEx ($B)" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBenchmarkMetric(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${
                    benchmarkMetric === tab.id
                      ? "bg-white text-gray-950 shadow-sm"
                      : "text-gray-500 hover:text-gray-950"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-3">
            {companiesList.slice(0, 7).map((comp: any, idx: number) => {
              const isSelected =
                comp.company.toLowerCase() === companyName.toLowerCase();

              let val = comp.predicted_wafers || 0;
              let displayVal = `${Math.round(val).toLocaleString()} wafers`;

              if (benchmarkMetric === "revenue") {
                val = comp.revenue_usd_bn || 0;
                displayVal = `$${val.toFixed(2)}B`;
              } else if (benchmarkMetric === "rd") {
                val = comp.rd_spend_usd_bn || 0;
                displayVal = `$${val.toFixed(2)}B`;
              } else if (benchmarkMetric === "capex") {
                val = comp.capex_usd_bn || 0;
                displayVal = `$${val.toFixed(2)}B`;
              }

              const maxVal = Math.max(
                ...companiesList.map((c) => {
                  if (benchmarkMetric === "revenue") return c.revenue_usd_bn || 1;
                  if (benchmarkMetric === "rd") return c.rd_spend_usd_bn || 1;
                  if (benchmarkMetric === "capex") return c.capex_usd_bn || 1;
                  return c.predicted_wafers || 1;
                })
              );

              const pct = Math.max(5, Math.min(100, (val / (maxVal || 1)) * 100));

              return (
                <div
                  key={idx}
                  className={`p-3.5 border transition-colors ${
                    isSelected
                      ? "bg-blue-50/50 border-blue-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-400 font-semibold text-[11px]">
                        {comp.rank || `#${idx + 1}`}
                      </span>
                      <span className={`font-semibold ${isSelected ? "text-blue-700 font-bold" : "text-gray-950"}`}>
                        {comp.company}
                        {isSelected && (
                          <span className="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 font-semibold uppercase tracking-wider">
                            Target Startup
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="font-mono font-semibold text-gray-950">{displayVal}</span>
                  </div>

                  <div className="w-full bg-gray-100 h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isSelected ? "bg-blue-600" : "bg-gray-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* QUANTITATIVE GAP ANALYSIS */}
        <section className="border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 mb-1">
              GAP ANALYSIS
            </p>
            <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Quantitative Gap Analysis (vs Top Leaders)
            </h2>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="border border-gray-200 p-5 bg-gray-50/50">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Revenue Gap
              </span>
              <div className="text-xl font-semibold text-gray-950">
                ${(startup.expected_revenue ?? 2.5).toFixed(2)}B
              </div>
              <p className="text-xs text-gray-500 mt-1">Leader Avg: ${avgRevenue.toFixed(1)}B</p>
            </div>

            <div className="border border-gray-200 p-5 bg-gray-50/50">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                R&D Budget Gap
              </span>
              <div className="text-xl font-semibold text-gray-950">
                ${(startup.rd_budget ?? 0.8).toFixed(2)}B
              </div>
              <p className="text-xs text-gray-500 mt-1">Leader Avg: ${avgRd.toFixed(1)}B</p>
            </div>

            <div className="border border-gray-200 p-5 bg-gray-50/50">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                CapEx Gap
              </span>
              <div className="text-xl font-semibold text-gray-950">
                ${(startup.capex ?? 1.5).toFixed(2)}B
              </div>
              <p className="text-xs text-gray-500 mt-1">Leader Avg: ${avgCapex.toFixed(1)}B</p>
            </div>

            <div className="border border-gray-200 p-5 bg-gray-50/50">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Wafer Demand Gap
              </span>
              <div className="text-xl font-semibold text-blue-600">
                {finalPrediction.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leader Avg: {Math.round(avgDemand).toLocaleString()} wafers</p>
            </div>
          </div>
        </section>

        {/* STRATEGIC RECOMMENDATIONS */}
        {recommendationsList.length > 0 && (
          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 mb-1">
                STRATEGIC GUIDANCE
              </p>
              <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Strategic Analyst Recommendations
              </h2>
            </div>

            <div className="p-6 space-y-3">
              {recommendationsList.map((rec: string, idx: number) => (
                <div key={idx} className="border border-gray-200 p-4 flex items-start gap-3 bg-gray-50/60">
                  <span className="h-5 w-5 bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ANALYST INSIGHTS */}
        {explanationList.length > 0 && (
          <section className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 mb-1">
                MODEL EXPLANATION
              </p>
              <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Analyst Insights & ML Model Explanation
              </h2>
            </div>

            <div className="p-6 space-y-2.5">
              {explanationList.map((exp: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Actions Bar matching Existing Company Prediction */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <Link
            href="/predict/startup/input"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Predict Another Startup Company
          </Link>

          <button
            onClick={handleExportPDF}
            disabled={pdfExporting}
            className="h-12 bg-gray-950 px-8 text-xs font-semibold text-white hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <FileDown className="w-4 h-4" />
            {pdfExporting ? "Exporting PDF..." : "Export Full PDF Analyst Report"}
          </button>
        </div>
      </div>
    </main>
  );
}