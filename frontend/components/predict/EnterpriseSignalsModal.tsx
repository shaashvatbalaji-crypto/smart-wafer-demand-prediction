"use client";

import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const signals = [
  "Wafer Price Index",
  "Silicon Price",
  "Fab Utilization",
  "Semiconductor Sales",
  "Inventory Levels",
  "Lead Time",
  "Import / Export Volume",
  "Consumer Electronics Demand",
  "Automotive Chip Demand",
  "AI Server Demand",
  "Memory Market Trend",
  "Foundry Capacity",
  "Technology Node Mix",
  "Interest Rate",
  "Inflation Rate",
  "USD Exchange Rate",
  "GDP Growth",
  "Geopolitical Risk Index",
];

export default function EnterpriseSignalsModal({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="w-[900px] rounded-3xl bg-white p-10 shadow-2xl">

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-semibold">
              Enterprise Intelligence Signals
            </h2>

            <p className="mt-2 text-gray-500">
              AI uses these parameters for demand forecasting.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-gray-100"
          >
            <X size={22}/>
          </button>

        </div>

        <div className="grid grid-cols-2 gap-4">

          {signals.map((signal, index) => (

            <div
              key={signal}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-blue-400 hover:bg-blue-50"
            >

              <p className="text-sm text-blue-600">
                Signal {index + 1}
              </p>

              <h3 className="mt-1 font-semibold">
                {signal}
              </h3>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}