import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOON_PHASES, MoonPhase } from "../constants/moonPhases";
import calculateIllumination from "./calculateIllumination";

export default function HomeScreen() {
  const [currentPhaseInfo, setCurrentPhaseInfo] = useState<
    (typeof MOON_PHASES)[MoonPhase]
  >(MOON_PHASES.new);
  const [date, setDate] = useState("");
  const [illumination, setIllumination] = useState(0);
  const [moonrise, setMoonrise] = useState<string | null>(null);
  const [moonset, setMoonset] = useState<string | null>(null);
  const [nextPhaseInfo, setNextPhaseInfo] = useState<
    (typeof MOON_PHASES)[MoonPhase]
  >(MOON_PHASES.new);
  const [nextPhaseDate, setNextPhaseDate] = useState<string | null>(null);
  const [attribution, setAttribution] = useState<{
    logo: string | null;
    legalPage: string;
  } | null>(null);
  const [upcomingPhases, setUpcomingPhases] = useState<
    {
      phaseKey: MoonPhase;
      label: string;
      date: string;
    }[]
  >([]);

  const formatTime = (isoString: string) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Location permission denied");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      lat: location.coords.latitude,
      lon: location.coords.longitude,
    };
  };

  const fetchMoonData = async () => {
    try {
      const coords = await getUserLocation();
      if (!coords) return;
      const response = await fetch(
        `https://vercel-lunify-backend.vercel.app/api/weather?lat=${coords.lat}&lon=${coords.lon}`
      );

      const data = await response.json();

      const today = data.forecastDaily.days[0];

      const phaseKey = today.moonPhase as MoonPhase;

      const phaseInfo = MOON_PHASES[phaseKey] ?? MOON_PHASES.new;

      const illumination = calculateIllumination(new Date());

      const date = new Date(today.forecastStart);

      const moonrise = today.moonrise;

      const moonset = today.moonset;

      const days = data.forecastDaily.days;

      const todayPhase = days[0].moonPhase;

      setCurrentPhaseInfo(phaseInfo);

      setIllumination(illumination);

      setMoonrise(formatTime(moonrise));

      setMoonset(formatTime(moonset));

      const upcoming: {
        phaseKey: MoonPhase;
        label: string;
        date: string;
      }[] = [];

      let lastPhase = todayPhase;

      for (let i = 1; i < days.length; i++) {
        const day = days[i];

        if (day.moonPhase !== lastPhase) {
          const phaseKey = day.moonPhase as MoonPhase;

          upcoming.push({
            phaseKey,
            label: MOON_PHASES[phaseKey].label,
            date: new Date(day.forecastStart).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          });

          lastPhase = phaseKey;
        }

        if (upcoming.length === 3) break;
      }

      setUpcomingPhases(upcoming);

      const nextPhaseDay = days.find(
        (day: any, idx: number) => idx > 0 && day.moonPhase !== todayPhase
      );

      if (nextPhaseDay) {
        const nextPhaseInfo =
          MOON_PHASES[nextPhaseDay.moonPhase as MoonPhase] ?? MOON_PHASES.new;
        setNextPhaseInfo(nextPhaseInfo);
        setNextPhaseDate(
          new Date(nextPhaseDay.forecastStart).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
      }

      setDate(
        date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      );
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchMoonData();
  }, []);

  useEffect(() => {
    const fetchAttribution = async () => {
      try {
        const response = await fetch(
          "https://vercel-lunify-backend.vercel.app/api/attribution"
        );

        const data = await response.json();

        const baseUrl = "https://weatherkit.apple.com";
        setAttribution({
          logo:
            baseUrl +
            (data["logoDark@3x"] || data["logoDark@2x"] || data["logoDark@1x"]),
          legalPage: data.legalPage,
        });
      } catch (error) {
        console.error("Error fetching attribution:", error);
      }
    };
    fetchAttribution();
  }, []);

  const MoonIcon = currentPhaseInfo.Icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.appName}>Lunify</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>

        <View style={styles.moonContainer}>
          <View style={styles.moonGlow}>
            {MoonIcon && (
              <MoonIcon width="100%" height="100%" color="#000000" />
            )}
          </View>
        </View>

        <Text style={styles.phase}>{currentPhaseInfo.label}</Text>
        <Text style={styles.illumination}>~{illumination}% illuminated</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Next Phase</Text>
            <Text style={styles.statValue}>
              {nextPhaseInfo.label
                ? `${nextPhaseInfo.label} · ${nextPhaseDate}`
                : "-"}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Moonrise</Text>
            <Text style={styles.statValue}>{moonrise ?? "-"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Moonset</Text>
            <Text style={styles.statValue}>{moonset ?? "-"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Phases</Text>
        <View style={styles.phaseRow}>
          {upcomingPhases.map((phase) => {
            const Icon = MOON_PHASES[phase.phaseKey].Icon;

            return (
              <View
                key={`${phase.phaseKey}-${phase.date}`}
                style={styles.phaseCard}
              >
                {Icon && <Icon width={36} height={36} color="#FFFFFF" />}
                <Text style={styles.phaseCardLabel}>{phase.label}</Text>
                <Text style={styles.phaseCardDate}>{phase.date}</Text>
              </View>
            );
          })}
        </View>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() =>
            Linking.openURL(
              attribution?.legalPage ||
                "https://weatherkit.apple.com/legal-attribution.html"
            )
          }
          style={styles.attributionContainer}
        >
          {attribution?.logo ? (
            <Image
              source={{ uri: attribution.logo }}
              style={{ width: 100, height: 20, opacity: 0.6 }}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.attributionText}> Weather</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050B18",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: "center",
    flex: 1,
    maxWidth: 500,
    alignSelf: "center",
    width: "100%",
  },
  header: {
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  appName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  date: {
    marginTop: 4,
    fontSize: 14,
    color: "#8FA3BF",
  },
  moonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginVertical: 16,
    maxHeight: 360,
    flex: 1,
  },
  phase: {
    fontSize: 26,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  illumination: {
    marginTop: 6,
    fontSize: 14,
    color: "#8FA3BF",
    textAlign: "center",
    marginBottom: 20,
  },
  infoSection: {
    marginTop: 16,
    alignItems: "baseline",
  },
  infoText: {
    marginTop: 32,
    fontSize: 16,
    color: "#8FA3BF",
    textAlign: "left",
  },
  sectionTitle: {
    width: "100%",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  moonGlow: {
    width: "70%",
    maxWidth: 260,
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(255, 255, 255, 1)",
    shadowOpacity: 0.18,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  statsCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#8FA3BF",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 12,
  },
  phaseCard: {
    width: 110,
    height: 130,
    marginHorizontal: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  phaseCardLabel: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  phaseCardDate: {
    marginTop: 4,
    fontSize: 12,
    color: "#8FA3BF",
  },
  phaseRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  attributionContainer: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "40%",
  },
  attributionText: {
    fontSize: 11,
    color: "#565f6b",
    textAlign: "center",
    lineHeight: 16,
  },
  attributionLink: {
    color: "#8FA3BF",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});
