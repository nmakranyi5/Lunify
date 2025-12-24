import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MoonIcon from "../assets/images/moon-cycles/fullmoon";

export default function HomeScreen() {
  const lat = 40.71;
  const lon = -74.0;

  const [phase, setPhase] = useState("");
  const [illumination, setIllumination] = useState(0);
  const [date, setDate] = useState();

  const fetchMoonData = async () => {
    try {
      const response = await fetch(
        `http://192.168.56.1:3000/weather?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      console.log("Data received:", data.forecastDaily.days[0]);
      const today = data.forecastDaily.days[0];
      setPhase(today.moonPhase);
      setIllumination(Math.round((today.moonIllumination ?? 0) * 100));
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchMoonData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appName}>Lunify</Text>
          <Text style={styles.date}>Tuesday, December 23</Text>
        </View>

        <View style={styles.moonContainer}>
          <MoonIcon />
        </View>

        <Text style={styles.phase}>{phase}</Text>
        <Text style={styles.illumination}>{illumination}% illuminated</Text>

        <View style={styles.infoSection}>
          <Text style={styles.phase}>Hello</Text>
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
    alignItems: "center",
    marginBottom: 32,
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
    marginTop: 32,
  },
  sectionTitle: {
    marginTop: 40,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
