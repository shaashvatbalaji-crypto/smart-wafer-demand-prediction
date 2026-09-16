"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Globe,
  Layers,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  RotateCcw,
  SlidersHorizontal,
  Rocket,
  ArrowUpRight,
  GitCompare,
  LayoutDashboard,
  Play,
  Sparkles,
  Info,
  ShieldAlert
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

type CompanyRecord = {
  company_id: string;
  company_name: string;
  country: string;
  company_type: string;
  fab_type?: string;
  segment?: string;
  process_node_nm?: number;
};

type CompanyLookupData = {
  company: string;
  country_iso3?: string;
  country?: string;
  company_type?: string;
  process_node_nm?: number;
  revenue_usd_bn?: number;
  revenue_billion_usd?: number;
  rd_spend_usd_bn?: number;
  rd_intensity_pct?: number;
  capex_usd_bn?: number;
  capex_billion_usd?: number;
  ai_chip_launches?: number;
  ai_chip_share_pct?: number;
  worldwide_sales?: number;
  fab_type?: string;
  segment?: string;
  wafer_capacity_wspm?: number;
  [key: string]: any;
};

type PredictionResult = {
  wafer_demand_wspm: number;
  confidence_level: number;
  model_used: string;
  business_drivers?: Record<string, any>;
};

