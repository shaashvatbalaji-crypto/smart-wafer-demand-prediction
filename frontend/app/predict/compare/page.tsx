"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  GitCompare,
  Search,
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
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Cpu,
  TrendingDown,
  Info,
  Activity,
  Zap,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getPredictionHistory,
  searchCompanies,
  getDashboardData,
  getFinancialData,
  getMarketIntelligence,
  getDatasetScatter,
  generatePdfReport,
} from "@/lib/api";

export default function ComparePredictionsPage() {
  // Master Selection & Entity Lists
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [companyList, setCompanyList] = useState<any[]>([]);
  const [scatterDataset, setScatterDataset] = useState<any[]>([]);
  const [marketIntel, setMarketIntel] = useState<any>(null);

  // Selected Entities
  const [selectedIdA, setSelectedIdA] = useState<string>("");
  const [selectedIdB, setSelectedIdB] = useState<string>("");

  // Data Objects for A & B
  const [dashA, setDashA] = useState<any>(null);
  const [dashB, setDashB] = useState<any>(null);

  // Scatter Tab State: "revenue" | "rd" | "capex" | "ai"
  const [scatterMetric, setScatterMetric] = useState<"revenue" | "rd" | "capex" | "ai">("revenue");
  const [hoveredScatterPoint, setHoveredScatterPoint] = useState<any | null>(null);

  // Historical Chart & Filter States
  const [timeRange, setTimeRange] = useState<"ALL" | "30D" | "90D" | "1Y">("ALL");
  const [showLineA, setShowLineA] = useState<boolean>(true);
  const [showLineB, setShowLineB] = useState<boolean>(true);
  const [hoveredHistPoint, setHoveredHistPoint] = useState<any | null>(null);
  const [historyPage, setHistoryPage] = useState<number>(1);

  // Status & Export States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfExporting, setPdfExporting] = useState<boolean>(false);

  // ==========================================================
  // 1. INITIAL LOAD & DATA FETCHING
  // ==========================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch saved prediction history, company directory, market intelligence, and scatter metrics
      const [histRes, compRes, marketRes, scatterRes] = await Promise.all([
        getPredictionHistory().catch(() => ({ success: false, predictions: [] })),
        searchCompanies("").catch(() => ({ success: false, companies: [] })),
        getMarketIntelligence().catch(() => ({ success: false })),
        getDatasetScatter().catch(() => ({ success: false, companies: [] })),
      ]);

      const historyRecords = histRes.success && Array.isArray(histRes.predictions) ? histRes.predictions : [];
      setHistoryList(historyRecords);

      if (marketRes.success && marketRes.data) {
        setMarketIntel(marketRes.data);
      }

      if (scatterRes.success && Array.isArray(scatterRes.companies)) {
        setScatterDataset(scatterRes.companies);
      }

      // Filter and unify company directory
      const validCompanies = compRes.success && Array.isArray(compRes.companies)
        ? compRes.companies.filter((c: any) => {
            const name = typeof c === "string" ? c : c.company_name || c.company || "";
            const id = typeof c === "string" ? c : c.company_id || "";
            return name && !name.startsWith("COMP_") && !id.startsWith("COMP_");
          })
        : [];
      setCompanyList(validCompanies);

      // Default Selections: TSMC (EC0002) vs Samsung (EC0001) or Intel (EC0003)
      const compA = validCompanies.find((c: any) => c.company_name === "TSMC" || c.company_id === "EC0002") || validCompanies[0];
      const compB = validCompanies.find((c: any) => c.company_name === "Samsung Electronics" || c.company_name === "Samsung" || c.company_id === "EC0001") || validCompanies[1] || validCompanies[0];

      const idA = compA?.company_id || "EC0002";
      const idB = compB?.company_id || "EC0001";

      setSelectedIdA(idA);
      setSelectedIdB(idB);

      await fetchComparison(idA, idB);
    } catch (err: any) {
      console.error("Initial load error:", err);
      setError("Unable to load comparison baseline data. Please verify the backend API service.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async (idA: string, idB: string) => {
    setLoading(true);
    setError(null);

    try {
      const [resA, resB] = await Promise.all([
        getDashboardData(idA).catch(() => ({ success: false })),
        getDashboardData(idB).catch(() => ({ success: false })),
      ]);

      if (resA.success) setDashA(resA);
      else setDashA(null);

      if (resB.success) setDashB(resB);
      else setDashB(null);

      if (!resA.success && !resB.success) {
        setError("Unable to retrieve prediction data for the selected entities.");
      }
    } catch (err: any) {
      console.error("Fetch comparison error:", err);
      setError("Failed to fetch comparison records. Please check API server connection.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // HANDLERS
  // ==========================================================
  const handleSelectA = (val: string) => {
    setSelectedIdA(val);
    setHistoryPage(1);
    if (val && selectedIdB) {
      fetchComparison(val, selectedIdB);
    }
  };

  const handleSelectB = (val: string) => {
    setSelectedIdB(val);
    setHistoryPage(1);
    if (selectedIdA && val) {
      fetchComparison(selectedIdA, val);
    }
  };

  const handleExportPDF = async () => {
    if (!dashA && !dashB) return;
    setPdfExporting(true);

    try {
      const nameA = dashA?.company_name || "Company A";
      const nameB = dashB?.company_name || "Company B";

      const payload = {
        entity_name: `${nameA}_vs_${nameB}`,
        company_id: dashA?.company_id || "EC0002",
        entity_type: "Analyst Comparison Report",
        inputs: dashA?.dataset_data || {},
        prediction_result: dashA?.latest_prediction || {},
        benchmark_data: dashA?.benchmark || {},
        financial_data: dashA?.financial || {},
        market_intel_data: marketIntel || {},
        is_startup: false,
      };

      const blob = await generatePdfReport(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `INSIQ_Compare_${nameA.replace(/[^a-zA-Z0-9_-]/g, "_")}_vs_${nameB.replace(/[^a-zA-Z0-9_-]/g, "_")}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Failed to generate analyst PDF report.");
    } finally {
      setPdfExporting(false);
    }
  };

  // Safe scalar text extractor helper
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

  // ==========================================================
  // DATA EXTRACTION & CALCULATIONS
  // ==========================================================
  // Company A Details
  const nameA = dashA?.company_name || "Company A";
  const cidA = dashA?.company_id || "EC0002";
  const dsA = dashA?.dataset_data || {};
  const predA = dashA?.latest_prediction || {};
  const countryA = dsA.country_iso3 || dashA?.company?.country || "TWN";
  const typeA = predA.prediction_type || dashA?.company?.company_type || "Existing Company";
  const wafersA = predA.predicted_wafers
    ? Math.round(predA.predicted_wafers)
    : dsA.monthly_wafer_capacity
    ? Math.round(dsA.monthly_wafer_capacity)
    : 326450;
  const confA = predA.confidence ? Math.round(predA.confidence) : 87;
  const revA = dsA.revenue_usd_bn || 69.8;
  const rdA = dsA.rd_spend_usd_bn || 6.2;
  const capexA = dsA.capex_usd_bn || 38.0;
  const aiA = dsA.total_ai_shipments || 2930000;
  const nodeA = dsA.process_node_nm || 3;
  const yearA = predA.year || dsA.year || 2026;
  const modelA = predA.model_version || "CatBoost Hybrid v1.0";

  // Company B Details
  const nameB = dashB?.company_name || "Company B";
  const cidB = dashB?.company_id || "EC0001";
  const dsB = dashB?.dataset_data || {};
  const predB = dashB?.latest_prediction || {};
  const countryB = dsB.country_iso3 || dashB?.company?.country || "KOR";
  const typeB = predB.prediction_type || dashB?.company?.company_type || "Existing Company";
  const wafersB = predB.predicted_wafers
    ? Math.round(predB.predicted_wafers)
    : dsB.monthly_wafer_capacity
    ? Math.round(dsB.monthly_wafer_capacity)
    : 245100;
  const confB = predB.confidence ? Math.round(predB.confidence) : 95;
  const revB = dsB.revenue_usd_bn || 54.2;
  const rdB = dsB.rd_spend_usd_bn || 4.5;
  const capexB = dsB.capex_usd_bn || 22.1;
  const aiB = dsB.total_ai_shipments || 1850000;
  const nodeB = dsB.process_node_nm || 4;
  const yearB = predB.year || dsB.year || 2026;
  const modelB = predB.model_version || "CatBoost Hybrid v1.0";

  // Differentials
  const diffWafers = wafersA - wafersB;
  const higherDemandComp = diffWafers >= 0 ? nameA : nameB;
  const pctWafers = wafersB > 0 ? ((wafersA - wafersB) / wafersB) * 100 : 0;
  const pctWafersStr = `${pctWafers >= 0 ? "+" : ""}${pctWafers.toFixed(1)}%`;

  const diffRev = revA - revB;
  const pctRev = revB > 0 ? ((revA - revB) / revB) * 100 : 0;

  const diffRd = rdA - rdB;
  const pctRd = rdB > 0 ? ((rdA - rdB) / rdB) * 100 : 0;

  const diffCapex = capexA - capexB;
  const pctCapex = capexB > 0 ? ((capexA - capexB) / capexB) * 100 : 0;

  const diffAi = aiA - aiB;
  const pctAi = aiB > 0 ? ((aiA - aiB) / aiB) * 100 : 0;

  // Driver Normalization for 0-100% Indexed Comparison
  const maxRev = Math.max(revA, revB, 0.1);
  const normRevA = (revA / maxRev) * 100;
  const normRevB = (revB / maxRev) * 100;

  const maxRd = Math.max(rdA, rdB, 0.1);
  const normRdA = (rdA / maxRd) * 100;
  const normRdB = (rdB / maxRd) * 100;

  const maxCapex = Math.max(capexA, capexB, 0.1);
  const normCapexA = (capexA / maxCapex) * 100;
  const normCapexB = (capexB / maxCapex) * 100;

  const maxAi = Math.max(aiA, aiB, 1);
  const normAiA = (aiA / maxAi) * 100;
  const normAiB = (aiB / maxAi) * 100;

  // Live Financial Intelligence
  const finA = dashA?.financial?.data || dashA?.financial || {};
  const finB = dashB?.financial?.data || dashB?.financial || {};
  const isLiveFinA = dashA?.financial?.status === "live";
  const isLiveFinB = dashB?.financial?.status === "live";

  // ==========================================================
  // SCATTER PLOT MATH & COMPUTATIONS (PEARSON R, REGRESSION, MEDIANS)
  // ==========================================================
  const scatterStats = useMemo(() => {
    if (!scatterDataset || scatterDataset.length === 0) {
      return {
        points: [],
        count: 0,
        r: 0,
        rStr: "0.00",
        xLabel: "Revenue ($B)",
        yLabel: "Wafer Demand (Units / Month)",
        xMed: 0,
        yMed: 0,
        xMin: 0,
        xMax: 100,
        yMin: 0,
        yMax: 500000,
        xMedPct: 50,
        yMedPct: 50,
        regLine: null,
        compAPos: "Positioned relative to dataset benchmark",
        compBPos: "Positioned relative to dataset benchmark",
        isLogX: false,
      };
    }

    let xLabel = "Revenue ($B)";
    if (scatterMetric === "rd") xLabel = "R&D Spend ($B)";
    else if (scatterMetric === "capex") xLabel = "CapEx Spend ($B)";
    else if (scatterMetric === "ai") xLabel = "AI Accelerator Shipments (Million Units)";

    const yLabel = "Wafer Demand (Units / Month)";

    const validPts = scatterDataset
      .map((c) => {
        let rawX = 0;
        if (scatterMetric === "revenue") rawX = parseFloat(c.revenue_usd_bn || 0);
        else if (scatterMetric === "rd") rawX = parseFloat(c.rd_spend_usd_bn || 0);
        else if (scatterMetric === "capex") rawX = parseFloat(c.capex_usd_bn || 0);
        else if (scatterMetric === "ai") rawX = parseFloat(c.total_ai_shipments || 0) / 1000000;

        const rawY = parseFloat(c.monthly_wafer_capacity || 0);
        return {
          ...c,
          rawX,
          rawY,
          isA: c.company_id === cidA || c.company_name === nameA,
          isB: c.company_id === cidB || c.company_name === nameB,
        };
      })
      .filter((pt) => pt.rawX >= 0 && pt.rawY > 0);

    const count = validPts.length;
    if (count === 0) {
      return {
        points: [],
        count: 0,
        r: 0,
        rStr: "Insufficient data",
        xLabel,
        yLabel,
        xMed: 0,
        yMed: 0,
        xMin: 0,
        xMax: 100,
        yMin: 0,
        yMax: 500000,
        xMedPct: 50,
        yMedPct: 50,
        regLine: null,
        compAPos: "Insufficient data",
        compBPos: "Insufficient data",
        isLogX: false,
      };
    }

    const xVals = validPts.map((p) => p.rawX);
    const yVals = validPts.map((p) => p.rawY);

    const xMin = Math.min(...xVals, 0);
    const xMax = Math.max(...xVals, 10);
    const yMin = 0;
    const yMax = Math.max(...yVals, 100000);

    const getMedian = (arr: number[]) => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const xMed = getMedian(xVals);
    const yMed = getMedian(yVals);

    const sumX = xVals.reduce((a, b) => a + b, 0);
    const sumY = yVals.reduce((a, b) => a + b, 0);
    const meanX = sumX / count;
    const meanY = sumY / count;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < count; i++) {
      const dx = xVals[i] - meanX;
      const dy = yVals[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    const r = den > 0 ? num / den : 0;
    const rStr = `${r >= 0 ? "+" : ""}${r.toFixed(2)}`;

    let slope = 0;
    let intercept = meanY;
    if (denX > 0) {
      slope = num / denX;
      intercept = meanY - slope * meanX;
    }

    const posXVals = xVals.filter((v) => v > 0);
    const minPosX = posXVals.length > 0 ? Math.min(...posXVals) : 0.1;
    const isLogX = xMax / minPosX > 15;

    const getNormX = (val: number) => {
      if (isLogX && val > 0 && minPosX > 0) {
        const logVal = Math.log10(val);
        const logMin = Math.log10(minPosX);
        const logMax = Math.log10(xMax);
        if (logMax === logMin) return 0.5;
        return Math.min(1, Math.max(0, (logVal - logMin) / (logMax - logMin)));
      }
      if (xMax === xMin) return 0.5;
      return Math.min(1, Math.max(0, (val - xMin) / (xMax - xMin)));
    };

    const getNormY = (val: number) => {
      if (yMax === yMin) return 0.5;
      return Math.min(1, Math.max(0, (val - yMin) / (yMax - yMin)));
    };

    // Convert normalized coordinates to SVG viewBox pixel space (0..1000 X, 0..480 Y)
    // Left Margin = 95px (protects Y-axis title/labels), Right = 925px (width = 830px)
    // Top Margin = 45px (protects header/quadrant labels), Bottom = 425px (height = 380px)
    const mappedPts = validPts.map((pt) => {
      const nx = getNormX(pt.rawX);
      const ny = getNormY(pt.rawY);

      const xPx = 95 + nx * 830;
      const yPx = 425 - ny * 380;

      return {
        ...pt,
        nx,
        ny,
        xPx,
        yPx,
      };
    });

    const xStartVal = xMin;
    const yStartVal = slope * xStartVal + intercept;
    const xEndVal = xMax;
    const yEndVal = slope * xEndVal + intercept;

    const regLine = {
      x1Px: 95 + getNormX(xStartVal) * 830,
      y1Px: 425 - getNormY(yStartVal) * 380,
      x2Px: 95 + getNormX(xEndVal) * 830,
      y2Px: 425 - getNormY(yEndVal) * 380,
    };

    const xMedPx = 95 + getNormX(xMed) * 830;
    const yMedPx = 425 - getNormY(yMed) * 380;

    // Build Priority-Based Collision Resolution Label Boxes
    const itemA = mappedPts.find((p) => p.isA);
    const itemB = mappedPts.find((p) => p.isB);
    const nonSelectedOutliers = mappedPts
      .filter((p) => !p.isA && !p.isB)
      .sort((a, b) => b.rawY - a.rawY);

    const candidatesToLabel: any[] = [];
    if (itemA) candidatesToLabel.push({ ...itemA, priority: 1 });
    if (itemB) candidatesToLabel.push({ ...itemB, priority: 2 });
    nonSelectedOutliers.slice(0, 2).forEach((pt, idx) => {
      candidatesToLabel.push({ ...pt, priority: 3 + idx });
    });

    const placedLabels: any[] = [];

    candidatesToLabel.forEach((pt) => {
      const textStr = `${pt.company_name} ${pt.isA ? "(A)" : pt.isB ? "(B)" : ""}`.trim();
      const labelW = Math.max(88, textStr.length * 6.5 + 18);
      const labelH = 20;

      const offsets = [
        { dx: 14, dy: -24 },
        { dx: 14, dy: 8 },
        { dx: -labelW - 14, dy: -24 },
        { dx: -labelW - 14, dy: 8 },
        { dx: -labelW / 2, dy: -32 },
        { dx: -labelW / 2, dy: 16 },
        { dx: 24, dy: -36 },
        { dx: -labelW - 24, dy: -36 },
        { dx: -labelW - 30, dy: -4 },
        { dx: 30, dy: -4 },
        { dx: 24, dy: 24 },
        { dx: -labelW - 24, dy: 24 },
      ];

      let bestOpt: any = null;
      let lowestScore = Infinity;

      for (const off of offsets) {
        let left = pt.xPx + off.dx;
        let top = pt.yPx + off.dy;

        // Bound enforcement inside viewBox 0..1000 X and 0..480 Y
        let oob = false;
        if (left < 95) { left = 95; oob = true; }
        if (left + labelW > 925) { left = 925 - labelW; oob = true; }
        if (top < 45) { top = 45; oob = true; }
        if (top + labelH > 425) { top = 425 - labelH; oob = true; }

        let overlapCount = 0;
        for (const pl of placedLabels) {
          const overlaps = !(
            left + labelW + 6 < pl.labelX ||
            left > pl.labelX + pl.width + 6 ||
            top + labelH + 6 < pl.labelY ||
            top > pl.labelY + pl.height + 6
          );
          if (overlaps) overlapCount++;
        }

        const dist = Math.hypot(left + labelW / 2 - pt.xPx, top + labelH / 2 - pt.yPx);
        const score = (overlapCount * 10000) + (oob ? 500 : 0) + dist;

        if (score < lowestScore) {
          lowestScore = score;
          bestOpt = { left, top, overlapCount, oob, dist };
        }
      }

      // Suppress outlier label if it collides, protecting priority A & B
      if (pt.priority > 2 && bestOpt && bestOpt.overlapCount > 0) {
        return;
      }

      if (bestOpt) {
        const left = bestOpt.left;
        const top = bestOpt.top;

        // Anchor calculation for smart connector leader lines
        let anchorX = pt.xPx;
        let anchorY = pt.yPx;

        if (left > pt.xPx) anchorX = left;
        else if (left + labelW < pt.xPx) anchorX = left + labelW;
        else anchorX = Math.max(left, Math.min(left + labelW, pt.xPx));

        if (top > pt.yPx) anchorY = top;
        else if (top + labelH < pt.yPx) anchorY = top + labelH;
        else anchorY = Math.max(top, Math.min(top + labelH, pt.yPx));

        const distCenter = Math.hypot(pt.xPx - (left + labelW / 2), pt.yPx - (top + labelH / 2));

        placedLabels.push({
          id: pt.company_id || pt.company_name,
          company_name: pt.company_name,
          isA: pt.isA,
          isB: pt.isB,
          ptX: pt.xPx,
          ptY: pt.yPx,
          labelX: left,
          labelY: top,
          width: labelW,
          height: labelH,
          anchorX,
          anchorY,
          needsLeader: distCenter > 28,
          textStr,
        });
      }
    });

    const ptA = mappedPts.find((p) => p.isA) || { rawX: revA, rawY: wafersA };
    const ptB = mappedPts.find((p) => p.isB) || { rawX: revB, rawY: wafersB };

    const compAPos = `${nameA} (A) is positioned ${ptA.rawX >= xMed ? "above" : "below"} industry median driver ($${ptA.rawX.toFixed(1)}) with ${ptA.rawY >= yMed ? "high" : "moderate"} wafer demand (${Math.round(ptA.rawY).toLocaleString()} wspm) relative to dataset benchmark.`;
    const compBPos = `${nameB} (B) is positioned ${ptB.rawX >= xMed ? "above" : "below"} industry median driver ($${ptB.rawX.toFixed(1)}) with ${ptB.rawY >= yMed ? "high" : "moderate"} wafer demand (${Math.round(ptB.rawY).toLocaleString()} wspm) relative to dataset benchmark.`;

    return {
      points: mappedPts,
      count,
      r,
      rStr,
      xLabel,
      yLabel,
      xMed,
      yMed,
      xMin,
      xMax,
      yMin,
      yMax,
      xMedPx,
      yMedPx,
      regLine,
      placedLabels,
      compAPos,
      compBPos,
      isLogX,
    };
  }, [scatterDataset, scatterMetric, cidA, cidB, nameA, nameB, revA, wafersA, revB, wafersB]);

  // ==========================================================
  // HISTORICAL TIME-SERIES MATH & DYNAMIC Y-AXIS SCALING
  // ==========================================================
  const historyStats = useMemo(() => {
    const allRecords: any[] = [];

    // Historical records from historyList
    historyList.forEach((h: any) => {
      const hCid = h.company_id || "";
      const hName = h.company || h.company_name || "";
      const isA = hCid === cidA || hName === nameA;
      const isB = hCid === cidB || hName === nameB;

      if (isA || isB) {
        const timeStr = h.prediction_time || h.created_at || h.date || "2026-09-15 12:00:00";
        const ts = new Date(timeStr).getTime() || Date.now();
        const wafers = parseFloat(h.predicted_wafers || h.prediction || 0);

        if (wafers > 0) {
          const dObj = new Date(timeStr);
          allRecords.push({
            ...h,
            id: h.id || `hist_${ts}_${Math.random()}`,
            company_name: isA ? nameA : nameB,
            company_id: isA ? cidA : cidB,
            isA,
            isB,
            wafers: Math.round(wafers),
            confidence: h.confidence || (isA ? confA : confB),
            timeStr,
            ts,
            fullDateStr: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateLabel: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            timeDetail: timeStr.includes(" ")
              ? timeStr.split(" ")[1]
              : timeStr.includes("T")
              ? timeStr.split("T")[1].substring(0, 5)
              : "12:00",
            predId: h.id ? (String(h.id).startsWith("PRED-") ? h.id : `PRED-${String(h.id).padStart(4, "0")}`) : `PRED-${isA ? cidA : cidB}`,
          });
        }
      }
    });

    // Include trend records from dashA if not present
    if (dashA?.trend && Array.isArray(dashA.trend)) {
      dashA.trend.forEach((t: any, idx: number) => {
        const timeStr = t.prediction_time || `2026-09-${10 + idx} 12:00:00`;
        const ts = new Date(timeStr).getTime() || Date.now();
        const wafers = parseFloat(t.predicted_wafers || 0);
        if (wafers > 0 && !allRecords.some((r) => r.isA && r.timeStr === timeStr)) {
          const dObj = new Date(timeStr);
          allRecords.push({
            id: `trend_a_${idx}`,
            company_name: nameA,
            company_id: cidA,
            isA: true,
            isB: false,
            wafers: Math.round(wafers),
            confidence: t.confidence || confA,
            timeStr,
            ts,
            fullDateStr: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateLabel: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            timeDetail: "12:00",
            predId: `PRED-A${idx + 1}`,
          });
        }
      });
    }

    // Include trend records from dashB if not present
    if (dashB?.trend && Array.isArray(dashB.trend)) {
      dashB.trend.forEach((t: any, idx: number) => {
        const timeStr = t.prediction_time || `2026-09-${10 + idx} 12:00:00`;
        const ts = new Date(timeStr).getTime() || Date.now();
        const wafers = parseFloat(t.predicted_wafers || 0);
        if (wafers > 0 && !allRecords.some((r) => r.isB && r.timeStr === timeStr)) {
          const dObj = new Date(timeStr);
          allRecords.push({
            id: `trend_b_${idx}`,
            company_name: nameB,
            company_id: cidB,
            isA: false,
            isB: true,
            wafers: Math.round(wafers),
            confidence: t.confidence || confB,
            timeStr,
            ts,
            fullDateStr: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dateLabel: dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            timeDetail: "12:00",
            predId: `PRED-B${idx + 1}`,
          });
        }
      });
    }

    // Ensure baseline evaluation record for A is included
    if (!allRecords.some((r) => r.isA)) {
      allRecords.push({
        id: `latest_a`,
        company_name: nameA,
        company_id: cidA,
        isA: true,
        isB: false,
        wafers: wafersA,
        confidence: confA,
        timeStr: "2026-09-15 12:00:00",
        ts: Date.now(),
        fullDateStr: "Sep 15, 2026",
        dateLabel: "Sep 15",
        timeDetail: "12:00",
        predId: `PRED-${cidA}`,
      });
    }

    // Ensure baseline evaluation record for B is included
    if (!allRecords.some((r) => r.isB)) {
      allRecords.push({
        id: `latest_b`,
        company_name: nameB,
        company_id: cidB,
        isA: false,
        isB: true,
        wafers: wafersB,
        confidence: confB,
        timeStr: "2026-09-15 12:00:00",
        ts: Date.now(),
        fullDateStr: "Sep 15, 2026",
        dateLabel: "Sep 15",
        timeDetail: "12:00",
        predId: `PRED-${cidB}`,
      });
    }

    // Filter by Time Range
    const now = Date.now();
    const filteredRecords = allRecords.filter((r) => {
      if (timeRange === "30D") return now - r.ts <= 30 * 86400 * 1000;
      if (timeRange === "90D") return now - r.ts <= 90 * 86400 * 1000;
      if (timeRange === "1Y") return now - r.ts <= 365 * 86400 * 1000;
      return true;
    });

    const sortedChrono = [...filteredRecords].sort((a, b) => a.ts - b.ts || String(a.id).localeCompare(String(b.id)));
    const sortedTable = [...filteredRecords].sort((a, b) => b.ts - a.ts || String(b.id).localeCompare(String(a.id)));

    const ptsA = sortedChrono.filter((p) => p.isA);
    const ptsB = sortedChrono.filter((p) => p.isB);

    // Latest and Earliest Calculations
    const latestA = ptsA.length > 0 ? ptsA[ptsA.length - 1] : { wafers: wafersA };
    const earliestA = ptsA.length > 0 ? ptsA[0] : { wafers: wafersA };
    const deltaWafersA = latestA.wafers - earliestA.wafers;
    const pctDeltaA = earliestA.wafers > 0 ? (deltaWafersA / earliestA.wafers) * 100 : 0;
    const trendClassA = pctDeltaA > 5 ? "Growing" : pctDeltaA < -5 ? "Declining" : "Stable";

    const latestB = ptsB.length > 0 ? ptsB[ptsB.length - 1] : { wafers: wafersB };
    const earliestB = ptsB.length > 0 ? ptsB[0] : { wafers: wafersB };
    const deltaWafersB = latestB.wafers - earliestB.wafers;
    const pctDeltaB = earliestB.wafers > 0 ? (deltaWafersB / earliestB.wafers) * 100 : 0;
    const trendClassB = pctDeltaB > 5 ? "Growing" : pctDeltaB < -5 ? "Declining" : "Stable";

    // Dynamic Y-Axis Bounds Calculation with 10% Padding (Avoids Excessive Empty Vertical Space)
    const visibleWafers = sortedChrono.map((p) => p.wafers);
    const minDemand = visibleWafers.length > 0 ? Math.min(...visibleWafers) : 50000;
    const maxDemand = visibleWafers.length > 0 ? Math.max(...visibleWafers) : 150000;
    
    const demandSpan = maxDemand - minDemand;
    const pad = Math.max(demandSpan * 0.10, 5000);

    let yMin = Math.max(0, Math.floor((minDemand - pad) / 5000) * 5000);
    let yMax = Math.ceil((maxDemand + pad) / 5000) * 5000;

    if (yMax === yMin) {
      yMax += 20000;
      yMin = Math.max(0, yMin - 10000);
    }

    // Time Bounds
    const allTs = sortedChrono.map((p) => p.ts);
    const minTs = allTs.length > 0 ? Math.min(...allTs) : Date.now() - 86400000;
    const maxTs = allTs.length > 0 ? Math.max(...allTs) : Date.now();

    const latestObsTs = allTs.length > 0 ? Math.max(...allTs) : Date.now();
    const latestDateStr = new Date(latestObsTs).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // SVG Pixel Mapping Functions (viewBox 0 0 1000 390, Margins: Left 85, Right 30, Top 25, Bottom 45)
    const mapPx = (pt: any, isLatest: boolean = false) => {
      const tsSpan = maxTs - minTs || 1;
      const ySpan = yMax - yMin || 1;

      const xPx = 85 + ((pt.ts - minTs) / tsSpan) * 885;
      const yPx = 345 - ((pt.wafers - yMin) / ySpan) * 320;

      return { ...pt, xPx, yPx, isLatest };
    };

    const mappedA = ptsA.map((pt, idx) => mapPx(pt, idx === ptsA.length - 1));
    const mappedB = ptsB.map((pt, idx) => mapPx(pt, idx === ptsB.length - 1));

    // Build SVG Path Strings in Pixel Coordinates
    let pathD_A = "";
    mappedA.forEach((pt, i) => {
      pathD_A += `${i === 0 ? "M" : "L"} ${pt.xPx.toFixed(1)} ${pt.yPx.toFixed(1)} `;
    });

    let pathD_B = "";
    mappedB.forEach((pt, i) => {
      pathD_B += `${i === 0 ? "M" : "L"} ${pt.xPx.toFixed(1)} ${pt.yPx.toFixed(1)} `;
    });

    // Y-Axis Ticks (5 Linear Ticks)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
      const wVal = Math.round(yMin + pct * (yMax - yMin));
      const yPx = 345 - pct * 320;
      const label = wVal >= 1000000 ? `${(wVal / 1000000).toFixed(1)}M` : wVal >= 1000 ? `${Math.round(wVal / 1000)}K` : `${wVal}`;
      return { wVal, yPx, label };
    });

    // Mathematically Non-Overlapping X-Axis Date Ticks (5 to 6 Spaced Interval Labels)
    const tickCount = Math.min(6, Math.max(2, sortedChrono.length));
    const tsSpan = maxTs - minTs || 1;
    const xTicks: any[] = [];

    for (let i = 0; i < tickCount; i++) {
      const tickTs = minTs + (i / (tickCount - 1 || 1)) * tsSpan;
      const xPx = 85 + (i / (tickCount - 1 || 1)) * 885;
      const dObj = new Date(tickTs);
      const dateLabel = dObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      xTicks.push({ dateLabel, xPx, tickTs });
    }

    // Historical Signal Text (Professional Analyst Wording)
    const trajectorySignal = `Available saved predictions indicate that ${nameA} currently projects a higher wafer demand (${latestA.wafers.toLocaleString()} wspm) than ${nameB} (${latestB.wafers.toLocaleString()} wspm). Across saved forecasts, ${nameA} has shown a ${trendClassA.toLowerCase()} predicted demand trajectory (${pctDeltaA >= 0 ? "+" : ""}${pctDeltaA.toFixed(1)}% change), while ${nameB} has shown a ${trendClassB.toLowerCase()} predicted demand trajectory (${pctDeltaB >= 0 ? "+" : ""}${pctDeltaB.toFixed(1)}% change).`;

    return {
      allRecords: sortedTable,
      mappedA,
      mappedB,
      pathD_A,
      pathD_B,
      latestA,
      earliestA,
      deltaWafersA,
      pctDeltaA,
      trendClassA,
      latestB,
      earliestB,
      deltaWafersB,
      pctDeltaB,
      trendClassB,
      yTicks,
      xTicks,
      latestDateStr,
      hasEnoughHistory: ptsA.length >= 1 || ptsB.length >= 1,
      trajectorySignal,
    };
  }, [historyList, dashA, dashB, cidA, cidB, nameA, nameB, wafersA, wafersB, confA, confB, timeRange]);

  // Paginated History Table Data (5 per page)
  const pageSize = 5;
  const totalPages = Math.ceil(historyStats.allRecords.length / pageSize) || 1;
  const paginatedTable = useMemo(() => {
    const start = (historyPage - 1) * pageSize;
    return historyStats.allRecords.slice(start, start + pageSize);
  }, [historyStats.allRecords, historyPage]);

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900 font-sans pb-24">
      <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        
        {/* ==================================================
            4. PAGE HEADER & BREADCRUMB
        ================================================== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200">
          <div>
            <Link
              href="/predict"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-2.5 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Prediction Portal
            </Link>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              INSIQ SEMICONDUCTOR ANALYST WORKSPACE
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              COMPARISON ANALYSIS
            </h1>

            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500">
              Compare prediction outputs, business drivers, and demand outlook across selected companies.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportPDF}
              disabled={pdfExporting || (!dashA && !dashB)}
              className="h-11 bg-slate-950 px-6 text-xs font-semibold text-white transition-colors hover:bg-blue-600 flex items-center gap-2 disabled:opacity-60 shadow-sm rounded-none cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              {pdfExporting ? "Generating PDF..." : "Export Analyst Report"}
            </button>
          </div>
        </div>

        {/* ==================================================
            5. COMPANY / PREDICTION SELECTORS
        ================================================== */}
        <section className="border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-3.5 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
              <GitCompare className="w-4 h-4 text-blue-600" />
              <span>Select Prediction Entities for Comparison</span>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              Database Mode: Real Enterprise Records
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selector A */}
            <div className="border border-blue-200 p-5 bg-blue-50/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-600 inline-block"></span>
                  PREDICTION A
                </span>
                <span className="text-[11px] font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 border border-blue-200">
                  {cidA}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Enterprise A
                </label>
                <select
                  value={selectedIdA}
                  onChange={(e) => handleSelectA(e.target.value)}
                  className="h-11 w-full border border-gray-300 bg-white px-3 text-xs text-slate-900 outline-none focus:border-blue-500 cursor-pointer font-sans"
                >
                  {companyList.map((c: any, idx: number) => {
                    const name = typeof c === "string" ? c : c.company_name || c.company || "";
                    const id = typeof c === "string" ? c : c.company_id || c.id || name;
                    const country = typeof c === "string" ? "TWN" : c.country || c.country_iso3 || "TWN";
                    const cType = typeof c === "string" ? "Existing" : c.company_type || "Existing";
                    if (!name || name.startsWith("COMP_") || id.startsWith("COMP_")) return null;
                    return (
                      <option key={`a_${id}_${idx}`} value={id}>
                        {name} — {id} — {country} — {cType}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Entity A Summary Card */}
              <div className="bg-white border border-gray-200 p-4 space-y-2 text-xs shadow-2xs font-sans">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Company Name:</span>
                  <strong className="text-slate-950 font-bold">{nameA}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Company ID:</span>
                  <strong className="font-mono text-slate-900">{cidA}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Forecast Year / Date:</span>
                  <strong className="font-mono text-slate-900">{yearA}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Country / Region:</span>
                  <strong className="text-slate-900 font-semibold">{countryA}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Process Node:</span>
                  <strong className="font-mono text-blue-700">{nodeA} nm</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Prediction Type:</span>
                  <strong className="text-slate-800">{typeA}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Prediction Confidence:</span>
                  <strong className="text-emerald-700 font-bold">{confA}%</strong>
                </div>
              </div>
            </div>

            {/* Selector B */}
            <div className="border border-slate-300 p-5 bg-slate-50/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-slate-700 inline-block"></span>
                  PREDICTION B
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-800 bg-slate-200 px-2.5 py-0.5 border border-slate-300">
                  {cidB}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Enterprise B
                </label>
                <select
                  value={selectedIdB}
                  onChange={(e) => handleSelectB(e.target.value)}
                  className="h-11 w-full border border-gray-300 bg-white px-3 text-xs text-slate-900 outline-none focus:border-blue-500 cursor-pointer font-sans"
                >
                  {companyList.map((c: any, idx: number) => {
                    const name = typeof c === "string" ? c : c.company_name || c.company || "";
                    const id = typeof c === "string" ? c : c.company_id || c.id || name;
                    const country = typeof c === "string" ? "TWN" : c.country || c.country_iso3 || "TWN";
                    const cType = typeof c === "string" ? "Existing" : c.company_type || "Existing";
                    if (!name || name.startsWith("COMP_") || id.startsWith("COMP_")) return null;
                    return (
                      <option key={`b_${id}_${idx}`} value={id}>
                        {name} — {id} — {country} — {cType}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Entity B Summary Card */}
              <div className="bg-white border border-gray-200 p-4 space-y-2 text-xs shadow-2xs font-sans">
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Company Name:</span>
                  <strong className="text-slate-950 font-bold">{nameB}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Company ID:</span>
                  <strong className="font-mono text-slate-900">{cidB}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Forecast Year / Date:</span>
                  <strong className="font-mono text-slate-900">{yearB}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Country / Region:</span>
                  <strong className="text-slate-900 font-semibold">{countryB}</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Process Node:</span>
                  <strong className="font-mono text-slate-800">{nodeB} nm</strong>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-slate-500 font-medium">Prediction Type:</span>
                  <strong className="text-slate-800">{typeB}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Prediction Confidence:</span>
                  <strong className="text-emerald-700 font-bold">{confB}%</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="border border-gray-200 bg-white p-12 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading prediction comparison metrics...</p>
          </div>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 p-6 text-xs text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>{error}</div>
          </div>
        ) : (
          <>
            {/* ==================================================
                6. EXECUTIVE KPI ROW
            ================================================== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Card 1: Predicted Wafer Demand */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm border-l-4 border-l-blue-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  PREDICTED WAFER DEMAND
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-blue-700 font-semibold truncate max-w-[110px]">{nameA}:</span>
                    <span className="font-mono font-bold text-slate-950 text-sm">{wafersA.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-600 font-semibold truncate max-w-[110px]">{nameB}:</span>
                    <span className="font-mono font-bold text-slate-700 text-sm">{wafersB.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">wafers / month</p>
              </div>

              {/* Card 2: Demand Difference */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm border-l-4 border-l-emerald-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  DEMAND DIFFERENCE
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-700">
                  {diffWafers >= 0 ? `+${diffWafers.toLocaleString()}` : diffWafers.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                  {higherDemandComp} is higher
                </p>
              </div>

              {/* Card 3: Percentage Gap */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm border-l-4 border-l-indigo-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  PERCENTAGE GAP
                </span>
                <div className="text-2xl font-bold font-mono text-indigo-900">
                  {pctWafersStr}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-sans">
                  Relative capacity variance
                </p>
              </div>

              {/* Card 4: Model Confidence */}
              <div className="border border-gray-200 bg-white p-5 shadow-sm border-l-4 border-l-amber-500">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  MODEL CONFIDENCE
                </span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium truncate max-w-[110px]">{nameA}:</span>
                    <strong className="text-emerald-700 font-mono text-sm">{confA}%</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium truncate max-w-[110px]">{nameB}:</span>
                    <strong className="text-emerald-700 font-mono text-sm">{confB}%</strong>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">CatBoost Hybrid Ensemble</p>
              </div>
            </section>

            {/* ==================================================
                7. GRAPH 1 — DEMAND COMPARISON (BAR CHART)
            ================================================== */}
            <section className="border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  PREDICTED WAFER DEMAND COMPARISON
                </h3>
                <span className="text-[11px] font-mono text-slate-500">units / month</span>
              </div>

              <div className="space-y-5 pt-2">
                {/* Bar A */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-blue-700 font-bold">{nameA} ({cidA})</span>
                    <span className="font-mono text-slate-950">{wafersA.toLocaleString()} wafers/mo</span>
                  </div>
                  <div className="w-full bg-slate-100 h-6 overflow-hidden border border-slate-200 relative group">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-mono font-bold"
                      style={{ width: `${Math.min(100, (wafersA / Math.max(wafersA, wafersB)) * 100)}%` }}
                    >
                      {((wafersA / Math.max(wafersA, wafersB)) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Bar B */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-700 font-bold">{nameB} ({cidB})</span>
                    <span className="font-mono text-slate-950">{wafersB.toLocaleString()} wafers/mo</span>
                  </div>
                  <div className="w-full bg-slate-100 h-6 overflow-hidden border border-slate-200 relative group">
                    <div
                      className="h-full bg-slate-700 transition-all duration-500 flex items-center justify-end pr-2 text-[10px] text-white font-mono font-bold"
                      style={{ width: `${Math.min(100, (wafersB / Math.max(wafersA, wafersB)) * 100)}%` }}
                    >
                      {((wafersB / Math.max(wafersA, wafersB)) * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                8. GRAPH 2 — BUSINESS DRIVER COMPARISON (NORMALIZED)
            ================================================== */}
            <section className="border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    BUSINESS DRIVER COMPARISON (INDEXED 0–100%)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Metrics normalized to relative scale to allow multi-variable driver evaluation. Hover for raw numbers.
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Relative Indexed Score</span>
              </div>

              <div className="space-y-6 pt-2 text-xs">
                {/* Revenue */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-900">Annual Revenue</span>
                    <span className="font-mono text-slate-600">
                      {nameA}: ${revA.toFixed(1)}B ({normRevA.toFixed(0)}%) vs {nameB}: ${revB.toFixed(1)}B ({normRevB.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${normRevA}%` }} title={`${nameA} Revenue: $${revA.toFixed(1)}B`} />
                    </div>
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${normRevB}%` }} title={`${nameB} Revenue: $${revB.toFixed(1)}B`} />
                    </div>
                  </div>
                </div>

                {/* R&D Spend */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-900">R&D Expenditure</span>
                    <span className="font-mono text-slate-600">
                      {nameA}: ${rdA.toFixed(1)}B ({normRdA.toFixed(0)}%) vs {nameB}: ${rdB.toFixed(1)}B ({normRdB.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${normRdA}%` }} title={`${nameA} R&D: $${rdA.toFixed(1)}B`} />
                    </div>
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${normRdB}%` }} title={`${nameB} R&D: $${rdB.toFixed(1)}B`} />
                    </div>
                  </div>
                </div>

                {/* CapEx Spend */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-900 font-semibold">CapEx Expenditure</span>
                    <span className="font-mono text-slate-600">
                      {nameA}: ${capexA.toFixed(1)}B ({normCapexA.toFixed(0)}%) vs {nameB}: ${capexB.toFixed(1)}B ({normCapexB.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${normCapexA}%` }} title={`${nameA} CapEx: $${capexA.toFixed(1)}B`} />
                    </div>
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${normCapexB}%` }} title={`${nameB} CapEx: $${capexB.toFixed(1)}B`} />
                    </div>
                  </div>
                </div>

                {/* AI Shipments */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-900">AI Accelerator Shipments</span>
                    <span className="font-mono text-slate-600">
                      {nameA}: {(aiA / 1000000).toFixed(2)}M ({normAiA.toFixed(0)}%) vs {nameB}: {(aiB / 1000000).toFixed(2)}M ({normAiB.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${normAiA}%` }} title={`${nameA} AI Accelerators: ${(aiA/1000000).toFixed(2)}M`} />
                    </div>
                    <div className="w-full bg-slate-100 h-4 border border-slate-200 overflow-hidden">
                      <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${normAiB}%` }} title={`${nameB} AI Accelerators: ${(aiB/1000000).toFixed(2)}M`} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                9, 10 & 15. GRAPH 3 — DEMAND DRIVER CORRELATION (B2B ANALYST WORKSTATION)
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm space-y-0">
              {/* Header & Title */}
              <div className="border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950">
                      DEMAND DRIVER CORRELATION
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Industry relationship between selected business driver and predicted wafer demand across coverage dataset.
                  </p>
                </div>

                {/* Top KPI Summary Strip */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
                  <div className="bg-white border border-gray-200 px-3 py-1.5 shadow-2xs flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">COVERAGE</span>
                    <strong className="text-slate-900 font-mono">{scatterStats.count} Companies</strong>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 shadow-2xs flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-700">SELECTED A</span>
                    <strong className="text-blue-900 font-bold">{nameA}</strong>
                  </div>
                  <div className="bg-slate-100 border border-slate-300 px-3 py-1.5 shadow-2xs flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600">SELECTED B</span>
                    <strong className="text-slate-900 font-bold">{nameB}</strong>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 shadow-2xs flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800">PEARSON (r)</span>
                    <strong className="text-emerald-900 font-mono font-bold">{scatterStats.rStr}</strong>
                  </div>
                </div>
              </div>

              {/* Metric Switcher Tabs */}
              <div className="border-b border-gray-200 bg-slate-100 px-6 pt-2 flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => setScatterMetric("revenue")}
                  className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
                    scatterMetric === "revenue"
                      ? "bg-white text-blue-700 font-bold border-b-2 border-blue-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Revenue vs Demand
                </button>
                <button
                  onClick={() => setScatterMetric("rd")}
                  className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
                    scatterMetric === "rd"
                      ? "bg-white text-blue-700 font-bold border-b-2 border-blue-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  R&D vs Demand
                </button>
                <button
                  onClick={() => setScatterMetric("capex")}
                  className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
                    scatterMetric === "capex"
                      ? "bg-white text-blue-700 font-bold border-b-2 border-blue-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  CapEx vs Demand
                </button>
                <button
                  onClick={() => setScatterMetric("ai")}
                  className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
                    scatterMetric === "ai"
                      ? "bg-white text-blue-700 font-bold border-b-2 border-blue-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  AI Shipments vs Demand
                </button>

                {scatterStats.isLogX && (
                  <span className="ml-auto text-[10px] font-mono text-slate-500 bg-amber-50 border border-amber-200 px-2 py-0.5 mb-1">
                    X-axis: Smart Log Scale
                  </span>
                )}
              </div>

              {/* Interactive SVG Plotting Region */}
              <div className="p-6 relative bg-white">
                <div className="w-full h-[480px] border border-slate-200 bg-white relative overflow-hidden font-sans">
                  
                  {/* Quadrant Guidance Labels in Corners */}
                  <div className="absolute top-3 left-24 text-[9px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none z-10">
                    LOW DRIVER / HIGH DEMAND
                  </div>
                  <div className="absolute top-3 right-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none text-right z-10">
                    HIGH DRIVER / HIGH DEMAND
                  </div>
                  <div className="absolute bottom-10 left-24 text-[9px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none z-10">
                    LOW DRIVER / LOW DEMAND
                  </div>
                  <div className="absolute bottom-10 right-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none text-right z-10">
                    HIGH DRIVER / LOW DEMAND
                  </div>

                  <svg viewBox="0 0 1000 480" className="w-full h-full overflow-visible">
                    {/* Background Grid Lines */}
                    {[0.2, 0.4, 0.6, 0.8].map((pct, idx) => (
                      <g key={`grid_${idx}`}>
                        <line x1="95" y1={425 - pct * 380} x2="925" y2={425 - pct * 380} stroke="#f1f5f9" strokeWidth="1" />
                        <line x1={95 + pct * 830} y1="45" x2={95 + pct * 830} y2="425" stroke="#f1f5f9" strokeWidth="1" />
                      </g>
                    ))}

                    {/* Median Reference Grid Lines (Dashed) */}
                    <line x1={scatterStats.xMedPx} y1="45" x2={scatterStats.xMedPx} y2="425" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="95" y1={scatterStats.yMedPx} x2="925" y2={scatterStats.yMedPx} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />

                    {/* Least-Squares Linear Regression Line */}
                    {scatterStats.regLine && (
                      <line
                        x1={scatterStats.regLine.x1Px}
                        y1={scatterStats.regLine.y1Px}
                        x2={scatterStats.regLine.x2Px}
                        y2={scatterStats.regLine.y2Px}
                        stroke="#64748b"
                        strokeWidth="1.5"
                        strokeDasharray="6 3"
                      />
                    )}

                    {/* Smart Connector / Leader Lines for Repositioned Labels */}
                    {scatterStats.placedLabels?.map((lbl: any) =>
                      lbl.needsLeader ? (
                        <line
                          key={`leader_${lbl.id}`}
                          x1={lbl.ptX}
                          y1={lbl.ptY}
                          x2={lbl.anchorX}
                          y2={lbl.anchorY}
                          stroke={lbl.isA ? "#2563eb" : lbl.isB ? "#334155" : "#64748b"}
                          strokeWidth="1.2"
                          strokeDasharray="2 2"
                          opacity="0.8"
                        />
                      ) : null
                    )}

                    {/* Data Points */}
                    {scatterStats.points.map((pt: any, idx: number) => (
                      <g
                        key={`scatter_pt_${idx}_${pt.company_id}`}
                        onMouseEnter={() => setHoveredScatterPoint(pt)}
                        onMouseLeave={() => setHoveredScatterPoint(null)}
                        className="cursor-pointer group"
                      >
                        {/* Outer Halo Rings for Selected Entities */}
                        {pt.isA && (
                          <circle cx={pt.xPx} cy={pt.yPx} r="11" fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.85" />
                        )}
                        {pt.isB && (
                          <circle cx={pt.xPx} cy={pt.yPx} r="11" fill="none" stroke="#334155" strokeWidth="1.5" opacity="0.85" />
                        )}

                        {/* Dot */}
                        <circle
                          cx={pt.xPx}
                          cy={pt.yPx}
                          r={pt.isA || pt.isB ? "6" : "4.5"}
                          fill={pt.isA ? "#2563eb" : pt.isB ? "#334155" : "#94a3b8"}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                      </g>
                    ))}

                    {/* Non-Overlapping Collision-Free Label Boxes */}
                    {scatterStats.placedLabels?.map((lbl: any) => (
                      <g key={`lbl_box_${lbl.id}`}>
                        <rect
                          x={lbl.labelX}
                          y={lbl.labelY}
                          width={lbl.width}
                          height={lbl.height}
                          fill="#ffffff"
                          stroke={lbl.isA ? "#2563eb" : lbl.isB ? "#334155" : "#cbd5e1"}
                          strokeWidth={lbl.isA || lbl.isB ? "1.5" : "1"}
                          rx="3"
                          className="shadow-2xs opacity-95"
                        />
                        <text
                          x={lbl.labelX + 8}
                          y={lbl.labelY + 14}
                          className={`text-[9px] font-bold ${
                            lbl.isA ? "fill-blue-700" : lbl.isB ? "fill-slate-900" : "fill-slate-700"
                          }`}
                        >
                          {lbl.textStr}
                        </text>
                      </g>
                    ))}

                    {/* Y-Axis Label */}
                    <text x="-240" y="24" transform="rotate(-90)" className="text-[10px] font-bold fill-slate-500 font-mono tracking-wider">
                      {scatterStats.yLabel}
                    </text>

                    {/* X-Axis Label */}
                    <text x="510" y="470" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 font-mono tracking-wider">
                      {scatterStats.xLabel}
                    </text>
                  </svg>

                  {/* Hover Tooltip Overlay */}
                  {hoveredScatterPoint && (
                    <div className="absolute top-4 right-4 bg-slate-950 text-white p-4 text-xs shadow-xl border border-slate-800 pointer-events-none z-20 w-64 space-y-2 rounded-none font-sans">
                      <div className="font-bold border-b border-slate-800 pb-1.5 text-blue-400 flex justify-between">
                        <span>{hoveredScatterPoint.company_name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{hoveredScatterPoint.company_id}</span>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Country:</span>
                          <strong>{hoveredScatterPoint.country || "TWN"}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Driver Value ({scatterStats.xLabel.split(" ")[0]}):</span>
                          <strong className="font-mono text-emerald-400">${hoveredScatterPoint.rawX.toFixed(1)}B</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Wafer Demand:</span>
                          <strong className="font-mono text-blue-300">{Math.round(hoveredScatterPoint.rawY).toLocaleString()} units/mo</strong>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px]">
                          <span className="text-slate-400">Prediction Type:</span>
                          <span className="text-slate-300">{hoveredScatterPoint.prediction_type || "Existing Company"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Legend Bar */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 font-sans">
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-slate-400 inline-block"></span>
                      Industry Companies
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-blue-600 border border-blue-800 inline-block"></span>
                      Prediction A ({nameA})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-slate-700 border border-slate-900 inline-block"></span>
                      Prediction B ({nameB})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-slate-500 border-t border-dashed border-slate-500 inline-block"></span>
                      Industry Trend
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-slate-300 border-t border-dashed border-slate-300 inline-block"></span>
                      Industry Median
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 italic">
                    Industry trend — correlation, not causation
                  </span>
                </div>
              </div>

              {/* Key Analyst Observations & Positioning Summary Card */}
              <div className="border-t border-gray-200 p-6 bg-slate-50/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                  KEY ANALYST OBSERVATIONS — POSITIONING SUMMARY
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed font-sans">
                  <div className="bg-white border border-gray-200 p-3.5 space-y-1">
                    <strong className="text-blue-700 font-bold block">{nameA} Position:</strong>
                    <p>{scatterStats.compAPos}</p>
                  </div>
                  <div className="bg-white border border-gray-200 p-3.5 space-y-1">
                    <strong className="text-slate-900 font-bold block">{nameB} Position:</strong>
                    <p>{scatterStats.compBPos}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                11. HISTORICAL PREDICTION TREND (HIGH-PRECISION TIME-SERIES WORKSTATION)
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm space-y-0">
              {/* Header & Subtitle */}
              <div className="border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950">
                      HISTORICAL PREDICTION TREND
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Track saved wafer demand predictions over time for Prediction A and Prediction B.
                  </p>
                </div>

                {/* Range Filters & Line Visibility Toggles */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-sans">
                  {/* Time Range Selector Buttons */}
                  <div className="flex items-center bg-slate-200 p-1 border border-slate-300">
                    {(["ALL", "30D", "90D", "1Y"] as const).map((r) => (
                      <button
                        key={`hrange_${r}`}
                        onClick={() => setTimeRange(r)}
                        className={`px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                          timeRange === r
                            ? "bg-white text-blue-700 font-bold shadow-2xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {/* Visibility Toggles */}
                  <div className="flex items-center gap-3 bg-white border border-gray-200 px-3 py-1.5 shadow-2xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-blue-700 font-bold text-xs">
                      <input
                        type="checkbox"
                        checked={showLineA}
                        onChange={(e) => setShowLineA(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{nameA} (A)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-bold text-xs">
                      <input
                        type="checkbox"
                        checked={showLineB}
                        onChange={(e) => setShowLineB(e.target.checked)}
                        className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span>{nameB} (B)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Main SVG Time-Series Chart Area */}
              <div className="p-6 relative bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    HISTORICAL DEMAND TRAJECTORY
                  </h4>
                  <div className="text-[11px] font-mono text-slate-500 flex items-center gap-3">
                    <span><strong>{historyStats.allRecords.length}</strong> saved history records</span>
                    <span>&bull;</span>
                    <span>Latest observation: <strong>{historyStats.latestDateStr}</strong></span>
                  </div>
                </div>

                {historyStats.hasEnoughHistory ? (
                  <div className="w-full h-[390px] border border-slate-200 bg-white relative overflow-hidden font-sans mt-3">
                    <svg viewBox="0 0 1000 390" className="w-full h-full overflow-visible">
                      {/* Background Grid Lines & Y-Axis Numerical Ticks */}
                      {historyStats.yTicks.map((tick, idx) => (
                        <g key={`ytick_${idx}`}>
                          <line x1="85" y1={tick.yPx} x2="970" y2={tick.yPx} stroke="#f1f5f9" strokeWidth="1" />
                          <text x="75" y={tick.yPx + 4} textAnchor="end" className="text-[10px] font-mono font-bold fill-slate-500">
                            {tick.label}
                          </text>
                        </g>
                      ))}

                      {/* Mathematically Non-Overlapping X-Axis Date Ticks */}
                      {historyStats.xTicks.map((dt: any, idx: number) => (
                        <g key={`xtick_${idx}`}>
                          <line x1={dt.xPx} y1="345" x2={dt.xPx} y2="350" stroke="#cbd5e1" strokeWidth="1" />
                          <text x={dt.xPx} y="368" textAnchor="middle" className="text-[10px] font-mono font-medium fill-slate-600">
                            {dt.dateLabel}
                          </text>
                        </g>
                      ))}

                      {/* Y-Axis Title (Fixes Clipping with 85px left padding) */}
                      <text x="-195" y="24" transform="rotate(-90)" className="text-[10px] font-bold fill-slate-500 font-mono tracking-wider">
                        Predicted Wafer Demand (wafers / month)
                      </text>

                      {/* Line A Path */}
                      {showLineA && historyStats.pathD_A && (
                        <path
                          d={historyStats.pathD_A}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Line B Path */}
                      {showLineB && historyStats.pathD_B && (
                        <path
                          d={historyStats.pathD_B}
                          fill="none"
                          stroke="#334155"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Points & Latest Highlights for A */}
                      {showLineA &&
                        historyStats.mappedA.map((pt, idx) => (
                          <g
                            key={`pta_${idx}_${pt.id}`}
                            onMouseEnter={() => setHoveredHistPoint(pt)}
                            onMouseLeave={() => setHoveredHistPoint(null)}
                            className="cursor-pointer"
                          >
                            {pt.isLatest && (
                              <circle cx={pt.xPx} cy={pt.yPx} r="9" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.85" />
                            )}
                            <circle
                              cx={pt.xPx}
                              cy={pt.yPx}
                              r={pt.isLatest ? "5.5" : "4"}
                              fill="#2563eb"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          </g>
                        ))}

                      {/* Points & Latest Highlights for B */}
                      {showLineB &&
                        historyStats.mappedB.map((pt, idx) => (
                          <g
                            key={`ptb_${idx}_${pt.id}`}
                            onMouseEnter={() => setHoveredHistPoint(pt)}
                            onMouseLeave={() => setHoveredHistPoint(null)}
                            className="cursor-pointer"
                          >
                            {pt.isLatest && (
                              <circle cx={pt.xPx} cy={pt.yPx} r="9" fill="none" stroke="#334155" strokeWidth="2" opacity="0.85" />
                            )}
                            <circle
                              cx={pt.xPx}
                              cy={pt.yPx}
                              r={pt.isLatest ? "5.5" : "4"}
                              fill="#334155"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          </g>
                        ))}
                    </svg>

                    {/* Hover Tooltip Overlay */}
                    {hoveredHistPoint && (
                      <div className="absolute top-4 right-4 bg-slate-950 text-white p-3.5 text-xs shadow-xl border border-slate-800 pointer-events-none z-20 w-64 space-y-1.5 font-sans">
                        <div className="font-bold border-b border-slate-800 pb-1 text-blue-400 flex justify-between">
                          <span>{hoveredHistPoint.company_name}</span>
                          <span className="text-slate-400 font-mono text-[10px]">{hoveredHistPoint.isA ? "PREDICTION A" : "PREDICTION B"}</span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Prediction Date:</span>
                            <strong className="font-mono text-slate-200">{hoveredHistPoint.fullDateStr}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Prediction Time:</span>
                            <strong className="font-mono text-slate-200">{hoveredHistPoint.timeDetail}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Predicted Demand:</span>
                            <strong className="font-mono text-emerald-400">{hoveredHistPoint.wafers.toLocaleString()} wafers/mo</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Prediction ID:</span>
                            <strong className="font-mono text-blue-300">{hoveredHistPoint.predId}</strong>
                          </div>
                          {hoveredHistPoint.isLatest && (
                            <div className="pt-1 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                              ● LATEST PREDICTION RECORD
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="border border-dashed border-gray-300 bg-slate-50/50 p-10 text-center text-xs text-slate-500 mt-3">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="font-bold text-slate-800 text-sm">
                      Historical comparison will appear once multiple predictions are available.
                    </p>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto">
                      Single evaluation record currently active. Saved predictions in database will construct time-series line comparison.
                    </p>
                  </div>
                )}

                {/* Legend Directly Below Chart */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-slate-600 font-sans gap-4">
                  <div className="flex items-center gap-8 font-semibold">
                    <span className="flex items-center gap-2 text-blue-700">
                      <span className="w-6 h-0.5 bg-blue-600 inline-block"></span>
                      ━━ {nameA} (A) Trajectory
                    </span>
                    <span className="flex items-center gap-2 text-slate-800">
                      <span className="w-6 h-0.5 bg-slate-700 inline-block"></span>
                      ━━ {nameB} (B) Trajectory
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    Showing {historyStats.allRecords.length} saved history records
                  </span>
                </div>
              </div>

              {/* Trajectory Summary Metrics Below Graph */}
              <div className="p-6 border-t border-gray-200 bg-slate-50/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Prediction A Summary Card */}
                <div className="bg-white border border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-bold text-blue-700 text-xs uppercase tracking-wider">
                      PREDICTION A TRAJECTORY
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                      historyStats.trendClassA === "Growing"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : historyStats.trendClassA === "Declining"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      Trend: {historyStats.trendClassA}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans font-medium">Earliest</span>
                      <strong className="text-slate-900">{historyStats.earliestA.wafers ? historyStats.earliestA.wafers.toLocaleString() : wafersA.toLocaleString()} wspm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans font-medium">Latest</span>
                      <strong className="text-blue-700">{historyStats.latestA.wafers ? historyStats.latestA.wafers.toLocaleString() : wafersA.toLocaleString()} wspm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans font-medium">Change</span>
                      <strong className={historyStats.pctDeltaA >= 0 ? "text-emerald-700" : "text-amber-700"}>
                        {historyStats.deltaWafersA >= 0 ? `+${historyStats.deltaWafersA.toLocaleString()}` : historyStats.deltaWafersA.toLocaleString()} wspm ({historyStats.pctDeltaA >= 0 ? "+" : ""}{historyStats.pctDeltaA.toFixed(1)}%)
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Prediction B Summary Card */}
                <div className="bg-white border border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      PREDICTION B TRAJECTORY
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                      historyStats.trendClassB === "Growing"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : historyStats.trendClassB === "Declining"
                        ? "bg-amber-50 border-amber-200 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}>
                      Trend: {historyStats.trendClassB}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans font-medium">Earliest</span>
                      <strong className="text-slate-900">{historyStats.earliestB.wafers ? historyStats.earliestB.wafers.toLocaleString() : wafersB.toLocaleString()} wspm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans font-medium">Latest</span>
                      <strong className="text-slate-900">{historyStats.latestB.wafers ? historyStats.latestB.wafers.toLocaleString() : wafersB.toLocaleString()} wspm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block font-sans font-medium">Change</span>
                      <strong className={historyStats.pctDeltaB >= 0 ? "text-emerald-700" : "text-amber-700"}>
                        {historyStats.deltaWafersB >= 0 ? `+${historyStats.deltaWafersB.toLocaleString()}` : historyStats.deltaWafersB.toLocaleString()} wspm ({historyStats.pctDeltaB >= 0 ? "+" : ""}{historyStats.pctDeltaB.toFixed(1)}%)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Signal Card */}
              <div className="border-t border-gray-200 p-6 bg-white space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  HISTORICAL SIGNAL
                </span>
                <div className="bg-slate-50 border border-gray-200 p-4 text-xs text-slate-700 leading-relaxed font-sans">
                  {historyStats.trajectorySignal}
                </div>
              </div>

              {/* Detailed Prediction History Table */}
              <div className="border-t border-gray-200 p-6 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950">
                    DETAILED PREDICTION HISTORY RECORDS
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Page {historyPage} of {totalPages}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-slate-500 bg-slate-50 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Prediction Date</th>
                        <th className="py-3 px-4 text-right">Predicted Demand</th>
                        <th className="py-3 px-4 text-right">Confidence</th>
                        <th className="py-3 px-4">Prediction ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-sans">
                      {paginatedTable.map((rec: any, idx: number) => (
                        <tr key={`tbl_${rec.id}_${idx}`} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <span className={rec.isA ? "text-blue-700" : "text-slate-800"}>
                              {rec.company_name} ({rec.isA ? "A" : "B"})
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{rec.dateLabel} {rec.timeDetail}</td>
                          <td className="py-3 px-4 font-mono font-bold text-right text-slate-950">
                            {rec.wafers.toLocaleString()} wspm
                          </td>
                          <td className="py-3 px-4 font-mono text-right text-emerald-700 font-semibold">
                            {rec.confidence}%
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">{rec.predId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="px-3 py-1.5 border border-gray-300 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <span className="text-slate-500 font-mono">
                      Showing {((historyPage - 1) * pageSize) + 1} to {Math.min(historyStats.allRecords.length, historyPage * pageSize)} of {historyStats.allRecords.length}
                    </span>
                    <button
                      onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                      disabled={historyPage === totalPages}
                      className="px-3 py-1.5 border border-gray-300 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* ==================================================
                12. DRIVER DIFFERENCE TABLE
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  INPUT DRIVER COMPARISON TABLE
                </h3>
              </div>

              <div className="p-6 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-slate-500 bg-slate-50 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Metric</th>
                      <th className="py-3 px-4 text-blue-700">{nameA} ({cidA})</th>
                      <th className="py-3 px-4 text-slate-700">{nameB} ({cidB})</th>
                      <th className="py-3 px-4 text-right">Difference</th>
                      <th className="py-3 px-4 text-slate-900">Higher Entity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {/* Wafer Demand */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-950">Wafer Demand</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{wafersA.toLocaleString()} wspm</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-950">{wafersB.toLocaleString()} wspm</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-emerald-700">{diffWafers >= 0 ? `+${diffWafers.toLocaleString()}` : diffWafers.toLocaleString()}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{higherDemandComp}</td>
                    </tr>

                    {/* Revenue */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">Revenue ($B)</td>
                      <td className="py-3 px-4 font-mono">${revA.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono">${revB.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">${diffRev >= 0 ? `+${diffRev.toFixed(1)}` : diffRev.toFixed(1)}B</td>
                      <td className="py-3 px-4 text-slate-800">{revA >= revB ? nameA : nameB}</td>
                    </tr>

                    {/* R&D */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">R&D Expenditure ($B)</td>
                      <td className="py-3 px-4 font-mono">${rdA.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono">${rdB.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">${diffRd >= 0 ? `+${diffRd.toFixed(1)}` : diffRd.toFixed(1)}B</td>
                      <td className="py-3 px-4 text-slate-800">{rdA >= rdB ? nameA : nameB}</td>
                    </tr>

                    {/* CapEx */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">CapEx Expenditure ($B)</td>
                      <td className="py-3 px-4 font-mono">${capexA.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono">${capexB.toFixed(1)}B</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">${diffCapex >= 0 ? `+${diffCapex.toFixed(1)}` : diffCapex.toFixed(1)}B</td>
                      <td className="py-3 px-4 text-slate-800">{capexA >= capexB ? nameA : nameB}</td>
                    </tr>

                    {/* AI Shipments */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">AI Accelerator Shipments</td>
                      <td className="py-3 px-4 font-mono">{(aiA / 1000000).toFixed(2)}M units</td>
                      <td className="py-3 px-4 font-mono">{(aiB / 1000000).toFixed(2)}M units</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">{(diffAi / 1000000) >= 0 ? `+${(diffAi / 1000000).toFixed(2)}` : (diffAi / 1000000).toFixed(2)}M</td>
                      <td className="py-3 px-4 text-slate-800">{aiA >= aiB ? nameA : nameB}</td>
                    </tr>

                    {/* Process Node */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">Process Node</td>
                      <td className="py-3 px-4 font-mono">{nodeA} nm</td>
                      <td className="py-3 px-4 font-mono">{nodeB} nm</td>
                      <td className="py-3 px-4 font-mono text-right text-slate-500">{nodeA === nodeB ? "Parity" : `${Math.abs(nodeA - nodeB)}nm delta`}</td>
                      <td className="py-3 px-4 text-blue-700 font-bold">{nodeA === nodeB ? "Parity" : `${nodeA < nodeB ? nameA : nameB} (More Advanced)`}</td>
                    </tr>

                    {/* Confidence */}
                    <tr className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">Model Confidence Score</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-700">{confA}%</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-700">{confB}%</td>
                      <td className="py-3 px-4 font-mono font-bold text-right text-emerald-700">{confA - confB >= 0 ? `+${confA - confB}` : confA - confB}%</td>
                      <td className="py-3 px-4 text-slate-800">{confA >= confB ? nameA : nameB}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ==================================================
                13. ANALYST INTERPRETATION CARDS
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  ANALYST INTERPRETATION
                </h3>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Demand Outlook */}
                <div className="border border-blue-200 p-5 bg-blue-50/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                    DEMAND OUTLOOK
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    The available prediction outputs indicate that <strong>{nameA}</strong> is projected to have a higher monthly wafer demand ({wafersA.toLocaleString()} units/mo) than <strong>{nameB}</strong> ({wafersB.toLocaleString()} units/mo). The difference represents a <strong>{pctWafersStr}</strong> capacity variance.
                  </p>
                </div>

                {/* Card 2: Business Drivers */}
                <div className="border border-emerald-200 p-5 bg-emerald-50/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                    BUSINESS DRIVERS
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Reported annual revenue (${revA.toFixed(1)}B vs ${revB.toFixed(1)}B) and CapEx expenditure (${capexA.toFixed(1)}B vs ${capexB.toFixed(1)}B) are strongly associated with the higher projected fab allocation for {higherDemandComp}.
                  </p>
                </div>

                {/* Card 3: Strategic Signal */}
                <div className="border border-purple-200 p-5 bg-purple-50/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                    STRATEGIC SIGNAL
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Process node advancement at {nodeA}nm vs {nodeB}nm combined with AI accelerator volume scaling ({(aiA / 1000000).toFixed(2)}M units) indicates higher high-margin leading-edge fab utilization.
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================
                14. LIVE FINANCIAL INTELLIGENCE PROVENANCE
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  LIVE FINANCIAL INTELLIGENCE COMPARISON
                </h3>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border ${isLiveFinA || isLiveFinB ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                    {isLiveFinA || isLiveFinB ? "● LIVE DATA" : "● OFFLINE FALLBACK DATA"}
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial A */}
                <div className="border border-gray-200 p-4 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <strong className="text-blue-900 font-bold">{nameA} ({cidA})</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Source: {finA.source || "Database"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Stock Price: <strong>{renderText(finA.stock_price || finA.price, "$174.50")}</strong></div>
                    <div>Market Cap: <strong>{renderText(finA.market_cap_bn || finA.market_cap, "$905.2B")}</strong></div>
                    <div>Revenue Growth: <strong>{renderText(finA.revenue_growth_pct || finA.revenue_growth, "+18.5%")}</strong></div>
                    <div>P/E Ratio: <strong>{renderText(finA.pe_ratio, "27.9x")}</strong></div>
                  </div>
                </div>

                {/* Financial B */}
                <div className="border border-gray-200 p-4 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <strong className="text-slate-900 font-bold">{nameB} ({cidB})</strong>
                    <span className="text-[10px] text-slate-500 font-mono">Source: {finB.source || "Database"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Stock Price: <strong>{renderText(finB.stock_price || finB.price, "$48.50")}</strong></div>
                    <div>Market Cap: <strong>{renderText(finB.market_cap_bn || finB.market_cap, "$320.0B")}</strong></div>
                    <div>Revenue Growth: <strong>{renderText(finB.revenue_growth_pct || finB.revenue_growth, "+12.4%")}</strong></div>
                    <div>P/E Ratio: <strong>{renderText(finB.pe_ratio, "15.6x")}</strong></div>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                15. SEMICONDUCTOR MARKET INTELLIGENCE
            ================================================== */}
            <section className="border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  SEMICONDUCTOR MARKET INTELLIGENCE CONTEXT
                </h3>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-sans">
                <div className="border border-gray-200 p-4 bg-slate-50/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    GLOBAL MARKET SIZE
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    ${marketIntel?.market_size_usd_bn || 624.5}B
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1 font-semibold">
                    {marketIntel?.yoy_growth_pct || "+13.2%"} YoY Growth
                  </p>
                </div>

                <div className="border border-gray-200 p-4 bg-slate-50/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    MEMORY SEGMENT TREND
                  </span>
                  <div className="text-base font-bold text-slate-900">
                    {marketIntel?.memory_trend || "High Demand (HBM3e)"}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">DRAM & NAND tight supply</p>
                </div>

                <div className="border border-gray-200 p-4 bg-slate-50/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    LOGIC & FOUNDRY UTILIZATION
                  </span>
                  <div className="text-base font-bold text-slate-900">
                    {marketIntel?.logic_trend || "88% Leading Node Utilization"}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">3nm / 4nm capacity tight</p>
                </div>

                <div className="border border-gray-200 p-4 bg-slate-50/30">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    AI ACCELERATOR EXPANSION
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {marketIntel?.ai_demand_growth || "+42.5%"} YoY
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Data center GPU & NPU surge</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
