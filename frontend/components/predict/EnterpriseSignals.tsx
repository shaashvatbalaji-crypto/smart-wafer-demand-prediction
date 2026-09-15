"use client";

const signals = [
  "Global GDP Growth",
  "Semiconductor Sales",
  "Wafer Production",
  "Foundry Capacity",
  "AI Chip Demand",
  "Automotive Semiconductor Demand",
  "Consumer Electronics Sales",
  "Data Center Expansion",
  "Cloud Infrastructure Investment",
  "5G Deployment",
  "Electric Vehicle Production",
  "Geopolitical Risk Index",
  "Supply Chain Stability",
  "Silicon Price Index",
  "Inflation Rate",
  "Interest Rate",
  "Manufacturing PMI",
  "Export-Import Index",
];

export default function EnterpriseSignals() {
  return (
    <section className="mx-auto mt-16 max-w-7xl">

      <div className="mb-10 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-[#111111]">
          Enterprise Intelligence Signals
        </h2>

        <p className="mt-4 text-lg text-gray-500">
          These signals collectively drive semiconductor demand forecasting.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {signals.map((signal, index) => (

          <div
            key={signal}
            className="
              rounded-3xl
              border
              border-gray-200
              bg-white
              p-6
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-2
              hover:border-blue-300
              hover:shadow-xl
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.3em] text-blue-600">
                  Signal {index + 1}
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#111111]">
                  {signal}
                </h3>

              </div>

              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />

            </div>

            <div className="mt-8">

              <div className="mb-2 flex justify-between">

                <span className="text-sm text-gray-500">
                  AI Importance
                </span>

                <span className="font-semibold">
                  {(90 - index).toFixed(0)}%
                </span>

              </div>

              <div className="h-2 rounded-full bg-gray-100">

                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  style={{
                    width: `${90 - index}%`,
                  }}
                />

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}