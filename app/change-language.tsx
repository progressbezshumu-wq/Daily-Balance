import { router } from "expo-router";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { t } from "../src/i18n";
import type { AppLanguage } from "../src/store/settingsStore";
import { useSettingsStore } from "../src/store/settingsStore";

function getLanguageLabel(language: AppLanguage) {
  if (language === "de") return t(language, "languageGerman");
  if (language === "uk") return t(language, "languageUkrainian");
  return t(language, "languageEnglish");
}

const LANGUAGE_OPTIONS: AppLanguage[] = ["en", "de", "uk"];

export default function ChangeLanguageScreen() {
  const language = useSettingsStore((state) => state.language) ?? "en";
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  const handleSelect = async (nextLanguage: AppLanguage) => {
    await setLanguage(nextLanguage);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{t(language, "changeLanguage")}</Text>

        {LANGUAGE_OPTIONS.map((item) => {
          const selected = language === item;

          return (
            <Pressable
              key={item}
              onPress={() => handleSelect(item)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={styles.optionText}>{getLanguageLabel(item)}</Text>
            </Pressable>
          );
        })}
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
    marginBottom: 32,
  },
  option: {
    backgroundColor: "#1c2230",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "#2f6fed",
  },
  optionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
