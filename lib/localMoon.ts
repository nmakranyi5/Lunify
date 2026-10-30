import type { MoonPhase } from "../constants/moonPhases";

export const SYNODIC_MONTH = 29.53059;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const DAY_MS = 86_400_000;

// Age (days into the cycle) of each principal phase.
const NEW = 0;
const FIRST = SYNODIC_MONTH / 4;
const FULL = SYNODIC_MONTH / 2;
const LAST = (SYNODIC_MONTH * 3) / 4;

export function moonAge(date: Date) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / DAY_MS;
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

// Distance between two ages on the circular cycle.
const gap = (a: number, b: number) => {
  const d = Math.abs(a - b);
  return Math.min(d, SYNODIC_MONTH - d);
};

/** Phase for a given date, estimated from the mean lunar cycle. */
export function estimatePhase(date: Date): MoonPhase {
  const age = moonAge(date);
  // Principal phases own the day they fall on, like WeatherKit reports them.
  if (gap(age, NEW) < 0.5) return "new";
  if (gap(age, FIRST) < 0.5) return "firstQuarter";
  if (gap(age, FULL) < 0.5) return "full";
  if (gap(age, LAST) < 0.5) return "lastQuarter";
  if (age < FIRST) return "waxingCrescent";
  if (age < FULL) return "waxingGibbous";
  if (age < LAST) return "waningGibbous";
  return "waningCrescent";
}

/** A forecast shaped like the WeatherKit days the app consumes, minus rise/set. */
export function estimateDays(count: number, from = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const day = new Date(from);
    day.setDate(day.getDate() + i);
    day.setHours(12, 0, 0, 0);
    return {
      moonPhase: estimatePhase(day),
      forecastStart: day.toISOString(),
      moonrise: null as string | null,
      moonset: null as string | null,
    };
  });
}
