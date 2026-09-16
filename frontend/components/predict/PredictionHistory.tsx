"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronRight,
  Database,
  RefreshCw,
  Search,
  X,
  FileDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ============================================================
// TYPES
// ============================================================

interface PredictionRecord {
  id: number;
  prediction_name: string;
  company_id: string;
  company: string;
  prediction_type: string;

  original_data:
    | string
    | Record<string, unknown>;

  modified_data:
    | string
    | Record<string, unknown>;

  predicted_wafers: number;
  confidence: number;
  model_version: string;
  prediction_time: string;
}

interface HistoryResponse {
  success: boolean;
  predictions: PredictionRecord[];
  count?: number;
  error?: string;
  message?: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PredictionHistory() {
  const router = useRouter();

  const [predictions, setPredictions] =
    useState<PredictionRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [exporting, setExporting] =
    useState(false);

  const [exportingRecord, setExportingRecord] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedPrediction, setSelectedPrediction] =
    useState<PredictionRecord | null>(null);

  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
      const response = await fetch(
        `${API_BASE}/api/predictions/history`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data: HistoryResponse =
        await response.json();

      console.log(
        "PREDICTION HISTORY RESPONSE:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.message ||
            "Unable to load prediction history."
        );
      }

      setPredictions(
        Array.isArray(data.predictions)
          ? data.predictions
          : []
      );

    } catch (err) {

      console.error(
        "Prediction history error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load prediction history."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadHistory();
  }, []);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredPredictions =
    predictions.filter((prediction) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        prediction.prediction_name
          ?.toLowerCase()
          .includes(search) ||

        prediction.company
          ?.toLowerCase()
          .includes(search) ||

        prediction.company_id
          ?.toLowerCase()
          .includes(search) ||

        prediction.prediction_type
          ?.toLowerCase()
          .includes(search)
      );
    });

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (
    dateString: string
  ) => {

    if (!dateString) {
      return "—";
    }

    const date =
      new Date(dateString);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return dateString;
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================================
  // FORMAT NUMBER
  // ==========================================================

  const formatNumber = (
    value: number
  ) => {

    const number =
      Number(value);

    if (
      Number.isNaN(number)
    ) {
      return "—";
    }

    return number.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // ==========================================================
  // PARSE JSON DATA
  // ==========================================================

  const parseData = (
    value:
      | string
      | Record<string, unknown>
  ): Record<string, unknown> => {

    if (
      typeof value === "object" &&
      value !== null
    ) {
      return value;
    }

    try {

      const parsed =
        JSON.parse(value);

      if (
        typeof parsed === "object" &&
        parsed !== null
      ) {
        return parsed;
      }

      return {};

    } catch {

      return {};

    }
  };

  // ==========================================================
  // FORMAT PDF VALUE
  // ==========================================================

  const formatPDFValue = (
    value: unknown
  ): string => {

    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    if (
      typeof value === "object"
    ) {

      try {

        return JSON.stringify(
          value
        );

      } catch {

        return String(value);

      }
    }

    return String(value);
  };

  // ==========================================================
  // BACK TO DESK
  // ==========================================================

  const handleBack = () => {
    router.push("/predict");
  };

  // ==========================================================
  // EXPORT ALL HISTORY PDF
  // ==========================================================

  const handleExportPDF = async () => {

    if (predictions.length === 0) {

      alert(
        "There are no predictions available to export."
      );

      return;
    }

    setExporting(true);

    try {

      const { jsPDF } =
        await import("jspdf");

      const { default: autoTable } =
        await import(
          "jspdf-autotable"
        );

      const doc =
        new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      const margin = 14;

      // ======================================================
      // HEADER
      // ======================================================

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
        15
      );

      doc.setFontSize(20);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        "Prediction History Report",
        margin,
        25
      );

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
        "Semiconductor Forecasting Desk",
        margin,
        31
      );

      // ======================================================
      // HEADER LINE
      // ======================================================

      doc.setDrawColor(
        220,
        226,
        232
      );

      doc.line(
        margin,
        36,
        pageWidth - margin,
        36
      );

      // ======================================================
      // SUMMARY
      // ======================================================

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
        "TOTAL FORECASTS",
        margin,
        45
      );

      doc.setFontSize(14);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        String(
          predictions.length
        ),
        margin,
        52
      );

      // ======================================================
      // COMPANY COUNT
      // ======================================================

      const companyCount =
        new Set(
          predictions.map(
            (item) =>
              item.company
          )
        ).size;

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
        "COMPANIES",
        75,
        45
      );

      doc.setFontSize(14);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        String(companyCount),
        75,
        52
      );

      // ======================================================
      // MODEL
      // ======================================================

      const modelNames =
        Array.from(
          new Set(
            predictions.map(
              (item) =>
                item.model_version
            )
          )
        );

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
        "MODEL",
        135,
        45
      );

      doc.setFontSize(10);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        modelNames.length > 0
          ? modelNames.join(", ")
          : "CatBoost_v1",
        135,
        52
      );

      // ======================================================
      // GENERATED
      // ======================================================

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
        "REPORT GENERATED",
        pageWidth - 72,
        45
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        15,
        23,
        42
      );

      doc.text(
        new Date().toLocaleString(
          "en-IN"
        ),
        pageWidth - 72,
        52
      );

      // ======================================================
      // TABLE DATA
      // ======================================================

      const tableData =
        predictions.map(
          (prediction) => [

            `#${prediction.id}`,

            prediction.prediction_name ||
              "Unnamed",

            prediction.company ||
              "—",

            prediction.company_id ||
              "—",

            prediction.prediction_type ||
              "—",

            Number(
              prediction.predicted_wafers
            ).toLocaleString(
              "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            ),

            `${Number(
              prediction.confidence
            ).toFixed(0)}%`,

            prediction.model_version ||
              "—",

            formatPDFDate(
              prediction.prediction_time
            ),

          ]
        );

      // ======================================================
      // TABLE
      // ======================================================

      autoTable(doc, {

        startY: 62,

        head: [[
          "ID",
          "Prediction",
          "Company",
          "Company ID",
          "Type",
          "Forecast (Wafers/Month)",
          "Confidence",
          "Model",
          "Date",
        ]],

        body: tableData,

        margin: {
          left: margin,
          right: margin,
          bottom: 18,
        },

        theme: "grid",

        styles: {
          font:
            "helvetica",
          fontSize: 7.2,
          cellPadding: 3,
          textColor: [
            30,
            41,
            59,
          ],
          lineColor: [
            220,
            226,
            232,
          ],
          lineWidth: 0.2,
          valign:
            "middle",
        },

        headStyles: {
          fontStyle:
            "bold",
          fontSize: 7,
          textColor: [
            71,
            85,
            105,
          ],
          fillColor: [
            247,
            249,
            252,
          ],
          lineColor: [
            220,
            226,
            232,
          ],
        },

        alternateRowStyles: {
          fillColor: [
            252,
            253,
            254,
          ],
        },

        columnStyles: {

          0: {
            cellWidth: 14,
          },

          1: {
            cellWidth: 38,
          },

          2: {
            cellWidth: 30,
          },

          3: {
            cellWidth: 24,
          },

          4: {
            cellWidth: 29,
          },

          5: {
            cellWidth: 39,
            halign:
              "right",
          },

          6: {
            cellWidth: 23,
            halign:
              "right",
          },

          7: {
            cellWidth: 30,
          },

          8: {
            cellWidth: 42,
          },

        },

      });

      // ======================================================
      // FOOTER
      // ======================================================

      const totalPages =
        doc.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {

        doc.setPage(page);

        doc.setDrawColor(
          220,
          226,
          232
        );

        doc.line(
          margin,
          pageHeight - 13,
          pageWidth - margin,
          pageHeight - 13
        );

        doc.setFont(
          "helvetica",
          "normal"
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
          pageHeight - 7
        );

        doc.text(
          `Prediction History • Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 7,
          {
            align: "right",
          }
        );
      }

      // ======================================================
      // SAVE
      // ======================================================

      const date =
        new Date()
          .toISOString()
          .slice(0, 10);

      doc.save(
        `INSIQ_Prediction_History_${date}.pdf`
      );

    } catch (error) {

      console.error(
        "Prediction history PDF error:",
        error
      );

      alert(
        "Unable to generate the prediction history PDF."
      );

    } finally {

      setExporting(false);

    }
  };

  // ==========================================================
  // EXPORT SELECTED FORECAST RECORD
  // ==========================================================

  const handleExportSelectedPDF =
    async () => {

      if (!selectedPrediction) {
        return;
      }

      setExportingRecord(true);

      try {

        const { jsPDF } =
          await import("jspdf");

        const { default: autoTable } =
          await import(
            "jspdf-autotable"
          );

        const doc =
          new jsPDF({
            orientation:
              "portrait",
            unit: "mm",
            format: "a4",
          });

        const pageWidth =
          doc.internal.pageSize.getWidth();

        const pageHeight =
          doc.internal.pageSize.getHeight();

        const margin = 16;

        // ====================================================
        // HEADER
        // ====================================================

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
          16
        );

        doc.setFontSize(20);

        doc.setTextColor(
          15,
          23,
          42
        );

        doc.text(
          "Forecast Record",
          margin,
          27
        );

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
          "Semiconductor Forecasting Desk",
          margin,
          33
        );

        // ====================================================
        // HEADER LINE
        // ====================================================

        doc.setDrawColor(
          220,
          226,
          232
        );

        doc.line(
          margin,
          38,
          pageWidth - margin,
          38
        );

        // ====================================================
        // PREDICTION NAME
        // ====================================================

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(15);

        doc.setTextColor(
          15,
          23,
          42
        );

        doc.text(
          selectedPrediction.prediction_name ||
            "Unnamed Forecast",
          margin,
          49
        );

        // ====================================================
        // PREDICTED DEMAND BOX
        // ====================================================

        doc.setFillColor(
          247,
          249,
          250
        );

        doc.setDrawColor(
          220,
          226,
          232
        );

        doc.roundedRect(
          margin,
          57,
          pageWidth -
            margin * 2,
          34,
          2,
          2,
          "FD"
        );

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
          "PREDICTED DEMAND",
          margin + 7,
          65
        );

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(22);

        doc.setTextColor(
          15,
          23,
          42
        );

        doc.text(
          formatNumber(
            selectedPrediction.predicted_wafers
          ),
          margin + 7,
          78
        );

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
          "wafers / month",
          margin + 7,
          85
        );

        // ====================================================
        // FORECAST INFORMATION
        // ====================================================

        let y = 104;

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(10);

        doc.setTextColor(
          71,
          85,
          105
        );

        doc.text(
          "FORECAST INFORMATION",
          margin,
          y
        );

        y += 6;

        const forecastInfo = [

          [
            "Company",
            selectedPrediction.company ||
              "—",
          ],

          [
            "Company ID",
            selectedPrediction.company_id ||
              "—",
          ],

          [
            "Prediction Type",
            selectedPrediction.prediction_type ||
              "—",
          ],

          [
            "Confidence",
            `${Number(
              selectedPrediction.confidence
            ).toFixed(0)}%`,
          ],

          [
            "Model",
            selectedPrediction.model_version ||
              "—",
          ],

          [
            "Created",
            formatDate(
              selectedPrediction.prediction_time
            ),
          ],

        ];

        autoTable(doc, {

          startY: y,

          body: forecastInfo,

          theme: "grid",

          margin: {
            left: margin,
            right: margin,
          },

          styles: {
            font:
              "helvetica",
            fontSize: 8,
            cellPadding: 3,
            textColor: [
              30,
              41,
              59,
            ],
            lineColor: [
              225,
              229,
              233,
            ],
            lineWidth:
              0.2,
          },

          columnStyles: {

            0: {
              cellWidth: 55,
              textColor: [
                100,
                116,
                139,
              ],
            },

            1: {
              fontStyle:
                "bold",
            },

          },

        });

        // ====================================================
        // ORIGINAL INPUTS
        // ====================================================

        const firstTableEnd =
          (
            doc as any
          ).lastAutoTable?.finalY ||
          y + 45;

        y =
          firstTableEnd + 12;

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(10);

        doc.setTextColor(
          71,
          85,
          105
        );

        doc.text(
          "ORIGINAL INPUTS",
          margin,
          y
        );

        y += 5;

        const originalData =
          parseData(
            selectedPrediction.original_data
          );

        const originalRows =
          Object.entries(
            originalData
          ).map(
            ([key, value]) => [
              key,
              formatPDFValue(
                value
              ),
            ]
          );

        autoTable(doc, {

          startY: y,

          head: [
            [
              "Field",
              "Value",
            ],
          ],

          body:
            originalRows.length >
            0
              ? originalRows
              : [
                  [
                    "No data",
                    "—",
                  ],
                ],

          theme: "grid",

          margin: {
            left: margin,
            right: margin,
          },

          styles: {
            font:
              "helvetica",
            fontSize: 7.5,
            cellPadding: 2.5,
            textColor: [
              30,
              41,
              59,
            ],
            lineColor: [
              225,
              229,
              233,
            ],
            lineWidth:
              0.2,
            overflow:
              "linebreak",
          },

          headStyles: {
            fontStyle:
              "bold",
            fontSize: 7.5,
            textColor: [
              71,
              85,
              105,
            ],
            fillColor: [
              247,
              249,
              252,
            ],
          },

          columnStyles: {

            0: {
              cellWidth: 65,
            },

            1: {
              cellWidth:
                pageWidth -
                margin * 2 -
                65,
            },

          },

          alternateRowStyles: {
            fillColor: [
              252,
              253,
              254,
            ],
          },

        });

        // ====================================================
        // MODIFIED / FORECAST INPUTS
        // ====================================================

        const originalTableEnd =
          (
            doc as any
          ).lastAutoTable?.finalY ||
          y + 20;

        y =
          originalTableEnd + 12;

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(10);

        doc.setTextColor(
          71,
          85,
          105
        );

        doc.text(
          "FORECAST INPUTS",
          margin,
          y
        );

        y += 5;

        const modifiedData =
          parseData(
            selectedPrediction.modified_data
          );

        const modifiedRows =
          Object.entries(
            modifiedData
          ).map(
            ([key, value]) => [
              key,
              formatPDFValue(
                value
              ),
            ]
          );

        autoTable(doc, {

          startY: y,

          head: [
            [
              "Field",
              "Value",
            ],
          ],

          body:
            modifiedRows.length >
            0
              ? modifiedRows
              : [
                  [
                    "No data",
                    "—",
                  ],
                ],

          theme: "grid",

          margin: {
            left: margin,
            right: margin,
            bottom: 20,
          },

          styles: {
            font:
              "helvetica",
            fontSize: 7.5,
            cellPadding: 2.5,
            textColor: [
              30,
              41,
              59,
            ],
            lineColor: [
              225,
              229,
              233,
            ],
            lineWidth:
              0.2,
            overflow:
              "linebreak",
          },

          headStyles: {
            fontStyle:
              "bold",
            fontSize: 7.5,
            textColor: [
              71,
              85,
              105,
            ],
            fillColor: [
              247,
              249,
              252,
            ],
          },

          columnStyles: {

            0: {
              cellWidth: 65,
            },

            1: {
              cellWidth:
                pageWidth -
                margin * 2 -
                65,
            },

          },

          alternateRowStyles: {
            fillColor: [
              252,
              253,
              254,
            ],
          },

        });

        // ====================================================
        // FOOTER
        // ====================================================

        const totalPages =
          doc.getNumberOfPages();

        for (
          let page = 1;
          page <= totalPages;
          page++
        ) {

          doc.setPage(page);

          doc.setDrawColor(
            220,
            226,
            232
          );

          doc.line(
            margin,
            pageHeight - 13,
            pageWidth - margin,
            pageHeight - 13
          );

          doc.setFont(
            "helvetica",
            "normal"
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
            pageHeight - 7
          );

          doc.text(
            `Forecast Record • Page ${page} of ${totalPages}`,
            pageWidth - margin,
            pageHeight - 7,
            {
              align: "right",
            }
          );
        }

        // ====================================================
        // SAVE
        // ====================================================

        const safeName =
          (
            selectedPrediction.prediction_name ||
            selectedPrediction.company ||
            "Forecast"
          )
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
          `INSIQ_${safeName}_Forecast_${date}.pdf`
        );

      } catch (error) {

        console.error(
          "Selected forecast PDF error:",
          error
        );

        alert(
          "Unable to generate the forecast PDF."
        );

      } finally {

        setExportingRecord(false);

      }
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div
        style={{
          minHeight:
            "100vh",
          background:
            "#f7f8fa",
          padding:
            "32px",
          color:
            "#172033",
        }}
      >
        <div
          style={{
            maxWidth:
              "1400px",
            margin:
              "0 auto",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
              color:
                "#64748b",
              fontSize:
                "13px",
            }}
          >
            <RefreshCw
              size={15}
              className="animate-spin"
            />

            Loading prediction history...
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f7f8fa",
        padding:
          "28px 32px 48px",
        color:
          "#172033",
      }}
    >

      <div
        style={{
          maxWidth:
            "1400px",
          margin:
            "0 auto",
        }}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
          }}
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            paddingBottom:
              "22px",
            borderBottom:
              "1px solid #dfe3e8",
          }}
        >

          <div>

            <button
              onClick={
                handleBack
              }
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "7px",
                border:
                  "none",
                background:
                  "transparent",
                padding: 0,
                marginBottom:
                  "12px",
                color:
                  "#64748b",
                fontSize:
                  "12px",
                cursor:
                  "pointer",
              }}
            >
              <ArrowLeft
                size={14}
              />

              Analyst Desk
            </button>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "12px",
              }}
            >

              <div
                style={{
                  width:
                    "38px",
                  height:
                    "38px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  border:
                    "1px solid #d7dce2",
                  background:
                    "#ffffff",
                }}
              >
                <BarChart3
                  size={19}
                  strokeWidth={1.7}
                />
              </div>

              <div>

                <div
                  style={{
                    fontSize:
                      "11px",
                    fontWeight:
                      600,
                    letterSpacing:
                      "0.12em",
                    color:
                      "#0f766e",
                    textTransform:
                      "uppercase",
                  }}
                >
                  INSIQ ANALYST DESK
                </div>

                <h1
                  style={{
                    margin:
                      "3px 0 0",
                    fontSize:
                      "25px",
                    fontWeight:
                      600,
                    letterSpacing:
                      "-0.025em",
                  }}
                >
                  Prediction History
                </h1>

              </div>

            </div>

          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "8px",
            }}
          >

            <button
              onClick={
                handleExportPDF
              }
              disabled={
                exporting ||
                predictions.length === 0
              }
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "8px",
                height:
                  "38px",
                padding:
                  "0 14px",
                border:
                  "1px solid #cfd5dc",
                background:
                  "#ffffff",
                color:
                  "#334155",
                fontSize:
                  "12px",
                fontWeight:
                  600,
                cursor:
                  exporting
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  exporting
                    ? 0.5
                    : 1,
              }}
            >

              <FileDown
                size={14}
              />

              {exporting
                ? "Generating..."
                : "Export PDF"}

            </button>

            <button
              onClick={
                loadHistory
              }
              disabled={
                loading
              }
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "8px",
                height:
                  "38px",
                padding:
                  "0 14px",
                border:
                  "1px solid #cfd5dc",
                background:
                  "#ffffff",
                color:
                  "#334155",
                fontSize:
                  "12px",
                cursor:
                  "pointer",
              }}
            >

              <RefreshCw
                size={14}
              />

              Refresh

            </button>

          </div>

        </motion.div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <motion.div
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
            delay: 0.08,
          }}
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            marginTop:
              "20px",
            border:
              "1px solid #dfe3e8",
            background:
              "#ffffff",
          }}
        >

          <div
            style={{
              padding:
                "17px 20px",
              borderRight:
                "1px solid #e1e5e9",
            }}
          >

            <div
              style={{
                color:
                  "#7b8794",
                fontSize:
                  "10px",
                letterSpacing:
                  "0.09em",
                textTransform:
                  "uppercase",
              }}
            >
              Total Forecasts
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                fontSize:
                  "22px",
                fontWeight:
                  600,
              }}
            >
              {
                predictions.length
              }
            </div>

          </div>

          <div
            style={{
              padding:
                "17px 20px",
              borderRight:
                "1px solid #e1e5e9",
            }}
          >

            <div
              style={{
                color:
                  "#7b8794",
                fontSize:
                  "10px",
                letterSpacing:
                  "0.09em",
                textTransform:
                  "uppercase",
              }}
            >
              Companies
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                fontSize:
                  "22px",
                fontWeight:
                  600,
              }}
            >
              {
                new Set(
                  predictions.map(
                    (item) =>
                      item.company
                  )
                ).size
              }
            </div>

          </div>

          <div
            style={{
              padding:
                "17px 20px",
            }}
          >

            <div
              style={{
                color:
                  "#7b8794",
                fontSize:
                  "10px",
                letterSpacing:
                  "0.09em",
                textTransform:
                  "uppercase",
              }}
            >
              Model
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                fontSize:
                  "15px",
                fontWeight:
                  600,
              }}
            >
              {predictions.length > 0
                ? predictions[0]
                    .model_version
                : "CatBoost_v1"}
            </div>

          </div>

        </motion.div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div
          style={{
            marginTop:
              "20px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            gap:
              "16px",
          }}
        >

          <div
            style={{
              position:
                "relative",
              width:
                "360px",
            }}
          >

            <Search
              size={15}
              style={{
                position:
                  "absolute",
                left:
                  "12px",
                top:
                  "50%",
                transform:
                  "translateY(-50%)",
                color:
                  "#7c8795",
              }}
            />

            <input
              type="text"
              value={
                searchTerm
              }
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder="Search prediction or company..."
              style={{
                width:
                  "100%",
                height:
                  "38px",
                padding:
                  "0 12px 0 36px",
                border:
                  "1px solid #cfd5dc",
                background:
                  "#ffffff",
                color:
                  "#172033",
                fontSize:
                  "12px",
                outline:
                  "none",
                boxSizing:
                  "border-box",
              }}
            />

          </div>

          <div
            style={{
              fontSize:
                "11px",
              color:
                "#7b8794",
            }}
          >
            Showing{" "}
            <strong
              style={{
                color:
                  "#334155",
              }}
            >
              {
                filteredPredictions.length
              }
            </strong>{" "}
            of{" "}
            <strong
              style={{
                color:
                  "#334155",
              }}
            >
              {
                predictions.length
              }
            </strong>{" "}
            forecasts
          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            style={{
              marginTop:
                "16px",
              padding:
                "13px 16px",
              border:
                "1px solid #e4b9b9",
              background:
                "#fffafa",
              color:
                "#a33a3a",
              fontSize:
                "12px",
            }}
          >
            {error}
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!error &&
          filteredPredictions.length ===
            0 && (

            <div
              style={{
                marginTop:
                  "18px",
                border:
                  "1px solid #dfe3e8",
                background:
                  "#ffffff",
                padding:
                  "60px 20px",
                textAlign:
                  "center",
              }}
            >

              <Database
                size={28}
                strokeWidth={1.4}
                style={{
                  color:
                    "#94a3b8",
                  marginBottom:
                    "12px",
                }}
              />

              <div
                style={{
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                }}
              >
                No predictions found
              </div>

              <div
                style={{
                  marginTop:
                    "6px",
                  fontSize:
                    "12px",
                  color:
                    "#7b8794",
                }}
              >
                {searchTerm
                  ? "Try a different search term."
                  : "Saved forecasts will appear here."}
              </div>

            </div>
          )}

        {/* ==================================================
            TABLE
        ================================================== */}

        {filteredPredictions.length >
          0 && (

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
              duration: 0.35,
              delay: 0.15,
            }}
            style={{
              marginTop:
                "18px",
              border:
                "1px solid #dfe3e8",
              background:
                "#ffffff",
              overflowX:
                "auto",
            }}
          >

            <table
              style={{
                width:
                  "100%",
                borderCollapse:
                  "collapse",
                minWidth:
                  "950px",
              }}
            >

              <thead>

                <tr
                  style={{
                    background:
                      "#f8f9fa",
                    borderBottom:
                      "1px solid #dfe3e8",
                  }}
                >

                  <th
                    style={
                      headerStyle
                    }
                  >
                    Prediction
                  </th>

                  <th
                    style={
                      headerStyle
                    }
                  >
                    Company
                  </th>

                  <th
                    style={
                      headerStyle
                    }
                  >
                    Type
                  </th>

                  <th
                    style={{
                      ...headerStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Forecast
                  </th>

                  <th
                    style={{
                      ...headerStyle,
                      textAlign:
                        "right",
                    }}
                  >
                    Confidence
                  </th>

                  <th
                    style={
                      headerStyle
                    }
                  >
                    Model
                  </th>

                  <th
                    style={
                      headerStyle
                    }
                  >
                    Date
                  </th>

                  <th
                    style={{
                      ...headerStyle,
                      width:
                        "45px",
                    }}
                  />

                </tr>

              </thead>

              <tbody>

                {filteredPredictions.map(
                  (
                    prediction,
                    index
                  ) => (

                    <motion.tr
                      key={
                        prediction.id
                      }
                      initial={{
                        opacity: 0,
                      }}
                      animate={{
                        opacity: 1,
                      }}
                      transition={{
                        delay:
                          0.03 *
                          index,
                      }}
                      style={{
                        borderBottom:
                          "1px solid #edf0f2",
                      }}
                    >

                      {/* PREDICTION */}

                      <td
                        style={
                          cellStyle
                        }
                      >

                        <div
                          style={{
                            fontWeight:
                              600,
                            fontSize:
                              "12px",
                            color:
                              "#172033",
                          }}
                        >
                          {
                            prediction.prediction_name ||
                            "Unnamed Forecast"
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              "4px",
                            fontSize:
                              "10px",
                            color:
                              "#8a94a2",
                          }}
                        >
                          ID #
                          {
                            prediction.id
                          }
                        </div>

                      </td>

                      {/* COMPANY */}

                      <td
                        style={
                          cellStyle
                        }
                      >

                        <div
                          style={{
                            fontWeight:
                              600,
                            fontSize:
                              "12px",
                          }}
                        >
                          {
                            prediction.company
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              "3px",
                            fontSize:
                              "10px",
                            color:
                              "#8a94a2",
                          }}
                        >
                          {
                            prediction.company_id
                          }
                        </div>

                      </td>

                      {/* TYPE */}

                      <td
                        style={
                          cellStyle
                        }
                      >

                        <span
                          style={{
                            display:
                              "inline-block",
                            padding:
                              "4px 7px",
                            border:
                              "1px solid #d8dde3",
                            background:
                              "#fafbfc",
                            fontSize:
                              "10px",
                            color:
                              "#596575",
                          }}
                        >
                          {
                            prediction.prediction_type
                          }
                        </span>

                      </td>

                      {/* FORECAST */}

                      <td
                        style={{
                          ...cellStyle,
                          textAlign:
                            "right",
                        }}
                      >

                        <div
                          style={{
                            fontSize:
                              "13px",
                            fontWeight:
                              600,
                            fontVariantNumeric:
                              "tabular-nums",
                          }}
                        >
                          {
                            formatNumber(
                              prediction.predicted_wafers
                            )
                          }
                        </div>

                        <div
                          style={{
                            marginTop:
                              "3px",
                            fontSize:
                              "9px",
                            color:
                              "#8a94a2",
                          }}
                        >
                          wafers / month
                        </div>

                      </td>

                      {/* CONFIDENCE */}

                      <td
                        style={{
                          ...cellStyle,
                          textAlign:
                            "right",
                        }}
                      >

                        <span
                          style={{
                            fontWeight:
                              600,
                            fontSize:
                              "12px",
                          }}
                        >
                          {
                            Number(
                              prediction.confidence
                            ).toFixed(0)
                          }
                          %
                        </span>

                      </td>

                      {/* MODEL */}

                      <td
                        style={
                          cellStyle
                        }
                      >

                        <span
                          style={{
                            fontFamily:
                              "monospace",
                            fontSize:
                              "10px",
                            color:
                              "#596575",
                          }}
                        >
                          {
                            prediction.model_version
                          }
                        </span>

                      </td>

                      {/* DATE */}

                      <td
                        style={
                          cellStyle
                        }
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap:
                              "6px",
                            fontSize:
                              "11px",
                            color:
                              "#596575",
                            whiteSpace:
                              "nowrap",
                          }}
                        >

                          <Calendar
                            size={12}
                          />

                          {
                            formatDate(
                              prediction.prediction_time
                            )
                          }

                        </div>

                      </td>

                      {/* DETAILS */}

                      <td
                        style={{
                          ...cellStyle,
                          textAlign:
                            "center",
                        }}
                      >

                        <button
                          onClick={() =>
                            setSelectedPrediction(
                              prediction
                            )
                          }
                          title="View prediction"
                          style={{
                            width:
                              "30px",
                            height:
                              "30px",
                            border:
                              "1px solid #d9dee4",
                            background:
                              "#ffffff",
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            cursor:
                              "pointer",
                            color:
                              "#64748b",
                          }}
                        >

                          <ChevronRight
                            size={15}
                          />

                        </button>

                      </td>

                    </motion.tr>

                  )
                )}

              </tbody>

            </table>

          </motion.div>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          style={{
            marginTop:
              "15px",
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "7px",
            color:
              "#8993a0",
            fontSize:
              "10px",
          }}
        >

          <Database
            size={12}
          />

          Connected to INSIQ prediction database

          <span>•</span>

          {
            predictions.length
          } stored forecast
          {
            predictions.length !==
            1
              ? "s"
              : ""
          }

        </div>

      </div>

      {/* ====================================================
          FORECAST RECORD PANEL
      ==================================================== */}

      {selectedPrediction && (

        <div
          onClick={() =>
            setSelectedPrediction(
              null
            )
          }
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.35)",
            display:
              "flex",
            justifyContent:
              "flex-end",
            zIndex:
              100,
          }}
        >

          <motion.div
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width:
                "480px",
              maxWidth:
                "90vw",
              height:
                "100%",
              overflowY:
                "auto",
              background:
                "#ffffff",
              borderLeft:
                "1px solid #dfe3e8",
              padding:
                "28px",
              boxSizing:
                "border-box",
            }}
          >

            {/* =================================================
                PANEL HEADER
            ================================================= */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-start",
                justifyContent:
                  "space-between",
                paddingBottom:
                  "18px",
                borderBottom:
                  "1px solid #e1e5e9",
              }}
            >

              <div>

                <div
                  style={{
                    fontSize:
                      "10px",
                    letterSpacing:
                      "0.1em",
                    color:
                      "#0f766e",
                    textTransform:
                      "uppercase",
                    fontWeight:
                      600,
                  }}
                >
                  Forecast Record
                </div>

                <h2
                  style={{
                    margin:
                      "6px 0 0",
                    fontSize:
                      "20px",
                    fontWeight:
                      600,
                  }}
                >
                  {
                    selectedPrediction.prediction_name
                  }
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedPrediction(
                    null
                  )
                }
                style={{
                  border:
                    "1px solid #d9dee4",
                  background:
                    "#ffffff",
                  width:
                    "32px",
                  height:
                    "32px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  cursor:
                    "pointer",
                }}
              >

                <X
                  size={15}
                />

              </button>

            </div>

            {/* =================================================
                EXPORT CURRENT RECORD
            ================================================= */}

            <div
              style={{
                marginTop:
                  "16px",
                display:
                  "flex",
                justifyContent:
                  "flex-end",
              }}
            >

              <button
                onClick={
                  handleExportSelectedPDF
                }
                disabled={
                  exportingRecord
                }
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
                  height:
                    "36px",
                  padding:
                    "0 14px",
                  border:
                    "1px solid #cfd5dc",
                  background:
                    "#ffffff",
                  color:
                    "#334155",
                  fontSize:
                    "11px",
                  fontWeight:
                    600,
                  cursor:
                    exportingRecord
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    exportingRecord
                      ? 0.55
                      : 1,
                }}
              >

                <FileDown
                  size={14}
                />

                {exportingRecord
                  ? "Generating..."
                  : "Export PDF"}

              </button>

            </div>

            {/* =================================================
                RESULT
            ================================================= */}

            <div
              style={{
                marginTop:
                  "16px",
                padding:
                  "20px",
                background:
                  "#f7f9fa",
                border:
                  "1px solid #e0e5e9",
              }}
            >

              <div
                style={{
                  fontSize:
                    "10px",
                  color:
                    "#7b8794",
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    "0.08em",
                }}
              >
                Predicted Demand
              </div>

              <div
                style={{
                  marginTop:
                    "5px",
                  fontSize:
                    "28px",
                  fontWeight:
                    600,
                  letterSpacing:
                    "-0.03em",
                }}
              >
                {
                  formatNumber(
                    selectedPrediction.predicted_wafers
                  )
                }
              </div>

              <div
                style={{
                  marginTop:
                    "3px",
                  fontSize:
                    "10px",
                  color:
                    "#7b8794",
                }}
              >
                wafers / month
              </div>

            </div>

            {/* =================================================
                FORECAST INFORMATION
            ================================================= */}

            <DetailSection
              title="Forecast Information"
            >

              <DetailRow
                label="Company"
                value={
                  selectedPrediction.company
                }
              />

              <DetailRow
                label="Company ID"
                value={
                  selectedPrediction.company_id
                }
              />

              <DetailRow
                label="Prediction Type"
                value={
                  selectedPrediction.prediction_type
                }
              />

              <DetailRow
                label="Confidence"
                value={`${Number(
                  selectedPrediction.confidence
                ).toFixed(0)}%`}
              />

              <DetailRow
                label="Model"
                value={
                  selectedPrediction.model_version
                }
              />

              <DetailRow
                label="Created"
                value={formatDate(
                  selectedPrediction.prediction_time
                )}
              />

            </DetailSection>

            {/* =================================================
                ORIGINAL INPUTS
            ================================================= */}

            <DetailSection
              title="Original Inputs"
            >

              <DataObject
                data={parseData(
                  selectedPrediction.original_data
                )}
              />

            </DetailSection>

            {/* =================================================
                FORECAST INPUTS
            ================================================= */}

            <DetailSection
              title="Forecast Inputs"
            >

              <DataObject
                data={parseData(
                  selectedPrediction.modified_data
                )}
              />

            </DetailSection>

            {/* =================================================
                DATABASE NOTE
            ================================================= */}

            <div
              style={{
                marginTop:
                  "24px",
                paddingTop:
                  "16px",
                borderTop:
                  "1px solid #e1e5e9",
                fontSize:
                  "10px",
                color:
                  "#8a94a2",
                lineHeight:
                  1.6,
              }}
            >
              This record is loaded directly from
              the INSIQ prediction history database.
            </div>

          </motion.div>

        </div>

      )}

    </div>
  );
}

// ============================================================
// PDF DATE
// ============================================================

function formatPDFDate(
  dateString: string
) {

  if (!dateString) {
    return "—";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateString;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// ============================================================
// TABLE HEADER STYLE
// ============================================================

const headerStyle: React.CSSProperties = {
  padding: "11px 14px",
  textAlign: "left",
  fontSize: "9px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#788493",
  whiteSpace: "nowrap",
};

// ============================================================
// TABLE CELL STYLE
// ============================================================

const cellStyle: React.CSSProperties = {
  padding: "13px 14px",
  verticalAlign: "middle",
};

// ============================================================
// DETAIL SECTION
// ============================================================

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {

  return (
    <div
      style={{
        marginTop:
          "24px",
      }}
    >

      <div
        style={{
          marginBottom:
            "10px",
          fontSize:
            "10px",
          fontWeight:
            600,
          letterSpacing:
            "0.08em",
          textTransform:
            "uppercase",
          color:
            "#64748b",
        }}
      >
        {title}
      </div>

      <div
        style={{
          border:
            "1px solid #e0e5e9",
          background:
            "#ffffff",
        }}
      >
        {children}
      </div>

    </div>
  );
}

// ============================================================
// DETAIL ROW
// ============================================================

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div
      style={{
        display:
          "flex",
        justifyContent:
          "space-between",
        gap:
          "20px",
        padding:
          "10px 12px",
        borderBottom:
          "1px solid #edf0f2",
        fontSize:
          "11px",
      }}
    >

      <span
        style={{
          color:
            "#8a94a2",
        }}
      >
        {label}
      </span>

      <span
        style={{
          color:
            "#263244",
          fontWeight:
            500,
          textAlign:
            "right",
          wordBreak:
            "break-word",
        }}
      >
        {value || "—"}
      </span>

    </div>
  );
}

// ============================================================
// DATA OBJECT
// ============================================================

function DataObject({
  data,
}: {
  data: Record<string, unknown>;
}) {

  const entries =
    Object.entries(data);

  if (
    entries.length === 0
  ) {

    return (
      <div
        style={{
          padding:
            "14px",
          color:
            "#8a94a2",
          fontSize:
            "11px",
        }}
      >
        No input data available.
      </div>
    );
  }

  return (
    <div>

      {entries.map(
        ([key, value]) => (

          <div
            key={key}
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              gap:
                "16px",
              padding:
                "9px 12px",
              borderBottom:
                "1px solid #edf0f2",
              fontSize:
                "10px",
            }}
          >

            <span
              style={{
                color:
                  "#7b8794",
                wordBreak:
                  "break-word",
              }}
            >
              {key}
            </span>

            <span
              style={{
                color:
                  "#263244",
                fontWeight:
                  500,
                textAlign:
                  "right",
                wordBreak:
                  "break-word",
              }}
            >
              {typeof value ===
              "object"
                ? JSON.stringify(
                    value
                  )
                : String(
                    value ??
                      "—"
                  )}
            </span>

          </div>

        )
      )}

    </div>
  );
}