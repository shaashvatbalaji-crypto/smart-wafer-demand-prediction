"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import PredictionDashboard from "./PredictionDashboard";
import EnterpriseSignals from "./EnterpriseSignals";
import ForecastLoader from "./ForecastLoader";
import ForecastResults from "./ForecastResults";

export default function PredictionWorkspace() {
  const [showSignals, setShowSignals] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState<any>(null);

  const handleGenerateForecast = async () => {
    setLoading(true);
    setForecastData(null);

    try {
      // --------------------------------------------------
      // TEMPORARY SIMULATION
      // Later this becomes:
      // const response = await fetch("http://127.0.0.1:8001/predict")
      // --------------------------------------------------

      await new Promise((resolve) => setTimeout(resolve, 6000));

      setForecastData({
        company: "TSMC",
        predictedDemand: "1.84 Million Wafers",
        confidence: "95.6%",
        growth: "+12.8%",
        recommendation: "Increase production capacity",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <div className="mx-auto max-w-6xl">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-14 text-center text-[4rem] font-semibold leading-[0.92] tracking-[-0.06em] md:text-[6rem] lg:text-[7rem]"
        >
          <span className="block text-[#111111]">
            Semiconductor
          </span>

          <span className="block bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#93C5FD] bg-clip-text text-transparent">
            Demand Prediction
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: .4 }}
          className="mx-auto mt-8 max-w-5xl text-center text-xl leading-9 text-[#6B7280]"
        >
          Enterprise AI platform for forecasting semiconductor wafer demand
          using financial intelligence,
          manufacturing signals,
          technology trends,
          supply-chain analytics,
          and global market indicators.
        </motion.p>

      </div>

      {/* ================================================= */}
      {/* METRIC CARDS */}
      {/* ================================================= */}

      <div className="mx-auto mt-24 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">

        {/* Enterprise Signals */}

        <button
          onClick={() => setShowSignals(!showSignals)}
          className="
          group
          rounded-[32px]
          border
          border-gray-200
          bg-white/80
          p-8
          text-left
          backdrop-blur-xl
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-blue-300
          hover:shadow-2xl
        "
        >
          <p className="text-6xl font-bold text-gray-700 transition group-hover:text-[#2563EB]">
            18
          </p>

          <p className="mt-4 text-lg font-medium text-gray-700">
            Enterprise Signals
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Click to explore all prediction parameters
          </p>
        </button>

        {/* AI Engine */}

        <div
          className="
          rounded-[32px]
          border
          border-gray-200
          bg-white/80
          p-8
          backdrop-blur-xl
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-blue-300
          hover:shadow-2xl
        "
        >
          <p className="text-6xl font-bold text-gray-700">
            AI
          </p>

          <p className="mt-4 text-lg font-medium text-gray-700">
            Forecast Engine
          </p>

          <p className="mt-2 text-sm text-gray-500">
            CatBoost + Time Series Intelligence
          </p>
        </div>

        {/* Confidence */}

        <div
          className="
          rounded-[32px]
          border
          border-gray-200
          bg-white/80
          p-8
          backdrop-blur-xl
          shadow-sm
          transition-all
          duration-300
          hover:-translate-y-2
          hover:border-blue-300
          hover:shadow-2xl
        "
        >
          <p className="text-6xl font-bold text-gray-700">
            95%
          </p>

          <p className="mt-4 text-lg font-medium text-gray-700">
            Confidence Target
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Enterprise-grade prediction reliability
          </p>
        </div>

      </div>

      {/* ================================================= */}
      {/* BUTTON */}
      {/* ================================================= */}

      <div className="mt-16 flex justify-center">

        <button
          onClick={handleGenerateForecast}
          disabled={loading}
          className="
          rounded-full
          bg-[#2563EB]
          px-10
          py-5
          text-lg
          font-semibold
          text-white
          shadow-xl
          transition-all
          duration-300
          hover:-translate-y-1
          hover:bg-blue-700
          hover:shadow-2xl
          disabled:opacity-60
          disabled:cursor-not-allowed
        "
        >
          {loading ? "Generating..." : "Generate Forecast"}
        </button>

      </div>

      {/* ================================================= */}
      {/* LOADER */}
      {/* ================================================= */}

      {loading && <ForecastLoader />}

      {/* ================================================= */}
      {/* RESULTS */}
      {/* ================================================= */}

      {forecastData && (
        <ForecastResults
          data={forecastData}
        />
      )}

      {/* ================================================= */}
      {/* SIGNALS */}
      {/* ================================================= */}

      {showSignals && (
        <div className="mt-16">
          <EnterpriseSignals />
        </div>
      )}

      {/* ================================================= */}
      {/* DASHBOARD */}
      {/* ================================================= */}

      <PredictionDashboard />

    </div>
  );
}