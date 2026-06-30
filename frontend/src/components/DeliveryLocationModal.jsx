import { useState } from "react";
import { MapPin, Search } from "./Icons";
import { useDeliveryLocation } from "../context/DeliveryLocationContext";

function DeliveryLocationModal({ open, onClose, title = "Please provide your delivery location" }) {
  const { deliveryLocation, detectCurrentLocation, setManualLocation, skipLocationPrompt } = useDeliveryLocation();
  const [manualLocation, setManualLocationInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleDetect = async () => {
    setStatus("detecting");
    setError("");
    try {
      await detectCurrentLocation();
      setStatus("idle");
    } catch (err) {
      setError(err.message || "Unable to detect your location.");
      setStatus("idle");
    }
  };

  const handleManual = () => {
    setError("");
    try {
      setManualLocation(manualLocation);
      setManualLocationInput("");
    } catch (err) {
      setError(err.message || "Enter a valid delivery location.");
    }
  };

  const handleSkip = () => {
    skipLocationPrompt();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/35 px-4 py-6">
      <div className="mx-auto mt-12 w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-600">
              Welcome to <span className="font-extrabold text-lime-700">KiranaMart</span>
            </p>
            <h2 className="mt-2 text-sm font-bold text-slate-900">{title}</h2>
          </div>
          {deliveryLocation && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Done
            </button>
          )}
        </div>

        <div className="mt-4 flex items-start gap-3">
          <MapPin className="mt-0.5 h-7 w-7 shrink-0 text-slate-600" />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-sm font-semibold text-slate-800">Choose where we should deliver.</p>
            <p className="text-xs font-semibold text-slate-500">
              Not sharing location now? Continue with store pickup and add delivery details later.
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDetect}
                disabled={status === "detecting"}
                className="rounded-lg bg-lime-600 px-3 py-2 text-xs font-bold text-white hover:bg-lime-700 disabled:bg-slate-300"
              >
                {status === "detecting" ? "Detecting..." : deliveryLocation ? "Detect again" : "Detect my location"}
              </button>

              <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-400">
                OR
              </span>

              <button
                type="button"
                onClick={handleSkip}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Continue without location
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(event) => setManualLocationInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleManual();
                  }}
                  placeholder="Search delivery location"
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              <button
                type="button"
                onClick={handleManual}
                className="rounded-lg border border-lime-200 px-3 py-2 text-xs font-bold text-lime-800 hover:bg-lime-50"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default DeliveryLocationModal;
