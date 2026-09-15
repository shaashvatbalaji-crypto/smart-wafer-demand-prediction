"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  X,
  Save,
} from "lucide-react";
import Link from "next/link";

type CompanyData = {
  company: string;
  country_iso3: string;
  process_node_nm: number;
  revenue_usd_bn: number;
  rd_spend_usd_bn: number;
  capex_usd_bn: number;
  ai_chip_launches: number;
  worldwide_sales: number;
  [key: string]: any;
};

type FormData = {
  country: string;
  processNode: string;
  revenue: string;
  rdBudget: string;
  capex: string;
  aiChipLaunches: string;
  worldwideSales: string;
};

type PredictionData = {
  prediction: number;
  confidence: number;
  model: string;
};

export default function ExistingCompanyPrediction() {
  const [company, setCompany] = useState("");

  const [searching, setSearching] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [found, setFound] = useState(false);

  const [companyData, setCompanyData] =
    useState<CompanyData | null>(null);

  /*
   * IMPORTANT:
   * Keep the original database/dataset values separately.
   *
   * These values must NOT change when the user edits the form.
   * They are sent to /api/company/save as original_data.
   */
  const [originalData, setOriginalData] =
    useState<CompanyData | null>(null);

  const [companyId, setCompanyId] = useState("");

  const [prediction, setPrediction] =
    useState<number | null>(null);

  const [confidence, setConfidence] =
    useState(95);

  const [modelVersion, setModelVersion] =
    useState("CatBoost_v1");

  /*
   * Prediction name popup
   */
  const [showSaveModal, setShowSaveModal] =
    useState(false);

  const [predictionName, setPredictionName] =
    useState("");

  const [form, setForm] = useState<FormData>({
    country: "",
    processNode: "",
    revenue: "",
    rdBudget: "",
    capex: "",
    aiChipLaunches: "",
    worldwideSales: "",
  });

  // ==========================================================
  // COMPANY LOOKUP
  // ==========================================================

  const handleSearch = async () => {
    const companyName = company.trim();

    if (!companyName) {
      alert("Please enter a company name.");
      return;
    }

    setSearching(true);
    setFound(false);
    setPrediction(null);
    setShowSaveModal(false);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/company/lookup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company: companyName,
          }),
        }
      );

      const data = await response.json();

      console.log("LOOKUP RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            data.error ||
            "Company not found."
        );

        return;
      }

      const result =
        data.company as CompanyData;

      // ------------------------------------------------------
      // Store company information
      // ------------------------------------------------------

      setCompanyData(result);

      /*
       * IMPORTANT:
       * Make a separate copy of the original company.
       *
       * This prevents edited form values from overwriting
       * original_data.
       */
      setOriginalData({
        ...result,
      });

      setCompanyId(
        String(
          data.company_id ??
            result.company_id ??
            result.id ??
            ""
        )
      );

      // ------------------------------------------------------
      // Populate form from dataset
      // ------------------------------------------------------

      setForm({
        country: String(
          result.country_iso3 ?? ""
        ),

        processNode: String(
          result.process_node_nm ?? ""
        ),

        revenue: String(
          result.revenue_usd_bn ?? ""
        ),

        rdBudget: String(
          result.rd_spend_usd_bn ?? ""
        ),

        capex: String(
          result.capex_usd_bn ?? ""
        ),

        aiChipLaunches: String(
          result.ai_chip_launches ?? ""
        ),

        worldwideSales: String(
          result.worldwide_sales ?? ""
        ),
      });

      setFound(true);
    } catch (error) {
      console.error(
        "Company lookup error:",
        error
      );

      alert(
        "Unable to connect to the INSIQ Prediction API."
      );
    } finally {
      setSearching(false);
    }
  };

  // ==========================================================
  // UPDATE FORM
  // ==========================================================

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // VALIDATE INPUTS
  // ==========================================================

  const validateInputs = () => {
    const processNode = Number(
      form.processNode
        .replace(/nm/gi, "")
        .trim()
    );

    const revenue = Number(
      form.revenue
    );

    const rdBudget = Number(
      form.rdBudget
    );

    const capex = Number(
      form.capex
    );

    const aiChipLaunches = Number(
      form.aiChipLaunches
    );

    const worldwideSales = Number(
      form.worldwideSales
    );

    if (!form.country.trim()) {
      alert("Country is required.");
      return false;
    }

    if (
      !Number.isFinite(processNode) ||
      processNode <= 0
    ) {
      alert(
        "Process Node must be greater than 0."
      );
      return false;
    }

    if (
      !Number.isFinite(revenue) ||
      revenue <= 0
    ) {
      alert(
        "Revenue must be greater than 0."
      );
      return false;
    }

    if (
      !Number.isFinite(rdBudget) ||
      rdBudget <= 0
    ) {
      alert(
        "R&D Budget must be greater than 0."
      );
      return false;
    }

    if (
      !Number.isFinite(capex) ||
      capex <= 0
    ) {
      alert(
        "CapEx must be greater than 0."
      );
      return false;
    }

    if (
      !Number.isFinite(aiChipLaunches) ||
      aiChipLaunches < 0
    ) {
      alert(
        "AI Chip Launches cannot be negative."
      );
      return false;
    }

    if (
      !Number.isFinite(worldwideSales) ||
      worldwideSales <= 0
    ) {
      alert(
        "Worldwide Sales must be greater than 0."
      );
      return false;
    }

    return true;
  };

  // ==========================================================
  // BUILD MODIFIED DATA
  // ==========================================================

  const getModifiedData = () => {
    const processNode = Number(
      form.processNode
        .replace(/nm/gi, "")
        .trim()
    );

    const revenue = Number(
      form.revenue
    );

    const rdBudget = Number(
      form.rdBudget
    );

    const capex = Number(
      form.capex
    );

    const aiChipLaunches = Number(
      form.aiChipLaunches
    );

    const worldwideSales = Number(
      form.worldwideSales
    );

    return {
      country_iso3:
        form.country.trim(),

      process_node_nm:
        processNode,

      revenue_usd_bn:
        revenue,

      rd_spend_usd_bn:
        rdBudget,

      capex_usd_bn:
        capex,

      ai_chip_launches:
        aiChipLaunches,

      worldwide_sales:
        worldwideSales,
    };
  };

  // ==========================================================
  // RUN AI PREDICTION
  // ==========================================================

  const handlePrediction = async () => {
    if (!companyData) {
      alert(
        "Please find a company first."
      );
      return;
    }

    if (!companyId) {
      alert(
        "Company ID is missing."
      );
      return;
    }

    if (!validateInputs()) {
      return;
    }

    const processNode = Number(
      form.processNode
        .replace(/nm/gi, "")
        .trim()
    );

    const revenue = Number(
      form.revenue
    );

    const rdBudget = Number(
      form.rdBudget
    );

    const capex = Number(
      form.capex
    );

    const aiChipLaunches = Number(
      form.aiChipLaunches
    );

    const worldwideSales = Number(
      form.worldwideSales
    );

    setPredicting(true);
    setPrediction(null);
    setShowSaveModal(false);

    try {
      // ------------------------------------------------------
      // Complete company record with MODIFIED values
      // ------------------------------------------------------

      const predictionCompany = {
        ...companyData,

        country_iso3:
          form.country.trim(),

        process_node_nm:
          processNode,

        revenue_usd_bn:
          revenue,

        rd_spend_usd_bn:
          rdBudget,

        capex_usd_bn:
          capex,

        ai_chip_launches:
          aiChipLaunches,

        worldwide_sales:
          worldwideSales,
      };

      console.log(
        "PREDICTION COMPANY DATA:",
        predictionCompany
      );

      // ------------------------------------------------------
      // Send request to Flask
      // ------------------------------------------------------

      const response = await fetch(
        "http://127.0.0.1:5000/api/company/predict",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            company:
              predictionCompany,

            revenue:
              revenue,

            rdBudget:
              rdBudget,

            capex:
              capex,

            processNode:
              processNode,

            aiChipLaunches:
              aiChipLaunches,

            worldwideSales:
              worldwideSales,

            country:
              form.country.trim(),
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "PREDICTION RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            data.error ||
            "Prediction failed."
        );

        return;
      }

      const newPrediction =
        Number(data.prediction);

      setPrediction(
        newPrediction
      );

      /*
       * Keep the actual response values.
       * This avoids hardcoding them.
       */
      setConfidence(
        Number(
          data.confidence ?? 95
        )
      );

      setModelVersion(
        String(
          data.model ??
            "CatBoost_v1"
        )
      );

      if (data.company_id) {
        setCompanyId(
          String(data.company_id)
        );
      }

      /*
       * ------------------------------------------------------
       * PREDICTION COMPLETE
       *
       * Now show the Prediction Name popup.
       * This matches the terminal workflow:
       *
       * Enter Prediction Name :
       * TSMC 3
       *
       * Prediction History Saved Successfully!
       * ------------------------------------------------------
       */

      setPredictionName(
        `${companyData.company} ${new Date().getFullYear()}`
      );

      setShowSaveModal(true);
    } catch (error) {
      console.error(
        "Prediction error:",
        error
      );

      alert(
        "Unable to connect to the INSIQ Prediction API."
      );
    } finally {
      setPredicting(false);
    }
  };

  // ==========================================================
  // SAVE PREDICTION TO HISTORY
  // ==========================================================

  const handleSavePrediction = async () => {
    if (!companyData) {
      alert(
        "Company information is missing."
      );
      return;
    }

    if (!originalData) {
      alert(
        "Original company data is missing."
      );
      return;
    }

    if (prediction === null) {
      alert(
        "Please run a prediction first."
      );
      return;
    }

    const name =
      predictionName.trim();

    if (!name) {
      alert(
        "Please enter a prediction name."
      );
      return;
    }

    if (!companyId) {
      alert(
        "Company ID is missing."
      );
      return;
    }

    setSaving(true);

    try {
      /*
       * ------------------------------------------------------
       * ORIGINAL DATA
       *
       * These are the values loaded when the company was found.
       * Example:
       *
       * Revenue = 113.25
       * CapEx = 50.96
       * etc.
       * ------------------------------------------------------
       */

      const originalPayload = {
        country_iso3:
          originalData.country_iso3,

        process_node_nm:
          Number(
            originalData.process_node_nm
          ),

        revenue_usd_bn:
          Number(
            originalData.revenue_usd_bn
          ),

        rd_spend_usd_bn:
          Number(
            originalData.rd_spend_usd_bn
          ),

        capex_usd_bn:
          Number(
            originalData.capex_usd_bn
          ),

        ai_chip_launches:
          Number(
            originalData.ai_chip_launches
          ),

        worldwide_sales:
          Number(
            originalData.worldwide_sales
          ),
      };

      /*
       * ------------------------------------------------------
       * MODIFIED DATA
       *
       * These are the values currently entered by the user.
       *
       * Example:
       *
       * Original Revenue = 113.25
       * Modified Revenue = 113
       *
       * Both values are therefore preserved in history.
       * ------------------------------------------------------
       */

      const modifiedPayload =
        getModifiedData();

      const savePayload = {
        prediction_name: name,

        company_id:
          String(companyId),

        company:
          companyData.company,

        prediction_type:
          "Existing Company",

        original_data:
          originalPayload,

        modified_data:
          modifiedPayload,

        predicted_wafers:
          Number(prediction),

        confidence:
          Number(confidence),

        model_version:
          modelVersion,
      };

      console.log(
        "SAVE PREDICTION PAYLOAD:",
        savePayload
      );

      // ------------------------------------------------------
      // SEND TO BACKEND
      // ------------------------------------------------------

      const response = await fetch(
        "http://127.0.0.1:5000/api/company/save",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            savePayload
          ),
        }
      );

      const data =
        await response.json();

      console.log(
        "SAVE RESPONSE:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            data.error ||
            "Unable to save prediction."
        );

        return;
      }

      /*
       * ------------------------------------------------------
       * SUCCESS
       * ------------------------------------------------------
       */

      setShowSaveModal(false);

      alert(
        "Prediction History Saved Successfully!"
      );
    } catch (error) {
      console.error(
        "Save prediction error:",
        error
      );

      alert(
        "Unable to save prediction to Prediction History."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // EXPORT PDF
  // ==========================================================

  const handleExportPDF = async () => {
    if (
      !companyData ||
      prediction === null
    ) {
      alert(
        "Please run a prediction before exporting the report."
      );

      return;
    }

    setExporting(true);

    try {
      const { jsPDF } =
        await import("jspdf");

      const doc =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      const margin = 18;

      let y = 20;

      // ------------------------------------------------------
      // HEADER
      // ------------------------------------------------------

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(9);

      doc.setTextColor(
        37,
        99,
        235
      );

      doc.text(
        "INSIQ ANALYST DESK",
        margin,
        y
      );

      y += 8;

      doc.setFontSize(20);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        "Semiconductor Forecast Report",
        margin,
        y
      );

      y += 7;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      doc.setTextColor(
        100,
        116,
        139
      );

      doc.text(
        "Existing Company Demand Forecast",
        margin,
        y
      );

      y += 8;

      doc.setDrawColor(
        220,
        226,
        232
      );

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      y += 12;

      // ------------------------------------------------------
      // COMPANY INFORMATION
      // ------------------------------------------------------

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        "Company Information",
        margin,
        y
      );

      y += 8;

      addPDFRow(
        doc,
        "Company",
        companyData.company,
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "Company ID",
        companyId || "—",
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "Country",
        form.country,
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "Process Node",
        `${form.processNode} nm`,
        margin,
        y
      );

      y += 12;

      // ------------------------------------------------------
      // FORECAST INPUTS
      // ------------------------------------------------------

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        "Forecast Inputs",
        margin,
        y
      );

      y += 8;

      addPDFRow(
        doc,
        "Revenue",
        `${form.revenue} B$`,
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "R&D Budget",
        `${form.rdBudget} B$`,
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "CapEx",
        `${form.capex} B$`,
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "AI Chip Launches",
        form.aiChipLaunches,
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "Worldwide Sales",
        Number(
          form.worldwideSales
        ).toLocaleString(),
        margin,
        y
      );

      y += 14;

      // ------------------------------------------------------
      // FORECAST RESULT
      // ------------------------------------------------------

      doc.setDrawColor(
        210,
        218,
        226
      );

      doc.setFillColor(
        247,
        249,
        252
      );

      doc.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        40,
        2,
        2,
        "FD"
      );

      y += 10;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(9);

      doc.setTextColor(
        37,
        99,
        235
      );

      doc.text(
        "FORECAST RESULT",
        margin + 7,
        y
      );

      y += 9;

      doc.setFontSize(22);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        prediction.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        ),
        margin + 7,
        y
      );

      doc.setFontSize(9);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setTextColor(
        100,
        116,
        139
      );

      doc.text(
        "wafers / month",
        margin + 7,
        y + 6
      );

      const rightX =
        pageWidth - margin - 55;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        100,
        116,
        139
      );

      doc.text(
        "CONFIDENCE",
        rightX,
        y - 7
      );

      doc.setFontSize(13);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        `${confidence}%`,
        rightX,
        y + 1
      );

      doc.setFontSize(8);

      doc.setTextColor(
        100,
        116,
        139
      );

      doc.text(
        "MODEL",
        rightX,
        y + 10
      );

      doc.setFontSize(10);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        modelVersion,
        rightX,
        y + 17
      );

      y += 52;

      // ------------------------------------------------------
      // REPORT INFORMATION
      // ------------------------------------------------------

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(11);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        "Report Information",
        margin,
        y
      );

      y += 8;

      const generatedAt =
        new Date().toLocaleString(
          "en-IN"
        );

      addPDFRow(
        doc,
        "Generated",
        generatedAt,
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "Prediction Name",
        predictionName || "—",
        margin,
        y
      );

      y += 7;

      addPDFRow(
        doc,
        "Forecast Type",
        "Existing Company",
        margin,
        y
      );

      y += 12;

      // ------------------------------------------------------
      // NOTE
      // ------------------------------------------------------

      doc.setDrawColor(
        220,
        226,
        232
      );

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      y += 9;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        100,
        116,
        139
      );

      const note =
        `This report was generated by the INSIQ Semiconductor Forecasting Desk using the configured ${modelVersion} forecasting engine and the company inputs shown above.`;

      const wrappedNote =
        doc.splitTextToSize(
          note,
          pageWidth - margin * 2
        );

      doc.text(
        wrappedNote,
        margin,
        y
      );

      // ------------------------------------------------------
      // FOOTER
      // ------------------------------------------------------

      doc.setDrawColor(
        220,
        226,
        232
      );

      doc.line(
        margin,
        pageHeight - 18,
        pageWidth - margin,
        pageHeight - 18
      );

      doc.setFontSize(7);

      doc.setTextColor(
        148,
        163,
        184
      );

      doc.text(
        "INSIQ ANALYST DESK",
        margin,
        pageHeight - 11
      );

      doc.text(
        "Semiconductor Forecasting Desk",
        pageWidth - margin,
        pageHeight - 11,
        {
          align: "right",
        }
      );

      // ------------------------------------------------------
      // SAVE FILE
      // ------------------------------------------------------

      const safeCompanyName =
        companyData.company
          .replace(
            /[^a-z0-9]/gi,
            "_"
          )
          .replace(
            /_+/g,
            "_"
          );

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      doc.save(
        `INSIQ_${safeCompanyName}_Forecast_${date}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF export error:",
        error
      );

      alert(
        "Unable to generate the PDF report."
      );
    } finally {
      setExporting(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-gray-900">

      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">

          <div className="flex items-center gap-3">

            <Link
              href="/predict"
              className="flex items-center gap-2 text-xs text-gray-500 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Desk
            </Link>

            <span className="text-gray-300">
              /
            </span>

            <span className="text-xs font-semibold tracking-[0.16em] text-gray-700">
              EXISTING COMPANY PREDICTION
            </span>

          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            MODEL READY

          </div>

        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-8 py-12">

        {/* ==================================================
            TITLE
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.4,
          }}
        >

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            INSIQ ANALYST DESK
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-950">
            Existing Company Prediction
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Search an existing semiconductor company,
            review its available operating data, modify
            the forecast inputs, and generate a wafer
            demand prediction.
          </p>

        </motion.div>

        {/* ==================================================
            COMPANY LOOKUP
        =================================================== */}

        <section className="mt-10 border border-gray-200 bg-white">

          <div className="border-b border-gray-200 px-6 py-5">

            <div className="flex items-center gap-3">

              <Search className="h-4 w-4 text-blue-600" />

              <div>

                <h2 className="text-sm font-semibold">
                  Company Lookup
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the company name or identifier.
                </p>

              </div>

            </div>

          </div>

          <div className="flex flex-col gap-3 p-6 sm:flex-row">

            <input
              value={company}
              onChange={(e) =>
                setCompany(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  handleSearch();
                }
              }}
              placeholder="Example: TSMC"
              className="h-12 flex-1 border border-gray-300 bg-white px-4 text-sm outline-none focus:border-blue-500"
            />

            <button
              onClick={handleSearch}
              disabled={searching}
              className="h-12 bg-gray-950 px-7 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {searching
                ? "Searching..."
                : "Find Company"}
            </button>

          </div>

        </section>

        {/* ==================================================
            COMPANY RESULT
        =================================================== */}

        {found &&
          companyData && (

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
              }}
            >

              <section className="mt-6 border border-gray-200 bg-white">

                {/* Company Header */}

                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center border border-gray-200 bg-gray-50">

                      <Building2 className="h-5 w-5 text-gray-600" />

                    </div>

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                        Company Found
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">
                        {companyData.company}
                      </h2>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-[10px] uppercase tracking-wider text-gray-400">
                      Company ID
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {companyId || "—"}
                    </p>

                  </div>

                </div>

                {/* Company Information */}

                <div className="grid grid-cols-2 divide-x divide-gray-200 md:grid-cols-4">

                  <InfoCell
                    icon={Factory}
                    label="Country"
                    value={
                      form.country
                    }
                  />

                  <InfoCell
                    icon={Cpu}
                    label="Process Node"
                    value={`${form.processNode} nm`}
                  />

                  <InfoCell
                    icon={TrendingUp}
                    label="Model"
                    value={
                      modelVersion
                    }
                  />

                  <InfoCell
                    icon={BrainCircuit}
                    label="Status"
                    value="Ready"
                  />

                </div>

              </section>

              {/* ==================================================
                  FORECAST INPUTS
              =================================================== */}

              <section className="mt-6 border border-gray-200 bg-white">

                <div className="border-b border-gray-200 px-6 py-5">

                  <h2 className="text-sm font-semibold">
                    Forecast Inputs
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Review or modify the values before
                    running the model.
                  </p>

                </div>

                <div className="grid gap-x-8 gap-y-6 p-6 md:grid-cols-2">

                  <InputField
                    label="Country"
                    value={
                      form.country
                    }
                    onChange={(value) =>
                      updateField(
                        "country",
                        value
                      )
                    }
                  />

                  <InputField
                    label="Process Node"
                    value={
                      form.processNode
                        ? `${form.processNode} nm`
                        : ""
                    }
                    onChange={(value) =>
                      updateField(
                        "processNode",
                        value
                          .replace(
                            /nm/gi,
                            ""
                          )
                          .trim()
                      )
                    }
                  />

                  <InputField
                    label="Revenue (B$)"
                    value={
                      form.revenue
                    }
                    onChange={(value) =>
                      updateField(
                        "revenue",
                        value
                      )
                    }
                    icon={DollarSign}
                    numeric
                  />

                  <InputField
                    label="R&D Budget (B$)"
                    value={
                      form.rdBudget
                    }
                    onChange={(value) =>
                      updateField(
                        "rdBudget",
                        value
                      )
                    }
                    icon={DollarSign}
                    numeric
                  />

                  <InputField
                    label="CapEx (B$)"
                    value={
                      form.capex
                    }
                    onChange={(value) =>
                      updateField(
                        "capex",
                        value
                      )
                    }
                    icon={DollarSign}
                    numeric
                  />

                  <InputField
                    label="AI Chip Launches"
                    value={
                      form.aiChipLaunches
                    }
                    onChange={(value) =>
                      updateField(
                        "aiChipLaunches",
                        value
                      )
                    }
                    numeric
                  />

                  <InputField
                    label="Worldwide Sales"
                    value={
                      form.worldwideSales
                    }
                    onChange={(value) =>
                      updateField(
                        "worldwideSales",
                        value
                      )
                    }
                    numeric
                  />

                </div>

                {/* Run Prediction */}

                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-5">

                  <div>

                    <p className="text-xs font-semibold text-gray-700">
                      Ready to run forecast
                    </p>

                    <p className="mt-1 text-[11px] text-gray-500">
                      {modelVersion} will use the configured
                      company inputs.
                    </p>

                  </div>

                  <button
                    onClick={
                      handlePrediction
                    }
                    disabled={
                      predicting
                    }
                    className="bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {predicting
                      ? "Running Model..."
                      : "Run AI Prediction"}

                  </button>

                </div>

              </section>

              {/* ==================================================
                  RESULT
              =================================================== */}

              {prediction !==
                null && (

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                  }}
                  className="mt-6 border border-gray-200 bg-white"
                >

                  <div className="border-b border-gray-200 px-6 py-5">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
                      Forecast Result
                    </p>

                    <div className="mt-2 flex items-end justify-between">

                      <div>

                        <h2 className="text-xl font-semibold">
                          {
                            companyData.company
                          }
                        </h2>

                        <p className="mt-1 text-xs text-gray-500">
                          Existing Company Forecast
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-3xl font-semibold tracking-tight text-gray-950">

                          {prediction.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}

                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          wafers / month
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="grid md:grid-cols-2">

                    <div className="border-b border-gray-200 p-6 md:border-b-0 md:border-r">

                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        Confidence
                      </p>

                      <p className="mt-2 text-2xl font-semibold">
                        {confidence}%
                      </p>

                    </div>

                    <div className="p-6">

                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        Model
                      </p>

                      <p className="mt-2 text-2xl font-semibold">
                        {modelVersion}
                      </p>

                    </div>

                  </div>

                  {/* Export PDF */}

                  <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-5">

                    <div>

                      <p className="text-xs font-semibold text-gray-700">
                        Forecast Report
                      </p>

                      <p className="mt-1 text-[11px] text-gray-500">
                        Export this forecast and its configured inputs
                        as a professional PDF report.
                      </p>

                    </div>

                    <button
                      onClick={
                        handleExportPDF
                      }
                      disabled={
                        exporting
                      }
                      className="flex items-center gap-2 border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-800 transition-colors hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      <FileDown className="h-4 w-4" />

                      {exporting
                        ? "Generating PDF..."
                        : "Export PDF"}

                    </button>

                  </div>

                </motion.section>

              )}

            </motion.div>

          )}

      </div>

      {/* ======================================================
          SAVE PREDICTION MODAL
      ======================================================= */}

      {showSaveModal &&
        prediction !== null && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className="w-full max-w-md border border-gray-200 bg-white shadow-2xl"
            >

              {/* Modal Header */}

              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                <div>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Prediction Complete
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-gray-950">
                    Save Prediction
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setShowSaveModal(false)
                  }
                  disabled={saving}
                  className="flex h-9 w-9 items-center justify-center border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50"
                >

                  <X className="h-4 w-4" />

                </button>

              </div>

              {/* Prediction Summary */}

              <div className="px-6 py-5">

                <div className="border border-gray-200 bg-gray-50 p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        Company
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {companyData?.company}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-[10px] uppercase tracking-wider text-gray-400">
                        Prediction
                      </p>

                      <p className="mt-1 text-lg font-semibold text-gray-950">
                        {prediction.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                    </div>

                  </div>

                  <p className="mt-1 text-right text-[10px] text-gray-500">
                    wafers / month
                  </p>

                </div>

                {/* Prediction Name */}

                <div className="mt-5">

                  <label className="mb-2 block text-xs font-medium text-gray-600">
                    Prediction Name
                  </label>

                  <input
                    autoFocus
                    value={
                      predictionName
                    }
                    onChange={(e) =>
                      setPredictionName(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !saving
                      ) {
                        handleSavePrediction();
                      }
                    }}
                    placeholder="Example: TSMC 3"
                    disabled={saving}
                    className="h-12 w-full border border-gray-300 bg-white px-4 text-sm outline-none transition-colors focus:border-blue-500 disabled:bg-gray-50"
                  />

                  <p className="mt-2 text-[11px] text-gray-500">
                    Give this forecast a name so you can
                    identify it later in Prediction History.
                  </p>

                </div>

              </div>

              {/* Modal Footer */}

              <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">

                <button
                  onClick={() =>
                    setShowSaveModal(false)
                  }
                  disabled={saving}
                  className="border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleSavePrediction
                  }
                  disabled={
                    saving ||
                    !predictionName.trim()
                  }
                  className="flex items-center gap-2 bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Save className="h-4 w-4" />

                  {saving
                    ? "Saving..."
                    : "Save Prediction"}

                </button>

              </div>

            </motion.div>

          </div>

        )}

    </main>
  );
}


// ==========================================================
// PDF ROW HELPER
// ==========================================================

function addPDFRow(
  doc: any,
  label: string,
  value: string,
  margin: number,
  y: number
) {
  const pageWidth =
    doc.internal.pageSize.getWidth();

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    100,
    116,
    139
  );

  doc.text(
    label,
    margin,
    y
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setTextColor(
    30,
    41,
    59
  );

  doc.text(
    value,
    pageWidth - margin,
    y,
    {
      align: "right",
    }
  );

  doc.setDrawColor(
    235,
    238,
    242
  );

  doc.line(
    margin,
    y + 2,
    pageWidth - margin,
    y + 2
  );
}


// ==========================================================
// INFO CELL
// ==========================================================

function InfoCell({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="p-5">

      <div className="flex items-center gap-2">

        <Icon className="h-3.5 w-3.5 text-gray-400" />

        <span className="text-[10px] uppercase tracking-wider text-gray-400">
          {label}
        </span>

      </div>

      <p className="mt-2 text-sm font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}


// ==========================================================
// INPUT FIELD
// ==========================================================

function InputField({
  label,
  value,
  onChange,
  icon: Icon,
  numeric = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: any;
  numeric?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-xs font-medium text-gray-600">
        {label}
      </label>

      <div className="relative">

        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        )}

        <input
          type={
            numeric
              ? "number"
              : "text"
          }

          value={value}

          min={
            numeric
              ? 0
              : undefined
          }

          onChange={(e) =>
            onChange(
              e.target.value
            )
          }

          className={`h-11 w-full border border-gray-300 bg-white text-sm outline-none transition-colors focus:border-blue-500 ${
            Icon
              ? "pl-10 pr-3"
              : "px-3"
          }`}
        />

      </div>

    </div>
  );
}