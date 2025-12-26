import FirstQuarter from "../assets/images/moon-cycles/firstquarter";
import FullMoon from "../assets/images/moon-cycles/fullmoon";
import LastQuarter from "../assets/images/moon-cycles/lastquarter";
import NewMoon from "../assets/images/moon-cycles/newmoon";
import WaningCrescent from "../assets/images/moon-cycles/waningcrescent";
import WaningGibbous from "../assets/images/moon-cycles/waninggibbous";
import WaxingCrescent from "../assets/images/moon-cycles/waxingcrescent";
import WaxingGibbous from "../assets/images/moon-cycles/waxinggibbous";

export type MoonPhase = keyof typeof MOON_PHASES;

export const MOON_PHASES = {
  newMoon: {
    label: "New Moon",
    Icon: NewMoon,
    illumination: 0,
  },

  waxingCrescent: {
    label: "Waxing Crescent",
    Icon: WaxingCrescent,
    illumination: 25,
  },

  firstQuarter: {
    label: "First Quarter",
    Icon: FirstQuarter,
    illumination: 50,
  },

  waxingGibbous: {
    label: "Waxing Gibbous",
    Icon: WaxingGibbous,
    illumination: 75,
  },

  fullMoon: {
    label: "Full Moon",
    Icon: FullMoon,
    illumination: 100,
  },

  waningGibbous: {
    label: "Waning Gibbous",
    Icon: WaningGibbous,
    illumination: 75,
  },

  lastQuarter: {
    label: "Last Quarter",
    Icon: LastQuarter,
    illumination: 50,
  },

  waningCrescent: {
    label: "Waning Crescent",
    Icon: WaningCrescent,
    illumination: 25,
  },
} as const;
