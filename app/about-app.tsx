import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";

import { useSettingsStore } from "../src/store/settingsStore";

type AppLanguage = "en" | "de" | "uk";

function getCopy(language: AppLanguage) {
  if (language === "de") {
    return {
      title: "Über die App",
      name: "Daily Balance",
      description: "Verfolge deine Finanzen täglich. Analysiere Vermögen, Verbindlichkeiten und dein tägliches Gleichgewicht.",
      version: "Version",
    };
  }

  if (language === "uk") {
    return {
      title: "Про додаток",
      name: "Daily Balance",
      description: "Контролюй свої фінанси щодня. Аналізуй активи, пасиви та свій денний баланс.",
      version: "Версія",
    };
  }

  return {
    title: "About app",
    name: "Daily Balance",
    description: "Track your finances daily. Analyze assets, liabilities and your daily balance.",
    version: "Version",
  };
}

export default function AboutAppScreen() {
  const language = useSettingsStore((state) => (state.language ?? "en") as AppLanguage);
  const copy = getCopy(language);

  const appVersion =
    Constants.expoConfig?.version ??
    Constants.manifest?.version ??
    "1.0.0";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{copy.title}</Text>

        <View style={styles.card}>
          <Text style={styles.appName}>{copy.name}</Text>
          <Text style={styles.description}>{copy.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{copy.version}</Text>
          <Text style={styles.value}>{appVersion}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  topRow: {
    marginBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1c2230",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginTop: -2,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1c2230",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  appName: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    color: "#98a2b3",
    fontSize: 15,
    lineHeight: 22,
  },
  label: {
    color: "#98a2b3",
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
