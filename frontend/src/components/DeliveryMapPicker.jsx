import { useEffect, useRef, useState } from "react";

const DEFAULT_CENTER = { lat: 22.8046, lng: 86.2029 };
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const STREET_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

let leafletPromise;

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Unable to load map."));
    document.body.appendChild(script);
  });

  return leafletPromise;
};

const isCoordinateLocation = (location) => (
  Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng))
);

const reverseGeocode = async ({ lat, lng }) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) throw new Error("Unable to read this location.");
  const data = await response.json();
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

const searchPlaces = async (query) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) throw new Error("Unable to search location.");
  return response.json();
};

function DeliveryMapPicker({ initialLocation, onConfirm }) {
  const mapRef = useRef(null);
  const mapNodeRef = useRef(null);
  const markerRef = useRef(null);
  const [mapError, setMapError] = useState("");
  const [query, setQuery] = useState(initialLocation?.label || initialLocation?.query || "");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [pin, setPin] = useState(() => (
    isCoordinateLocation(initialLocation)
      ? { lat: Number(initialLocation.lat), lng: Number(initialLocation.lng), label: initialLocation.label || "" }
      : { ...DEFAULT_CENTER, label: "" }
  ));

  const updatePin = async (nextPin, shouldPan = false) => {
    setPin((current) => ({ ...current, ...nextPin }));
    if (markerRef.current) markerRef.current.setLatLng([nextPin.lat, nextPin.lng]);
    if (shouldPan && mapRef.current) mapRef.current.setView([nextPin.lat, nextPin.lng], Math.max(mapRef.current.getZoom(), 16));

    try {
      const label = nextPin.label || await reverseGeocode(nextPin);
      setPin((current) => ({ ...current, label }));
      setQuery(label);
    } catch {
      const fallback = `${nextPin.lat.toFixed(5)}, ${nextPin.lng.toFixed(5)}`;
      setPin((current) => ({ ...current, label: fallback }));
      setQuery(fallback);
    }
  };

  useEffect(() => {
    let active = true;

    loadLeaflet()
      .then((L) => {
        if (!active || !mapNodeRef.current || mapRef.current) return;

        const start = isCoordinateLocation(initialLocation)
          ? [Number(initialLocation.lat), Number(initialLocation.lng)]
          : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng];

        const map = L.map(mapNodeRef.current, { zoomControl: false }).setView(start, 15);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        L.tileLayer(STREET_TILE_URL, {
          maxZoom: 19,
          attribution: "Tiles &copy; Esri",
        }).addTo(map);

        const marker = L.marker(start, {
          draggable: true,
          icon: L.divIcon({
            className: "",
            html: "<div style=\"width:28px;height:28px;border-radius:999px 999px 999px 0;background:#dc2626;transform:rotate(-45deg);box-shadow:0 6px 16px rgba(15,23,42,.35);border:3px solid white;\"><div style=\"width:8px;height:8px;border-radius:999px;background:white;margin:7px;\"></div></div>",
            iconSize: [28, 28],
            iconAnchor: [14, 28],
          }),
        }).addTo(map);

        map.on("click", (event) => updatePin({ lat: event.latlng.lat, lng: event.latlng.lng }, false));
        marker.on("dragend", () => {
          const position = marker.getLatLng();
          updatePin({ lat: position.lat, lng: position.lng }, false);
        });

        mapRef.current = map;
        markerRef.current = marker;
        setTimeout(() => map.invalidateSize(), 120);
      })
      .catch((error) => setMapError(error.message || "Unable to load map."));

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setMapError("Enter at least 3 characters to search.");
      return;
    }
    setSearching(true);
    setHasSearched(true);
    setMapError("");
    try {
      const places = await searchPlaces(trimmed);
      setResults(places);
      if (places.length === 0) {
        setMapError("No matching location found. Try adding city or pincode.");
      }
    } catch (error) {
      setMapError(error.message || "Unable to search location.");
    } finally {
      setSearching(false);
    }
  };

  const handleResultSelect = (place) => {
    setResults([]);
    updatePin({
      lat: Number(place.lat),
      lng: Number(place.lon),
      label: place.display_name,
    }, true);
  };

  const handleDetect = () => {
    setDetecting(true);
    setMapError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updatePin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }, true);
        setDetecting(false);
      },
      (error) => {
        setMapError(error.message || "Unable to detect current location.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    onConfirm({
      lat: pin.lat,
      lng: pin.lng,
      label: pin.label || query || "Pinned delivery point",
      query: pin.label || query || `${pin.lat},${pin.lng}`,
      source: "map-pin",
      capturedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-lime-200 bg-white shadow-sm">
      <div className="space-y-3 border-b border-lime-100 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search society, street, landmark..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:bg-slate-300"
          >
            {searching ? "Searching..." : "Search"}
          </button>
          <button
            type="button"
            onClick={handleDetect}
            disabled={detecting}
            className="rounded-xl border border-lime-300 px-4 py-2 text-xs font-bold text-lime-800 hover:bg-lime-50 disabled:text-slate-300"
          >
            {detecting ? "Detecting..." : "Use current"}
          </button>
        </div>
        {mapError && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{mapError}</p>}
        {results.length > 0 && (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {results.map((place) => (
              <button
                type="button"
                key={place.place_id}
                onClick={() => handleResultSelect(place)}
                className="block w-full border-b border-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-lime-50"
              >
                {place.display_name}
              </button>
            ))}
          </div>
        )}
        {hasSearched && !searching && results.length === 0 && !mapError && (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
            No results yet. Try a nearby landmark, colony name, city, or pincode.
          </p>
        )}
      </div>

      <div className="relative">
        <div ref={mapNodeRef} className="h-72 w-full bg-lime-50" />
        <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-700 shadow">
          Click or drag pin to exact doorstep
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-lime-100 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800">Selected delivery point</p>
          <p className="line-clamp-2 text-[11px] font-semibold text-slate-500">{pin.label || query || "Move the pin to delivery location"}</p>
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          className="rounded-xl bg-lime-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-lime-700"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}

export default DeliveryMapPicker;
