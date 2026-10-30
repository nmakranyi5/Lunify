import { useEffect, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";

const API = "https://vercel-lunify-backend.vercel.app/api/attribution";
const BASE_URL = "https://weatherkit.apple.com";
const FALLBACK_LEGAL = `${BASE_URL}/legal-attribution.html`;

export default function Attribution() {
  const [attribution, setAttribution] = useState<{
    logo: string | null;
    legalPage: string;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await (await fetch(API)).json();
        const path = data["logoDark@3x"] || data["logoDark@2x"] || data["logoDark@1x"];
        if (!cancelled) {
          setAttribution({
            logo: path ? BASE_URL + path : null,
            legalPage: data.legalPage,
          });
        }
      } catch (error) {
        console.warn("Error fetching attribution:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Weather data attribution"
      onPress={() => Linking.openURL(attribution?.legalPage || FALLBACK_LEGAL)}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.5 }]}
    >
      {attribution?.logo ? (
        <Image
          source={{ uri: attribution.logo }}
          style={styles.logo}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.text}> Weather</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "center", paddingVertical: 12, paddingHorizontal: 16 },
  logo: { width: 100, height: 20, opacity: 0.55 },
  text: { fontSize: 12, color: colors.textFaint },
});
