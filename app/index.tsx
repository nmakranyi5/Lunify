import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MoonIcon from "../assets/images/moon-cycles/icon";

export default function HomeScreen() {
  const fetchWeather = async () => {
    try {
      const response = await fetch(
        "http://192.168.56.1:3000/weather?lat=40.71&lon=-74.00"
      );
      const data = await response.json();
      console.log("Weather received:", data.currentWeather);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchWeather();
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

        <Text style={styles.phase}>Waning Crescent</Text>
        <Text style={styles.illumination}>23% Illuminated</Text>

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
