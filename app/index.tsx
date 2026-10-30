import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Attribution from "../components/Attribution";
import MoonView from "../components/MoonView";
import StatTile from "../components/StatTile";
import Starfield from "../components/Starfield";
import UpcomingPhases from "../components/UpcomingPhases";
import { colors, radius, spacing } from "../constants/theme";
import { useMoonData } from "../hooks/useMoonData";

function Message({
  icon,
  title,
  body,
  action,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  body: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={40} color={colors.accent} />
      <Text style={styles.messageTitle}>{title}</Text>
      <Text style={styles.messageBody}>{body}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.buttonText}>{action}</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const { status, data, refreshing, retry, refresh } = useMoonData();
  const { width } = useWindowDimensions();
  const moonSize = Math.min(width * 0.72, 300);

  const appear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (status !== "ready") return;
    Animated.timing(appear, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [status, appear]);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    refresh();
  };

  return (
    <View style={styles.root}>
      <Starfield />
      <SafeAreaView style={styles.safe}>
        {status === "loading" && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.messageBody}>Finding the moon…</Text>
          </View>
        )}

        {status === "denied" && (
          <Message
            icon="location-outline"
            title="Location needed"
            body="Lunify uses your location to work out moonrise and moonset times where you are."
            action="Open Settings"
            onPress={() => Linking.openSettings()}
          />
        )}

        {status === "error" && (
          <Message
            icon="cloud-offline-outline"
            title="Couldn't load moon data"
            body="Check your connection and try again."
            action="Try again"
            onPress={retry}
          />
        )}

        {status === "ready" && data && (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.accent}
              />
            }
          >
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: appear,
                  transform: [
                    {
                      translateY: appear.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.appName}>LUNIFY</Text>
                <Text style={styles.date}>{data.dateLabel}</Text>
              </View>

              <View
                style={styles.moon}
                accessible
                accessibilityLabel={`${data.label}, about ${data.illumination} percent illuminated`}
              >
                <MoonView
                  size={moonSize}
                  illumination={data.illumination / 100}
                  waxing={data.waxing}
                />
              </View>

              <View style={styles.titleBlock}>
                <Text style={styles.phase}>{data.label}</Text>
                <Text style={styles.subtitle}>
                  {data.waxing ? "Waxing" : "Waning"} · ~{data.illumination}%
                  illuminated
                </Text>
              </View>

              <View style={styles.grid}>
                <StatTile
                  icon="arrow-up-circle-outline"
                  label="Moonrise"
                  value={data.moonrise ?? "—"}
                />
                <StatTile
                  icon="arrow-down-circle-outline"
                  label="Moonset"
                  value={data.moonset ?? "—"}
                />
              </View>

              <UpcomingPhases phases={data.upcoming} />
              <Attribution />
            </Animated.View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  header: { alignItems: "center", paddingTop: spacing.lg, gap: 4 },
  appName: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 4,
  },
  date: { color: colors.textMuted, fontSize: 14 },
  moon: { alignItems: "center", justifyContent: "center" },
  titleBlock: { alignItems: "center", gap: 6 },
  phase: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "300",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: { color: colors.textMuted, fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  messageTitle: { color: colors.text, fontSize: 20, fontWeight: "600" },
  messageBody: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: { color: colors.background, fontSize: 15, fontWeight: "600" },
});
