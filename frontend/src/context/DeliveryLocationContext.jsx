/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DeliveryLocationContext = createContext(null);
const STORAGE_KEY = "kirana_delivery_location";
const SKIP_LOCATION_KEY = "kirana_skip_location_prompt";

const parseCoordinateLocation = (value) => {
  const input = String(value || "").trim();
  const atMatch = input.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const queryMatch = input.match(/[?&](?:q|query|destination)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  const plainMatch = input.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  const match = atMatch || queryMatch || plainMatch;
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return { lat, lng };
};

const buildLocationFromSearch = (value) => {
  const input = String(value || "").trim();
  if (input.length < 3) return null;

  const coordinates = parseCoordinateLocation(input);
  if (coordinates) {
    return {
      ...coordinates,
      label: "Pinned delivery location",
      capturedAt: new Date().toISOString(),
      source: "manual",
    };
  }

  return {
    query: input,
    label: input,
    capturedAt: new Date().toISOString(),
    source: "manual",
  };
};

const isGenericDetectedLabel = (location) => (
  ["browser", "map-pin"].includes(location?.source)
  && (!location.label || ["Detected delivery location", "Pinned delivery point"].includes(location.label))
  && Number.isFinite(Number(location.lat))
  && Number.isFinite(Number(location.lng))
);

const reverseGeocodeLocation = async ({ lat, lng }) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`,
    { headers: { Accept: "application/json" } }
  );
  if (!response.ok) throw new Error("Unable to resolve address");
  const data = await response.json();
  const address = data.address || {};
  return (
    data.display_name
    || [address.road, address.suburb, address.city || address.town || address.village, address.state, address.postcode]
      .filter(Boolean)
      .join(", ")
  );
};

export const DeliveryLocationProvider = ({ children }) => {
  const [deliveryLocation, setDeliveryLocationState] = useState(null);
  const [locationPromptSkipped, setLocationPromptSkipped] = useState(false);

  useEffect(() => {
    try {
      const storedLocation = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (storedLocation) setDeliveryLocationState(storedLocation);
      setLocationPromptSkipped(localStorage.getItem(SKIP_LOCATION_KEY) === "true");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isGenericDetectedLabel(deliveryLocation)) return;

    let active = true;
    reverseGeocodeLocation(deliveryLocation)
      .then((label) => {
        if (!active || !label) return;
        const updatedLocation = {
          ...deliveryLocation,
          label,
          query: label,
        };
        setDeliveryLocationState(updatedLocation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocation));
      })
      .catch(() => {
        if (!active) return;
        const updatedLocation = {
          ...deliveryLocation,
          label: `Near ${Number(deliveryLocation.lat).toFixed(5)}, ${Number(deliveryLocation.lng).toFixed(5)}`,
        };
        setDeliveryLocationState(updatedLocation);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocation));
      });

    return () => { active = false; };
  }, [deliveryLocation]);

  const setDeliveryLocation = (location) => {
    const nextLocation = {
      ...location,
      label: location.label || location.query || "Detected delivery location",
      capturedAt: location.capturedAt || new Date().toISOString(),
    };
    setDeliveryLocationState(nextLocation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLocation));
    localStorage.removeItem(SKIP_LOCATION_KEY);
    setLocationPromptSkipped(false);
    return nextLocation;
  };

  const clearDeliveryLocation = () => {
    setDeliveryLocationState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const skipLocationPrompt = () => {
    setLocationPromptSkipped(true);
    localStorage.setItem(SKIP_LOCATION_KEY, "true");
  };

  const detectCurrentLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported by this browser."));
      return;
    }

    let bestPosition = null;
    let watchId = null;
    let finished = false;

    const finish = async () => {
      if (finished) return;
      finished = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);

      if (!bestPosition) {
        reject(new Error("Unable to detect your location. Search manually instead."));
        return;
      }

      const baseLocation = {
        lat: bestPosition.coords.latitude,
        lng: bestPosition.coords.longitude,
        accuracy: bestPosition.coords.accuracy,
        capturedAt: new Date().toISOString(),
        source: "browser",
      };

      let label = "";
      try {
        label = await reverseGeocodeLocation(baseLocation);
      } catch {
        label = `Near ${Number(baseLocation.lat).toFixed(5)}, ${Number(baseLocation.lng).toFixed(5)}`;
      }

      const location = setDeliveryLocation({
        ...baseLocation,
        label,
        query: label,
      });
      resolve(location);
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }
        if (position.coords.accuracy <= 30) finish();
      },
      (error) => {
        if (finished) return;
        finished = true;
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        reject(new Error(error.message || "Unable to detect your location. Search manually instead."));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    setTimeout(finish, 10000);
  });

  const setManualLocation = (value) => {
    const location = buildLocationFromSearch(value);
    if (!location) {
      throw new Error("Enter a location name, landmark, or Google Maps link.");
    }
    return setDeliveryLocation(location);
  };

  const value = useMemo(() => ({
    deliveryLocation,
    setDeliveryLocation,
    setManualLocation,
    detectCurrentLocation,
    clearDeliveryLocation,
    skipLocationPrompt,
    locationPromptSkipped,
  }), [deliveryLocation, locationPromptSkipped]);

  return (
    <DeliveryLocationContext.Provider value={value}>
      {children}
    </DeliveryLocationContext.Provider>
  );
};

export const useDeliveryLocation = () => {
  const context = useContext(DeliveryLocationContext);
  if (!context) {
    throw new Error("useDeliveryLocation must be used within a DeliveryLocationProvider");
  }
  return context;
};
