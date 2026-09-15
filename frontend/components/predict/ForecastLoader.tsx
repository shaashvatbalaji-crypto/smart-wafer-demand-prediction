"use client";

import { useEffect, useState } from "react";

const steps = [
  "Connecting Enterprise Signals...",
  "Loading Financial Market Data...",
  "Analyzing Manufacturing Indicators...",
  "Running CatBoost AI Model...",
  "Calculating Demand Forecast...",
  "Forecast Ready ✓",
];

export default function ForecastLoader() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= steps.length - 1) return;

    const timer = setTimeout(() => {
      setCurrent((prev) => prev + 1);
    }, 900);

    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="mx-auto mt-20 max-w-4xl rounded-[36px] border border-gray-200 bg-white p-10 shadow-xl">

      <h2 className="mb-10 text-center text-3xl font-semibold text-[#111111]">
        AI Forecast Engine
      </h2>

      {steps.map((step, index) => (

        <div
          key={step}
          className="mb-8"
        >

          <div className="mb-3 flex items-center justify-between">

            <p
              className={`font-medium ${
                index <= current
                  ? "text-[#111111]"
                  : "text-gray-400"
              }`}
            >
              {step}
            </p>

            {index < current && (
              <span className="text-green-600 font-semibold">
                ✓
              </span>
            )}

          </div>

          <div className="h-2 rounded-full bg-gray-100">

            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700"
              style={{
                width:
                  index < current
                    ? "100%"
                    : index === current
                    ? "65%"
                    : "0%",
              }}
            />

          </div>

        </div>

      ))}

    </div>
  );
}