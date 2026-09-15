"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  PlusCircle,
  Cpu,
  Building2,
  DollarSign,
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Factory,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { searchStartup, createStartup, predictStartup, saveStartupPrediction } from "@/lib/api";

export default function StartupInputPage() {
  const router = useRouter();

  // Search & Startup Identification State
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isNewStartup, setIsNewStartup] = useState<boolean>(true);

  const [searchStatus, setSearchStatus] = useState<{
    type: "idle" | "success" | "warning" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  // Progressive Disclosure State (Form hidden initially)
  const [showForm, setShowForm] = useState(false);

  // Startup Input Form state matching backend & Streamlit requirements
  const [form, setForm] = useState({
    company: "",
    country: "USA",
    fab_type: "logic_leading",
    segment: "foundry",
    year: 2026,
    process_node_nm: 3.0,
    expected_revenue: 2.5,
    rd_budget: 0.8,
    capex: 1.5,
    ai_chip_launches: 2,
    expected_shipments: 500000,
    expected_ai_revenue: 800.0,
  });

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const updateForm = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==========================================================
  // STATE 2 — SEARCH EXISTING STARTUP IN DATABASE
  // ==========================================================
  const handleSearchDatabase = async () => {
    const query = searchName.trim() || form.company.trim();

    if (!query) {
      setSearchStatus({
        type: "warning",
        message: "Please enter a startup company name to search.",
      });
      return;
    }

    setSearching(true);
    setSearchStatus({ type: "idle", message: "" });

    try {
      const res = await searchStartup(query);

      if (res.success && res.exists && res.startup) {
        const s = res.startup;
        const latest = res.latest_data || {};
        const cId = res.company_id || s.company_id || "ST0001";

        setCompanyId(cId);
        setIsNewStartup(false);

        // Extract fields prioritizing latest prediction history data, then startup record
        const loadedCompany = latest.company || s.company || s.company_name || query;
        const loadedCountry = latest.country || s.country || s.country_iso3 || "USA";
        const loadedFab = latest.fab_type || s.fab_type || "logic_leading";
        const loadedSegment = latest.segment || s.segment || "foundry";
        const loadedYear = latest.year ? Number(latest.year) : (s.year ? Number(s.year) : 2026);
        const loadedNode = latest.process_node_nm ? Number(latest.process_node_nm) : (s.process_node_nm ? Number(s.process_node_nm) : 3.0);
        const loadedRev = latest.expected_revenue ?? s.expected_revenue ?? s.revenue_usd_bn ?? 2.5;
        const loadedRd = latest.rd_budget ?? s.rd_budget ?? s.rd_spend_usd_bn ?? 0.8;
        const loadedCapex = latest.capex ?? s.capex ?? s.capex_usd_bn ?? 1.5;
        const loadedLaunches = latest.ai_chip_launches ? Number(latest.ai_chip_launches) : (s.ai_chip_launches ? Number(s.ai_chip_launches) : 2);
        const loadedShipments = latest.expected_shipments ?? s.expected_shipments ?? s.total_ai_shipments ?? 500000;
        const loadedAiRev = latest.expected_ai_revenue ?? s.expected_ai_revenue ?? s.total_ai_revenue_m ?? 800.0;

        setForm({
          company: loadedCompany,
          country: ["IND", "USA", "TWN", "KOR", "CHN"].includes(loadedCountry) ? loadedCountry : "USA",
          fab_type: loadedFab,
          segment: loadedSegment,
          year: loadedYear,
          process_node_nm: Number(loadedNode),
          expected_revenue: Number(loadedRev),
          rd_budget: Number(loadedRd),
          capex: Number(loadedCapex),
          ai_chip_launches: Number(loadedLaunches),
          expected_shipments: Number(loadedShipments),
          expected_ai_revenue: Number(loadedAiRev),
        });

        setSearchStatus({
          type: "success",
          message: `✓ Existing startup found in database — Company ID: ${cId}`,
        });

        // Reveal parameter form for existing startup
        setShowForm(true);
      } else {
        setCompanyId(null);
        setIsNewStartup(true);

        setSearchStatus({
          type: "warning",
          message: `Startup "${query}" was not found in database. Click "➕ Enter New Startup" below to register and generate a Company ID.`,
        });
        updateForm("company", query);

        // Keep form hidden until user clicks "Enter New Startup"
        setShowForm(false);
      }
    } catch (err) {
      console.error("Search error:", err);
      setCompanyId(null);
      setIsNewStartup(true);

      setSearchStatus({
        type: "warning",
        message: `Unable to search database. Click "➕ Enter New Startup" below to provide details manually.`,
      });
      if (query) updateForm("company", query);
      setShowForm(false);
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // STATE 3 — ENTER NEW STARTUP (AUTOMATIC ID GENERATION + SAVE)
  // ==========================================================
  const handleEnterNewStartup = async () => {
    const targetName = searchName.trim() || form.company.trim() || "";
    setCreating(true);

    const updatedForm = {
      company: targetName,
      country: form.country || "USA",
      fab_type: form.fab_type || "logic_leading",
      segment: form.segment || "foundry",
      year: 2026,
      process_node_nm: 3.0,
      expected_revenue: 2.5,
      rd_budget: 0.8,
      capex: 1.5,
      ai_chip_launches: 2,
      expected_shipments: 500000,
      expected_ai_revenue: 800.0,
    };

    setForm(updatedForm);

    if (targetName) {
      try {
        // Register startup with backend database persistence layer
        const res = await createStartup(updatedForm);

        if (res.success && res.company_id) {
          setCompanyId(res.company_id);
          setIsNewStartup(res.is_new ?? true);

          setSearchStatus({
            type: "success",
            message: `✓ Startup registered successfully — Company ID: ${res.company_id}`,
          });
        } else {
          setSearchStatus({
            type: "idle",
            message: "",
          });
        }
      } catch (err) {
        console.warn("Backend startup creation notice:", err);
        setSearchStatus({
          type: "idle",
          message: "",
        });
      } finally {
        setCreating(false);
      }
    } else {
      setCompanyId(null);
      setIsNewStartup(true);
      setSearchStatus({
        type: "idle",
        message: "",
      });
      setCreating(false);
    }

    // Explicitly reveal the parameter form when Enter New Startup is clicked
    setShowForm(true);
  };

  // ==========================================================
  // SUBMIT PREDICTION TO BACKEND API
  // ==========================================================
  const handleSubmitPrediction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.company.trim()) {
      alert("Please enter a valid Startup Company Name.");
      return;
    }

    setLoading(true);

    try {
      // Call backend REST API endpoint /api/startup/predict with company_id
      const payload = {
        ...form,
        company_id: companyId,
      };

      const res = await predictStartup(payload);

      if (!res.success) {
        throw new Error(res.error || "Startup prediction failed on server.");
      }

      const activeCompanyId = res.company_id || companyId;
      if (res.company_id && res.company_id !== companyId) {
        setCompanyId(res.company_id);
      }

      // Store inputs, companyId, and results in sessionStorage
      sessionStorage.setItem(
        "startup_prediction_input",
        JSON.stringify({
          ...form,
          company_id: activeCompanyId,
          is_new: res.is_new ?? isNewStartup,
        })
      );
      sessionStorage.setItem("startup_prediction_result", JSON.stringify(res));

      // Asynchronously attempt to save to database history
      try {
        await saveStartupPrediction({
          company_id: activeCompanyId,
          startup: form,
          prediction: res,
          confidence: res.confidence,
        });
      } catch (saveErr) {
        console.warn("Save history notice:", saveErr);
      }

      // Navigate to analyst result page
      router.push("/predict/startup/result");
    } catch (err: any) {
      console.error("Prediction error:", err);
      alert(err.message || "Failed to generate startup prediction. Check backend status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans pb-20">
      <div className="mx-auto max-w-6xl px-8 py-12">
        {/* Back Link */}
        <Link
          href="/predict"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Prediction Portal
        </Link>

        {/* Page Title & Hierarchy matching Existing Company Prediction */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            INSIQ ANALYST DESK
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950">
            Startup Company Prediction
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Enter startup company details, review operating parameters, and generate an AI-powered monthly wafer demand forecast.
          </p>
        </div>

        {/* ==================================================
            1. ENTER STARTUP NAME
        ================================================== */}
        <section className="mt-10 border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  1. Enter Startup Name
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter a startup name above and click Search Database / Load Startup.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Label & Search Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Startup Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchName || form.company}
                  onChange={(e) => {
                    setSearchName(e.target.value);
                    updateForm("company", e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchDatabase();
                    }
                  }}
                  placeholder="Enter startup name (e.g. Latent Fabs, NeoAI)"
                  className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Equal-Width Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleSearchDatabase}
                disabled={searching}
                className="h-12 bg-gray-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-600 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search Database / Load Startup</span>
              </button>

              <button
                type="button"
                onClick={handleEnterNewStartup}
                disabled={creating}
                className="h-12 border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                )}
                <span>➕ Enter New Startup</span>
              </button>
            </div>

            {/* Search Status Notice */}
            {searchStatus.type !== "idle" && (
              <div
                className={`p-4 text-xs font-medium flex items-start gap-2.5 border ${
                  searchStatus.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : searchStatus.type === "warning"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {searchStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>{searchStatus.message}</div>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            STARTUP PARAMETER FORM (PROGRESSIVE DISCLOSURE)
            Revealed on "Enter New Startup" or Search Hit
        ================================================== */}
        {showForm && (
          <form onSubmit={handleSubmitPrediction} className="mt-8 space-y-8">
            {/* SECTION 2 HEADER & COMPANY ID DISPLAY */}
            <section className="border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                <div className="flex items-center gap-3">
                  <Cpu className="h-4 w-4 text-blue-600" />
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      2. Startup Financial & Technology Parameters
                    </h2>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Configure fab type, process node, revenue, and accelerator parameters.
                    </p>
                  </div>
                </div>

                {/* COMPANY ID DISPLAY */}
                <div>
                  {companyId ? (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                        {!isNewStartup ? "Existing Database Record" : "Registered Company ID"}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold font-mono text-gray-900 flex items-center gap-1 justify-end">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        {companyId}
                      </p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                        New Startup Record
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 font-mono">
                        ID generated on save (e.g. ST0001)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Classification */}
              <div className="p-6 border-b border-gray-200 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Basic Classification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Startup Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Startup Name
                    </label>
                    <input
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => updateForm("company", e.target.value)}
                      placeholder="Startup Name"
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Country Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Country / Region
                    </label>
                    <select
                      value={form.country}
                      onChange={(e) => updateForm("country", e.target.value)}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="IND">IND — India</option>
                      <option value="USA">USA — United States</option>
                      <option value="TWN">TWN — Taiwan</option>
                      <option value="KOR">KOR — South Korea</option>
                      <option value="CHN">CHN — China</option>
                    </select>
                  </div>

                  {/* Fab Type Dropdown */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Fab Type Architecture
                    </label>
                    <select
                      value={form.fab_type}
                      onChange={(e) => updateForm("fab_type", e.target.value)}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="logic_leading">Logic Leading Edge (&lt;7nm)</option>
                      <option value="logic_mature">Logic Mature (&ge;7nm)</option>
                      <option value="memory_DRAM">Memory DRAM</option>
                      <option value="memory_NAND">Memory NAND</option>
                      <option value="foundry">Pure-Play Foundry</option>
                      <option value="idm">IDM Architecture</option>
                    </select>
                  </div>

                  {/* Segment Dropdown */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Industry Segment
                    </label>
                    <select
                      value={form.segment}
                      onChange={(e) => updateForm("segment", e.target.value)}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="foundry">Foundry Services</option>
                      <option value="idm_logic">IDM Logic ICs</option>
                      <option value="idm_memory">IDM Memory Storage</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technology & Node */}
              <div className="p-6 border-b border-gray-200 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Factory className="w-4 h-4 text-blue-600" />
                  Technology & Semiconductor Process Node
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Year */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Forecast Year
                    </label>
                    <input
                      type="number"
                      min="2024"
                      max="2035"
                      step="1"
                      value={form.year}
                      onChange={(e) => updateForm("year", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Process Node */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Process Node (nm)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="any"
                      value={form.process_node_nm}
                      onChange={(e) => updateForm("process_node_nm", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                    <p className="mt-1 text-[11px] text-gray-400">
                      e.g. 2nm, 3nm, 5nm, 7nm, 14nm, 28nm
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Parameters */}
              <div className="p-6 border-b border-gray-200 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Financial Capacity & Capital Investments ($B USD)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Revenue */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Expected Revenue ($B USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.expected_revenue}
                      onChange={(e) => updateForm("expected_revenue", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* R&D Budget */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Annual R&D Budget ($B USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.rd_budget}
                      onChange={(e) => updateForm("rd_budget", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* CapEx */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Annual CapEx ($B USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.capex}
                      onChange={(e) => updateForm("capex", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* AI Business Information */}
              <div className="p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                  AI Accelerators & Shipments Volume
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* AI Chip Launches */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      AI Chip Product Launches
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.ai_chip_launches}
                      onChange={(e) => updateForm("ai_chip_launches", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Expected AI Shipments */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Expected AI Shipments (Units)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.expected_shipments}
                      onChange={(e) => updateForm("expected_shipments", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Expected AI Revenue */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Expected AI Revenue ($M USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.expected_ai_revenue}
                      onChange={(e) => updateForm("expected_ai_revenue", Number(e.target.value))}
                      className="h-12 w-full border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* PREDICTION SUBMIT BUTTON */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full sm:w-auto bg-gray-950 px-8 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Executing ML Prediction...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Generate Startup Prediction</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}