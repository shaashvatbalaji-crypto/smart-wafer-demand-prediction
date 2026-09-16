"use client";

import {
  TrendingUp,
  ShieldCheck,
  Cpu,
  Activity,
} from "lucide-react";

export default function ForecastResults({ data }: { data?: any } = {}) {
  return (
    <section className="mx-auto mt-20 max-w-7xl">

      {/* Header */}

      <div className="mb-12">

        <h2 className="text-4xl font-semibold tracking-tight text-[#111111]">
          AI Forecast Results
        </h2>

        <p className="mt-3 text-lg text-gray-500">
          Enterprise semiconductor demand forecast generated using 18 market intelligence signals.
        </p>

      </div>

      {/* KPI Cards */}

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

        {/* Card */}

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

          <TrendingUp className="text-blue-600" size={34} />

          <p className="mt-8 text-sm uppercase tracking-[0.25em] text-gray-500">
            Forecast
          </p>

          <h3 className="mt-2 text-5xl font-bold">
            8.74M
          </h3>

          <p className="mt-3 text-gray-500">
            Wafer Demand
          </p>

        </div>

        {/* Card */}

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

          <ShieldCheck className="text-green-600" size={34} />

          <p className="mt-8 text-sm uppercase tracking-[0.25em] text-gray-500">
            Confidence
          </p>

          <h3 className="mt-2 text-5xl font-bold">
            95.2%
          </h3>

          <p className="mt-3 text-gray-500">
            Prediction Confidence
          </p>

        </div>

        {/* Card */}

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

          <Activity className="text-orange-500" size={34} />

          <p className="mt-8 text-sm uppercase tracking-[0.25em] text-gray-500">
            Growth
          </p>

          <h3 className="mt-2 text-5xl font-bold">
            +14.8%
          </h3>

          <p className="mt-3 text-gray-500">
            YoY Increase
          </p>

        </div>

        {/* Card */}

        <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

          <Cpu className="text-purple-600" size={34} />

          <p className="mt-8 text-sm uppercase tracking-[0.25em] text-gray-500">
            AI Model
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            CatBoost
          </h3>

          <p className="mt-3 text-gray-500">
            Ensemble Predictor
          </p>

        </div>

      </div>

      {/* AI Explanation */}

      <div className="mt-12 rounded-[36px] border border-gray-200 bg-white p-10 shadow-sm">

        <h3 className="text-2xl font-semibold">
          AI Explanation
        </h3>

        <p className="mt-6 text-lg leading-9 text-gray-600">

          The predicted increase in wafer demand is primarily driven by
          accelerated AI chip adoption, expansion of hyperscale data centers,
          strong EV production growth, recovery in semiconductor supply chains,
          and increasing global cloud infrastructure investment.

        </p>

      </div>

    </section>
  );
}