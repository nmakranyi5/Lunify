import Svg, {
  Circle,
  ClipPath,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { colors } from "../constants/theme";

type Props = {
  /** Fraction of the disc that is lit, 0..1 */
  illumination: number;
  waxing: boolean;
  size: number;
};

const R = 100;
const C = 120;

// Fixed crater layout (x, y, r) in disc coordinates, so the surface is stable.
const CRATERS: [number, number, number][] = [
  [92, 88, 14],
  [140, 78, 9],
  [150, 128, 17],
  [100, 150, 11],
  [76, 124, 7],
  [125, 172, 8],
  [170, 98, 6],
];

/** Path covering the lit part of the disc (northern-hemisphere view). */
function litPath(f: number, waxing: boolean) {
  const rx = R * Math.abs(1 - 2 * f);
  const crescent = f < 0.5;
  const limbSweep = waxing ? 1 : 0;
  const termSweep = crescent ? 1 - limbSweep : limbSweep;
  return [
    `M ${C} ${C - R}`,
    `A ${R} ${R} 0 0 ${limbSweep} ${C} ${C + R}`,
    `A ${rx} ${R} 0 0 ${termSweep} ${C} ${C - R}`,
    "Z",
  ].join(" ");
}

export default function MoonView({ illumination, waxing, size }: Props) {
  const f = Math.min(1, Math.max(0, illumination));
  const lit = f > 0.005 ? litPath(f, waxing) : null;

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
          <Stop offset="55%" stopColor={colors.accent} stopOpacity="0.22" />
          <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="night" cx="40%" cy="35%" r="75%">
          <Stop offset="0%" stopColor="#1A2347" />
          <Stop offset="100%" stopColor={colors.moonDark} />
        </RadialGradient>
        <RadialGradient id="surface" cx="38%" cy="32%" r="80%">
          <Stop offset="0%" stopColor={colors.moonLight} />
          <Stop offset="100%" stopColor={colors.moonShade} />
        </RadialGradient>
        {lit && (
          <ClipPath id="litClip">
            <Path d={lit} />
          </ClipPath>
        )}
      </Defs>

      <Circle cx={C} cy={C} r={118} fill="url(#halo)" opacity={0.3 + f * 0.7} />
      <Circle cx={C} cy={C} r={R} fill="url(#night)" />
      <Circle
        cx={C}
        cy={C}
        r={R}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />

      {lit && (
        <>
          <Path d={lit} fill="url(#surface)" />
          {CRATERS.map(([x, y, r], i) => (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={r}
              fill="rgba(90,84,72,0.22)"
              clipPath="url(#litClip)"
            />
          ))}
        </>
      )}
    </Svg>
  );
}
