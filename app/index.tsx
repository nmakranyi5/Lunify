import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Head from "expo-router/head";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
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

export default function HomeScreen() {
  const { status, data, refreshing, refresh } = useMoonData();
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
      <Head>
        <title>Lunify</title>
        <meta name="description" content="Today's moon phase, illumination, and upcoming phases." />
      </Head>
      <Starfield />
      <SafeAreaView style={styles.safe}>
        {status === "loading" && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.messageBody}>Finding the moon…</Text>
          </View>
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

              {data.notice && (
                <View style={styles.notice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text style={styles.noticeText}>{data.notice}</Text>
                </View>
              )}

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
  messageBody: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  noticeText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});