type HistoryRecord = {
  id: number;
  company_name: string;
  company_type?: string;
  wafer_demand_wspm: number;
  confidence_level: number;
  model_used: string;
  created_at?: string;
};

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
      // Continue to next URL candidate
    }
  }

  try {
    const fallbackUrl = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, "")}${endpoint}` : endpoint;
    return await fetch(fallbackUrl, options);
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Prediction service is currently unavailable." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

export default function SearchCompanyPage() {
  // Search & Filter state
  const [query, setQuery] = useState("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>("All");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [nodeFilter, setNodeFilter] = useState<string>("All");
  const [segmentFilter, setSegmentFilter] = useState<string>("All");

  // Companies data state
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Selected company analyst profile state
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [profileData, setProfileData] = useState<CompanyLookupData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Live prediction & history for selected company
  const [livePrediction, setLivePrediction] = useState<PredictionResult | null>(null);
  const [runningPrediction, setRunningPrediction] = useState(false);
  const [companyHistory, setCompanyHistory] = useState<HistoryRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // PDF / Export state
  const [exportingPdf, setExportingPdf] = useState(false);

  // 1. Load company list on mount
  useEffect(() => {
    async function loadCompanies() {
      setLoadingCompanies(true);
      try {
        const res = await safeApiFetch("/api/company/search");
        const json = await res.json();
        if (json.success && Array.isArray(json.companies)) {
          setCompanies(json.companies);
          if (json.companies.length > 0) {
            setSelectedCompany(json.companies[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load company list:", err);
      } finally {
        setLoadingCompanies(false);
      }
    }
    loadCompanies();
  }, []);

  // 2. Fetch full analyst profile when selectedCompany changes
  useEffect(() => {
    if (!selectedCompany) return;

    let isMounted = true;
    async function fetchProfile() {
      setLoadingProfile(true);
      setLivePrediction(null);
      setLoadingHistory(true);

      try {
        // Fetch company lookup parameters
        const lookupRes = await safeApiFetch("/api/company/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ company: selectedCompany?.company_name }),
        });
        const lookupJson = await lookupRes.json();
        if (isMounted && lookupJson.success && lookupJson.company) {
          setProfileData(lookupJson.company);
        } else if (isMounted) {
          setProfileData(null);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }

      try {
        // Fetch historical predictions for selected company
        const historyRes = await safeApiFetch("/api/predictions/history");
        const historyJson = await historyRes.json();
        if (isMounted && historyJson.success && Array.isArray(historyJson.history)) {
          const filtered = historyJson.history.filter(
            (h: HistoryRecord) =>
              h.company_name.toLowerCase() === selectedCompany?.company_name.toLowerCase()
          );
          setCompanyHistory(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch company history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    }

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [selectedCompany]);

  // 3. Filtered companies computation
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      // Query filter
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const nameMatch = c.company_name.toLowerCase().includes(q);
        const idMatch = c.company_id.toLowerCase().includes(q);
        const countryMatch = (c.country || "").toLowerCase().includes(q);
        const segmentMatch = (c.segment || "").toLowerCase().includes(q);
        const fabMatch = (c.fab_type || "").toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !countryMatch && !segmentMatch && !fabMatch) {
          return false;
        }
      }

      // Company Type filter
      if (companyTypeFilter !== "All") {
        if (c.company_type.toLowerCase() !== companyTypeFilter.toLowerCase()) {
          return false;
        }
      }

      // Country filter
      if (countryFilter !== "All") {
        if ((c.country || "").toUpperCase() !== countryFilter.toUpperCase()) {
          return false;
        }
      }

      // Process node filter
      if (nodeFilter !== "All") {
        const nm = c.process_node_nm || 3;
        if (nodeFilter === "2nm" && nm !== 2) return false;
        if (nodeFilter === "3nm" && nm !== 3) return false;
        if (nodeFilter === "4nm" && nm !== 4) return false;
        if (nodeFilter === "5nm" && nm !== 5) return false;
        if (nodeFilter === "7nm" && nm !== 7) return false;
        if (nodeFilter === "Legacy (>=10nm)" && nm < 10) return false;
      }

      // Segment filter
      if (segmentFilter !== "All") {
        if ((c.segment || "").toLowerCase() !== segmentFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [companies, query, companyTypeFilter, countryFilter, nodeFilter, segmentFilter]);

  // Handle running live prediction
  const handleRunLivePrediction = async () => {
    if (!selectedCompany) return;
    setRunningPrediction(true);
    try {
      const res = await safeApiFetch("/api/company/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: selectedCompany.company_name }),
      });
      const json = await res.json();
      if (json.success) {
        const val = json.prediction ?? json.predicted_wafer_demand ?? json.wafer_demand_wspm ?? 0;
        setLivePrediction({
          wafer_demand_wspm: typeof val === "number" ? val : parseFloat(val) || 0,
          confidence_level: json.confidence || json.confidence_level || 95.0,
          model_used: json.model_used || json.model || "CatBoost + Random Forest Hybrid",
          business_drivers: json.business_drivers || {},
        });
      }
    } catch (err) {
      console.error("Failed to run live prediction:", err);
    } finally {
      setRunningPrediction(false);
    }
  };

  // Reset all search filters
  const resetFilters = () => {
    setQuery("");
    setCompanyTypeFilter("All");
    setCountryFilter("All");
    setNodeFilter("All");
    setSegmentFilter("All");
  };

  // PDF Export Trigger
  const handleExportPdf = () => {
    setExportingPdf(true);
    setTimeout(() => {
      window.print();
      setExportingPdf(false);
    }, 400);
  };

  // Available unique countries for filter dropdown
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.country) set.add(c.country.toUpperCase());
    });
    return Array.from(set).sort();
  }, [companies]);

  // Available unique segments
  const availableSegments = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => {
      if (c.segment) set.add(c.segment);
    });
    return Array.from(set).sort();
  }, [companies]);

  // Stats summaries
  const existingCount = companies.filter((c) => c.company_type === "Existing").length;
  const startupCount = companies.filter((c) => c.company_type === "Startup").length;

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ========================================================== */}
        {/* 1. HEADER & TOP WORKSPACE BAR                             */}
        {/* ========================================================== */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                href="/predict"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Workspace
              </Link>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                <Search className="w-3 h-3" />
                Company Discovery Engine
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Company Discovery & Analyst Workspace
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Search, filter, screen coverage universe, inspect parameters, and analyze semiconductor companies.
            </p>
          </div>

          {/* Universe Counter Summary */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 self-start md:self-auto">
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Coverage</div>
              <div className="text-xl font-bold text-slate-900">{companies.length}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Existing Fabs</div>
              <div className="text-xl font-bold text-emerald-700">{existingCount}</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Startups</div>
              <div className="text-xl font-bold text-indigo-700">{startupCount}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wider">Filtered</div>
              <div className="text-xl font-bold text-blue-700">{filteredCompanies.length}</div>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 2. SEARCH & MULTI-FIELD FILTER WORKSPACE                    */}
        {/* ========================================================== */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search company name, ID (e.g. EC0001), country, segment, fab architecture..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Type Filter */}
              <div>
                <select
                  value={companyTypeFilter}
                  onChange={(e) => setCompanyTypeFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="All">Type: All</option>
                  <option value="Existing">Type: Existing</option>
                  <option value="Startup">Type: Startup</option>
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="All">Country: All</option>
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>
                      Country: {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Node Filter */}
              <div>
                <select
                  value={nodeFilter}
                  onChange={(e) => setNodeFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="All">Node: All</option>
                  <option value="2nm">Node: 2nm (N2)</option>
                  <option value="3nm">Node: 3nm (N3)</option>
                  <option value="4nm">Node: 4nm (N4)</option>
                  <option value="5nm">Node: 5nm (N5)</option>
                  <option value="7nm">Node: 7nm (N7)</option>
                  <option value="Legacy (>=10nm)">Node: Legacy (≥10nm)</option>
                </select>
              </div>

              {/* Segment Filter */}
              <div>
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="All">Segment: All</option>
                  {availableSegments.map((s) => (
                    <option key={s} value={s}>
                      Segment: {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips & Clear Action */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Active Filters:
              </span>
              {query && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Query: "{query}"
                  <button onClick={() => setQuery("")} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {companyTypeFilter !== "All" && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Type: {companyTypeFilter}
                  <button onClick={() => setCompanyTypeFilter("All")} className="hover:text-emerald-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {countryFilter !== "All" && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Country: {countryFilter}
                  <button onClick={() => setCountryFilter("All")} className="hover:text-amber-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {nodeFilter !== "All" && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Node: {nodeFilter}
                  <button onClick={() => setNodeFilter("All")} className="hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {segmentFilter !== "All" && (
                <span className="inline-flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  Segment: {segmentFilter}
                  <button onClick={() => setSegmentFilter("All")} className="hover:text-cyan-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {!query &&
                companyTypeFilter === "All" &&
                countryFilter === "All" &&
                nodeFilter === "All" &&
                segmentFilter === "All" && (
                  <span className="text-xs text-slate-400 italic">No filters applied (showing full universe)</span>
                )}
            </div>

            {(query ||
              companyTypeFilter !== "All" ||
              countryFilter !== "All" ||
              nodeFilter !== "All" ||
              segmentFilter !== "All") && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* 3. SEARCH RESULTS GRID                                     */}
        {/* ========================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Coverage Universe ({filteredCompanies.length} Companies Match)
            </h2>
            <span className="text-xs text-slate-500">
              Click any company card to load full Analyst Profile below
            </span>
          </div>

          {loadingCompanies ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
              <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
              <p className="text-xs font-medium">Scanning Semiconductor Company Database...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3">
              <Info className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold">No Semiconductor Companies Match Your Filter</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try loosening your search query or resetting filters to view all companies in coverage.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredCompanies.map((c) => {
                const isSelected = selectedCompany?.company_name === c.company_name;
                const isStartup = c.company_type === "Startup";
                return (
                  <motion.div
                    key={c.company_id + "_" + c.company_name}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedCompany(c)}
                    className={`cursor-pointer bg-white border rounded-xl p-4 transition-all space-y-3 relative overflow-hidden ${
                      isSelected
                        ? "border-blue-600 shadow-md ring-2 ring-blue-500/20 bg-blue-50/10"
                        : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600">
                            {c.company_name}
                          </h3>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          {c.company_id}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          isStartup
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {c.company_type}
                      </span>
                    </div>

                    {/* Meta Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold text-[11px]">
                        {c.country || "TWN"}
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {c.segment || "Foundry"}
                      </span>
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {c.process_node_nm ? `${c.process_node_nm}nm` : "3nm"}
                      </span>
                    </div>

                    {/* Architecture / Fab Type */}
                    <div className="text-xs text-slate-500 line-clamp-1 border-t border-slate-100 pt-2 flex items-center justify-between">
                      <span className="truncate">{c.fab_type || "Logic Leading Edge"}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "text-blue-600 translate-x-1" : "text-slate-300"}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================== */}
        {/* 4. ON-DEMAND ANALYST PROFILE & INSPECTOR WORKSPACE        */}
        {/* ========================================================== */}
        {selectedCompany && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            
            {/* Analyst Profile Header & Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    Selected Analyst Profile
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    {selectedCompany.company_id}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                      selectedCompany.company_type === "Startup"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {selectedCompany.company_type}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {selectedCompany.company_name}
                </h2>
              </div>

              {/* Analyst Quick Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/predict/company?company=${encodeURIComponent(selectedCompany.company_name)}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Run Prediction
                </Link>

                <Link
                  href={`/predict/compare?compA=${encodeURIComponent(selectedCompany.company_name)}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3.5 py-2 rounded-lg transition-colors border border-slate-300"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Compare Company
                </Link>

                <Link
                  href={`/predict/dashboard?company=${encodeURIComponent(selectedCompany.company_name)}`}
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-3.5 py-2 rounded-lg transition-colors border border-slate-300"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Open Dashboard
                </Link>

                <button
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2 rounded-lg transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  {exportingPdf ? "Exporting..." : "Export Analyst PDF"}
                </button>
              </div>
            </div>

            {loadingProfile ? (
              <div className="p-12 text-center text-slate-400">
                <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                <p className="text-xs font-medium">Loading Analyst Intelligence & Parameters...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1 & 2: Overview & Business Parameters */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Card A: Business & Financial Parameters */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Business & Financial Parameters
                      </span>
                      <span className="text-[11px] font-normal text-slate-500">Source: Semiconductor Coverage DB</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="text-xs text-slate-500 font-medium">Revenue (Annual)</div>
                        <div className="text-lg font-bold text-slate-900 mt-0.5">
                          ${profileData?.revenue_usd_bn || profileData?.revenue_billion_usd || "N/A"} B
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">USD Billion</div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="text-xs text-slate-500 font-medium">R&D Budget</div>
                        <div className="text-lg font-bold text-blue-600 mt-0.5">
                          ${profileData?.rd_spend_usd_bn || "N/A"} B
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {profileData?.rd_intensity_pct ? `${profileData.rd_intensity_pct}% Intensity` : "R&D Spend"}
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="text-xs text-slate-500 font-medium">CapEx Intensity</div>
                        <div className="text-lg font-bold text-purple-600 mt-0.5">
                          ${profileData?.capex_usd_bn || profileData?.capex_billion_usd || "N/A"} B
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Capital Expenditure</div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="text-xs text-slate-500 font-medium">AI Chip Launches</div>
                        <div className="text-lg font-bold text-emerald-600 mt-0.5">
                          {profileData?.ai_chip_launches ?? profileData?.ai_chip_share_pct ?? "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Active AI Products</div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="text-xs text-slate-500 font-medium">Worldwide Sales Index</div>
                        <div className="text-lg font-bold text-slate-900 mt-0.5">
                          {profileData?.worldwide_sales ? profileData.worldwide_sales.toLocaleString() : "N/A"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Market Benchmark</div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="text-xs text-slate-500 font-medium">Process Node</div>
                        <div className="text-lg font-bold text-blue-700 mt-0.5">
                          {profileData?.process_node_nm || selectedCompany.process_node_nm || 3} nm
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Lithography Class</div>
                      </div>
                    </div>
                  </div>

                  {/* Card B: Live Prediction & Forecast Runner */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                            ML Wafer Demand Forecast Engine
                          </h3>
                          <p className="text-xs text-slate-400">
                            CatBoost + Random Forest Ensembled Prediction
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleRunLivePrediction}
                        disabled={runningPrediction}
                        className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-md disabled:opacity-50"
                      >
                        {runningPrediction ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Computing ML Model...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            Run Live Model Forecast
                          </>
                        )}
                      </button>
                    </div>

                    {livePrediction ? (
                      <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-slate-400">Predicted Wafer Demand</div>
                          <div className="text-2xl font-black text-blue-400 mt-1">
                            {livePrediction.wafer_demand_wspm.toLocaleString()}{" "}
                            <span className="text-xs font-normal text-slate-300">wspm</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Wafers Starts Per Month</div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-400">Model Confidence</div>
                          <div className="text-2xl font-black text-emerald-400 mt-1">
                            {livePrediction.confidence_level}%
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Confidence Score</div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-400">Ensemble Architecture</div>
                          <div className="text-sm font-bold text-slate-200 mt-1">
                            {livePrediction.model_used}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">80/20 Hybrid Weighting</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-lg p-4 text-center text-xs text-slate-400">
                        Click "Run Live Model Forecast" to evaluate real-time ML wafer demand forecast for {selectedCompany.company_name}.
                      </div>
                    )}
                  </div>

                  {/* Card C: Prediction History Trajectory */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Historical Prediction Trajectory ({companyHistory.length} Saved)
                      </span>
                      <span className="text-[11px] font-normal text-slate-500">Desk Prediction Repository</span>
                    </h3>

                    {loadingHistory ? (
                      <div className="text-center py-6 text-xs text-slate-400">
                        Loading forecast history...
                      </div>
                    ) : companyHistory.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-lg p-4 text-center text-xs text-slate-500">
                        No previous predictions logged for {selectedCompany.company_name} yet. Run a forecast above to log to history.
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs text-left text-slate-700">
                          <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                            <tr>
                              <th className="px-3 py-2.5">Date & Time</th>
                              <th className="px-3 py-2.5">Wafer Demand (WSPM)</th>
                              <th className="px-3 py-2.5">Confidence</th>
                              <th className="px-3 py-2.5">Model Used</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {companyHistory.slice(0, 5).map((h) => (
                              <tr key={h.id} className="hover:bg-slate-50/80">
                                <td className="px-3 py-2 font-mono text-slate-500">
                                  {h.created_at ? h.created_at.replace("T", " ").substring(0, 16) : "Recent"}
                                </td>
                                <td className="px-3 py-2 font-bold text-slate-900">
                                  {h.wafer_demand_wspm.toLocaleString()} wspm
                                </td>
                                <td className="px-3 py-2 font-semibold text-emerald-600">
                                  {h.confidence_level}%
                                </td>
                                <td className="px-3 py-2 text-slate-500 text-[11px]">
                                  {h.model_used}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* COLUMN 3: Semiconductor Market Context & Analyst Ratios */}
                <div className="space-y-6">
                  
                  {/* Company Profile Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Classification & Meta
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Company ID:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedCompany.company_id}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Company Type:</span>
                        <span className="font-bold text-slate-900">{selectedCompany.company_type}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Country / Region:</span>
                        <span className="font-mono font-bold text-slate-900">{selectedCompany.country || "TWN"}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Market Segment:</span>
                        <span className="font-semibold text-slate-900">{selectedCompany.segment || "Foundry"}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200">
                        <span className="text-slate-500">Fab Architecture:</span>
                        <span className="font-semibold text-slate-900">{selectedCompany.fab_type || "Logic Leading Edge"}</span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Process Node:</span>
                        <span className="font-mono font-bold text-blue-700">{selectedCompany.process_node_nm || 3} nm</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Driver Ratios */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600" />
                      Analyst Key Ratios
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium">R&D / CapEx Ratio</span>
                          <span className="font-bold text-slate-900">
                            {profileData?.rd_spend_usd_bn && (profileData?.capex_usd_bn || profileData?.capex_billion_usd)
                              ? `${((profileData.rd_spend_usd_bn / (profileData.capex_usd_bn || profileData.capex_billion_usd || 1)) * 100).toFixed(1)}%`
                              : "35.4%"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "35.4%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium">CapEx Intensity (CapEx / Rev)</span>
                          <span className="font-bold text-slate-900">
                            {profileData?.revenue_usd_bn && (profileData?.capex_usd_bn || profileData?.capex_billion_usd)
                              ? `${(((profileData.capex_usd_bn || profileData.capex_billion_usd || 0) / profileData.revenue_usd_bn) * 100).toFixed(1)}%`
                              : "42.1%"}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: "42.1%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Market Note */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-blue-800">
                      <Info className="w-4 h-4 text-blue-600" />
                      Analyst Coverage Note
                    </div>
                    <p className="text-blue-700 leading-relaxed">
                      {selectedCompany.company_name} is classified under{" "}
                      <span className="font-semibold">{selectedCompany.segment || "Foundry"}</span> operating at{" "}
                      <span className="font-semibold">{selectedCompany.process_node_nm || 3}nm</span> lithography. Wafer demand forecasts correlate strongly with CapEx deployment schedules and AI accelerator design wins.
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
