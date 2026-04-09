import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSettingsStore } from "../../src/store/settingsStore";

export default function SettingsScreen() {
  const language = useSettingsStore((state) => state.language) ?? "en";
  const displayCurrency = useSettingsStore((state) => state.displayCurrency) ?? "EUR";

  const copy =
    language === "uk"
      ? {
          title: "Налаштування",
          subtitle: "Мова, валюта та основні параметри",
          language: "Мова",
          currency: "Валюта",
          languageSub: "Змінити мову інтерфейсу",
          currencySub: "Основна валюта відображення",
        }
      : language === "de"
      ? {
          title: "Einstellungen",
          subtitle: "Sprache, Währung und Hauptparameter",
          language: "Sprache",
          currency: "Währung",
          languageSub: "Sprache der Oberfläche ändern",
          currencySub: "Hauptanzeigewährung",
        }
      : {
          title: "Settings",
          subtitle: "Language, currency and main parameters",
          language: "Language",
          currency: "Currency",
          languageSub: "Change app language",
          currencySub: "Main display currency",
        };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={["#050816", "#0A1020", "#0C1425"]} style={StyleSheet.absoluteFill} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          </View>

        <View style={styles.sectionCard}>
          <Pressable style={styles.rowCard} onPress={() => router.push("/change-language")}>
            <View style={styles.left}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name="translate" size={20} color="#60A5FA" />
              </View>
              <View>
                <Text style={styles.rowTitle}>{copy.language}</Text>
                <Text style={styles.rowSub}>{copy.languageSub}</Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={styles.valueText}>{language.toUpperCase()}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
            </View>
          </Pressable>

          <Pressable style={styles.rowCard} onPress={() => router.push("/change-currency")}>
            <View style={styles.left}>
              <View style={styles.iconWrap}>
                <MaterialCommunityIcons name="currency-eur" size={20} color="#22C55E" />
              </View>
              <View>
                <Text style={styles.rowTitle}>{copy.currency}</Text>
                <Text style={styles.rowSub}>{copy.currencySub}</Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={styles.valueText}>{displayCurrency}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#050816",
  },
  content: {
    padding: 20,
    paddingBottom: 150,
    gap: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#F8FAFC",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
  },
  sectionCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.12)",
  },
  rowCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(17, 24, 39, 0.70)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.10)",
    marginBottom: 12,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  rowSub: {
    marginTop: 2,
    fontSize: 12,
    color: "#94A3B8",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E5E7EB",
  },
});
