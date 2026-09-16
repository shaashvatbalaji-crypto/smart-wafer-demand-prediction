"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Search,
  SlidersHorizontal,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Building2,
  Layers,
  BarChart3,
  Globe,
  Calendar,
  ShieldAlert,
  ArrowUpDown,
  Sparkles,
  Rocket
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

type PredictionRecord = {
  id: number;
  prediction_name?: string;
  company?: string;
  company_name?: string;
  company_id?: string;
  prediction_type?: string;
  predicted_wafers?: number;
  wafer_demand_wspm?: number;
  confidence?: number;
  confidence_level?: number;
  model_version?: string;
  model_used?: string;
  prediction_time?: string;
  created_at?: string;
  country?: string;
  original_data?: any;
  modified_data?: any;
  [key: string]: any;
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
      // Continue trying next URL candidate
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

export default function DeletePredictionPage() {
  // Data state
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected prediction for review / deletion
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionRecord | null>(null);

  // Modal confirmation state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "demand_desc" | "demand_asc" | "company">("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // 1. Load predictions from database
  const loadPredictions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await safeApiFetch("/api/predictions/history");
      if (!res.ok) {
        setErrorMsg("Prediction service is currently unavailable.");
        setPredictions([]);
        return;
      }
      const json = await res.json();
      if (json.success && (Array.isArray(json.predictions) || Array.isArray(json.history))) {
        const list = json.predictions || json.history || [];
        setPredictions(list);
        if (list.length > 0 && !selectedPrediction) {
          setSelectedPrediction(list[0]);
        }
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error("Failed to load predictions:", err);
      setErrorMsg("Prediction service is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  // Normalize record attributes
  const getRecordCompany = (p: PredictionRecord) =>
    p.company || p.company_name || "Unknown Company";

  const getRecordCompanyId = (p: PredictionRecord) =>
    p.company_id || `PRD_${p.id}`;

  const getRecordDemand = (p: PredictionRecord) =>
    p.predicted_wafers ?? p.wafer_demand_wspm ?? 0;

  const getRecordConfidence = (p: PredictionRecord) =>
    p.confidence ?? p.confidence_level ?? 95.0;

  const getRecordDate = (p: PredictionRecord) => {
    const raw = p.prediction_time || p.created_at;
    if (!raw) return "Recent";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw).replace("T", " ").substring(0, 16);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return String(raw);
    }
  };

  const getRecordYear = (p: PredictionRecord) => {
    if (p.original_data?.year) return String(p.original_data.year);
    if (p.modified_data?.year) return String(p.modified_data.year);
    const raw = p.prediction_time || p.created_at;
    if (raw) {
      const yr = new Date(raw).getFullYear();
      if (!isNaN(yr)) return String(yr);
    }
    return "2026";
  };

  const getRecordCountry = (p: PredictionRecord) => {
    if (p.country) return p.country.toUpperCase();
    if (p.original_data?.country) return p.original_data.country.toUpperCase();
    if (p.original_data?.country_iso3) return p.original_data.country_iso3.toUpperCase();
    return "TWN";
  };

  const getRecordType = (p: PredictionRecord) => {
    const raw = (p.prediction_type || "").toLowerCase();
    if (raw.includes("startup")) return "Startup";
    return "Existing Company";
  };

  // Derive unique filter options from actual data
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    predictions.forEach((p) => set.add(getRecordCountry(p)));
    return Array.from(set).sort();
  }, [predictions]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    predictions.forEach((p) => set.add(getRecordYear(p)));
    return Array.from(set).sort();
  }, [predictions]);

  // Dynamic KPI calculations
  const totalCount = predictions.length;
  const existingCount = predictions.filter((p) => getRecordType(p) === "Existing Company").length;
  const startupCount = predictions.filter((p) => getRecordType(p) === "Startup").length;
  const latestRecord = predictions[0] || null;

  // Filter & Sort logic
  const filteredPredictions = useMemo(() => {
    let result = predictions.filter((p) => {
      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cName = getRecordCompany(p).toLowerCase();
        const cId = getRecordCompanyId(p).toLowerCase();
        const prdId = `prd${p.id}`.toLowerCase();
        const pName = (p.prediction_name || "").toLowerCase();
        if (!cName.includes(q) && !cId.includes(q) && !prdId.includes(q) && !pName.includes(q)) {
          return false;
        }
      }

      // Prediction Type filter
      if (typeFilter !== "All") {
        const recType = getRecordType(p);
        if (typeFilter === "Existing Company" && recType !== "Existing Company") return false;
        if (typeFilter === "Startup" && recType !== "Startup") return false;
      }

      // Country filter
      if (countryFilter !== "All") {
        if (getRecordCountry(p) !== countryFilter) return false;
      }

      // Forecast Year filter
      if (yearFilter !== "All") {
        if (getRecordYear(p) !== yearFilter) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return b.id - a.id;
      }
      if (sortBy === "oldest") {
        return a.id - b.id;
      }
      if (sortBy === "demand_desc") {
        return getRecordDemand(b) - getRecordDemand(a);
      }
      if (sortBy === "demand_asc") {
        return getRecordDemand(a) - getRecordDemand(b);
      }
      if (sortBy === "company") {
        return getRecordCompany(a).localeCompare(getRecordCompany(b));
      }
      return 0;
    });

    return result;
  }, [predictions, searchQuery, typeFilter, countryFilter, yearFilter, sortBy]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, countryFilter, yearFilter, sortBy]);

  // Paginated slices
  const totalPages = Math.ceil(filteredPredictions.length / pageSize) || 1;
  const paginatedPredictions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPredictions.slice(start, start + pageSize);
  }, [filteredPredictions, currentPage, pageSize]);

  // Handle Delete Confirmation Execution
  const handleDeleteConfirm = async () => {
    if (!selectedPrediction) return;
    setDeleting(true);
    setDeleteErrorMsg(null);
    setDeleteSuccessMsg(null);

    const targetId = selectedPrediction.id;
    const targetComp = getRecordCompany(selectedPrediction);

    try {
      const res = await safeApiFetch(`/api/predictions/${targetId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        setDeleteSuccessMsg(`Prediction PRD${targetId.toString().padStart(3, "0")} for ${targetComp} deleted successfully.`);
        setShowConfirmModal(false);
        setSelectedPrediction(null);
        
        // Refresh records from backend
        await loadPredictions();
      } else {
        setDeleteErrorMsg(json.error || json.message || "Unable to delete prediction. Please try again.");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setDeleteErrorMsg("Unable to delete prediction. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("All");
    setCountryFilter("All");
    setYearFilter("All");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================== */}
        {/* 1. HEADER                                                  */}
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
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                <Trash2 className="w-3 h-3" />
                Prediction Repository Management
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              DELETE PREDICTION
            </h1>
            <p className="text-sm text-slate-500 max-w-2xl">
              Review saved wafer demand predictions and remove individual prediction records from the prediction history.
            </p>
          </div>
        </div>

        {/* Notification Banners */}
        {deleteSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{deleteSuccessMsg}</span>
            </div>
            <button onClick={() => setDeleteSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {deleteErrorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{deleteErrorMsg}</span>
            </div>
            <button onClick={() => setDeleteErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================== */}
        {/* 2. ANALYST KPI SUMMARY ROW                                */}
        {/* ========================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Total Predictions
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-[10px] text-slate-400">Database Records</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Existing Company
            </div>
            <div className="text-2xl font-bold text-emerald-700">{existingCount}</div>
            <div className="text-[10px] text-slate-400">Established Fabs</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-indigo-600" />
              Startup Predictions
            </div>
            <div className="text-2xl font-bold text-indigo-700">{startupCount}</div>
            <div className="text-[10px] text-slate-400">New Entrants</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-1 truncate">
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Latest Prediction
            </div>
            <div className="text-base font-bold text-slate-900 truncate">
              {latestRecord ? getRecordCompany(latestRecord) : "None"}
            </div>
            <div className="text-[10px] text-purple-700 font-semibold truncate">
              {latestRecord ? `${getRecordDemand(latestRecord).toLocaleString()} wspm` : "N/A"}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 3. SEARCH & FILTER BAR                                     */}
        {/* ========================================================== */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prediction, company name, or company ID..."
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter & Sort Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="All">Type: All</option>
                  <option value="Existing Company">Existing Company</option>
                  <option value="Startup">Startup</option>
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

              {/* Forecast Year Filter */}
              <div>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="All">Year: All</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      Year: {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="demand_desc">Sort: Highest Demand</option>
                  <option value="demand_asc">Sort: Lowest Demand</option>
                  <option value="company">Sort: Company Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Filter Status:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {typeFilter !== "All" && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Type: {typeFilter}
                  <button onClick={() => setTypeFilter("All")} className="hover:text-emerald-900">
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
              {yearFilter !== "All" && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Year: {yearFilter}
                  <button onClick={() => setYearFilter("All")} className="hover:text-purple-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {!searchQuery &&
                typeFilter === "All" &&
                countryFilter === "All" &&
                yearFilter === "All" && (
                  <span className="text-xs text-slate-400 italic">Showing all {predictions.length} saved records</span>
                )}
            </div>

            {(searchQuery || typeFilter !== "All" || countryFilter !== "All" || yearFilter !== "All" || sortBy !== "newest") && (
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
        {/* 4. MAIN CONTENT GRID (SELECTED PREDICTION & TABLE)        */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT PANEL: SELECTED PREDICTION INSPECTION & DELETE ACTION */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  SELECTED PREDICTION
                </h2>
                {selectedPrediction && (
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    PRD{selectedPrediction.id.toString().padStart(3, "0")}
                  </span>
                )}
              </div>

              {selectedPrediction ? (
                <div className="space-y-4">
                  
                  {/* Selected Prediction Summary Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
                    
                    <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                      <div>
                        <div className="text-slate-400 font-medium text-[10px] uppercase">Company</div>
                        <div className="text-base font-bold text-slate-900">
                          {getRecordCompany(selectedPrediction)}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          getRecordType(selectedPrediction) === "Startup"
                            ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {getRecordType(selectedPrediction)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Company ID:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {getRecordCompanyId(selectedPrediction)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Prediction ID:</span>
                        <span className="font-mono font-bold text-slate-800">
                          PRD{selectedPrediction.id.toString().padStart(3, "0")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Forecast Year:</span>
                        <span className="font-bold text-slate-800">
                          {getRecordYear(selectedPrediction)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Country:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {getRecordCountry(selectedPrediction)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 space-y-1">
                      <div className="text-slate-400 text-[10px]">Predicted Wafer Demand</div>
                      <div className="text-xl font-extrabold text-blue-700">
                        {getRecordDemand(selectedPrediction).toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-500">wafers/mo</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Prediction Date:</span>
                        <span className="font-medium text-slate-700">{getRecordDate(selectedPrediction)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Confidence Score:</span>
                        <span className="font-bold text-emerald-600">{getRecordConfidence(selectedPrediction)}%</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Model Version:</span>
                        <span className="font-mono text-slate-600 text-[10px]">
                          {selectedPrediction.model_version || selectedPrediction.model_used || "CatBoost v1.0"}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Warning Notice */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-amber-800">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                      Analyst Safety Protection
                    </div>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      Removing this forecast record purges it from desk prediction history. Master company profile{" "}
                      <span className="font-bold">({getRecordCompany(selectedPrediction)})</span> and ML models remain 100% intact.
                    </p>
                  </div>

                  {/* Primary Trigger Button */}
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 fill-white" />
                    DELETE PREDICTION
                  </button>

                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <Info className="w-6 h-6 text-slate-300 mx-auto" />
                  <p>Select a prediction record from the table to review details before removal.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: PREDICTION HISTORY TABLE */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Prediction History Records ({filteredPredictions.length})
                </h2>
                <span className="text-xs text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-xs font-medium">Fetching Saved Predictions from Database...</p>
                </div>
              ) : errorMsg ? (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center text-rose-800 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
                  <div className="text-sm font-bold">{errorMsg}</div>
                  <p className="text-xs text-rose-600">
                    Verify Python REST API server is running at {API_BASE_URL}.
                  </p>
                  <button
                    onClick={loadPredictions}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs bg-rose-700 text-white font-medium px-4 py-2 rounded-lg hover:bg-rose-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry Connection
                  </button>
                </div>
              ) : filteredPredictions.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center space-y-3">
                  <Info className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900">PREDICTION HISTORY IS EMPTY</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {predictions.length === 0
                      ? "No saved prediction records are currently available in the database."
                      : "No prediction records match your active search filters."}
                  </p>
                  {predictions.length > 0 && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1.5 text-xs bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Table View */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs text-left text-slate-700">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="px-3.5 py-3">ID</th>
                          <th className="px-3.5 py-3">Company</th>
                          <th className="px-3.5 py-3">Type</th>
                          <th className="px-3.5 py-3">Year</th>
                          <th className="px-3.5 py-3">Wafer Demand</th>
                          <th className="px-3.5 py-3">Date</th>
                          <th className="px-3.5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedPredictions.map((p) => {
                          const isSelected = selectedPrediction?.id === p.id;
                          const isStartup = getRecordType(p) === "Startup";
                          return (
                            <tr
                              key={p.id}
                              onClick={() => setSelectedPrediction(p)}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-blue-50/70 font-medium"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                                PRD{p.id.toString().padStart(3, "0")}
                              </td>

                              <td className="px-3.5 py-3">
                                <div className="font-bold text-slate-900">{getRecordCompany(p)}</div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {getRecordCompanyId(p)}
                                </div>
                              </td>

                              <td className="px-3.5 py-3">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                    isStartup
                                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {getRecordType(p)}
                                </span>
                              </td>

                              <td className="px-3.5 py-3 font-semibold text-slate-800">
                                {getRecordYear(p)}
                              </td>

                              <td className="px-3.5 py-3 font-bold text-slate-900">
                                {getRecordDemand(p).toLocaleString()}{" "}
                                <span className="text-[10px] font-normal text-slate-500">wspm</span>
                              </td>

                              <td className="px-3.5 py-3 text-[11px] text-slate-500 font-mono">
                                {getRecordDate(p)}
                              </td>

                              <td className="px-3.5 py-3 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPrediction(p);
                                    setShowConfirmModal(true);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-500">
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredPredictions.length)} of{" "}
                        {filteredPredictions.length} records
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => prev - 1)}
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="px-3 font-semibold text-slate-700">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          className="p-1.5 border border-slate-200 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* 5. DELETION CONFIRMATION DIALOG / MODAL                    */}
        {/* ========================================================== */}
        <AnimatePresence>
          {showConfirmModal && selectedPrediction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                    <AlertTriangle className="w-5 h-5" />
                    Delete this prediction record?
                  </div>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Modal Body: Selected Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Company Name:</span>
                    <span className="font-bold text-slate-900">{getRecordCompany(selectedPrediction)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Company ID:</span>
                    <span className="font-mono font-bold text-slate-900">{getRecordCompanyId(selectedPrediction)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Prediction ID:</span>
                    <span className="font-mono font-bold text-rose-700">PRD{selectedPrediction.id.toString().padStart(3, "0")}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Predicted Demand:</span>
                    <span className="font-bold text-blue-700">{getRecordDemand(selectedPrediction).toLocaleString()} wafers/mo</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Forecast Year:</span>
                    <span className="font-semibold text-slate-800">{getRecordYear(selectedPrediction)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Prediction Date:</span>
                    <span className="font-mono text-slate-700">{getRecordDate(selectedPrediction)}</span>
                  </div>
                </div>

                {/* Explicit Safety Warning */}
                <div className="bg-rose-50 border border-rose-200 text-rose-900 rounded-lg p-3 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-rose-800">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Warning
                  </div>
                  <p className="text-rose-800 leading-normal">
                    This action removes the saved prediction record from prediction history. It does not delete the company or modify the ML model.
                  </p>
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    disabled={deleting}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {deleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 fill-white" />
                        Delete Prediction
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
