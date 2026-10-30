import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { MOON_PHASES, MoonPhase } from "../constants/moonPhases";
import calculateIllumination from "../lib/calculateIllumination";
import { estimateDays } from "../lib/localMoon";

const TIMEOUT_MS = 8000;
const API = "https://vercel-lunify-backend.vercel.app/api/weather";

export type UpcomingPhase = {
  phaseKey: MoonPhase;
  label: string;
  date: string;
  inDays: number;
};

export type MoonData = {
  /** "estimate" means computed on-device because WeatherKit was unavailable. */
  source: "apple" | "estimate";
  notice: string | null;
  phaseKey: MoonPhase;
  label: string;
  waxing: boolean;
  dateLabel: string;
  illumination: number;
  moonrise: string | null;
  moonset: string | null;
  upcoming: UpcomingPhase[];
};

export type MoonStatus = "loading" | "ready";

const WAXING: MoonPhase[] = ["waxingCrescent", "firstQuarter", "waxingGibbous"];

const formatTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : null;

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

type Day = {
  moonPhase: string;
  forecastStart: string;
  moonrise?: string | null;
  moonset?: string | null;
};

function buildMoonData(
  days: Day[],
  source: MoonData["source"],
  notice: string | null
): MoonData {
  const today = days[0];
  const phaseKey = today.moonPhase as MoonPhase;
  const info = MOON_PHASES[phaseKey] ?? MOON_PHASES.new;

  const upcoming: UpcomingPhase[] = [];
  let last = today.moonPhase as MoonPhase;
  for (let i = 1; i < days.length && upcoming.length < 3; i++) {
    const key = days[i].moonPhase as MoonPhase;
    if (key !== last && MOON_PHASES[key]) {
      upcoming.push({
        phaseKey: key,
        label: MOON_PHASES[key].label,
        date: shortDate(days[i].forecastStart),
        inDays: i,
      });
    }
    last = key;
  }

  return {
    source,
    notice,
    phaseKey,
    label: info.label,
    waxing: WAXING.includes(phaseKey),
    dateLabel: new Date(today.forecastStart).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    illumination: calculateIllumination(new Date()),
    moonrise: formatTime(today.moonrise),
    moonset: formatTime(today.moonset),
    upcoming,
  };
}

const estimate = (notice: string) =>
  buildMoonData(estimateDays(30), "estimate", notice);

async function getCoords() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;
  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { lat: coords.latitude, lon: coords.longitude };
}

export function useMoonData() {
  const [status, setStatus] = useState<MoonStatus>("loading");
  const [data, setData] = useState<MoonData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    let coords: Awaited<ReturnType<typeof getCoords>> = null;
    try {
      coords = await getCoords();
    } catch (err) {
      console.warn("Error getting location:", err);
    }

    if (!coords) {
      setData(
        estimate("Location is off, so moonrise and moonset aren't available.")
      );
      setStatus("ready");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${API}?lat=${coords.lat}&lon=${coords.lon}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const json = await response.json();
      setData(buildMoonData(json.forecastDaily.days, "apple", null));
    } catch (err) {
      console.warn("Error loading moon data, using estimate:", err);
      setData(
        estimate("Showing an estimate. Moonrise and moonset are unavailable offline.")
      );
    } finally {
      clearTimeout(timer);
    }
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { status, data, refreshing, refresh };
}
