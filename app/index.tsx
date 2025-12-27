import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOON_PHASES, MoonPhase } from "../constants/moonPhases";
import calculateIllumination from "./calculateIllumination";

export default function HomeScreen() {
  const [currentPhaseInfo, setCurrentPhaseInfo] = useState<
    (typeof MOON_PHASES)[MoonPhase]
  >(MOON_PHASES.newMoon);
  const [date, setDate] = useState("");
  const [illumination, setIllumination] = useState(0);
  const [moonset, setMoonset] = useState("");
  const [moonrise, setMoonrise] = useState("");

  const formatTime = (isoString: string) => {
    if (!isoString) return "Error";
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
        `https://lunify-backend.onrender.com/weather?lat=${coords.lat}&lon=${coords.lon}`
      );
      const data = await response.json();

      const today = data.forecastDaily.days[0];

      const phaseKey = today.moonPhase as MoonPhase;

      const phaseInfo = MOON_PHASES[phaseKey] ?? MOON_PHASES.newMoon;

      const illumination = calculateIllumination(new Date());

      const date = new Date(today.forecastStart);

      const moonrise = today.moonrise;

      const moonset = today.moonset;

      setCurrentPhaseInfo(phaseInfo);

      setIllumination(illumination);

      setMoonrise(formatTime(moonrise));

      setMoonset(formatTime(moonset));

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

  const MoonIcon = currentPhaseInfo.Icon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>Lunify</Text>
          <Text style={styles.date}>{date}</Text>
        </View>

        <View style={styles.moonContainer}>
          <View style={styles.moonGlow}>
            {MoonIcon && <MoonIcon width={260} height={260} color="#000000" />}
          </View>
        </View>

        <Text style={styles.phase}>{currentPhaseInfo.label}</Text>
        <Text style={styles.illumination}>~{illumination}% illuminated</Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Next Phase</Text>
            <Text style={styles.statValue}>{}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Moonrise</Text>
            <Text style={styles.statValue}>{moonrise}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Moonset</Text>
            <Text style={styles.statValue}>{moonset}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Phases</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          {Object.values(MOON_PHASES)
            .slice(0, 4)
            .map((phase, idx) => {
              const Icon = phase.Icon;
              return (
                <View key={idx} style={styles.phaseCard}>
                  {Icon && <Icon width={36} height={36} color="#FFFFFF" />}
                  <Text style={styles.phaseCardLabel}>{phase.label}</Text>
                  <Text style={styles.phaseCardDate}>Jan {idx * 7 + 3}</Text>
                </View>
              );
            })}
        </ScrollView>
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
    paddingBottom: 20,
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
    alignItems: "center",
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
    width: 320,
    height: 320,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
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
    marginTop: 36,
    marginBottom: 16,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    alignSelf: "flex-start",
    letterSpacing: 0.4,
  },
  moonGlow: {
    width: 300,
    height: 300,
    borderRadius: 150,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.18,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },

  statsCard: {
    marginTop: 24,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    paddingVertical: 16,
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
    marginRight: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
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
});
