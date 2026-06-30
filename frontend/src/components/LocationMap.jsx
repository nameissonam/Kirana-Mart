const hasCoordinates = (location) => (
  Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng))
);

const getLocationQuery = (location) => {
  if (hasCoordinates(location)) return `${Number(location.lat)},${Number(location.lng)}`;
  return String(location?.query || "").trim();
};

const hasUsableLocation = (location) => Boolean(getLocationQuery(location));

const getOriginQuery = (origin) => {
  if (!origin) return "";
  if (typeof origin === "string") return origin.trim();
  return getLocationQuery(origin);
};

export const getDirectionsUrl = (location, origin = "") => {
  if (!hasUsableLocation(location)) return "";
  const destination = encodeURIComponent(getLocationQuery(location));
  const originQuery = getOriginQuery(origin);
  return `https://www.google.com/maps/dir/?api=1${originQuery ? `&origin=${encodeURIComponent(originQuery)}` : ""}&destination=${destination}`;
};

function LocationMap({ location, origin = "", title = "Delivery location", compact = false }) {
  if (!hasUsableLocation(location)) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-4 text-xs font-semibold text-gray-500">
        Customer GPS location was not captured for this order.
      </div>
    );
  }

  const hasPreciseCoordinates = hasCoordinates(location);
  const locationQuery = getLocationQuery(location);
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&z=${compact ? 16 : 17}&output=embed`;
  const directionsUrl = getDirectionsUrl(location, origin);
  const originQuery = getOriginQuery(origin);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
        <div>
          <p className="text-xs font-bold text-gray-800">{title}</p>
          <p className="mt-0.5 text-[10px] font-semibold text-gray-400">
            {hasPreciseCoordinates ? `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}` : locationQuery}
            {location.accuracy ? ` • ~${Math.round(location.accuracy)}m accuracy` : ""}
          </p>
          {originQuery && (
            <p className="mt-0.5 line-clamp-1 text-[10px] font-semibold text-lime-700">
              From: {originQuery}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-brand-700"
          >
            Directions
          </a>
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold text-gray-600 hover:bg-slate-50"
          >
            Google Maps
          </a>
        </div>
      </div>
      <iframe
        title={title}
        src={embedUrl}
        className={compact ? "h-44 w-full" : "h-56 w-full"}
        loading="lazy"
      />
    </div>
  );
}

export default LocationMap;
