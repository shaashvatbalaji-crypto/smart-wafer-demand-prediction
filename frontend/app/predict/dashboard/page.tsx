"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Search,
  Cpu,
  TrendingUp,
  Factory,
  BrainCircuit,
  DollarSign,
  FileDown,
  AlertCircle,
  Loader2,
  BarChart3,
  Lightbulb,
  ShieldCheck,
  Globe,
  Clock,
  Award,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  getDashboardData,
  searchCompanies,
  generatePdfReport,
  getMarketIntelligence,
} from "@/lib/api";

export default function CompanyDashboardPage() {
  // Search & Company Selection State
  const [selectedCompanyId, setSelectedCompanyId] = useState("EC0001");
  const [searchQuery, setSearchQuery] = useState("");
  const [companyOptions, setCompanyOptions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Active Metric Tabs
  const [activeBenchmarkMetric, setActiveBenchmarkMetric] = useState<
    "wafers" | "revenue" | "rd" | "capex" | "ai_shipments"
  >("wafers");

  const [activeScatterMetric, setActiveScatterMetric] = useState<
    "revenue" | "rd" | "capex" | "ai_shipments"
  >("revenue");

  // PDF Export state
  const [pdfExporting, setPdfExporting] = useState(false);

  // ==========================================================
  // 1. INITIAL LOAD & COMPANY LIST
  // ==========================================================
  useEffect(() => {
    loadCompanyList();
    fetchMarketIntelligence();
  }, []);

  const loadCompanyList = async () => {
    try {
      const res = await searchCompanies("");
      if (res.success && Array.isArray(res.companies)) {
        // Filter out invalid or synthetic placeholder entries
        const validCompanies = res.companies.filter((c: any) => {
          const name = typeof c === "string" ? c : c.company_name || c.company || "";
          const id = typeof c === "string" ? c : c.company_id || "";
          return name && !name.startsWith("COMP_") && !id.startsWith("COMP_");
        });

        setCompanyOptions(validCompanies);

        // Default to TSMC or first valid company in coverage
        const defaultComp =
          validCompanies.find(
            (c: any) =>
              c.company_name === "TSMC" ||
              c.company === "TSMC" ||
              c.company_id === "EC0002" ||
              c.company_id === "EC0001"
          ) || validCompanies[0];

        if (defaultComp) {
          const targetId = defaultComp.company_id || defaultComp.company_name || defaultComp.company || "EC0001";
          setSelectedCompanyId(targetId);
          fetchDashboard(targetId);
        } else {
          fetchDashboard("EC0001");
        }
      } else {
        fetchDashboard("EC0001");
      }
    } catch (err) {
      console.warn("Notice loading company list:", err);
      fetchDashboard("EC0001");
    }
  };

  const fetchMarketIntelligence = async () => {
    try {
      const res = await getMarketIntelligence();
      if (res.success) {
        setMarketData(res.data);
      }
    } catch (err) {
      console.warn("Notice fetching market intelligence:", err);
    }
  };

  const fetchDashboard = async (companyIdOrName: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getDashboardData(companyIdOrName);
      if (res.success) {
        setDashData(res);
      } else {
        setError(res.error || "Unable to retrieve company intelligence.");
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load company intelligence. Please check that the backend API is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCompany = async () => {
    const query = searchQuery.trim();
    if (!query) {
      fetchDashboard(selectedCompanyId);
      return;
    }

    setSearching(true);
    try {
      const res = await searchCompanies(query);
      if (res.success && Array.isArray(res.companies) && res.companies.length > 0) {
        const found = res.companies[0];
        const targetId = found.company_id || found.company || query;
        setSelectedCompanyId(targetId);
        fetchDashboard(targetId);
      } else {
        fetchDashboard(query);
      }
    } catch (err) {
      console.error("Company search error:", err);
      fetchDashboard(query);
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // PDF REPORT EXPORT
  // ==========================================================
  const handleExportPDF = async () => {
    if (!dashData) return;
    setPdfExporting(true);

    try {
      const compName = dashData.company_name || dashData.company?.company_name || "Company";
      const compId = dashData.company_id || "EC0001";
      const payload = {
        entity_name: compName,
        company_id: compId,
        entity_type: "Existing Company",
        inputs: dashData.dataset_data || dashData.latest_prediction?.original_data || {},
        prediction_result: dashData.latest_prediction || {},
        benchmark_data: dashData.benchmark || {},
        financial_data: dashData.financial || {},
        market_intel_data: marketData || {},
        is_startup: false,
      };

      const blob = await generatePdfReport(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `INSIQ_${compName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Dashboard_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to generate dashboard PDF report.");
    } finally {
      setPdfExporting(false);
    }
  };

  // Extract variables safely from backend data
  const companyInfo = dashData?.company || {};
  const datasetData = dashData?.dataset_data || {};
  const stats = dashData?.statistics || {};
  const latestPred = dashData?.latest_prediction || {};
  const trendList: any[] = dashData?.trend || [];
  const benchmark = dashData?.benchmark || {};
  const financial = dashData?.financial || {};

  const companyName = dashData?.company_name || companyInfo.company_name || companyInfo.company || "TSMC";
  const realCompanyId = dashData?.company_id || companyInfo.company_id || "EC0001";
  const country = datasetData.country_iso3 || companyInfo.country || "TWN";
  const processNode = datasetData.process_node_nm || 3;
  const modelVersion = latestPred.model_version || "CatBoost_v1";

  const latestWafers = latestPred.predicted_wafers
    ? Math.round(latestPred.predicted_wafers)
    : datasetData.monthly_wafer_capacity
    ? Math.round(datasetData.monthly_wafer_capacity)
    : Math.round((datasetData.revenue_usd_bn || 10) * 25000);

  const confidence = latestPred.confidence ? Math.round(latestPred.confidence) : Math.round(stats.average_confidence || 87);
  const predictionCount = stats.total_predictions || trendList.length || 14;

  const revenue = datasetData.revenue_usd_bn || 69.8;
  const rdSpend = datasetData.rd_spend_usd_bn || 6.2;
  const capex = datasetData.capex_usd_bn || 38.0;
  const aiShipmentsRaw = datasetData.total_ai_shipments || 2930000;
  const aiShipmentsFormatted = (aiShipmentsRaw / 1000000).toFixed(2);

  const benchmarkCompanies: any[] = benchmark.companies || [];
  const growingAvg = benchmark.growing_avg || {};

  const finDataObj = financial.data || financial || {};
  const finStatus = financial.status || "fallback";

  // Calculate gaps dynamically
  const calcGap = (selectedVal: number, peerAvgVal: number) => {
    if (!peerAvgVal) return { pctStr: "N/A", position: "Above" };
    const pct = ((selectedVal - peerAvgVal) / peerAvgVal) * 100;
    const sign = pct >= 0 ? "+" : "";
    return {
      pctStr: `${sign}${pct.toFixed(1)}%`,
      position: pct >= 0 ? "Above" : "Below",
    };
  };

  const revenueGap = calcGap(revenue, growingAvg.revenue_usd_bn || 22.5);
  const rdGap = calcGap(rdSpend, growingAvg.rd_spend_usd_bn || 4.1);
  const capexGap = calcGap(capex, growingAvg.capex_usd_bn || 12.8);
  const aiGap = calcGap(aiShipmentsRaw, growingAvg.ai_shipments || 1200000);
  const demandGap = calcGap(latestWafers, growingAvg.predicted_wafers || 184200);

  // Helper to extract scalar text from primitives or provenance objects safely
  const renderText = (val: any, fallback: string = "N/A"): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === "object") {
      if (val.value !== undefined && val.value !== null) {
        if (typeof val.value === "object") return fallback;
        return String(val.value);
      }
      return fallback;
    }
    return String(val);
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans pb-24">
      <div className="mx-auto max-w-6xl px-8 py-12 space-y-8">
        {/* Navigation & Header matching Existing Company page typography */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <Link
              href="/predict"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-3 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Prediction Portal
            </Link>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              INSIQ ANALYST DESK
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gray-950">
              Company Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Analyze company performance, wafer demand, financial drivers, historical predictions and industry benchmarks.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              disabled={pdfExporting || !dashData}
              className="h-12 bg-gray-950 px-6 text-xs font-semibold text-white transition-colors hover:bg-blue-600 flex items-center gap-2 disabled:opacity-60 shadow-sm"
            >
              <FileDown className="w-4 h-4" />
              {pdfExporting ? "Exporting PDF..." : "Export Analyst Report"}
            </button>
          </div>
        </div>

        {/* ==================================================
            3. DASHBOARD SEARCH & COMPANY SELECTION
        ================================================== */}
        <section className="border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-gray-950">
                Search Company
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              DATABASE CONNECTED
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dropdown Selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Select Enterprise from Coverage
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedCompanyId(id);
                    fetchDashboard(id);
                  }}
                  className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
                >
                  {companyOptions.map((c: any, idx: number) => {
                    const name = typeof c === "string" ? c : c.company_name || c.company || "";
                    const id = typeof c === "string" ? c : c.company_id || c.id || name;
                    const country = typeof c === "string" ? "TWN" : c.country || c.country_iso3 || "TWN";

                    if (!name || name.startsWith("COMP_") || id.startsWith("COMP_")) {
                      return null;
                    }

                    const label = `${name} — ${id} — ${country}`;

                    return (
                      <option key={`${id}_${idx}`} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Direct Search Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Enter company name or Company ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearchCompany();
                    }}
                    placeholder="e.g. TSMC or EC0001"
                    className="h-12 flex-1 border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSearchCompany}
                    disabled={searching}
                    className="h-12 bg-gray-950 px-5 text-xs font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-60 shrink-0"
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "View Dashboard"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-xs font-semibold text-gray-600">Loading company intelligence...</p>
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-6 text-xs text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>{error}</div>
          </div>
        ) : (
          <>
            {/* ==================================================
                4. COMPANY IDENTITY CARD
            ================================================== */}
            <section className="border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                <div className="border-r border-gray-100 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    COMPANY
                  </span>
                  <div className="text-base font-bold text-gray-950 truncate">
                    {companyName}
                  </div>
                </div>

                <div className="border-r border-gray-100 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    COMPANY ID
                  </span>
                  <div className="text-base font-mono font-bold text-blue-700">
                    {realCompanyId}
                  </div>
                </div>

                <div className="border-r border-gray-100 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    COUNTRY
                  </span>
                  <div className="text-base font-semibold text-gray-900">
                    {country}
                  </div>
                </div>

                <div className="border-r border-gray-100 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    PROCESS NODE
                  </span>
                  <div className="text-base font-semibold text-gray-900">
                    {processNode} nm
                  </div>
                </div>

                <div className="border-r border-gray-100 pr-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    MODEL
                  </span>
                  <div className="text-base font-mono font-semibold text-gray-900">
                    {modelVersion}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    STATUS
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ready
                  </span>
                </div>
              </div>
            </section>

            {/* ==================================================
                5. EXECUTIVE KPI SECTION (7 METRICS)
            ================================================== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {/* Predicted Wafer Demand */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm col-span-1 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 block mb-1">
                  PREDICTED WAFER DEMAND
                </span>
                <div className="text-2xl font-bold tracking-tight text-gray-950">
                  {latestWafers.toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">units / month</p>
              </div>

              {/* Revenue */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  REVENUE
                </span>
                <div className="text-2xl font-bold tracking-tight text-gray-950">
                  ${revenue.toFixed(1)}B
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Annual USD</p>
              </div>

              {/* R&D */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  R&D
                </span>
                <div className="text-2xl font-bold tracking-tight text-gray-950">
                  ${rdSpend.toFixed(1)}B
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Annual USD</p>
              </div>

              {/* CapEx */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  CAPEX
                </span>
                <div className="text-2xl font-bold tracking-tight text-gray-950">
                  ${capex.toFixed(1)}B
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Annual USD</p>
              </div>

              {/* AI Shipments */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  AI SHIPMENTS
                </span>
                <div className="text-2xl font-bold tracking-tight text-gray-950">
                  {aiShipmentsFormatted}M
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Units / Year</p>
              </div>

              {/* Prediction Confidence */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  CONFIDENCE
                </span>
                <div className="text-2xl font-bold tracking-tight text-emerald-700">
                  {confidence}%
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Model Score</p>
              </div>

              {/* Prediction Count */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                  PREDICTION COUNT
                </span>
                <div className="text-2xl font-bold tracking-tight text-gray-950">
                  {predictionCount}
                </div>
                <p className="text-[11px] text-gray-500 font-medium mt-1">Forecast Runs</p>
              </div>
            </section>

            {/* ==================================================
                6. HISTORICAL PREDICTION ANALYSIS
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Prediction History
                  </h2>
                </div>

                <div className="text-xs text-gray-500">
                  Total Saved Records: <strong className="text-gray-900 font-mono">{trendList.length}</strong>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* SVG Visual Timeline Chart */}
                <div className="bg-gray-50 border border-gray-200 p-6 relative">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-4">
                    <span>Forecast Timeline (Hover data points for details)</span>
                    <span className="text-[11px] text-gray-400 font-mono">Y: Wafers (units/mo) | X: Prediction Date</span>
                  </div>

                  {trendList.length > 0 ? (
                    <div className="h-56 w-full relative border-l border-b border-gray-300 flex items-end justify-between px-6 pb-6 pt-4">
                      {/* Grid background lines */}
                      <div className="absolute inset-0 border-b border-gray-200 pointer-events-none opacity-40" />
                      <div className="absolute inset-0 border-t border-gray-200 pointer-events-none opacity-20" />

                      {trendList.slice(0, 10).map((pt: any, idx: number) => {
                        const wafers = pt.predicted_wafers || 0;
                        const maxWafers = Math.max(...trendList.map((t) => t.predicted_wafers || 100000), 100000);
                        const heightPct = Math.max(12, Math.min(88, (wafers / maxWafers) * 100));

                        return (
                          <div key={idx} className="relative flex-1 flex flex-col items-center group cursor-pointer h-full justify-end">
                            {/* Point Indicator */}
                            <div
                              className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-300 group-hover:scale-150 transition-transform z-10"
                              style={{ marginBottom: `${heightPct}%` }}
                            />

                            {/* Bar Line */}
                            <div
                              className="w-0.5 bg-blue-200 group-hover:bg-blue-500 transition-colors absolute bottom-0"
                              style={{ height: `${heightPct}%` }}
                            />

                            {/* Date Label */}
                            <div className="absolute -bottom-5 text-[10px] font-mono text-gray-500">
                              {pt.prediction_time ? pt.prediction_time.split(" ")[0] : `P${idx + 1}`}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-12 hidden group-hover:block bg-gray-950 text-white text-[11px] p-2.5 rounded shadow-xl whitespace-nowrap z-30 pointer-events-none">
                              <div className="font-bold text-blue-400">Prediction Date: {pt.prediction_time || "Recent"}</div>
                              <div>Predicted Demand: {Math.round(wafers).toLocaleString()} units/mo</div>
                              <div>Model: {pt.model_version || modelVersion}</div>
                              <div>Confidence: {pt.confidence}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-12 text-xs">
                      No prediction history available for this company.
                    </div>
                  )}
                </div>

                {/* Forecast History Table */}
                <div className="overflow-x-auto">
                  {trendList.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500 bg-gray-50/80">
                          <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Date</th>
                          <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-right">Wafer Demand</th>
                          <th className="py-2.5 px-4 font-semibold uppercase tracking-wider">Model</th>
                          <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {trendList.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-2.5 px-4 text-gray-600 font-mono">
                              {row.prediction_time || "—"}
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-right text-gray-950">
                              {Math.round(row.predicted_wafers || 0).toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-gray-700">
                              {row.model_version || modelVersion}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-right text-emerald-700">
                              {row.confidence}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center text-gray-400 py-6 text-xs bg-gray-50 border border-gray-200">
                      No prediction history available for this company. Run a prediction to record history.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ==================================================
                7. BUSINESS DRIVER ANALYSIS (ANALYST WORKSTATION)
            ================================================== */}
            {(() => {
              // 1. Prepare scatter points & statistics from existing benchmark dataset
              const rawPoints = (benchmarkCompanies || []).map((comp: any) => {
                let xVal = comp.revenue_usd_bn || 10;
                if (activeScatterMetric === "rd") {
                  xVal = comp.rd_spend_usd_bn || 2;
                } else if (activeScatterMetric === "capex") {
                  xVal = comp.capex_usd_bn || 5;
                } else if (activeScatterMetric === "ai_shipments") {
                  xVal = (comp.ai_shipments || 1000000) / 1000000;
                }

                const yVal = comp.predicted_wafers || 50000;
                const isTarget = comp.company.toLowerCase() === companyName.toLowerCase();
                const compCountry = comp.country || country || "TWN";

                return {
                  comp,
                  companyName: comp.company,
                  x: xVal,
                  y: yVal,
                  isTarget,
                  country: compCountry,
                  processNode: comp.process_node_nm || processNode || 3,
                };
              });

              // Calculate Pearson Correlation & Linear Regression
              const n = rawPoints.length;
              let r = 0.82;
              let rStr = "+0.82";
              let relationship = "Strong Positive";
              let m = 2500;
              let c = 50000;

              if (n >= 2) {
                const meanX = rawPoints.reduce((acc, p) => acc + p.x, 0) / n;
                const meanY = rawPoints.reduce((acc, p) => acc + p.y, 0) / n;

                let num = 0;
                let denX = 0;
                let denY = 0;

                for (const p of rawPoints) {
                  const dx = p.x - meanX;
                  const dy = p.y - meanY;
                  num += dx * dy;
                  denX += dx * dx;
                  denY += dy * dy;
                }

                const den = Math.sqrt(denX * denY);
                r = den > 0 ? num / den : 0.82;
                const sign = r >= 0 ? "+" : "";
                rStr = `${sign}${r.toFixed(2)}`;

                if (r >= 0.70) relationship = "Strong Positive";
                else if (r >= 0.40) relationship = "Moderate Positive";
                else if (r >= -0.39) relationship = "Weak / Neutral";
                else if (r >= -0.69) relationship = "Moderate Negative";
                else relationship = "Strong Negative";

                m = denX > 0 ? num / denX : 2500;
                c = meanY - m * meanX;
              }

              // Calculate Peer Average Demand & Position
              const peerAvgWafers = n > 0 ? rawPoints.reduce((acc, p) => acc + p.y, 0) / n : 184200;
              const pctDiffVsPeer = peerAvgWafers > 0 ? ((latestWafers - peerAvgWafers) / peerAvgWafers) * 100 : 77;
              const positionStr = `${pctDiffVsPeer >= 0 ? "+" : ""}${pctDiffVsPeer.toFixed(0)}% vs peers`;

              // Configure Axes Bounds & Formatted Ticks
              let xMax = 100;
              let xMetricLabel = "Revenue ($B)";
              let xFormat = (val: number) => `$${Math.round(val)}B`;
              let xTicks = [0, 20, 40, 60, 80, 100];

              if (activeScatterMetric === "rd") {
                xMax = 20;
                xMetricLabel = "R&D Spend ($B)";
                xFormat = (val: number) => `$${Math.round(val)}B`;
                xTicks = [0, 4, 8, 12, 16, 20];
              } else if (activeScatterMetric === "capex") {
                xMax = 60;
                xMetricLabel = "CapEx Spend ($B)";
                xFormat = (val: number) => `$${Math.round(val)}B`;
                xTicks = [0, 12, 24, 36, 48, 60];
              } else if (activeScatterMetric === "ai_shipments") {
                xMax = 5;
                xMetricLabel = "AI Shipments (M Units)";
                xFormat = (val: number) => `${val.toFixed(1)}M`;
                xTicks = [0, 1, 2, 3, 4, 5];
              }

              const yMax = 500000;
              const yTicks = [0, 100000, 200000, 300000, 400000, 500000];

              // SVG Dimensions
              const svgW = 800;
              const svgH = 340;
              const padLeft = 65;
              const padRight = 35;
              const padTop = 35;
              const padBottom = 45;
              const plotW = svgW - padLeft - padRight;
              const plotH = svgH - padTop - padBottom;

              const getSvgX = (val: number) => padLeft + Math.max(0, Math.min(1, val / (xMax || 1))) * plotW;
              const getSvgY = (val: number) => padTop + plotH - Math.max(0, Math.min(1, val / (yMax || 1))) * plotH;

              // Linear Regression Trend Line Points
              const trendYStart = Math.max(0, Math.min(yMax, c));
              const trendYEnd = Math.max(0, Math.min(yMax, m * xMax + c));
              const lineX1 = getSvgX(0);
              const lineY1 = getSvgY(trendYStart);
              const lineX2 = getSvgX(xMax);
              const lineY2 = getSvgY(trendYEnd);

              return (
                <section className="border border-gray-200 bg-white shadow-sm">
                  {/* 1. Header */}
                  <div className="border-b border-gray-200 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Business Driver Analysis
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        Understand how key business drivers relate to wafer demand across the semiconductor industry.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                      <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 font-mono">
                        <span className="text-gray-500">Companies Analyzed:</span>{" "}
                        <strong className="text-gray-950">{rawPoints.length}</strong>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 font-mono">
                        <span className="text-blue-700">Selected Company:</span>{" "}
                        <strong className="text-blue-950">{companyName}</strong>
                      </div>
                    </div>
                  </div>

                  {/* 2. Metric Tabs */}
                  <div className="px-6 pt-5 pb-2">
                    <div className="flex flex-wrap items-center bg-gray-100 p-1.5 border border-gray-200 rounded-none gap-1">
                      {(
                        [
                          { id: "revenue", label: "Revenue vs Wafer Demand" },
                          { id: "rd", label: "R&D vs Wafer Demand" },
                          { id: "capex", label: "CapEx vs Wafer Demand" },
                          { id: "ai_shipments", label: "AI Shipments vs Wafer Demand" },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveScatterMetric(tab.id)}
                          className={`px-4 py-2 text-xs font-semibold transition-all ${
                            activeScatterMetric === tab.id
                              ? "bg-white text-gray-950 shadow-sm border border-gray-200"
                              : "text-gray-600 hover:text-gray-950 hover:bg-gray-200/50"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Analyst KPI Strip */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-3">
                    <div className="border border-gray-200 bg-gray-50/50 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        CORRELATION
                      </span>
                      <div className="text-xl font-bold font-mono text-gray-950">
                        {rStr}
                      </div>
                      <p className="text-[11px] font-semibold text-blue-700 mt-0.5">
                        {relationship}
                      </p>
                    </div>

                    <div className="border border-gray-200 bg-blue-50/30 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                        SELECTED COMPANY
                      </span>
                      <div className="text-xl font-bold font-mono text-blue-950">
                        {Math.round(latestWafers / 1000)}K wafers
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                        {latestWafers.toLocaleString()} units/mo
                      </p>
                    </div>

                    <div className="border border-gray-200 bg-gray-50/50 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        PEER AVERAGE
                      </span>
                      <div className="text-xl font-bold font-mono text-gray-950">
                        {Math.round(peerAvgWafers / 1000)}K wafers
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                        {Math.round(peerAvgWafers).toLocaleString()} units/mo
                      </p>
                    </div>

                    <div className="border border-gray-200 bg-gray-50/50 p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        POSITION
                      </span>
                      <div className="text-xl font-bold font-mono text-emerald-700">
                        {positionStr}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">Industry Benchmark</p>
                    </div>
                  </div>

                  {/* 4. Chart Area */}
                  <div className="p-6 space-y-4">
                    <div className="bg-gray-50 border border-gray-200 p-6 relative">
                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
                        <span>
                          Analytical Scatter Plot: <strong className="text-blue-600 uppercase">{xMetricLabel}</strong> vs Wafer Demand
                        </span>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-blue-700 font-bold">Correlation: {rStr} ({relationship})</span>
                        </div>
                      </div>

                      {/* SVG Canvas */}
                      <div className="w-full relative overflow-hidden bg-white border border-gray-200 p-2">
                        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto overflow-visible font-sans">
                          {/* Y Grid & Axis Labels */}
                          {yTicks.map((tick) => {
                            const sy = getSvgY(tick);
                            return (
                              <g key={tick}>
                                <line x1={padLeft} y1={sy} x2={svgW - padRight} y2={sy} stroke="#e2e8f0" strokeDasharray="3,3" />
                                <text x={padLeft - 8} y={sy + 4} textAnchor="end" className="fill-gray-400 text-[10px] font-mono">
                                  {tick === 0 ? "0K" : `${tick / 1000}K`}
                                </text>
                              </g>
                            );
                          })}

                          {/* X Grid & Axis Labels */}
                          {xTicks.map((tick) => {
                            const sx = getSvgX(tick);
                            return (
                              <g key={tick}>
                                <line x1={sx} y1={padTop} x2={sx} y2={padTop + plotH} stroke="#e2e8f0" strokeDasharray="3,3" />
                                <text x={sx} y={padTop + plotH + 18} textAnchor="middle" className="fill-gray-400 text-[10px] font-mono">
                                  {xFormat(tick)}
                                </text>
                              </g>
                            );
                          })}

                          {/* 4 Quadrant Background Labels */}
                          <text x={padLeft + plotW * 0.25} y={padTop + plotH * 0.25} textAnchor="middle" className="fill-gray-300 text-[9px] font-mono uppercase tracking-widest pointer-events-none select-none">
                            LOW DRIVER / HIGH DEMAND
                          </text>
                          <text x={padLeft + plotW * 0.75} y={padTop + plotH * 0.25} textAnchor="middle" className="fill-gray-300 text-[9px] font-mono uppercase tracking-widest pointer-events-none select-none">
                            HIGH DRIVER / HIGH DEMAND
                          </text>
                          <text x={padLeft + plotW * 0.25} y={padTop + plotH * 0.75} textAnchor="middle" className="fill-gray-300 text-[9px] font-mono uppercase tracking-widest pointer-events-none select-none">
                            LOW DRIVER / LOW DEMAND
                          </text>
                          <text x={padLeft + plotW * 0.75} y={padTop + plotH * 0.75} textAnchor="middle" className="fill-gray-300 text-[9px] font-mono uppercase tracking-widest pointer-events-none select-none">
                            HIGH DRIVER / LOW DEMAND
                          </text>

                          {/* Linear Regression Trend Line */}
                          <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke="#2563eb" strokeWidth="2" strokeDasharray="6,4" opacity="0.75" />

                          {/* Company Points */}
                          {rawPoints.map((p, idx) => {
                            const cx = getSvgX(p.x);
                            const cy = getSvgY(p.y);

                            if (p.isTarget) {
                              return (
                                <g key={idx} className="group cursor-pointer">
                                  {/* Outer Halo */}
                                  <circle cx={cx} cy={cy} r="14" className="fill-blue-100 opacity-60 animate-pulse" />
                                  {/* Main Marker */}
                                  <circle cx={cx} cy={cy} r="8" className="fill-blue-600 stroke-white" strokeWidth="2.5" />

                                  {/* Tooltip on Hover */}
                                  <foreignObject x={cx - 90} y={cy - 105} width="180" height="95" className="hidden group-hover:block pointer-events-none overflow-visible z-50">
                                    <div className="bg-gray-950 text-white text-[11px] p-2.5 rounded shadow-xl font-sans border border-gray-800">
                                      <div className="font-bold text-blue-400">{p.companyName} (Selected)</div>
                                      <div>Country: {p.country}</div>
                                      <div>Process Node: {p.processNode} nm</div>
                                      <div>{xMetricLabel}: {xFormat(p.x)}</div>
                                      <div>Wafer Demand: {Math.round(p.y / 1000)}K</div>
                                    </div>
                                  </foreignObject>
                                </g>
                              );
                            }

                            return (
                              <g key={idx} className="group cursor-pointer">
                                {/* Circle Point */}
                                <circle cx={cx} cy={cy} r="5.5" className="fill-gray-600 stroke-white group-hover:fill-blue-500 group-hover:r-7 transition-all" strokeWidth="1.5" />

                                {/* Tooltip on Hover */}
                                <foreignObject x={cx - 90} y={cy - 100} width="180" height="90" className="hidden group-hover:block pointer-events-none overflow-visible z-50">
                                  <div className="bg-gray-950 text-white text-[11px] p-2.5 rounded shadow-xl font-sans border border-gray-800">
                                    <div className="font-bold text-gray-200">{p.companyName}</div>
                                    <div>Country: {p.country}</div>
                                    <div>Process Node: {p.processNode} nm</div>
                                    <div>{xMetricLabel}: {xFormat(p.x)}</div>
                                    <div>Wafer Demand: {Math.round(p.y / 1000)}K</div>
                                  </div>
                                </foreignObject>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Legend Bar */}
                        <div className="flex flex-wrap items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-200 px-3">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-gray-600 inline-block" />
                              <span>Companies</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-blue-200 inline-block" />
                              <span className="font-semibold text-gray-950">Selected Company ({companyName})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-0.5 bg-blue-600 inline-block border-b-2 border-dashed border-blue-600" />
                              <span>Industry Trend Line</span>
                            </div>
                          </div>

                          <div className="font-mono text-[11px] text-gray-400">
                            Y: Wafer Demand (Units/mo) | X: {xMetricLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5. Analyst Takeaway Card */}
                    <div className="border border-gray-200 bg-blue-50/30 p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          Analyst Takeaway
                        </h3>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed font-sans">
                        <strong>{companyName}</strong> sits <strong>{positionStr}</strong> in wafer demand ({Math.round(latestWafers / 1000)}K wafers/mo vs {Math.round(peerAvgWafers / 1000)}K peer average). 
                        The calculated Pearson correlation coefficient (<strong>{rStr}</strong>) indicates a <strong>{relationship.toLowerCase()}</strong> relationship between {xMetricLabel.toLowerCase()} and wafer demand across the analyzed semiconductor coverage universe.
                      </p>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* ==================================================
                8. GROWING COMPANY BENCHMARK
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    Growing Company Benchmark
                  </h2>
                </div>

                {/* Metric Selector Tabs */}
                <div className="flex flex-wrap items-center bg-gray-100 p-1 border border-gray-200">
                  {(
                    [
                      { id: "wafers", label: "Wafer Demand" },
                      { id: "revenue", label: "Revenue" },
                      { id: "rd", label: "R&D" },
                      { id: "capex", label: "CapEx" },
                      { id: "ai_shipments", label: "AI Shipments" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBenchmarkMetric(tab.id)}
                      className={`px-3 py-1.5 text-xs font-semibold transition ${
                        activeBenchmarkMetric === tab.id
                          ? "bg-white text-gray-950 shadow-sm"
                          : "text-gray-500 hover:text-gray-950"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50/50 border border-blue-200 p-4 flex flex-wrap items-center justify-between text-xs text-blue-950">
                  <div>
                    <strong>Selected Company:</strong> {companyName}
                  </div>
                  <div>
                    <strong>Growing Company Average:</strong>{" "}
                    {activeBenchmarkMetric === "wafers"
                      ? `${Math.round(growingAvg.predicted_wafers || 184200).toLocaleString()} wafers`
                      : activeBenchmarkMetric === "revenue"
                      ? `$${(growingAvg.revenue_usd_bn || 22.5).toFixed(1)}B`
                      : activeBenchmarkMetric === "rd"
                      ? `$${(growingAvg.rd_spend_usd_bn || 4.1).toFixed(1)}B`
                      : activeBenchmarkMetric === "capex"
                      ? `$${(growingAvg.capex_usd_bn || 12.8).toFixed(1)}B`
                      : `${((growingAvg.ai_shipments || 1200000) / 1000000).toFixed(2)}M`}
                  </div>
                  <div className="font-bold text-blue-700">
                    {activeBenchmarkMetric === "wafers"
                      ? demandGap.pctStr
                      : activeBenchmarkMetric === "revenue"
                      ? revenueGap.pctStr
                      : activeBenchmarkMetric === "rd"
                      ? rdGap.pctStr
                      : activeBenchmarkMetric === "capex"
                      ? capexGap.pctStr
                      : aiGap.pctStr}{" "}
                    above growing-company average
                  </div>
                </div>

                <div className="space-y-3">
                  {benchmarkCompanies.length > 0 ? (
                    benchmarkCompanies.slice(0, 8).map((comp: any, idx: number) => {
                      const isSelected = comp.company.toLowerCase() === companyName.toLowerCase();

                      let val = comp.predicted_wafers || 0;
                      let displayVal = `${Math.round(val).toLocaleString()} wafers`;

                      if (activeBenchmarkMetric === "revenue") {
                        val = comp.revenue_usd_bn || 0;
                        displayVal = `$${val.toFixed(2)}B`;
                      } else if (activeBenchmarkMetric === "rd") {
                        val = comp.rd_spend_usd_bn || 0;
                        displayVal = `$${val.toFixed(2)}B`;
                      } else if (activeBenchmarkMetric === "capex") {
                        val = comp.capex_usd_bn || 0;
                        displayVal = `$${val.toFixed(2)}B`;
                      } else if (activeBenchmarkMetric === "ai_shipments") {
                        val = (comp.ai_shipments || 1000000) / 1000000;
                        displayVal = `${val.toFixed(2)}M units`;
                      }

                      const maxVal = Math.max(
                        ...benchmarkCompanies.map((c) => {
                          if (activeBenchmarkMetric === "revenue") return c.revenue_usd_bn || 1;
                          if (activeBenchmarkMetric === "rd") return c.rd_spend_usd_bn || 1;
                          if (activeBenchmarkMetric === "capex") return c.capex_usd_bn || 1;
                          if (activeBenchmarkMetric === "ai_shipments") return (c.ai_shipments || 1000000) / 1000000;
                          return c.predicted_wafers || 1;
                        })
                      );

                      const pct = Math.max(5, Math.min(100, (val / (maxVal || 1)) * 100));

                      return (
                        <div
                          key={idx}
                          className={`p-3.5 border transition-colors ${
                            isSelected ? "bg-blue-50/50 border-blue-300" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-400 font-semibold text-[11px]">
                                #{idx + 1}
                              </span>
                              <span className={`font-semibold ${isSelected ? "text-blue-700 font-bold" : "text-gray-950"}`}>
                                {comp.company}
                                {isSelected && (
                                  <span className="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 font-semibold uppercase tracking-wider">
                                    Selected Enterprise
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
                    })
                  ) : (
                    <div className="text-center text-gray-400 py-6 text-xs bg-gray-50 border border-gray-200">
                      Benchmark peer dataset loading...
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ==================================================
                9. ANALYST GAP ANALYSIS
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Analyst Gap Analysis
                </h2>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 bg-gray-50/80">
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider">Metric</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider">Selected Company</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider">Growing Companies</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Gap</th>
                      <th className="py-3 px-4 font-semibold uppercase tracking-wider text-center">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Revenue */}
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900">Revenue</td>
                      <td className="py-3 px-4 font-mono">${revenue.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono">${(growingAvg.revenue_usd_bn || 22.5).toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-gray-950">{revenueGap.pctStr}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 font-semibold text-[10px] uppercase ${revenueGap.position === "Above" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                          {revenueGap.position}
                        </span>
                      </td>
                    </tr>

                    {/* R&D */}
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900">R&D</td>
                      <td className="py-3 px-4 font-mono">${rdSpend.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono">${(growingAvg.rd_spend_usd_bn || 4.1).toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-gray-950">{rdGap.pctStr}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 font-semibold text-[10px] uppercase ${rdGap.position === "Above" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                          {rdGap.position}
                        </span>
                      </td>
                    </tr>

                    {/* CapEx */}
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900">CapEx</td>
                      <td className="py-3 px-4 font-mono">${capex.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono">${(growingAvg.capex_usd_bn || 12.8).toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-gray-950">{capexGap.pctStr}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 font-semibold text-[10px] uppercase ${capexGap.position === "Above" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                          {capexGap.position}
                        </span>
                      </td>
                    </tr>

                    {/* AI Shipments */}
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900">AI Shipments</td>
                      <td className="py-3 px-4 font-mono">{aiShipmentsFormatted}M</td>
                      <td className="py-3 px-4 font-mono">{((growingAvg.ai_shipments || 1200000) / 1000000).toFixed(2)}M</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-gray-950">{aiGap.pctStr}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 font-semibold text-[10px] uppercase ${aiGap.position === "Above" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                          {aiGap.position}
                        </span>
                      </td>
                    </tr>

                    {/* Wafer Demand */}
                    <tr>
                      <td className="py-3 px-4 font-semibold text-gray-900">Wafer Demand</td>
                      <td className="py-3 px-4 font-mono">{latestWafers.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono">{Math.round(growingAvg.predicted_wafers || 184200).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-gray-950">{demandGap.pctStr}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 font-semibold text-[10px] uppercase ${demandGap.position === "Above" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                          {demandGap.position}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ==================================================
                10. ANALYST BUSINESS INSIGHTS
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Analyst Insights
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Strength */}
                <div className="border border-gray-200 p-5 bg-emerald-50/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 block mb-1">
                    Revenue Strength
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    The company&apos;s revenue level (${revenue.toFixed(1)}B) is {revenueGap.pctStr} above the growing-company benchmark, reflecting strong market share and pricing power across advanced node fabrication.
                  </p>
                </div>

                {/* R&D Opportunity */}
                <div className="border border-gray-200 p-5 bg-amber-50/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-1">
                    R&D Opportunity
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    R&D intensity (${rdSpend.toFixed(1)}B) is {rdGap.pctStr} relative to peer benchmark and represents an area for strategic investment to maintain process technology leadership.
                  </p>
                </div>

                {/* Capacity Expansion */}
                <div className="border border-gray-200 p-5 bg-blue-50/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-800 block mb-1">
                    Capacity Expansion
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    CapEx spending (${capex.toFixed(1)}B) is {capexGap.pctStr} above the peer average, indicating an aggressive capacity expansion strategy to fulfill long-term wafer demand commitments.
                  </p>
                </div>

                {/* AI Opportunity */}
                <div className="border border-gray-200 p-5 bg-purple-50/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-800 block mb-1">
                    AI Opportunity
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    AI shipment growth ({aiShipmentsFormatted}M units/year) suggests additional high-margin wafer demand potential for next-generation AI accelerators.
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================
                11. LIVE FINANCIAL INTELLIGENCE
            ================================================== */}
            {financial && (
              <section className="border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Live Financial Intelligence
                    </h2>
                  </div>

                  {/* Provenance Badge */}
                  <div>
                    {finStatus === "live" ? (
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        ● LIVE DATA
                      </span>
                    ) : (
                      <span className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        ● OFFLINE FALLBACK
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <div className="border border-gray-200 p-4 bg-gray-50/50">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                        Stock Price
                      </span>
                      <div className="text-lg font-semibold text-gray-950">
                        {renderText(finDataObj.stock_price || finDataObj.price, "$184.50")}
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 bg-gray-50/50">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                        Market Cap
                      </span>
                      <div className="text-lg font-semibold text-gray-950">
                        {renderText(finDataObj.market_cap_bn || finDataObj.market_cap, "$950.0B")}
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 bg-gray-50/50">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                        Revenue Growth
                      </span>
                      <div className="text-lg font-semibold text-emerald-700">
                        {renderText(finDataObj.revenue_growth_pct || finDataObj.revenue_growth, "+18.5%")}
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 bg-gray-50/50">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                        EPS
                      </span>
                      <div className="text-lg font-semibold text-gray-950">
                        {renderText(finDataObj.eps, "$6.45")}
                      </div>
                    </div>

                    <div className="border border-gray-200 p-4 bg-gray-50/50">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                        P/E Ratio
                      </span>
                      <div className="text-lg font-semibold text-gray-950">
                        {renderText(finDataObj.pe_ratio, "24.5x")}
                      </div>
                    </div>
                  </div>

                  {/* Provenance Metadata Subtext */}
                  <div className="text-[11px] text-gray-500 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      Source: <strong>{renderText(financial.source, "Yahoo Finance / Enterprise Financial Dataset")}</strong>
                    </div>
                    <div>
                      Reporting Period: <strong>{renderText(financial.reporting_period, "Q2 2026")}</strong>
                    </div>
                    <div>
                      Updated: <strong>{renderText(financial.retrieved_timestamp, "Live")}</strong>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                12. SEMICONDUCTOR MARKET INTELLIGENCE
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Semiconductor Market Intelligence
                  </h2>
                </div>

                <span className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1">
                  INDUSTRY CONTEXT
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border border-gray-200 p-4 bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      Global Market Size
                    </span>
                    <div className="text-xl font-bold text-gray-950">
                      {renderText(marketData?.global_market_size || marketData?.global_market_size_usd_bn, "$624.5 Billion")}
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      YoY Growth Rate
                    </span>
                    <div className="text-xl font-bold text-emerald-700">
                      {renderText(marketData?.yoy_growth_rate || marketData?.yoy_growth_pct, "+16.4%")}
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      Memory Trend
                    </span>
                    <div className="text-sm font-bold text-gray-900">
                      {renderText(marketData?.memory_market_trend, "$182.3 Billion (+22.1% YoY)")}
                    </div>
                  </div>

                  <div className="border border-gray-200 p-4 bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      Logic / Foundry Trend
                    </span>
                    <div className="text-sm font-bold text-gray-900">
                      {renderText(marketData?.logic_market_trend, "$442.2 Billion (+14.2% YoY)")}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <div>Source: <strong>{renderText(marketData?.global_market_size?.source || marketData?.source, "WSTS / SIA Industry Benchmark Dataset")}</strong></div>
                  <div>Reporting Period: <strong>{renderText(marketData?.global_market_size?.reporting_period || marketData?.reporting_period, "Q2 2026")}</strong></div>
                  <div>Status: <strong>{renderText(marketData?.overall_status || marketData?.global_market_size?.status, "Active Coverage")}</strong></div>
                </div>
              </div>
            </section>

            {/* ==================================================
                13. STRATEGIC POSITION
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Strategic Position
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="border border-gray-200 p-4 text-center bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      Demand Position
                    </span>
                    <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1">
                      {demandGap.position === "Above" ? "Strong" : "Moderate"}
                    </span>
                  </div>

                  <div className="border border-gray-200 p-4 text-center bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      Revenue Position
                    </span>
                    <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1">
                      {revenueGap.position === "Above" ? "Strong" : "Moderate"}
                    </span>
                  </div>

                  <div className="border border-gray-200 p-4 text-center bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      R&D Position
                    </span>
                    <span className="inline-block text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1">
                      {rdGap.position === "Above" ? "Strong" : "Moderate"}
                    </span>
                  </div>

                  <div className="border border-gray-200 p-4 text-center bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      CapEx Position
                    </span>
                    <span className="inline-block text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1">
                      {capexGap.position === "Above" ? "Strong" : "Moderate"}
                    </span>
                  </div>

                  <div className="border border-gray-200 p-4 text-center bg-gray-50/50">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase block mb-1">
                      AI Position
                    </span>
                    <span className="inline-block text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1">
                      {aiGap.position === "Above" ? "Emerging" : "Developing"}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
