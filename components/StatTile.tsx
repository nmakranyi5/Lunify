import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  detail?: string;
};

export default function StatTile({ icon, label, value, detail }: Props) {
  return (
    <View style={styles.tile}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={14} color={colors.accent} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  value: { color: colors.text, fontSize: 22, fontWeight: "600", marginTop: 2 },
  detail: { color: colors.textMuted, fontSize: 12 },
});
