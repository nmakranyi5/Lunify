import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOON_PHASES, MoonPhase } from "../constants/moonPhases";
import { calculateIllumination } from "./calculateIllumination";

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
        `http://192.168.56.1:3000/weather?lat=${coords.lat}&lon=${coords.lon}`
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>Lunify</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <View style={styles.moonContainer}>
          <View style={styles.moonGlow}>
            {MoonIcon && <MoonIcon width={200} height={200} color="#000000" />}
          </View>
        </View>
        <Text style={styles.phase}>{currentPhaseInfo.label}</Text>
        <Text style={styles.illumination}>~{illumination}% illuminated</Text>

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>Next Phase </Text>
          <Text style={styles.infoText}>Moonrise {moonrise}</Text>
          <Text style={styles.infoText}>Moonset {moonset}</Text>
        </View>
        <Text style={styles.sectionTitle}>Upcoming Phases</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        ></ScrollView>
      </ScrollView>
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
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginTop: 8,
    marginBottom: 40,
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
    width: 200,
    height: 200,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 30,
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
    marginTop: 40,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  moonGlow: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
});
