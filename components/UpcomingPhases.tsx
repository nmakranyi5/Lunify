import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";
import { MOON_PHASES } from "../constants/moonPhases";
import type { UpcomingPhase } from "../hooks/useMoonData";

export default function UpcomingPhases({ phases }: { phases: UpcomingPhase[] }) {
  if (phases.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Coming up</Text>
      <View style={styles.list}>
        {phases.map((p, i) => {
          const Icon = MOON_PHASES[p.phaseKey].Icon;
          return (
            <View
              key={`${p.phaseKey}-${p.date}`}
              style={[styles.row, i > 0 && styles.rowDivider]}
            >
              <View style={styles.iconWrap}>
                <Icon width={28} height={28} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.label}>{p.label}</Text>
                <Text style={styles.date}>{p.date}</Text>
              </View>
              <Text style={styles.inDays}>
                {p.inDays === 1 ? "Tomorrow" : `in ${p.inDays} days`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", gap: spacing.md },
  title: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: spacing.xs,
  },
  list: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: { width: 36, alignItems: "center" },
  rowText: { flex: 1 },
  label: { color: colors.text, fontSize: 16, fontWeight: "600" },
  date: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  inDays: { color: colors.accent, fontSize: 13, fontWeight: "600" },
});
