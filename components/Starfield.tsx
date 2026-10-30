import { memo, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { colors } from "../constants/theme";

// Small seeded PRNG so the sky is identical on every render.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Starfield() {
  const { width, height } = useWindowDimensions();

  const stars = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: 70 }, () => ({
      x: rand() * width,
      y: rand() * height,
      r: 0.4 + rand() * 1.1,
      o: 0.15 + rand() * 0.55,
    }));
  }, [width, height]);

  return (
    <Svg style={StyleSheet.absoluteFill} width={width} height={height} pointerEvents="none">
      <Defs>
        <RadialGradient id="sky" cx="50%" cy="18%" r="75%">
          <Stop offset="0%" stopColor={colors.backgroundRaised} />
          <Stop offset="100%" stopColor={colors.background} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#sky)" />
      {stars.map((s, i) => (
        <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
      ))}
    </Svg>
  );
}

export default memo(Starfield);
