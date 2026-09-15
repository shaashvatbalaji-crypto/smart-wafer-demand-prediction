"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartupInputPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    company: "",
    country: "USA",
    fab_type: "logic_leading",
    segment: "foundry",
    year: 2026,
    process_node_nm: 3,
    expected_revenue: 2.5,
    rd_budget: 0.8,
    capex: 1.5,
    ai_chip_launches: 2,
    expected_shipments: 500000,
    expected_ai_revenue: 800,
  });

  const [loading, setLoading] = useState(false);

  const update = (
    key: string,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ==========================================================
  // SUBMIT STARTUP PREDICTION
  // ==========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form.company.trim()) {
      alert("Please enter the startup name.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:5000/api/startup/predict",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Startup prediction failed."
        );
      }

      // ------------------------------------------------------
      // Save input
      // ------------------------------------------------------

      sessionStorage.setItem(
        "startup_prediction_input",
        JSON.stringify(form)
      );

      // ------------------------------------------------------
      // Save API prediction result
      // ------------------------------------------------------

      sessionStorage.setItem(
        "startup_prediction_result",
        JSON.stringify(data)
      );

      // ------------------------------------------------------
      // Go to result page
      // ------------------------------------------------------

      router.push(
        "/predict/startup/result"
      );

    } catch (error) {

      console.error(
        "Startup prediction error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to connect to the prediction server."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#07111f] px-6 py-10">

      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 text-[#52708f] hover:text-[#07111f] transition"
        >
          ← Back
        </button>

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-10">

          <p className="text-sm font-semibold tracking-widest text-[#52708f] uppercase">
            Startup Analysis
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Startup Company Prediction
          </h1>

          <p className="text-[#52708f] mt-3 max-w-2xl">
            Enter your startup's technology,
            financial, and AI business information
            to estimate its monthly wafer demand.
          </p>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <section className="bg-white rounded-2xl border border-[#dce5ee] shadow-sm p-7">

            <h2 className="text-xl font-semibold mb-6">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Startup Name */}

              <div className="md:col-span-2">

                <label className="block text-sm font-medium mb-2">
                  Startup Name
                </label>

                <input
                  type="text"
                  value={form.company}
                  onChange={(e) =>
                    update(
                      "company",
                      e.target.value
                    )
                  }
                  placeholder="Enter startup name"
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f] focus:ring-2 focus:ring-[#52708f]/10"
                />

              </div>

              {/* Country */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Country
                </label>

                <select
                  value={form.country}
                  onChange={(e) =>
                    update(
                      "country",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                >

                  <option value="IND">
                    India
                  </option>

                  <option value="USA">
                    USA
                  </option>

                  <option value="TWN">
                    Taiwan
                  </option>

                  <option value="KOR">
                    South Korea
                  </option>

                  <option value="CHN">
                    China
                  </option>

                </select>

              </div>

              {/* Fab Type */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Fab Type
                </label>

                <select
                  value={form.fab_type}
                  onChange={(e) =>
                    update(
                      "fab_type",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                >

                  <option value="logic_leading">
                    Logic Leading
                  </option>

                  <option value="logic_mature">
                    Logic Mature
                  </option>

                  <option value="memory_DRAM">
                    Memory DRAM
                  </option>

                  <option value="memory_NAND">
                    Memory NAND
                  </option>

                </select>

              </div>

              {/* Segment */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Segment
                </label>

                <select
                  value={form.segment}
                  onChange={(e) =>
                    update(
                      "segment",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                >

                  <option value="foundry">
                    Foundry
                  </option>

                  <option value="idm_logic">
                    IDM Logic
                  </option>

                  <option value="idm_memory">
                    IDM Memory
                  </option>

                </select>

              </div>

            </div>

          </section>

          {/* ==================================================
              TECHNOLOGY INFORMATION
          ================================================== */}

          <section className="bg-white rounded-2xl border border-[#dce5ee] shadow-sm p-7">

            <h2 className="text-xl font-semibold mb-6">
              Technology Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Year */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Year
                </label>

                <input
                  type="number"
                  min="2024"
                  max="2035"
                  value={form.year}
                  onChange={(e) =>
                    update(
                      "year",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

              {/* Process Node */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Process Node (nm)
                </label>

                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.process_node_nm}
                  onChange={(e) =>
                    update(
                      "process_node_nm",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              FINANCIAL INFORMATION
          ================================================== */}

          <section className="bg-white rounded-2xl border border-[#dce5ee] shadow-sm p-7">

            <h2 className="text-xl font-semibold mb-6">
              Financial Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Revenue */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Expected Revenue (USD Billion)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.expected_revenue}
                  onChange={(e) =>
                    update(
                      "expected_revenue",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

              {/* R&D */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  R&D Budget (USD Billion)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.rd_budget}
                  onChange={(e) =>
                    update(
                      "rd_budget",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

              {/* CapEx */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  CapEx (USD Billion)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.capex}
                  onChange={(e) =>
                    update(
                      "capex",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              AI BUSINESS INFORMATION
          ================================================== */}

          <section className="bg-white rounded-2xl border border-[#dce5ee] shadow-sm p-7">

            <h2 className="text-xl font-semibold mb-6">
              AI Business Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* AI Chip Launches */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  AI Chip Launches
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.ai_chip_launches}
                  onChange={(e) =>
                    update(
                      "ai_chip_launches",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

              {/* Shipments */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Expected AI Shipments
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.expected_shipments}
                  onChange={(e) =>
                    update(
                      "expected_shipments",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

              {/* AI Revenue */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Expected AI Revenue (Million USD)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.expected_ai_revenue}
                  onChange={(e) =>
                    update(
                      "expected_ai_revenue",
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-[#ccd8e3] bg-white px-4 py-3 outline-none focus:border-[#52708f]"
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <div className="flex justify-end pb-10">

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#07111f] text-white px-8 py-4 font-semibold hover:bg-[#15283d] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loading
                ? "Running Prediction..."
                : "Predict Startup Wafer Demand"}

            </button>

          </div>

        </form>

      </div>

    </main>
  );
}