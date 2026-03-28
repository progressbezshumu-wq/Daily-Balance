import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { t } from "../../src/i18n";
import { useSettingsStore } from "../../src/store/settingsStore";

type AppLanguage = "en" | "de" | "uk";

function getCurrentLanguageLabel(language: AppLanguage) {
  if (language === "de") return "Deutsch";
  if (language === "uk") return "Українська";
  return "English";
}

function getDefaultCurrencyTitle(language: AppLanguage) {
  if (language === "de") return "Standardwährung";
  if (language === "uk") return "Базова валюта";
  return "Default currency";
}

function getCurrentCurrencyTitle(language: AppLanguage) {
  if (language === "de") return "Aktuelle Währung";
  if (language === "uk") return "Поточна валюта";
  return "Current currency";
}

function getFeedbackTitle(language: AppLanguage) {
  if (language === "de") return "Feedback";
  if (language === "uk") return "Зворотний звязок";
  return "Feedback";
}

function getFeedbackDescription(language: AppLanguage) {
  if (language === "de") return "Problem melden oder Idee senden.";
  if (language === "uk") return "Повідомити про помилку або надіслати ідею.";
  return "Report a problem or share an idea.";
}

function getAboutAppTitle(language: AppLanguage) {
  if (language === "de") return "Über die App";
  if (language === "uk") return "Про додаток";
  return "About app";
}

function getAboutAppDescription(language: AppLanguage) {
  if (language === "de") return "Daily Balance hilft dir, Vermögen und Verbindlichkeiten zu verfolgen.";
  if (language === "uk") return "Daily Balance допомагає відстежувати активи та пасиви.";
  return "Daily Balance helps you track assets and liabilities.";
}

export default function SettingsScreen() {
  const language = useSettingsStore((state) => (state.language ?? "en") as AppLanguage);
  const displayCurrency = useSettingsStore((state) => state.displayCurrency);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <Text style={styles.title}>{t(language, "settings")}</Text>

          <Pressable onPress={() => router.push("/change-language")} style={styles.card}>
            <Text style={styles.cardTitle}>{t(language, "changeLanguage")}</Text>
            <Text style={styles.cardSubtext}>
              {t(language, "currentLanguage")}: {getCurrentLanguageLabel(language)}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push("/change-currency")} style={styles.card}>
            <Text style={styles.cardTitle}>{getDefaultCurrencyTitle(language)}</Text>
            <Text style={styles.cardSubtext}>
              {getCurrentCurrencyTitle(language)}: {displayCurrency}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.push("/feedback")} style={styles.card}>
            <Text style={styles.cardTitle}>{getFeedbackTitle(language)}</Text>
            <Text style={styles.cardSubtext}>{getFeedbackDescription(language)}</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/about-app")} style={styles.card}>
            <Text style={styles.cardTitle}>{getAboutAppTitle(language)}</Text>
            <Text style={styles.cardSubtext}>{getAboutAppDescription(language)}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1115" },
  scrollContent: { flexGrow: 1, padding: 24 },
  container: { flex: 1, gap: 16 },
  title: { color: "white", fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  card: { backgroundColor: "#1c2230", padding: 18, borderRadius: 16 },
  cardTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  cardSubtext: { color: "#98a2b3", fontSize: 14, marginTop: 6, lineHeight: 20 },
});
