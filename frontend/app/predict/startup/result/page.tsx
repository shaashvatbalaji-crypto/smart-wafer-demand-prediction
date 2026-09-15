"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://127.0.0.1:5000";

export default function StartupInputPage() {

  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

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

    expected_ai_revenue: 800
  });


  const update = (
    key: string,
    value: string | number
  ) => {

    setForm((prev) => ({
      ...prev,
      [key]: value
    }));

  };


  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!form.company.trim()) {

      alert(
        "Please enter the startup name."
      );

      return;
    }

    setLoading(true);

    try {

      const response = await fetch(
        `${API_URL}/api/startup/predict`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(form)
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {

        throw new Error(
          data.error ||
          "Prediction failed."
        );
      }

      const prediction =
        data.prediction;

      const savedData = {

        input: form,

        prediction: prediction
      };

      sessionStorage.setItem(
        "startup_prediction_input",
        JSON.stringify(form)
      );

      sessionStorage.setItem(
        "startup_prediction_result",
        JSON.stringify(savedData)
      );


      // -----------------------------------------
      // SAVE TO DATABASE
      // -----------------------------------------

      try {

        const saveResponse =
          await fetch(
            `${API_URL}/api/startup/save`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify(
                savedData
              )
            }
          );

        const saveData =
          await saveResponse.json();

        if (!saveResponse.ok ||
            !saveData.success) {

          console.warn(
            "Prediction generated but database save failed:",
            saveData.error
          );

        }

      } catch (saveError) {

        console.warn(
          "Database save error:",
          saveError
        );

      }


      router.push(
        "/predict/startup/result"
      );

    } catch (error) {

      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to generate prediction."
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <main className="min-h-screen bg-[#f7f9fc] text-[#07111f] px-6 py-10">

      <div className="max-w-5xl mx-auto">

        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 text-[#52708f] hover:text-[#07111f] transition"
        >
          ← Back
        </button>


        <div className="mb-8">

          <p className="text-sm font-medium text-[#1677ff] tracking-wide">
            STARTUP PREDICTION
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Startup Company Analysis
          </h1>

          <p className="text-[#52708f] mt-2">
            Enter the startup information to
            estimate monthly wafer demand.
          </p>

        </div>


        {/* BASIC INFORMATION */}

        <section className="bg-white border border-[#d8e0ea] rounded-3xl p-7 mb-6 shadow-sm">

          <h2 className="text-xl font-semibold mb-6">
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                Startup Name
              </label>

              <input
                value={form.company}
                onChange={(e) =>
                  update(
                    "company",
                    e.target.value
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3 outline-none focus:border-[#1677ff]"
                placeholder="Enter startup name"
              />

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
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
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3 bg-white"
              >

                <option value="USA">
                  USA
                </option>

                <option value="Taiwan">
                  Taiwan
                </option>

                <option value="India">
                  India
                </option>

                <option value="South Korea">
                  South Korea
                </option>

                <option value="Japan">
                  Japan
                </option>

                <option value="Germany">
                  Germany
                </option>

              </select>

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
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
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3 bg-white"
              >

                <option value="logic_leading">
                  Logic Leading
                </option>

                <option value="logic_mature">
                  Logic Mature
                </option>

                <option value="memory">
                  Memory
                </option>

              </select>

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
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
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3 bg-white"
              >

                <option value="foundry">
                  Foundry
                </option>

                <option value="idmmemory">
                  IDM Memory
                </option>

                <option value="idm">
                  IDM
                </option>

              </select>

            </div>

          </div>

        </section>


        {/* TECHNOLOGY */}

        <section className="bg-white border border-[#d8e0ea] rounded-3xl p-7 mb-6 shadow-sm">

          <h2 className="text-xl font-semibold mb-6">
            Technology Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                Year
              </label>

              <input
                type="number"
                value={form.year}
                onChange={(e) =>
                  update(
                    "year",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                Process Node (nm)
              </label>

              <input
                type="number"
                value={form.process_node_nm}
                onChange={(e) =>
                  update(
                    "process_node_nm",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>

          </div>

        </section>


        {/* FINANCIAL */}

        <section className="bg-white border border-[#d8e0ea] rounded-3xl p-7 mb-6 shadow-sm">

          <h2 className="text-xl font-semibold mb-6">
            Financial Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                Expected Revenue (USD Billion)
              </label>

              <input
                type="number"
                step="0.01"
                value={form.expected_revenue}
                onChange={(e) =>
                  update(
                    "expected_revenue",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                R&D Budget (USD Billion)
              </label>

              <input
                type="number"
                step="0.01"
                value={form.rd_budget}
                onChange={(e) =>
                  update(
                    "rd_budget",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                CapEx (USD Billion)
              </label>

              <input
                type="number"
                step="0.01"
                value={form.capex}
                onChange={(e) =>
                  update(
                    "capex",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                AI Chip Launches
              </label>

              <input
                type="number"
                value={form.ai_chip_launches}
                onChange={(e) =>
                  update(
                    "ai_chip_launches",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                Expected Shipments
              </label>

              <input
                type="number"
                value={form.expected_shipments}
                onChange={(e) =>
                  update(
                    "expected_shipments",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>


            <div>

              <label className="block text-sm text-[#52708f] mb-2">
                Expected AI Revenue (USD Million)
              </label>

              <input
                type="number"
                value={form.expected_ai_revenue}
                onChange={(e) =>
                  update(
                    "expected_ai_revenue",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-[#cbd5e1] rounded-full px-4 py-3"
              />

            </div>

          </div>

        </section>


        {/* SUBMIT */}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="bg-[#1677ff] hover:bg-[#0866df] disabled:opacity-60 text-white px-8 py-3 rounded-full font-semibold transition"
        >

          {loading
            ? "Generating Prediction..."
            : "Generate Prediction"}

        </button>

      </div>

    </main>
  );
}