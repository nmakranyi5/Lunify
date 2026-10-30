import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { MOON_PHASES, MoonPhase } from "../constants/moonPhases";
import calculateIllumination from "../lib/calculateIllumination";

const API = "https://vercel-lunify-backend.vercel.app/api/weather";

export type UpcomingPhase = {
  phaseKey: MoonPhase;
  label: string;
  date: string;
  inDays: number;
};

export type MoonData = {
  phaseKey: MoonPhase;
  label: string;
  waxing: boolean;
  dateLabel: string;
  illumination: number;
  moonrise: string | null;
  moonset: string | null;
  upcoming: UpcomingPhase[];
};

export type MoonStatus = "loading" | "ready" | "denied" | "error";

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
    try {
      const coords = await getCoords();
      if (!coords) {
        setStatus("denied");
        return;
      }

      const response = await fetch(`${API}?lat=${coords.lat}&lon=${coords.lon}`);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const json = await response.json();

      const days: any[] = json.forecastDaily.days;
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

      setData({
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
      });
      setStatus("ready");
    } catch (err) {
      console.warn("Error loading moon data:", err);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setStatus("loading");
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { status, data, refreshing, retry, refresh };
}
